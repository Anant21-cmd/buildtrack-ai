import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const { currentUser, token } = useAuth();

  const fetchExpenses = useCallback(async () => {
    if (!token || !currentUser?.companyId) return;
    try {
      const res = await fetch('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExpenses(data);
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (currentUser?.companyId) fetchExpenses();
  }, [currentUser, fetchExpenses]);

  const addExpense = async (expenseData) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(expenseData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to add expense');
    fetchExpenses();
    return result;
  };

  const updateExpense = async (id, updatedData) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData)
    });
    if (res.ok) fetchExpenses();
  };

  return (
    <FinanceContext.Provider value={{ expenses, budgets, addExpense, updateExpense, refreshData: fetchExpenses }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}
