import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

const FinanceDashboard = () => {
  const { budgets, transactions } = useFinance();

  const columns = [
    { header: 'Project', accessor: 'projectId' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount', render: (row) => `₹${row.amount}` },
    { header: 'Category', accessor: 'category' },
    { header: 'Date', accessor: 'date' },
    { header: 'Description', accessor: 'desc' }
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">Finance & Budget</h1>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {budgets.map(b => (
          <Card key={b.id} title={`Project Budget: ${b.projectId}`}>
            <p><strong>Total:</strong> ₹{b.totalBudget}</p>
            <p><strong>Spent:</strong> ₹{b.spentAmount}</p>
            <p><strong>Remaining:</strong> ₹{b.totalBudget - b.spentAmount}</p>
          </Card>
        ))}
      </div>
      <Card title="Transactions"><Table columns={columns} data={transactions} /></Card>
    </div>
  );
};
export default FinanceDashboard;

