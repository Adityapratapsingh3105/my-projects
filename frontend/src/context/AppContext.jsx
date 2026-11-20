import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Navigation & View
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Core Data
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [settlementData, setSettlementData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [addExpensePrefill, setAddExpensePrefill] = useState(null);
  const [isBillScannerOpen, setIsBillScannerOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isUpiPaymentOpen, setIsUpiPaymentOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch initial data
  const loadData = useCallback(async (memberId = null) => {
    try {
      setLoading(true);
      const [membersRes, groupsRes, expensesRes] = await Promise.all([
        api.getMembers(),
        api.getGroups(),
        api.getExpenses()
      ]);

      const loadedMembers = membersRes.data || [];
      setMembers(loadedMembers);
      setGroups(groupsRes.data || []);
      setExpenses(expensesRes.data || []);

      // Set active user
      const activeUser = memberId
        ? loadedMembers.find(m => m.id === memberId) || loadedMembers[0]
        : currentMember || loadedMembers[0];
      setCurrentMember(activeUser);

      // Fetch dashboard stats & settlements for active user
      if (activeUser) {
        const [statsRes, settlementsRes] = await Promise.all([
          api.getDashboardStats(activeUser.id),
          api.getSettlements(selectedGroupId || null)
        ]);
        setStats(statsRes.data || null);
        setSettlementData(settlementsRes.data || null);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentMember, selectedGroupId, showToast]);

  useEffect(() => {
    loadData();
  }, []);

  // Switch perspective / current user
  const switchUser = async (member) => {
    setCurrentMember(member);
    try {
      const statsRes = await api.getDashboardStats(member.id);
      setStats(statsRes.data || null);
      showToast(`Switched view to ${member.name}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch active group view
  const openGroupDetail = (groupId) => {
    setSelectedGroupId(groupId);
    setActiveTab('group-detail');
  };

  // Open add expense with optional prefilled items (e.g. from AI Bill Scanner)
  const openAddExpense = (prefill = null) => {
    setAddExpensePrefill(prefill);
    setIsAddExpenseOpen(true);
  };

  const closeAddExpense = () => {
    setAddExpensePrefill(null);
    setIsAddExpenseOpen(false);
  };

  // Open UPI payment modal
  const openUpiPayment = (paymentData) => {
    setActivePayment(paymentData);
    setIsUpiPaymentOpen(true);
  };

  const closeUpiPayment = () => {
    setActivePayment(null);
    setIsUpiPaymentOpen(false);
  };

  // Refresh helper
  const refreshAll = async () => {
    await loadData(currentMember?.id);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedGroupId,
        setSelectedGroupId,
        openGroupDetail,
        members,
        currentMember,
        switchUser,
        groups,
        expenses,
        stats,
        settlementData,
        loading,
        refreshAll,
        // Modals
        isAddExpenseOpen,
        openAddExpense,
        closeAddExpense,
        addExpensePrefill,
        isBillScannerOpen,
        setIsBillScannerOpen,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        isUpiPaymentOpen,
        activePayment,
        openUpiPayment,
        closeUpiPayment,
        // Toast
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
