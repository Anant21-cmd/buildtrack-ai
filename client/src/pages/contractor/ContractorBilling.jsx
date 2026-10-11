import React, { useState } from 'react';
import { FileText, Plus, Search, DollarSign, Download, ArrowRight, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useFinance } from '../../context/FinanceContext';

export default function ContractorBilling() {
  const { expenses: invoices, addExpense: addInvoice } = useFinance();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ projectId: '', amount: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const { projects } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await addInvoice({
        projectId: newInvoice.projectId,
        amount: parseFloat(newInvoice.amount),
        description: newInvoice.description,
        category: 'Invoice',
        date: new Date().toISOString().split('T')[0]
      });
      setIsCreateModalOpen(false);
      setNewInvoice({ projectId: '', amount: '', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    !searchQuery || 
    (inv.project && inv.project.name && inv.project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBilled = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0);
  const pendingPayment = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount || 0), 0); // Mock for now as status isn't in Expense schema

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Invoices & Billing</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Submit payment requests and track invoice status.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>Create New Invoice</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1e3a8a' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Billed</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>${totalBilled.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Pending Payment</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>${pendingPayment.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
          </div>
        </div>
      </div>

      <Card title="Invoice History">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search invoice ID or project..." style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>INVOICE ID</th>
                <th style={{ padding: '1rem' }}>PROJECT</th>
                <th style={{ padding: '1rem' }}>SUBMITTED DATE</th>
                <th style={{ padding: '1rem' }}>AMOUNT</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <FileText size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 500, margin: 0 }}>No invoices found.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Create a new invoice to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{inv.id.substring(0, 8)}</td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{inv.project ? inv.project.name : 'Unknown'}</td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{inv.date}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td style={{ padding: '1rem' }}><Badge status="PENDING" /></td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="ghost" size="sm" icon={Download}>PDF</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Invoice" maxWidth="500px">
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Project</label>
            <select 
              required
              value={newInvoice.projectId} 
              onChange={e => setNewInvoice({...newInvoice, projectId: e.target.value})} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
            >
              <option value="">Select a project...</option>
              {safeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Invoice Amount ($)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={newInvoice.amount} 
              onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} 
              placeholder="e.g. 5000.00"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Description of Work Completed</label>
            <textarea 
              required
              rows={3}
              value={newInvoice.description}
              onChange={e => setNewInvoice({...newInvoice, description: e.target.value})}
              placeholder="Describe what this invoice covers..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={CheckCircle}>Submit Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
