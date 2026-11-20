import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialMembers, initialGroups, initialExpenses, initialSettlements } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../../data/db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class Database {
  constructor() {
    this.data = {
      members: [],
      groups: [],
      expenses: [],
      settlements: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure all arrays exist
        this.data.members = this.data.members || [];
        this.data.groups = this.data.groups || [];
        this.data.expenses = this.data.expenses || [];
        this.data.settlements = this.data.settlements || [];
      } else {
        this.seed();
      }
    } catch (err) {
      console.error('Error loading DB file, re-initializing with seed data:', err.message);
      this.seed();
    }
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error saving DB file:', err.message);
    }
  }

  seed() {
    this.data = {
      members: JSON.parse(JSON.stringify(initialMembers)),
      groups: JSON.parse(JSON.stringify(initialGroups)),
      expenses: JSON.parse(JSON.stringify(initialExpenses)),
      settlements: JSON.parse(JSON.stringify(initialSettlements))
    };
    this.save();
    console.log('Database seeded with initial hostel data.');
  }

  reset() {
    this.seed();
    return this.data;
  }

  // --- Members ---
  getMembers() {
    return this.data.members;
  }

  getMemberById(id) {
    return this.data.members.find(m => m.id === id);
  }

  createMember(memberData) {
    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: memberData.name,
      avatar: memberData.avatar || '👤',
      upiId: memberData.upiId || '',
      email: memberData.email || '',
      phone: memberData.phone || ''
    };
    this.data.members.push(newMember);
    this.save();
    return newMember;
  }

  // --- Groups ---
  getGroups() {
    return this.data.groups.map(group => {
      const groupExpenses = this.data.expenses.filter(e => e.groupId === group.id);
      const totalExpense = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        ...group,
        expenseCount: groupExpenses.length,
        totalExpense
      };
    });
  }

  getGroupById(id) {
    const group = this.data.groups.find(g => g.id === id);
    if (!group) return null;
    const members = this.data.members.filter(m => group.memberIds.includes(m.id));
    const groupExpenses = this.data.expenses.filter(e => e.groupId === group.id);
    const totalExpense = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      ...group,
      members,
      expenseCount: groupExpenses.length,
      totalExpense
    };
  }

  createGroup(groupData) {
    const newGroup = {
      id: `grp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: groupData.name,
      type: groupData.type || 'Hostel Room',
      description: groupData.description || '',
      icon: groupData.icon || '🏠',
      currency: groupData.currency || 'INR',
      memberIds: groupData.memberIds || [],
      createdAt: new Date().toISOString()
    };
    this.data.groups.push(newGroup);
    this.save();
    return this.getGroupById(newGroup.id);
  }

  updateGroup(id, updateData) {
    const index = this.data.groups.findIndex(g => g.id === id);
    if (index === -1) return null;
    this.data.groups[index] = {
      ...this.data.groups[index],
      ...updateData
    };
    this.save();
    return this.getGroupById(id);
  }

  // --- Expenses ---
  getExpenses(filters = {}) {
    let list = [...this.data.expenses];

    if (filters.groupId) {
      list = list.filter(e => e.groupId === filters.groupId);
    }
    if (filters.memberId) {
      list = list.filter(e => e.paidBy === filters.memberId || (e.participants && e.participants.includes(filters.memberId)));
    }
    if (filters.category) {
      list = list.filter(e => e.category?.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Sort by date newest first
    list.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    // Enrich with member and group info
    return list.map(exp => {
      const payer = this.getMemberById(exp.paidBy);
      const group = this.data.groups.find(g => g.id === exp.groupId);
      return {
        ...exp,
        payerName: payer ? payer.name : 'Unknown',
        payerAvatar: payer ? payer.avatar : '👤',
        groupName: group ? group.name : 'Unknown Group',
        groupIcon: group ? group.icon : '📁'
      };
    });
  }

  getExpenseById(id) {
    const exp = this.data.expenses.find(e => e.id === id);
    if (!exp) return null;
    const payer = this.getMemberById(exp.paidBy);
    const group = this.data.groups.find(g => g.id === exp.groupId);
    return {
      ...exp,
      payerName: payer ? payer.name : 'Unknown',
      payerAvatar: payer ? payer.avatar : '👤',
      groupName: group ? group.name : 'Unknown Group'
    };
  }

  createExpense(expenseData) {
    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      groupId: expenseData.groupId,
      title: expenseData.title,
      amount: Number(expenseData.amount),
      category: expenseData.category || 'Other',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      paidBy: expenseData.paidBy,
      participants: expenseData.participants || [],
      splitType: expenseData.splitType || 'equal',
      splits: expenseData.splits || {},
      items: expenseData.items || [],
      notes: expenseData.notes || '',
      receiptUrl: expenseData.receiptUrl || null,
      createdAt: new Date().toISOString()
    };

    this.data.expenses.push(newExpense);
    this.save();
    return this.getExpenseById(newExpense.id);
  }

  updateExpense(id, updateData) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return null;
    this.data.expenses[index] = {
      ...this.data.expenses[index],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : this.data.expenses[index].amount
    };
    this.save();
    return this.getExpenseById(id);
  }

  deleteExpense(id) {
    const index = this.data.expenses.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.data.expenses.splice(index, 1);
    this.save();
    return true;
  }

  // --- Settlements ---
  getSettlements(groupId = null) {
    let list = [...this.data.settlements];
    if (groupId) {
      list = list.filter(s => s.groupId === groupId);
    }
    return list.map(s => {
      const fromMember = this.getMemberById(s.fromMemberId);
      const toMember = this.getMemberById(s.toMemberId);
      const group = this.data.groups.find(g => g.id === s.groupId);
      return {
        ...s,
        fromMember,
        toMember,
        groupName: group ? group.name : 'General'
      };
    });
  }

  createSettlement(settlementData) {
    const newSettlement = {
      id: `stl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      groupId: settlementData.groupId,
      fromMemberId: settlementData.fromMemberId,
      toMemberId: settlementData.toMemberId,
      amount: Number(settlementData.amount),
      status: settlementData.status || 'settled',
      upiLink: settlementData.upiLink || '',
      note: settlementData.note || 'SplitMate Settlement',
      settledAt: new Date().toISOString()
    };
    this.data.settlements.push(newSettlement);
    this.save();
    return newSettlement;
  }

  updateSettlementStatus(id, status) {
    const index = this.data.settlements.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.settlements[index].status = status;
    this.data.settlements[index].updatedAt = new Date().toISOString();
    this.save();
    return this.data.settlements[index];
  }
}

export const db = new Database();
