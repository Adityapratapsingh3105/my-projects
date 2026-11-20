import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Zap, 
  PieChart, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    groups, 
    openGroupDetail, 
    setIsCreateGroupOpen,
    currentMember,
    setIsBillScannerOpen
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'groups', label: 'Hostel Groups', icon: Users, badge: groups.length },
    { id: 'settlements', label: 'Smart Settlements', icon: Zap, highlight: 'Min-Tx AI' },
    { id: 'expenses', label: 'All Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: PieChart }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800/80 bg-[#0a0f1d] p-4 min-h-[calc(100vh-65px)]">
      
      <div className="space-y-6">
        
        {/* Navigation Links */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.highlight}
                    </span>
                  )}

                  {item.badge !== undefined && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Your Groups List */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Hostel Groups
            </p>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              title="Create new group"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => openGroupDetail(group.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-900/80 transition-colors group text-left"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="text-sm shrink-0">{group.icon || '🏠'}</span>
                  <span className="truncate group-hover:text-emerald-400 transition-colors">
                    {group.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  ₹{Math.round(group.totalExpense || 0)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hackathon AI Bill Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-[#0a0f1d] border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Gemini 3.8 OCR</h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
            Snap your canteen bill or restaurant receipt to auto-extract items.
          </p>
          <button
            onClick={() => setIsBillScannerOpen(true)}
            className="w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center gap-1 transition-all"
          >
            Try Scanner <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Active User Card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg">
            {currentMember?.avatar || '👤'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">
              {currentMember?.name || 'Rahul'}
            </p>
            <p className="text-[10px] text-emerald-400 font-mono truncate">
              {currentMember?.upiId || 'rahul@oksbi'}
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}
