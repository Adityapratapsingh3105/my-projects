import { db } from '../config/database.js';
import { calculateBalances } from '../services/debtSimplifier.js';

export function getExpenses(req, res) {
  try {
    const { groupId, memberId, category, search } = req.query;
    const expenses = db.getExpenses({ groupId, memberId, category, search });
    res.json({ success: true, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getExpenseById(req, res) {
  try {
    const expense = db.getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function createExpense(req, res) {
  try {
    const {
      groupId,
      title,
      amount,
      category,
      date,
      paidBy,
      participants,
      splitType,
      splits,
      items,
      notes,
      receiptUrl
    } = req.body;

    if (!groupId || !title || !amount || !paidBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: groupId, title, amount, and paidBy are required'
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be a positive number' });
    }

    const finalParticipants = Array.isArray(participants) && participants.length > 0
      ? participants
      : [paidBy];

    let finalSplits = { ...(splits || {}) };

    // Compute splits based on splitType if not explicitly given
    if (splitType === 'equal' || !splits || Object.keys(splits).length === 0) {
      const perHead = Math.round((numAmount / finalParticipants.length) * 100) / 100;
      finalSplits = {};
      let totalAssigned = 0;
      finalParticipants.forEach((pId, idx) => {
        if (idx === finalParticipants.length - 1) {
          // Adjust last person by remainder cents to match exact total
          finalSplits[pId] = Math.round((numAmount - totalAssigned) * 100) / 100;
        } else {
          finalSplits[pId] = perHead;
          totalAssigned += perHead;
        }
      });
    }

    const expense = db.createExpense({
      groupId,
      title: title.trim(),
      amount: numAmount,
      category: category || 'Other',
      date: date || new Date().toISOString().split('T')[0],
      paidBy,
      participants: finalParticipants,
      splitType: splitType || 'equal',
      splits: finalSplits,
      items: items || [],
      notes: notes || '',
      receiptUrl: receiptUrl || null
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function updateExpense(req, res) {
  try {
    const updated = db.updateExpense(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function deleteExpense(req, res) {
  try {
    const success = db.deleteExpense(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getDashboardStats(req, res) {
  try {
    const currentMemberId = req.query.currentMemberId || 'mem_1'; // default to Rahul Sharma
    const members = db.getMembers();
    const groups = db.getGroups();
    const expenses = db.getExpenses();
    const settlements = db.getSettlements();

    const totalGroupExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate balances for each member across all groups
    const balances = calculateBalances(members, expenses, settlements);

    // Specific to current active user
    const currentMember = members.find(m => m.id === currentMemberId) || members[0];
    const myNetBalance = balances[currentMemberId] || 0;

    // What others owe me (positive credits) vs What I owe others (negative debts)
    let whoOwesMe = 0;
    let whatIOwe = 0;

    if (myNetBalance > 0) {
      whoOwesMe = myNetBalance;
    } else {
      whatIOwe = Math.abs(myNetBalance);
    }

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount);
    });

    // Recent 5 expenses
    const recentExpenses = expenses.slice(0, 5);

    res.json({
      success: true,
      data: {
        currentMember,
        totalGroupExpenses,
        myNetBalance,
        whoOwesMe,
        whatIOwe,
        activeGroupsCount: groups.length,
        totalExpensesCount: expenses.length,
        categoryTotals,
        recentExpenses,
        allBalances: balances
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
