import React, { useState } from 'react';
import { useVendors } from '../../context/VendorContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const VendorList = () => {
  const { vendors, addVendor } = useVendors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', category: '', rating: 5 });

  const columns = [
    { header: 'Vendor Name', accessor: 'name' },
    { header: 'Category', accessor: 'category' },
    { header: 'Rating', accessor: 'rating', render: (row) => `${row.rating} ⭐` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    addVendor(newVendor);
    setIsModalOpen(false);
    setNewVendor({ name: '', category: '', rating: 5 });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">Manage suppliers and subcontractors</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Vendor</Button>
      </div>

      <Card>
        <Table columns={columns} data={vendors} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vendor">
        <form onSubmit={handleAdd} className="form-layout">
          <div className="form-group">
            <label>Vendor Name</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={newVendor.name} 
              onChange={e => setNewVendor({...newVendor, name: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select 
              className="form-input" 
              required 
              value={newVendor.category} 
              onChange={e => setNewVendor({...newVendor, category: e.target.value})}
            >
              <option value="">Select Category</option>
              <option value="Cement & Concrete">Cement & Concrete</option>
              <option value="Steel & Metals">Steel & Metals</option>
              <option value="Wood & Lumber">Wood & Lumber</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
            </select>
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vendor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorList;

