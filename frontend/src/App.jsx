import React from 'react';
import { useApp } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNav from './components/BottomNav.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Groups from './pages/Groups.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Expenses from './pages/Expenses.jsx';
import Settlements from './pages/Settlements.jsx';
import Analytics from './pages/Analytics.jsx';

// Modals
import AddExpenseModal from './components/AddExpenseModal.jsx';
import BillScannerModal from './components/BillScannerModal.jsx';
import UpiPaymentModal from './components/UpiPaymentModal.jsx';
import CreateGroupModal from './components/CreateGroupModal.jsx';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const { activeTab, toast } = useApp();

  return (
    <div className="min-h-screen bg-[#070c18] text-slate-100 flex flex-col antialiased">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'groups' && <Groups />}
          {activeTab === 'group-detail' && <GroupDetail />}
          {activeTab === 'expenses' && <Expenses />}
          {activeTab === 'settlements' && <Settlements />}
          {activeTab === 'analytics' && <Analytics />}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Modals */}
      <AddExpenseModal />
      <BillScannerModal />
      <UpiPaymentModal />
      <CreateGroupModal />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl animate-slide-up text-xs font-semibold">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className={toast.type === 'error' ? 'text-rose-200' : 'text-slate-200'}>
            {toast.message}
          </span>
        </div>
      )}

    </div>
  );
}
