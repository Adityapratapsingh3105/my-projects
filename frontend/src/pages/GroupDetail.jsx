import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Receipt, 
  Zap, 
  QrCode, 
  CheckCircle2, 
  Trash2,
  TrendingUp,
  Share2
} from 'lucide-react';

export default function GroupDetail() {
  const { 
    selectedGroupId, 
    setActiveTab, 
    groups, 
    members, 
    openAddExpense, 
    openUpiPayment, 
    currentMember,
    refreshAll,
    showToast 
  } = useApp();

  const [group, setGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupSettlements, setGroupSettlements] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGroupData = async () => {
    if (!selectedGroupId) return;
    try {
      setLoading(true);
      const [grpRes, expRes, stlRes] = await Promise.all([
        api.getGroupById(selectedGroupId),
        api.getExpenses({ groupId: selectedGroupId }),
        api.getSettlements(selectedGroupId)
      ]);
      setGroup(grpRes.data);
      setGroupExpenses(expRes.data || []);
      setGroupSettlements(stlRes.data || null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [selectedGroupId]);

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      await loadGroupData();
      await refreshAll();
      showToast('Expense deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!group && !loading) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-slate-400">Group not found.</p>
        <button
          onClick={() => setActiveTab('groups')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const groupMembers = members.filter(m => group?.memberIds?.includes(m.id)) || [];
  const balances = groupSettlements?.balances || {};

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Bar Navigation */}
      <button
        onClick={() => setActiveTab('groups')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Groups
      </button>

      {/* Group Hero Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-lg">
              {group?.icon || '🏠'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white">{group?.name}</h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  {group?.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {group?.description || 'Group expenses for hostel members.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Group Expense
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400">Total Group Spending</span>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              ₹{Math.round(group?.totalExpense || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Total Expenses</span>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {groupExpenses.length} entries
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400">Roommates in Group</span>
            <p className="text-xl font-bold font-mono text-white mt-0.5">
              {groupMembers.length} members
            </p>
          </div>
        </div>
      </div>

      {/* Member Balances in this Group */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Member Balances
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {groupMembers.map(m => {
            const bal = balances[m.id] || 0;
            const isOwed = bal > 0.01;
            const owes = bal < -0.01;
            return (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{m.avatar}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{m.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{m.upiId}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs font-bold">
                  {isOwed && <span className="text-emerald-400">+₹{bal.toFixed(2)}</span>}
                  {owes && <span className="text-rose-400">-₹{Math.abs(bal).toFixed(2)}</span>}
                  {!isOwed && !owes && <span className="text-slate-500">Settled (₹0)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Settlements for this group */}
      {groupSettlements?.simplifiedTransactions?.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-[#0a0f1d] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Optimized Settlements ({groupSettlements.simplifiedTransactions.length} transaction{groupSettlements.simplifiedTransactions.length > 1 ? 's' : ''})
              </h3>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Min-Transactions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupSettlements.simplifiedTransactions.map((tx, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-sm">
                      {tx.fromMember.avatar}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-slate-900 flex items-center justify-center text-sm">
                      {tx.toMember.avatar}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      <strong>{tx.fromMember.name}</strong> pays <strong>{tx.toMember.name}</strong>
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-400">
                      ₹{Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openUpiPayment({ ...tx, groupId: group.id })}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                >
                  Pay via UPI
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses in this Group */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Group Expenses</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {groupExpenses.length} entries
          </span>
        </div>

        <div className="space-y-3">
          {groupExpenses.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No expenses recorded yet in this group. Click "+ Add Group Expense" above to add the first bill!
            </p>
          ) : (
            groupExpenses.map(exp => (
              <div
                key={exp.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{exp.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                    <span>Paid by <strong className="text-slate-300">{exp.payerName}</strong></span>
                    <span>•</span>
                    <span className="capitalize">{exp.splitType} split</span>
                    <span>•</span>
                    <span>{exp.date}</span>
                    {exp.notes && (
                      <>
                        <span>•</span>
                        <span className="italic text-slate-500 truncate max-w-xs">{exp.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold font-mono text-white">
                    ₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
