import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { 
  X, 
  Receipt, 
  Users, 
  Check, 
  Plus, 
  Trash2, 
  AlertCircle,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function AddExpenseModal() {
  const { 
    isAddExpenseOpen, 
    closeAddExpense, 
    addExpensePrefill, 
    groups, 
    members, 
    currentMember,
    selectedGroupId,
    refreshAll, 
    showToast 
  } = useApp();

  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'unequal' | 'percentage' | 'itemwise'

  // Custom split storage
  const [unequalSplits, setUnequalSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [items, setItems] = useState([
    { name: '', quantity: 1, price: 0, totalPrice: 0, assignedTo: [] }
  ]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available participants in the chosen group
  const activeGroup = groups.find(g => g.id === groupId);
  const groupMembers = members.filter(m => activeGroup?.memberIds?.includes(m.id)) || members;

  // Initialize or prefill state when modal opens
  useEffect(() => {
    if (isAddExpenseOpen) {
      const defaultGroup = selectedGroupId || (groups[0]?.id || '');
      setGroupId(defaultGroup);

      const targetGroup = groups.find(g => g.id === defaultGroup);
      const defaultGroupMems = targetGroup?.memberIds || members.map(m => m.id);

      setPaidBy(currentMember?.id || defaultGroupMems[0] || '');
      setSelectedParticipants(defaultGroupMems);

      if (addExpensePrefill) {
        setTitle(addExpensePrefill.title || addExpensePrefill.merchantName || 'Bill Expense');
        setAmount(addExpensePrefill.amount || addExpensePrefill.totalAmount || '');
        setCategory(addExpensePrefill.category || 'Food');
        setDate(addExpensePrefill.date || new Date().toISOString().split('T')[0]);
        setNotes(addExpensePrefill.notes || '');

        if (Array.isArray(addExpensePrefill.items) && addExpensePrefill.items.length > 0) {
          setItems(addExpensePrefill.items.map(it => ({
            name: it.name || 'Item',
            quantity: it.quantity || 1,
            price: it.price || 0,
            totalPrice: it.totalPrice || (it.price * it.quantity) || 0,
            assignedTo: defaultGroupMems
          })));
          setSplitType('itemwise');
        }
      } else {
        setTitle('');
        setAmount('');
        setCategory('Food');
        setDate(new Date().toISOString().split('T')[0]);
        setSplitType('equal');
        setUnequalSplits({});
        setPercentageSplits({});
        setItems([{ name: '', quantity: 1, price: 0, totalPrice: 0, assignedTo: defaultGroupMems }]);
        setNotes('');
      }
    }
  }, [isAddExpenseOpen, addExpensePrefill, groups, members, currentMember, selectedGroupId]);

  // When group changes, update participants list
  const handleGroupChange = (newGroupId) => {
    setGroupId(newGroupId);
    const grp = groups.find(g => g.id === newGroupId);
    const memIds = grp?.memberIds || [];
    setSelectedParticipants(memIds);
    if (!memIds.includes(paidBy)) {
      setPaidBy(memIds[0] || '');
    }
  };

  const toggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length === 1) {
        showToast('At least one participant must be selected', 'error');
        return;
      }
      setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  // Add Item for item-wise split
  const addItem = () => {
    setItems([
      ...items,
      { name: '', quantity: 1, price: 0, totalPrice: 0, assignedTo: [...selectedParticipants] }
    ]);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'price') {
      const q = Number(field === 'quantity' ? value : updated[index].quantity) || 0;
      const p = Number(field === 'price' ? value : updated[index].price) || 0;
      updated[index].totalPrice = Math.round(q * p * 100) / 100;
    }
    setItems(updated);

    // Auto update total amount if in itemwise mode
    if (splitType === 'itemwise') {
      const sum = updated.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
      setAmount(sum.toString());
    }
  };

  const toggleItemAssignee = (itemIdx, memberId) => {
    const updated = [...items];
    const currentAssigned = updated[itemIdx].assignedTo || [];
    if (currentAssigned.includes(memberId)) {
      if (currentAssigned.length === 1) return;
      updated[itemIdx].assignedTo = currentAssigned.filter(id => id !== memberId);
    } else {
      updated[itemIdx].assignedTo = [...currentAssigned, memberId];
    }
    setItems(updated);
  };

  // Compute splits map and validation
  const computeFinalSplits = () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return { error: 'Please enter a valid expense amount' };
    if (selectedParticipants.length === 0) return { error: 'Select at least one participant' };

    const splits = {};

    if (splitType === 'equal') {
      const perHead = Math.round((numAmount / selectedParticipants.length) * 100) / 100;
      let assignedSum = 0;
      selectedParticipants.forEach((pId, idx) => {
        if (idx === selectedParticipants.length - 1) {
          splits[pId] = Math.round((numAmount - assignedSum) * 100) / 100;
        } else {
          splits[pId] = perHead;
          assignedSum += perHead;
        }
      });
      return { splits };
    }

    if (splitType === 'unequal') {
      let sum = 0;
      selectedParticipants.forEach(pId => {
        const val = Number(unequalSplits[pId]) || 0;
        splits[pId] = val;
        sum += val;
      });
      const diff = Math.abs(sum - numAmount);
      if (diff > 0.05) {
        return { 
          error: `Total of splits (₹${sum.toFixed(2)}) must equal the expense amount (₹${numAmount.toFixed(2)}). Difference: ₹${(numAmount - sum).toFixed(2)}` 
        };
      }
      return { splits };
    }

    if (splitType === 'percentage') {
      let percentSum = 0;
      selectedParticipants.forEach(pId => {
        const pct = Number(percentageSplits[pId]) || 0;
        percentSum += pct;
      });
      if (Math.abs(percentSum - 100) > 0.5) {
        return { error: `Percentages must sum to 100%. Current sum: ${percentSum}%` };
      }
      selectedParticipants.forEach(pId => {
        const pct = Number(percentageSplits[pId]) || 0;
        splits[pId] = Math.round(((pct / 100) * numAmount) * 100) / 100;
      });
      return { splits };
    }

    if (splitType === 'itemwise') {
      selectedParticipants.forEach(pId => {
        splits[pId] = 0;
      });
      items.forEach(it => {
        const itTotal = Number(it.totalPrice) || 0;
        const assignees = (it.assignedTo && it.assignedTo.length > 0) ? it.assignedTo : selectedParticipants;
        const perPerson = itTotal / assignees.length;
        assignees.forEach(pId => {
          splits[pId] = (splits[pId] || 0) + perPerson;
        });
      });
      // Round splits
      let sum = 0;
      for (const pId of Object.keys(splits)) {
        splits[pId] = Math.round(splits[pId] * 100) / 100;
        sum += splits[pId];
      }
      return { splits };
    }

    return { splits };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an expense title', 'error');
      return;
    }
    const result = computeFinalSplits();
    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        groupId,
        title: title.trim(),
        amount: Number(amount),
        category,
        date,
        paidBy,
        participants: selectedParticipants,
        splitType,
        splits: result.splits,
        items: splitType === 'itemwise' ? items : [],
        notes
      };

      await api.createExpense(payload);
      await refreshAll();
      showToast('Expense added successfully!');
      closeAddExpense();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAddExpenseOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0f1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add New Expense</h3>
              <p className="text-xs text-slate-400">Record a hostel bill or shared expense</p>
            </div>
          </div>
          <button 
            onClick={closeAddExpense}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Group and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Group
              </label>
              <select
                value={groupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              >
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Food">🍔 Food & Dining</option>
                <option value="Groceries">🛒 Groceries & Mess</option>
                <option value="Rent">🏠 Rent & Room</option>
                <option value="Utilities">💡 Utilities & Wi-Fi</option>
                <option value="Travel">🚗 Travel & Cab</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          </div>

          {/* Title and Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expense Description
              </label>
              <input
                type="text"
                placeholder="e.g. Late Night Maggi, Zomato Biryani, WiFi bill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Total Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Paid By and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              >
                {groupMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name} ({m.upiId || 'No UPI'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Participants Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Split with ({selectedParticipants.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {groupMembers.map(m => {
                const isSelected = selectedParticipants.includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleParticipant(m.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{m.avatar}</span>
                    <span className="truncate">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Split Method
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
              {[
                { id: 'equal', label: 'Equal Split' },
                { id: 'unequal', label: 'Unequal' },
                { id: 'percentage', label: 'Percentage' },
                { id: 'itemwise', label: 'Item-wise' },
              ].map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setSplitType(tab.id)}
                  className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all ${
                    splitType === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Type Details Panel */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            {/* Equal Split */}
            {splitType === 'equal' && (
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between items-center text-slate-300 font-semibold pb-1 border-b border-slate-800">
                  <span>Equal Share per Person:</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    ₹{selectedParticipants.length > 0 && Number(amount) > 0
                      ? (Number(amount) / selectedParticipants.length).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Divided equally among all {selectedParticipants.length} selected hostel roommates.
                </p>
              </div>
            )}

            {/* Unequal Split */}
            {splitType === 'unequal' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Specify exact amount for each member:</span>
                  <span className="font-mono font-bold text-slate-300">
                    Remaining: ₹{(Number(amount || 0) - Object.values(unequalSplits).reduce((s, v) => s + (Number(v) || 0), 0)).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedParticipants.map(memId => {
                    const m = members.find(mem => mem.id === memId);
                    return (
                      <div key={memId} className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-300 font-medium truncate w-1/2">
                          {m?.avatar} {m?.name}
                        </span>
                        <div className="relative w-36">
                          <span className="absolute left-3 top-2 text-slate-500">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={unequalSplits[memId] || ''}
                            onChange={(e) => setUnequalSplits({ ...unequalSplits, [memId]: e.target.value })}
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Percentage Split */}
            {splitType === 'percentage' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Specify share percentage:</span>
                  <span className="font-mono font-bold text-slate-300">
                    Total: {Object.values(percentageSplits).reduce((s, v) => s + (Number(v) || 0), 0)}% / 100%
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedParticipants.map(memId => {
                    const m = members.find(mem => mem.id === memId);
                    const pct = Number(percentageSplits[memId] || 0);
                    const calcAmount = Number(amount) ? ((pct / 100) * Number(amount)).toFixed(2) : '0.00';
                    return (
                      <div key={memId} className="flex items-center justify-between gap-3 text-xs">
                        <div className="w-1/2 truncate">
                          <span className="text-slate-300 font-medium">
                            {m?.avatar} {m?.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            (₹{calcAmount})
                          </span>
                        </div>
                        <div className="relative w-32">
                          <input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={percentageSplits[memId] || ''}
                            onChange={(e) => setPercentageSplits({ ...percentageSplits, [memId]: e.target.value })}
                            className="w-full pr-7 pl-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono focus:border-emerald-500 outline-none"
                          />
                          <span className="absolute right-3 top-2 text-slate-500">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item-wise Split */}
            {splitType === 'itemwise' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Assign individual items to who consumed them:</p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Item name (e.g. Biryani, Pizza)"
                          value={it.name}
                          onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs text-center focus:border-emerald-500 outline-none"
                        />
                        <div className="relative w-24">
                          <span className="absolute left-2.5 top-1.5 text-slate-500 text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={it.price}
                            onChange={(e) => updateItem(idx, 'price', e.target.value)}
                            className="w-full pl-6 pr-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs text-right focus:border-emerald-500 outline-none"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Who ate/shared this item */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">Shared by:</span>
                        {selectedParticipants.map(memId => {
                          const m = members.find(mem => mem.id === memId);
                          const isAssigned = (it.assignedTo || []).includes(memId);
                          return (
                            <button
                              type="button"
                              key={memId}
                              onClick={() => toggleItemAssignee(idx, memId)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                                isAssigned
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                              }`}
                            >
                              {m?.avatar} {m?.name.split(' ')[0]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes or Remarks (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Paid via GPay, receipt attached"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeAddExpense}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Expense...' : 'Save Expense'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
