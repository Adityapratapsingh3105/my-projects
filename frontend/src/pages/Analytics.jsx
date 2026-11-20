import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  PieChart, 
  TrendingUp, 
  Users, 
  Receipt, 
  Award,
  Wallet
} from 'lucide-react';

export default function Analytics() {
  const { expenses, groups, members } = useApp();

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Category breakdown
  const categoryTotals = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
  });

  const categoryList = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Spender breakdown
  const payerTotals = {};
  expenses.forEach(e => {
    payerTotals[e.paidBy] = (payerTotals[e.paidBy] || 0) + Number(e.amount || 0);
  });

  const payerList = members.map(m => ({
    member: m,
    totalPaid: payerTotals[m.id] || 0,
    percentage: totalSpent > 0 ? Math.round(((payerTotals[m.id] || 0) / totalSpent) * 100) : 0
  })).sort((a, b) => b.totalPaid - a.totalPaid);

  const topSpender = payerList[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Spending Analytics</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Deep dive into hostel expenses, category trends, and member spending behavior.
        </p>
      </div>

      {/* Top 3 Quick Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Spending</p>
              <h3 className="text-2xl font-extrabold text-white font-mono">
                ₹{totalSpent.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Top Spender</p>
              <h3 className="text-base font-extrabold text-white truncate">
                {topSpender ? `${topSpender.member.avatar} ${topSpender.member.name}` : '—'}
              </h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                ₹{topSpender ? topSpender.totalPaid.toLocaleString('en-IN') : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/20 text-sky-300">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Avg per Expense</p>
              <h3 className="text-2xl font-extrabold text-white font-mono">
                ₹{expenses.length > 0 ? Math.round(totalSpent / expenses.length).toLocaleString('en-IN') : 0}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Roommate Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Spending by Category
          </h3>

          <div className="space-y-4">
            {categoryList.map((cat, idx) => {
              const colors = [
                'bg-emerald-500',
                'bg-teal-400',
                'bg-sky-400',
                'bg-amber-400',
                'bg-indigo-400',
                'bg-rose-400',
                'bg-purple-400'
              ];
              const barColor = colors[idx % colors.length];

              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="font-mono text-slate-300">
                      ₹{cat.amount.toLocaleString('en-IN')} <span className="text-slate-500">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roommate Paid Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Upfront Bill Payers
          </h3>

          <div className="space-y-4">
            {payerList.map((p) => (
              <div key={p.member.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span>{p.member.avatar}</span>
                    <span className="font-semibold text-slate-200">{p.member.name}</span>
                  </div>
                  <span className="font-mono text-slate-300">
                    ₹{p.totalPaid.toLocaleString('en-IN')} <span className="text-slate-500">({p.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
