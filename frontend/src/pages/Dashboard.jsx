import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import StatCard from '../components/StatCard.jsx';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Sparkles, 
  Plus, 
  Zap, 
  Receipt,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    currentMember, 
    stats, 
    groups, 
    expenses, 
    openAddExpense, 
    setIsBillScannerOpen, 
    openGroupDetail, 
    setActiveTab,
    openUpiPayment,
    settlementData 
  } = useApp();

  const totalSpent = stats?.totalGroupExpenses || 0;
  const whoOwesMe = stats?.whoOwesMe || 0;
  const whatIOwe = stats?.whatIOwe || 0;
  const netBalance = stats?.myNetBalance || 0;

  // Filter simplified settlements involving current active user
  const mySettlements = (settlementData?.simplifiedTransactions || []).filter(
    tx => tx.fromMemberId === currentMember?.id || tx.toMemberId === currentMember?.id
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentMember?.avatar || '👋'}</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Hey, {currentMember?.name || 'Friend'}!
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Welcome to <span className="text-emerald-400 font-semibold">SplitMate</span>. Track hostel room bills, food orders, and settle debts with minimum UPI transactions.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsBillScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Scan Bill</span>
            </button>

            <button
              onClick={() => openAddExpense()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Four Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Group Spending"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          subtitle={`${expenses.length} total shared expenses`}
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="You Are Owed"
          value={`₹${whoOwesMe.toLocaleString('en-IN')}`}
          subtitle={whoOwesMe > 0 ? "Friends owe you money" : "You have no pending credits"}
          icon={ArrowDownLeft}
          color="blue"
        />

        <StatCard
          title="What You Owe"
          value={`₹${whatIOwe.toLocaleString('en-IN')}`}
          subtitle={whatIOwe > 0 ? "You have pending settlements" : "You're all squared up!"}
          icon={ArrowUpRight}
          color={whatIOwe > 0 ? "rose" : "emerald"}
        />

        <StatCard
          title="Your Net Position"
          value={netBalance >= 0 ? `+₹${netBalance.toLocaleString('en-IN')}` : `-₹${Math.abs(netBalance).toLocaleString('en-IN')}`}
          subtitle={netBalance >= 0 ? "In the green (Net Creditor)" : "In the red (Net Debtor)"}
          icon={Zap}
          color={netBalance >= 0 ? "emerald" : "amber"}
          onClick={() => setActiveTab('settlements')}
        />
      </div>

      {/* Smart Settlement Notice & Actions */}
      {mySettlements.length > 0 && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-[#0a0f1d] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Smart Settlement Ready ({mySettlements.length} payment{mySettlements.length > 1 ? 's' : ''})
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    Min-Tx Optimized
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  The algorithm simplified multi-person hostel debts into direct single-transfer UPI payments.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('settlements')}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0"
            >
              View Settlements <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Pay Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
            {mySettlements.slice(0, 2).map((tx, idx) => {
              const isPayer = tx.fromMemberId === currentMember?.id;
              return (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isPayer ? tx.toMember.avatar : tx.fromMember.avatar}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {isPayer ? `You owe ${tx.toMember.name}` : `${tx.fromMember.name} owes you`}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-mono font-bold">
                        ₹{Number(tx.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openUpiPayment(tx)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all"
                  >
                    Pay via UPI
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Expenses & Active Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Expenses */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Recent Activity</h3>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              View All ({expenses.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses.slice(0, 5).map(exp => (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-lg">
                    {exp.groupIcon || '🍔'}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-200">
                      {exp.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{exp.groupName}</span>
                      <span>•</span>
                      <span>Paid by <strong className="text-slate-300">{exp.payerName}</strong></span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-white font-mono">
                    ₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-emerald-400/90 capitalize font-medium">
                    {exp.splitType} split
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hostel Groups */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Your Groups</h3>
            </div>
            <button
              onClick={() => setActiveTab('groups')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              See All
            </button>
          </div>

          <div className="space-y-3">
            {groups.map(group => (
              <div
                key={group.id}
                onClick={() => openGroupDetail(group.id)}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{group.icon || '🏠'}</span>
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {group.name}
                    </h5>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    ₹{Math.round(group.totalExpense || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{group.type}</span>
                  <span>{group.memberIds?.length || 0} roommates</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
