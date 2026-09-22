import React, { useState } from 'react';
import { useIssues } from '../../context/IssueContext';
import { useProjects } from '../../context/ProjectContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const IssueList = () => {
  const { issues, addIssue, updateIssueStatus } = useIssues();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', projectId: '', category: 'QA/QC', severity: 'Medium', description: '' });

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      case 'Low': return 'success';
      default: return 'neutral';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Resolved': return 'success';
      case 'In Progress': return 'warning';
      case 'Open': return 'danger';
      default: return 'neutral';
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { 
      header: 'Project', 
      accessor: 'projectId',
      render: (row) => projects.find(p => p.id === row.projectId)?.name || row.projectId
    },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Severity', 
      accessor: 'severity',
      render: (row) => <Badge variant={getSeverityBadge(row.severity)}>{row.severity}</Badge>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => <Badge variant={getStatusBadge(row.status)}>{row.status}</Badge>
    },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <select 
          value={row.status} 
          onChange={(e) => updateIssueStatus(row.id, e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      )
    }
  ];

  const handleAdd = (e) => {
    e.preventDefault();
    addIssue({
      ...newIssue,
      reportedBy: 'Current User'
    });
    setIsModalOpen(false);
    setNewIssue({ title: '', projectId: '', category: 'QA/QC', severity: 'Medium', description: '' });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issue Reporting & Snag List</h1>
          <p className="page-subtitle">Track QA/QC and Safety issues across projects</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Report Issue</Button>
      </div>

      <Card>
        <Table columns={columns} data={issues} />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report New Issue">
        <form onSubmit={handleAdd} className="form-layout">
          <div className="form-group">
            <label>Issue Title</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={newIssue.title} 
              onChange={e => setNewIssue({...newIssue, title: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Project</label>
            <select 
              className="form-input" 
              required 
              value={newIssue.projectId} 
              onChange={e => setNewIssue({...newIssue, projectId: e.target.value})}
            >
              <option value="">-- Select Project --</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={newIssue.category} onChange={e => setNewIssue({...newIssue, category: e.target.value})}>
                <option value="QA/QC">QA/QC</option>
                <option value="Safety">Safety</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select className="form-input" value={newIssue.severity} onChange={e => setNewIssue({...newIssue, severity: e.target.value})}>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-input" 
              rows="3" 
              required
              value={newIssue.description}
              onChange={e => setNewIssue({...newIssue, description: e.target.value})}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Issue</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IssueList;

