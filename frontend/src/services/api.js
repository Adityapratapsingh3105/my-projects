const API_BASE = '/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }
  return data;
}

export const api = {
  // Groups
  getGroups: async () => {
    const res = await fetch(`${API_BASE}/groups`);
    return handleResponse(res);
  },
  getGroupById: async (id) => {
    const res = await fetch(`${API_BASE}/groups/${id}`);
    return handleResponse(res);
  },
  createGroup: async (groupData) => {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData)
    });
    return handleResponse(res);
  },

  // Members
  getMembers: async () => {
    const res = await fetch(`${API_BASE}/members`);
    return handleResponse(res);
  },
  createMember: async (memberData) => {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    return handleResponse(res);
  },

  // Expenses
  getExpenses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/expenses?${query}` : `${API_BASE}/expenses`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  getExpenseById: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`);
    return handleResponse(res);
  },
  createExpense: async (expenseData) => {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    return handleResponse(res);
  },
  updateExpense: async (id, updateData) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    return handleResponse(res);
  },
  deleteExpense: async (id) => {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  getDashboardStats: async (currentMemberId) => {
    const url = currentMemberId 
      ? `${API_BASE}/stats/dashboard?currentMemberId=${currentMemberId}` 
      : `${API_BASE}/stats/dashboard`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Settlements & Smart Optimization
  getSettlements: async (groupId = null) => {
    const url = groupId ? `${API_BASE}/settlements?groupId=${groupId}` : `${API_BASE}/settlements`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  recordSettlement: async (settlementData) => {
    const res = await fetch(`${API_BASE}/settlements/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settlementData)
    });
    return handleResponse(res);
  },
  resetDatabase: async () => {
    const res = await fetch(`${API_BASE}/settlements/reset`, {
      method: 'POST'
    });
    return handleResponse(res);
  },

  // AI Bill Scanner
  scanBill: async (formData) => {
    const res = await fetch(`${API_BASE}/ai/scan-bill`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return handleResponse(res);
  }
};
