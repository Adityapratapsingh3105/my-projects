import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { LayoutDashboard, Users, Plus, Zap, Receipt } from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, openAddExpense } = useApp();

  const navs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'add', label: 'Add', isAction: true },
    { id: 'settlements', label: 'Settle', icon: Zap },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-around">
        {navs.map((n) => {
          if (n.isAction) {
            return (
              <button
                key={n.id}
                onClick={() => openAddExpense()}
                className="-mt-5 w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
                title="Add Expense"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            );
          }

          const Icon = n.icon;
          const isActive = activeTab === n.id;

          return (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
