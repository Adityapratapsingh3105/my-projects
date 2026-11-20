import { db } from '../config/database.js';
import { simplifyDebts } from '../services/debtSimplifier.js';

export async function getGroupSettlements(req, res) {
  try {
    const { groupId } = req.query;
    const members = db.getMembers();
    let expenses = [];
    let groupName = 'All Hostel Groups';

    if (groupId && groupId !== 'all') {
      const group = db.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, error: 'Group not found' });
      }
      groupName = group.name;
      expenses = db.getExpenses({ groupId });
    } else {
      expenses = db.getExpenses();
    }

    const settlements = db.getSettlements(groupId && groupId !== 'all' ? groupId : null);

    const result = await simplifyDebts(members, expenses, settlements, groupName);

    res.json({
      success: true,
      data: {
        groupId: groupId || 'all',
        groupName,
        ...result
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function recordSettlement(req, res) {
  try {
    const { groupId, fromMemberId, toMemberId, amount, note, upiLink } = req.body;

    if (!fromMemberId || !toMemberId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required settlement fields: fromMemberId, toMemberId, and amount'
      });
    }

    const settlement = db.createSettlement({
      groupId: groupId || 'general',
      fromMemberId,
      toMemberId,
      amount: Number(amount),
      status: 'settled',
      note: note || 'Settled via UPI',
      upiLink: upiLink || ''
    });

    res.status(201).json({
      success: true,
      data: settlement,
      message: 'Settlement successfully recorded! Balances updated.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function getSettlementHistory(req, res) {
  try {
    const { groupId } = req.query;
    const history = db.getSettlements(groupId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function resetDatabase(req, res) {
  try {
    const freshData = db.reset();
    res.json({
      success: true,
      message: 'Database reset to initial sample hostel data successfully.',
      data: freshData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
