import React, { useState } from 'react';
import { useVendors } from '../../context/VendorContext';
import { useProjects } from '../../context/ProjectContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const PurchaseOrders = () => {
  const { purchaseOrders, vendors, addPurchaseOrder, updatePOStatus } = useVendors();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newPO, setNewPO] = useState({ vendorId: '', projectId: '', itemName: '', qty: '', unitPrice: '' });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Delivered': return 'success';
      case 'Pending Delivery': return 'warning';
      case 'Approved': return 'primary';
      default: return 'neutral';
    }
  };

  const columns = [
    { header: 'PO ID', accessor: 'id' },
    { 
      header: 'Vendor', 
      accessor: 'vendorId',
      render: (row) => vendors.find(v => v.id === row.vendorId)?.name || row.vendorId
    },
    { 
      header: 'Project', 
      accessor: 'projectId',
      render: (row) => projects.find(p => p.id === row.projectId)?.name || row.projectId
    },
    { header: 'Total Amount', accessor: 'totalAmount', render: (row) => `$${row.totalAmount}` },
    { header: 'Order Date', accessor: 'orderDate' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <Badge variant={getStatusBadge(row.status)}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.status === 'Approved' && (
            <Button variant="outline" size="sm" onClick={() => updatePOStatus(row.id, 'Pending Delivery')}>Mark Sent</Button>
          )}
        </div>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    const items = [{ name: newPO.itemName, qty: Number(newPO.qty), unitPrice: Number(newPO.unitPrice) }];
    const totalAmount = items[0].qty * items[0].unitPrice;
    
    addPurchaseOrder({
      vendorId: newPO.vendorId,
      projectId: newPO.projectId,
      items,
      totalAmount
    });
    
    setIsModalOpen(false);
    setNewPO({ vendorId: '', projectId: '', itemName: '', qty: '', unitPrice: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <p className="page-subtitle">Track materials ordered from vendors</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Create PO</Button>
      </div>

      <Card>
        <Table columns={columns} data={purchaseOrders} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleAdd} className="form-layout">
          <div className="form-group">
            <label>Select Vendor</label>
            <select className="form-input" required value={newPO.vendorId} onChange={e => setNewPO({...newPO, vendorId: e.target.value})}>
              <option value="">-- Choose Vendor --</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Select Project</label>
            <select className="form-input" required value={newPO.projectId} onChange={e => setNewPO({...newPO, projectId: e.target.value})}>
              <option value="">-- Choose Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Item Name</label>
            <input type="text" className="form-input" required value={newPO.itemName} onChange={e => setNewPO({...newPO, itemName: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" className="form-input" required min="1" value={newPO.qty} onChange={e => setNewPO({...newPO, qty: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Unit Price ($)</label>
              <input type="number" className="form-input" required min="0.1" step="0.1" value={newPO.unitPrice} onChange={e => setNewPO({...newPO, unitPrice: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create PO</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PurchaseOrders;

