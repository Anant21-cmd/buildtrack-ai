import React, { createContext, useContext, useState } from 'react';

const FinanceContext = createContext();
export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([
    { id: 'b1', projectId: 'p1', totalBudget: 5000000, spentAmount: 1200000, committedAmount: 300000 }
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'tx1', projectId: 'p1', type: 'Expense', amount: 15000, category: 'Materials', date: '2023-11-05', desc: 'Cement PO payment' }
  ]);

  const addTransaction = (tx) => {
    setTransactions([...transactions, { ...tx, id: `tx${transactions.length + 1}` }]);
    if (tx.type === 'Expense') {
      setBudgets(budgets.map(b => b.projectId === tx.projectId ? { ...b, spentAmount: b.spentAmount + Number(tx.amount) } : b));
    }
  };

  return (
    <FinanceContext.Provider value={{ budgets, transactions, addTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
};

