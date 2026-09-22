import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  QrCode,
  MapPin,
  Phone,
  Briefcase,
  HardHat,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useWorkers, WORKER_STATUSES, TRADE_ROLES, CONTRACTOR_GROUPS } from '../../context/WorkerContext';
import { useProjects } from '../../context/ProjectContext';

export default function WorkerList() {
  const { workers, addWorker, updateWorker, removeWorker, reassignWorker } = useWorkers();
  const { projects } = useProjects();

  // Filter States
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    phone: '',
    role: TRADE_ROLES[0],
    skill: '',
    contractor: CONTRACTOR_GROUPS[0],
    assignedProjectId: projects[0]?.id || '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: WORKER_STATUSES.ACTIVE
  };
  const [formData, setFormData] = useState(initialForm);
  const [reassignProjectId, setReassignProjectId] = useState('');

  // Tab & Project filter logic
  const filteredWorkers = workers.filter((w) => {
    const matchesTab = activeTab === 'ALL' || w.status === activeTab;
    const matchesProject =
      selectedProjectFilter === 'ALL' ||
      (selectedProjectFilter === 'UNASSIGNED' ? !w.assignedProjectId : w.assignedProjectId === selectedProjectFilter);
    return matchesTab && matchesProject;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.role) {
      alert('Please provide worker name, phone number, and trade role.');
      return;
    }

    const assignedProj = projects.find((p) => p.id === formData.assignedProjectId);

    addWorker({
      ...formData,
      assignedProjectName: assignedProj ? assignedProj.name : 'Unassigned Reserve'
    });

    setAddModalOpen(false);
    setFormData(initialForm);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const assignedProj = projects.find((p) => p.id === formData.assignedProjectId);

    updateWorker(selectedWorker.id, {
      ...formData,
      assignedProjectName: assignedProj ? assignedProj.name : 'Unassigned Reserve'
    });

    setEditModalOpen(false);
    setSelectedWorker(null);
  };

  const openEditModal = (worker) => {
    setSelectedWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      role: worker.role,
      skill: worker.skill,
      contractor: worker.contractor,
      assignedProjectId: worker.assignedProjectId || '',
      joiningDate: worker.joiningDate,
      status: worker.status
    });
    setEditModalOpen(true);
  };

  const openQrBadgeModal = (worker) => {
    setSelectedWorker(worker);
    setQrModalOpen(true);
  };

  const openReassignModal = (worker) => {
    setSelectedWorker(worker);
    setReassignProjectId(worker.assignedProjectId || '');
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = () => {
    const targetProj = projects.find((p) => p.id === reassignProjectId);
    reassignWorker(selectedWorker.id, targetProj ? targetProj.id : null, targetProj ? targetProj.name : 'Unassigned Reserve');
    setReassignModalOpen(false);
    setSelectedWorker(null);
  };

  const columns = [
    {
      header: 'Worker Name & ID',
      accessor: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {row.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.id}</span>
              <button
                onClick={() => openQrBadgeModal(row)}
                title="View QR Attendance Token"
                style={{ color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <QrCode size={14} />
              </button>
            </div>
            <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</p>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.phone}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Trade & Skill',
      accessor: 'role',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 600, color: '#1e293b' }}>{row.role}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.skill}</span>
        </div>
      )
    },
    {
      header: 'Contractor Crew',
      accessor: 'contractor',
      render: (row) => (
        <span style={{ fontWeight: 500, color: '#334155' }}>
          {row.contractor}
        </span>
      )
    },
    {
      header: 'Assigned Project',
      accessor: 'assignedProjectName',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 600, color: row.assignedProjectId ? '#1e3a8a' : '#64748b' }}>
            {row.assignedProjectName}
          </p>
          {row.assignedProjectId && (
            <button
              onClick={() => openReassignModal(row)}
              style={{ fontSize: '0.75rem', color: '#0284c7', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Reassign Site
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Joining Date',
      accessor: 'joiningDate'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Button
            size="sm"
            variant="outline"
            icon={QrCode}
            onClick={() => openQrBadgeModal(row)}
            title="View Worker QR Badge"
          >
            QR Pass
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Edit2}
            onClick={() => openEditModal(row)}
            title="Edit Worker Profile"
          />

          {row.status === 'ACTIVE' && (
            <Button
              size="sm"
              variant="outline"
              icon={Trash2}
              onClick={() => removeWorker(row.id)}
              title="Deactivate Worker"
              style={{ color: '#dc2626' }}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Users size={22} style={{ color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Worker Roster & Labor Management
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Maintain trade classifications, contractor affiliations, project assignments, and unique QR attendance credentials.
          </p>
        </div>

        <Button variant="warning" icon={Plus} onClick={() => setAddModalOpen(true)}>
          Register New Worker
        </Button>
      </div>

      {/* Filter Toolbar (Status Tabs + Site Selector) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Workers', count: workers.length },
            { key: WORKER_STATUSES.ACTIVE, label: 'Active', count: workers.filter((w) => w.status === 'ACTIVE').length },
            { key: WORKER_STATUSES.ON_LEAVE, label: 'On Leave', count: workers.filter((w) => w.status === 'ON_LEAVE').length },
            { key: WORKER_STATUSES.INACTIVE, label: 'Inactive / Reserve', count: workers.filter((w) => w.status === 'INACTIVE').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: activeTab === tab.key ? '#1e3a8a' : '#ffffff',
                color: activeTab === tab.key ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: activeTab === tab.key ? '#1e3a8a' : '#cbd5e1',
                cursor: 'pointer'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '9999px',
                  backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                  color: activeTab === tab.key ? '#ffffff' : '#334155'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Project Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Briefcase size={16} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Filter Site:</span>
          <select
            value={selectedProjectFilter}
            onChange={(e) => setSelectedProjectFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none'
            }}
          >
            <option value="ALL">All Project Sites</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
            <option value="UNASSIGNED">Unassigned Reserve</option>
          </select>
        </div>
      </div>

      {/* Workers Data Table */}
      <Table
        title={`Workforce Roster (${filteredWorkers.length})`}
        columns={columns}
        data={filteredWorkers}
        searchPlaceholder="Search by name, phone, trade skill, or contractor..."
      />

      {/* Add Worker Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Construction Worker"
        subtitle="Onboard worker profile, trade category, and generate QR badge"
        maxWidth="640px"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              Register Worker & Generate QR
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Full Legal Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Marcus Aurelio"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Contact Phone *
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Primary Trade Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {TRADE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Contractor / Employer *
              </label>
              <select
                name="contractor"
                value={formData.contractor}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {CONTRACTOR_GROUPS.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Specialized Skill / Certifications
            </label>
            <input
              type="text"
              name="skill"
              placeholder="e.g. AWS Certified Arc Welder, High-Rise Fall Protection"
              value={formData.skill}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Assign to Construction Project
              </label>
              <select
                name="assignedProjectId"
                value={formData.assignedProjectId}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value="">Unassigned Reserve</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Worker Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Worker: ${selectedWorker?.name}`}
        subtitle="Update trade qualification, phone number, or operational status"
        maxWidth="640px"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value={WORKER_STATUSES.ACTIVE}>Active</option>
                <option value={WORKER_STATUSES.ON_LEAVE}>On Leave</option>
                <option value={WORKER_STATUSES.INACTIVE}>Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Trade Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {TRADE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Specialized Skill
            </label>
            <input
              type="text"
              name="skill"
              value={formData.skill}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>
        </form>
      </Modal>

      {/* Reassign Project Modal */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title={`Reassign Site: ${selectedWorker?.name}`}
        subtitle={`Current Site: ${selectedWorker?.assignedProjectName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReassign}>
              Confirm Reassignment
            </Button>
          </>
        }
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
            Select Target Project Site:
          </label>
          <select
            value={reassignProjectId}
            onChange={(e) => setReassignProjectId(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
          >
            <option value="">Unassigned Reserve (Bench)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — {p.location}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* Digital Worker ID Card & QR Badge Modal (Section 11 Requirement) */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Digital Worker ID & QR Pass"
        subtitle="Official on-site credential for QR attendance scanning"
        maxWidth="460px"
        footer={
          <Button variant="outline" onClick={() => setQrModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedWorker && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Printable ID Card Container */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '1.75rem 1.5rem',
                border: '2px solid #d97706',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ backgroundColor: '#d97706', padding: '0.35rem', borderRadius: '6px' }}>
                    <HardHat size={18} color="#ffffff" />
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    BUILDTRACK <span style={{ color: '#f59e0b' }}>AI</span>
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', backgroundColor: '#064e3b', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                  VERIFIED CREW
                </span>
              </div>

              {/* Avatar & Info */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#1e3a8a',
                    border: '3px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    marginBottom: '0.35rem'
                  }}
                >
                  {selectedWorker.avatar}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedWorker.name}</h3>
                <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700 }}>
                  {selectedWorker.role}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  ID: {selectedWorker.id} &bull; {selectedWorker.contractor}
                </span>
              </div>

              {/* Visual QR Code Generator Simulation */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '10px',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                {/* SVG QR Code Simulation */}
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <rect width="140" height="140" fill="#ffffff" />
                  {/* Outer corner anchors */}
                  <rect x="10" y="10" width="36" height="36" fill="#0f172a" />
                  <rect x="16" y="16" width="24" height="24" fill="#ffffff" />
                  <rect x="22" y="22" width="12" height="12" fill="#0f172a" />

                  <rect x="94" y="10" width="36" height="36" fill="#0f172a" />
                  <rect x="100" y="16" width="24" height="24" fill="#ffffff" />
                  <rect x="106" y="22" width="12" height="12" fill="#0f172a" />

                  <rect x="10" y="94" width="36" height="36" fill="#0f172a" />
                  <rect x="16" y="100" width="24" height="24" fill="#ffffff" />
                  <rect x="22" y="106" width="12" height="12" fill="#0f172a" />

                  {/* Pseudo data dots based on worker ID */}
                  <rect x="56" y="16" width="8" height="8" fill="#0f172a" />
                  <rect x="72" y="24" width="12" height="8" fill="#0f172a" />
                  <rect x="56" y="36" width="16" height="8" fill="#0f172a" />

                  <rect x="20" y="56" width="10" height="10" fill="#0f172a" />
                  <rect x="40" y="60" width="14" height="8" fill="#0f172a" />
                  <rect x="64" y="56" width="12" height="12" fill="#d97706" />
                  <rect x="86" y="62" width="16" height="8" fill="#0f172a" />
                  <rect x="110" y="56" width="10" height="14" fill="#0f172a" />

                  <rect x="56" y="80" width="14" height="14" fill="#0f172a" />
                  <rect x="80" y="86" width="18" height="8" fill="#0f172a" />
                  <rect x="56" y="104" width="24" height="10" fill="#0f172a" />
                  <rect x="90" y="104" width="16" height="16" fill="#0f172a" />
                  <rect x="116" y="94" width="10" height="12" fill="#0f172a" />
                </svg>

                <code style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {selectedWorker.qrCodeToken}
                </code>
              </div>

              {/* Site Assignment Details */}
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', borderTop: '1px solid #1e293b', paddingTop: '0.75rem' }}>
                <p>Assigned Site: <strong>{selectedWorker.assignedProjectName}</strong></p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Scan with authorized Site Engineer scanner to mark daily attendance.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

