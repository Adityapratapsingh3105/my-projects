import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  TrendingDown,
  RotateCcw,
  Clock
} from 'lucide-react';

export default function Settlements() {
  const { 
    groups, 
    members, 
    currentMember, 
    openUpiPayment, 
    refreshAll, 
    showToast 
  } = useApp();

  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [settlementData, setSettlementData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSettlementDetails = async () => {
    try {
      setLoading(true);
      const [stlRes, histRes] = await Promise.all([
        api.getSettlements(selectedGroupFilter === 'all' ? null : selectedGroupFilter),
        api.getSettlements(selectedGroupFilter === 'all' ? null : selectedGroupFilter)
      ]);
      setSettlementData(stlRes.data || null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettlementDetails();
  }, [selectedGroupFilter]);

  const summary = settlementData?.summary || {
    rawTransactionsCount: 0,
    simplifiedTransactionsCount: 0,
    transactionsSaved: 0,
    reductionPercent: 0,
    totalVolume: 0
  };

  const simplifiedList = settlementData?.simplifiedTransactions || [];
  const balances = settlementData?.balances || {};

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Smart Debt Settlement</h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">
              Min-Transactions Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Greedy balance algorithm simplifies multi-person hostel cross-debts down to minimum cash transfers.
          </p>
        </div>

        {/* Group Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Scope:</span>
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
          >
            <option value="all">🌐 All Hostel Groups Combined</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>
                {g.icon} {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Algorithm Optimization Summary Banner */}
      <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-[#0a0f1d] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Optimization Outcome
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {summary.reductionPercent > 0 
                ? `Eliminated ${summary.reductionPercent}% Redundant Transfers!`
                : 'All Accounts Balanced with Minimum Transfers'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Instead of {summary.rawTransactionsCount} messy back-and-forth payments between roommates, SplitMate resolves the entire debt web in just <strong>{summary.simplifiedTransactionsCount} direct UPI payment{summary.simplifiedTransactionsCount === 1 ? '' : 's'}</strong>.
            </p>
          </div>

          {/* Metrics comparison */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Bilateral</span>
              <p className="text-xl font-mono font-bold text-slate-400 line-through">
                {summary.rawTransactionsCount} txs
              </p>
            </div>
            <div className="text-emerald-400 font-bold text-lg">→</div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Optimized</span>
              <p className="text-2xl font-mono font-black text-emerald-400">
                {summary.simplifiedTransactionsCount} txs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Settlement Cards List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>Required Settlements</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            ({simplifiedList.length} transaction{simplifiedList.length === 1 ? '' : 's'} to clear all debts)
          </span>
        </h3>

        {simplifiedList.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Everyone is Squared Up!</h4>
            <p className="text-xs text-slate-400">
              There are no pending debts in this group. All balances are at zero.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simplifiedList.map((tx, idx) => {
              const isCurrentUserPayer = tx.fromMemberId === currentMember?.id;
              const isCurrentUserReceiver = tx.toMemberId === currentMember?.id;

              return (
                <div
                  key={idx}
                  className={`glass-panel p-5 rounded-3xl border transition-all ${
                    isCurrentUserPayer
                      ? 'border-rose-500/30 bg-rose-950/10'
                      : isCurrentUserReceiver
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Pay Flow */}
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                          {tx.fromMember.avatar}
                        </div>
                        <span className="text-xs font-bold text-slate-200 block mt-1 truncate max-w-[80px]">
                          {tx.fromMember.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-rose-400 font-semibold uppercase">Payer</span>
                      </div>

                      <div className="flex flex-col items-center px-1">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          ₹{Number(tx.amount).toFixed(2)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-500 my-0.5" />
                        <span className="text-[10px] text-slate-500">pays</span>
                      </div>

                      <div className="text-center">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                          {tx.toMember.avatar}
                        </div>
                        <span className="text-xs font-bold text-slate-200 block mt-1 truncate max-w-[80px]">
                          {tx.toMember.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase">Receiver</span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      onClick={() => openUpiPayment(tx)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI & QR</span>
                    </button>
                  </div>

                  {/* UPI Info Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">
                      Pay to: <strong className="text-slate-300">{tx.toMember.upiId || 'hostel@upi'}</strong>
                    </span>
                    {isCurrentUserPayer && (
                      <span className="text-rose-400 font-semibold">Action needed from you</span>
                    )}
                    {isCurrentUserReceiver && (
                      <span className="text-emerald-400 font-semibold">You will receive this</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Roommates Net Balance Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
        <h3 className="text-base font-bold text-white">Roommates Net Balances</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Hostel Friend</th>
                <th className="pb-3">UPI ID</th>
                <th className="pb-3">Net Balance Position</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map(m => {
                const bal = balances[m.id] || 0;
                const isCreditor = bal > 0.01;
                const isDebtor = bal < -0.01;
                const isCurrent = m.id === currentMember?.id;

                return (
                  <tr key={m.id} className={`hover:bg-slate-900/40 transition-colors ${isCurrent ? 'bg-emerald-500/5' : ''}`}>
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{m.avatar}</span>
                        <div>
                          <p className="font-bold text-slate-200">
                            {m.name} {isCurrent && <span className="text-[10px] text-emerald-400 font-normal">(You)</span>}
                          </p>
                          <p className="text-[10px] text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-slate-300">
                      {m.upiId || '—'}
                    </td>

                    <td className="py-3 font-mono font-bold text-sm">
                      {isCreditor && <span className="text-emerald-400">+₹{bal.toFixed(2)}</span>}
                      {isDebtor && <span className="text-rose-400">-₹{Math.abs(bal).toFixed(2)}</span>}
                      {!isCreditor && !isDebtor && <span className="text-slate-500">₹0.00</span>}
                    </td>

                    <td className="py-3 text-right pr-2">
                      {isCreditor && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          Gets back money
                        </span>
                      )}
                      {isDebtor && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                          Owes group
                        </span>
                      )}
                      {!isCreditor && !isDebtor && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
