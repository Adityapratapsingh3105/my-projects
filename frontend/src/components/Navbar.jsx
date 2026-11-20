import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  Sparkles, 
  Plus, 
  RotateCcw, 
  ChevronDown, 
  UserCheck, 
  Receipt,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Navbar() {
  const { 
    currentMember, 
    members, 
    switchUser, 
    openAddExpense, 
    setIsBillScannerOpen,
    setActiveTab,
    refreshAll,
    showToast 
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean initial hostel sample data?')) return;
    try {
      setIsResetting(true);
      await api.resetDatabase();
      await refreshAll();
      showToast('Database reset to fresh hostel data!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all">
            <div className="w-full h-full bg-[#070c18] rounded-[10px] flex items-center justify-center">
              <span className="text-xl">💸</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Split<span className="text-emerald-400">Mate</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Hostel Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Smart Hostel Expense Splitter & Min-Tx Settle</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* AI Bill Scanner Action */}
          <button
            onClick={() => setIsBillScannerOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-500/25 transition-all shadow-sm shadow-emerald-950"
            title="Scan paper bill or receipt image with Gemini 3.8 Flash"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Scan Bill with</span> AI
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => openAddExpense()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 font-bold"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Expense</span>
          </button>

          {/* User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm">
                {currentMember?.avatar || '👤'}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentMember?.name || 'Rahul'}
                </div>
                <div className="text-[10px] text-emerald-400/90 font-mono">
                  {currentMember?.upiId || 'rahul@oksbi'}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Switch User Perspective
                    </p>
                    <p className="text-[11px] text-slate-500">
                      View debts & balances as:
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {members.map(m => {
                      const isCurrent = m.id === currentMember?.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            switchUser(m);
                            setIsUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                            isCurrent
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                              : 'hover:bg-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{m.avatar}</span>
                            <div>
                              <div className="text-xs font-semibold">{m.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{m.upiId}</div>
                            </div>
                          </div>
                          {isCurrent && <UserCheck className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleReset();
                      }}
                      disabled={isResetting}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset to Sample Hostel Data
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
