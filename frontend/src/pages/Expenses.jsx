import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { 
  Receipt, 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Calendar,
  User,
  Layers
} from 'lucide-react';

export default function Expenses() {
  const { 
    expenses, 
    groups, 
    members, 
    openAddExpense, 
    refreshAll, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPayer, setSelectedPayer] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Filter logic
  const filteredExpenses = expenses.filter(exp => {
    // Search
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // Group
    const matchesGroup = selectedGroup === 'all' || exp.groupId === selectedGroup;

    // Category
    const matchesCategory = selectedCategory === 'all' || exp.category?.toLowerCase() === selectedCategory.toLowerCase();

    // Payer
    const matchesPayer = selectedPayer === 'all' || exp.paidBy === selectedPayer;

    return matchesSearch && matchesGroup && matchesCategory && matchesPayer;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? Balances will be recalculated.')) return;
    try {
      await api.deleteExpense(id);
      await refreshAll();
      showToast('Expense deleted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      showToast('No expenses to export', 'error');
      return;
    }

    const headers = ['Date', 'Title', 'Category', 'Amount (INR)', 'Paid By', 'Group', 'Split Type', 'Notes'];
    const rows = filteredExpenses.map(e => [
      `"${e.date || ''}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      Number(e.amount || 0).toFixed(2),
      `"${e.payerName || ''}"`,
      `"${e.groupName || ''}"`,
      `"${e.splitType || ''}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `splitmate_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported expenses to CSV!');
  };

  const totalFilteredSum = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Expense History</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search, filter, inspect split breakdowns, and export hostel records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            title="Download CSV for mess & hostel registers"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search expenses, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 text-xs focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">📁 All Groups</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">🏷️ All Categories</option>
              <option value="food">Food & Dining</option>
              <option value="groceries">Groceries & Mess</option>
              <option value="rent">Rent & Room</option>
              <option value="utilities">Utilities & Wi-Fi</option>
              <option value="travel">Travel & Scooter</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Paid By Filter */}
          <div>
            <select
              value={selectedPayer}
              onChange={(e) => setSelectedPayer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-emerald-500 outline-none"
            >
              <option value="all">👤 Paid by Anyone</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.avatar} {m.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter stats bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredExpenses.length}</strong> of {expenses.length} expenses
          </span>
          <span>
            Total Filtered Sum: <strong className="text-emerald-400 font-mono text-sm font-bold">₹{totalFilteredSum.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-2">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No expenses match your filters</p>
            <p className="text-xs text-slate-500">Try adjusting your search or category filters.</p>
          </div>
        ) : (
          filteredExpenses.map(exp => {
            const isExpanded = expandedId === exp.id;
            return (
              <div
                key={exp.id}
                className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800/80 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Left: icon, title, details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-inner">
                      {exp.groupIcon || '🍔'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-white">{exp.title}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {exp.category || 'Other'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                          {exp.splitType} split
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {exp.groupName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          Paid by <strong className="text-slate-200">{exp.payerName}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {exp.date}
                        </span>
                      </div>

                      {exp.notes && (
                        <p className="text-xs text-slate-400 italic mt-1.5">
                          "{exp.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: amount, expand toggle, delete */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-extrabold text-white font-mono block">
                        ₹{Number(exp.amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-semibold mt-0.5"
                      >
                        <span>{isExpanded ? 'Hide' : 'Split details'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

                {/* Expanded Split Breakdown */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs animate-fade-in">
                    
                    {/* Member Splits */}
                    {exp.splits && Object.keys(exp.splits).length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Member Share Breakdown
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(exp.splits).map(([memId, share]) => {
                            const m = members.find(mem => mem.id === memId);
                            return (
                              <div key={memId} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <span className="text-slate-300">
                                  {m?.avatar} {m?.name.split(' ')[0] || memId}
                                </span>
                                <span className="font-mono font-bold text-emerald-400">
                                  ₹{Number(share).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Extracted Line Items if any */}
                    {Array.isArray(exp.items) && exp.items.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Receipt Line Items
                        </p>
                        <div className="space-y-1">
                          {exp.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300 text-[11px] py-1 border-b border-slate-800/40">
                              <span>{it.quantity}x {it.name}</span>
                              <span className="font-mono">₹{Number(it.totalPrice || it.price).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
