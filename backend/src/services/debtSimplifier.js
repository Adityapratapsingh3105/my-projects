import { generateUpiLink, generateUpiQrCode } from './upiService.js';

/**
 * Calculates net balances for all members based on expenses and recorded settlements.
 * Positive balance = Member is owed money (Creditor)
 * Negative balance = Member owes money (Debtor)
 */
export function calculateBalances(members, expenses, settlements = []) {
  const balances = {};
  members.forEach(m => {
    balances[m.id] = 0;
  });

  // 1. Process Expenses
  expenses.forEach(exp => {
    const paidBy = exp.paidBy;
    const totalAmount = Number(exp.amount) || 0;

    if (balances[paidBy] === undefined) {
      balances[paidBy] = 0;
    }

    // Payer is credited the total amount
    balances[paidBy] += totalAmount;

    // Participants are debited their share
    if (exp.splits && Object.keys(exp.splits).length > 0) {
      Object.entries(exp.splits).forEach(([memId, share]) => {
        if (balances[memId] === undefined) balances[memId] = 0;
        balances[memId] -= Number(share) || 0;
      });
    } else if (exp.participants && exp.participants.length > 0) {
      // Fallback equal split
      const equalShare = totalAmount / exp.participants.length;
      exp.participants.forEach(memId => {
        if (balances[memId] === undefined) balances[memId] = 0;
        balances[memId] -= equalShare;
      });
    }
  });

  // 2. Process Settled Payments
  settlements.forEach(stl => {
    if (stl.status === 'settled') {
      const amount = Number(stl.amount) || 0;
      // The person who paid off their debt has their balance increase towards 0
      if (balances[stl.fromMemberId] !== undefined) {
        balances[stl.fromMemberId] += amount;
      }
      // The person who received the debt payment has their credit reduced towards 0
      if (balances[stl.toMemberId] !== undefined) {
        balances[stl.toMemberId] -= amount;
      }
    }
  });

  // Round balances to 2 decimal places to avoid float precision drift
  const rounded = {};
  for (const [id, bal] of Object.entries(balances)) {
    rounded[id] = Math.round(bal * 100) / 100;
  }
  return rounded;
}

/**
 * Calculates pairwise debts (raw non-simplified transactions) to show comparison.
 */
export function calculateRawPairwiseDebts(members, expenses) {
  // pairwise[debtor][creditor] = amount
  const pairwise = {};
  members.forEach(m1 => {
    pairwise[m1.id] = {};
    members.forEach(m2 => {
      pairwise[m1.id][m2.id] = 0;
    });
  });

  expenses.forEach(exp => {
    const payer = exp.paidBy;
    if (exp.splits && Object.keys(exp.splits).length > 0) {
      Object.entries(exp.splits).forEach(([memId, share]) => {
        if (memId !== payer) {
          pairwise[memId][payer] = (pairwise[memId][payer] || 0) + Number(share);
        }
      });
    } else if (exp.participants && exp.participants.length > 0) {
      const share = Number(exp.amount) / exp.participants.length;
      exp.participants.forEach(memId => {
        if (memId !== payer) {
          pairwise[memId][payer] = (pairwise[memId][payer] || 0) + share;
        }
      });
    }
  });

  // Simplify direct pairwise opposites (if A owes B 100 and B owes A 40 -> A owes B 60)
  const rawList = [];
  const processed = new Set();

  members.forEach(m1 => {
    members.forEach(m2 => {
      if (m1.id !== m2.id) {
        const pairKey = [m1.id, m2.id].sort().join(':');
        if (!processed.has(pairKey)) {
          processed.add(pairKey);
          const diff = (pairwise[m1.id][m2.id] || 0) - (pairwise[m2.id][m1.id] || 0);
          if (diff > 0.5) {
            rawList.push({
              fromMemberId: m1.id,
              toMemberId: m2.id,
              amount: Math.round(diff * 100) / 100
            });
          } else if (diff < -0.5) {
            rawList.push({
              fromMemberId: m2.id,
              toMemberId: m1.id,
              amount: Math.round(Math.abs(diff) * 100) / 100
            });
          }
        }
      }
    });
  });

  return rawList;
}

/**
 * Smart Settlement Algorithm:
 * Reduces arbitrary graph of debts to minimum number of transactions (max N-1)
 * using the greedy balance matching algorithm.
 */
export async function simplifyDebts(members, expenses, settlements = [], groupName = 'Hostel Group') {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const balances = calculateBalances(members, expenses, settlements);
  const rawDebts = calculateRawPairwiseDebts(members, expenses);

  // Divide into debtors and creditors
  // debtor: balance < -0.01 (owes money)
  // creditor: balance > 0.01 (is owed money)
  const debtors = [];
  const creditors = [];

  for (const [memId, bal] of Object.entries(balances)) {
    if (bal < -0.01) {
      debtors.push({ id: memId, balance: bal }); // negative
    } else if (bal > 0.01) {
      creditors.push({ id: memId, balance: bal }); // positive
    }
  }

  // Sort: Debtors ascending (largest debt first, e.g. -500 before -100)
  // Creditors descending (largest credit first, e.g. +600 before +200)
  debtors.sort((a, b) => a.balance - b.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const simplified = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amountOwed = -debtor.balance;
    const amountToReceive = creditor.balance;
    const settlementAmount = Math.min(amountOwed, amountToReceive);
    const roundedAmount = Math.round(settlementAmount * 100) / 100;

    if (roundedAmount > 0.01) {
      const fromMem = memberMap.get(debtor.id) || { id: debtor.id, name: 'Unknown', avatar: '👤' };
      const toMem = memberMap.get(creditor.id) || { id: creditor.id, name: 'Unknown', avatar: '👤', upiId: '' };

      const upiLink = generateUpiLink({
        upiId: toMem.upiId || 'hostel@upi',
        payeeName: toMem.name,
        amount: roundedAmount,
        note: `SplitMate: ${groupName}`
      });

      simplified.push({
        fromMemberId: debtor.id,
        toMemberId: creditor.id,
        fromMember: fromMem,
        toMember: toMem,
        amount: roundedAmount,
        upiLink,
        status: 'pending'
      });
    }

    debtor.balance += settlementAmount;
    creditor.balance -= settlementAmount;

    if (Math.abs(debtor.balance) <= 0.01) i++;
    if (Math.abs(creditor.balance) <= 0.01) j++;
  }

  // Generate QR code URLs asynchronously for each transaction
  for (const tx of simplified) {
    try {
      tx.qrCode = await generateUpiQrCode(tx.upiLink);
    } catch {
      tx.qrCode = '';
    }
  }

  const rawCount = Math.max(rawDebts.length, simplified.length);
  const simplifiedCount = simplified.length;
  const reductionPercent = rawCount > 0 
    ? Math.round(((rawCount - simplifiedCount) / rawCount) * 100) 
    : 0;

  const totalVolume = simplified.reduce((sum, tx) => sum + tx.amount, 0);

  return {
    simplifiedTransactions: simplified,
    balances,
    summary: {
      rawTransactionsCount: rawCount,
      simplifiedTransactionsCount: simplifiedCount,
      transactionsSaved: Math.max(0, rawCount - simplifiedCount),
      reductionPercent: Math.max(0, reductionPercent),
      totalVolume: Math.round(totalVolume * 100) / 100
    }
  };
}
