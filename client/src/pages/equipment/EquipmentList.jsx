import React, { useState } from 'react';
import { useEquipment } from '../../context/EquipmentContext';
import { useProjects } from '../../context/ProjectContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const EquipmentList = () => {
  const { equipment, addEquipment, updateEquipmentStatus } = useEquipment();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEq, setNewEq] = useState({ name: '', type: 'Heavy Machinery', lastMaintenance: '', nextMaintenance: '' });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available': return 'success';
      case 'In Use': return 'primary';
      case 'Maintenance': return 'warning';
      case 'Out of Service': return 'danger';
      default: return 'neutral';
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Equipment Name', accessor: 'name' },
    { header: 'Type', accessor: 'type' },
    { 
      header: 'Project Assignment', 
      accessor: 'projectId',
      render: (row) => row.projectId ? (projects.find(p => p.id === row.projectId)?.name || row.projectId) : 'None'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <Badge variant={getStatusBadge(row.status)}>{row.status}</Badge>
    },
    { header: 'Next Maintenance', accessor: 'nextMaintenance' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <select 
          value={row.status} 
          onChange={(e) => updateEquipmentStatus(row.id, e.target.value, row.projectId)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Out of Service">Out of Service</option>
        </select>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    addEquipment(newEq);
    setIsModalOpen(false);
    setNewEq({ name: '', type: 'Heavy Machinery', lastMaintenance: '', nextMaintenance: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Tracking</h1>
          <p className="page-subtitle">Manage heavy machinery, tools, and maintenance schedules</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Equipment</Button>
      </div>

      <Card>
        <Table columns={columns} data={equipment} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Equipment">
        <form onSubmit={handleAdd} className="form-layout">
          <div className="form-group">
            <label>Equipment Name / Model</label>
            <input type="text" className="form-input" required value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Equipment Type</label>
            <select className="form-input" value={newEq.type} onChange={e => setNewEq({...newEq, type: e.target.value})}>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Earthmoving">Earthmoving</option>
              <option value="Concrete">Concrete</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Vehicles">Vehicles</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Last Maintenance Date</label>
              <input type="date" className="form-input" required value={newEq.lastMaintenance} onChange={e => setNewEq({...newEq, lastMaintenance: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Next Maintenance Date</label>
              <input type="date" className="form-input" required value={newEq.nextMaintenance} onChange={e => setNewEq({...newEq, nextMaintenance: e.target.value})} />
            </div>
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Equipment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentList;
