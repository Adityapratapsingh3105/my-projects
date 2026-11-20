import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Users, Plus, ArrowRight, Wallet, Receipt } from 'lucide-react';

export default function Groups() {
  const { groups, members, openGroupDetail, setIsCreateGroupOpen } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Hostel & Trip Groups</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage room expenses, canteen splits, trips, and shared apartment bills.
          </p>
        </div>

        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create New Group</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {groups.map(group => {
          const groupMems = members.filter(m => group.memberIds?.includes(m.id));
          return (
            <div
              key={group.id}
              onClick={() => openGroupDetail(group.id)}
              className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                {/* Icon & Type */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                    {group.icon || '🏠'}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {group.type}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {group.description || 'Shared expenses for hostel members.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                {/* Spending & Count */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    {group.expenseCount || 0} expenses
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    ₹{Math.round(group.totalExpense || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Members Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    {groupMems.map(m => (
                      <div
                        key={m.id}
                        title={m.name}
                        className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#0a0f1d] flex items-center justify-center text-xs shadow-sm"
                      >
                        {m.avatar}
                      </div>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
