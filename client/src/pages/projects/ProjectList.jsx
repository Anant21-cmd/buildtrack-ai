import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Archive,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useProjects, PROJECT_STATUSES } from '../../context/ProjectContext';
import { Sparkles, Wand2 } from 'lucide-react';

export default function ProjectList() {
  const { projects, addProject, updateProject, archiveProject } = useProjects();
  const navigate = useNavigate();

  // Status Filter Tab
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    client: '',
    location: '',
    latitude: 41.8781,
    longitude: -87.6298,
    radiusMeters: 250,
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    status: PROJECT_STATUSES.PLANNING
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');


  const handleGenerateCode = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'PRJ';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, code: `${prefix}-${new Date().getFullYear()}-${randomNum}` }));
  };

  const handleGenerateScope = () => {
    if (!formData.name) {
      alert("Please enter a project name first.");
      return;
    }
    const template = `Project Scope Document: ${formData.name}
Client: ${formData.client || 'TBD'}

1. Structural Milestones
   - Site Preparation & Excavation
   - Foundation & Substructure
   - Superstructure Erection
2. Trades Involved
   - Concrete & Masonry
   - Mechanical, Electrical, Plumbing (MEP)
3. Quality & Compliance
   - ISO 9001 adherence required
   - Weekly material auditing`;
    setFormData(prev => ({ ...prev, description: template }));
  };

  // Tab filtered projects
  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'ALL') return !p.isArchived;
    if (activeTab === 'ARCHIVED') return p.isArchived;
    return p.status === activeTab && !p.isArchived;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.code || !formData.client || !formData.budget) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (Number(formData.budget) <= 0) {
      setFormError('Budget must be a positive number greater than 0.');
      return;
    }

    try {
      await addProject(formData);
      setCreateModalOpen(false);
      setFormData(initialForm);
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (Number(formData.budget) <= 0) {
      setFormError('Budget must be a positive number greater than 0.');
      return;
    }

    updateProject(selectedProject.id, formData);
    setEditModalOpen(false);
    setSelectedProject(null);
  };

  const openEditModal = (proj) => {
    setSelectedProject(proj);
    setFormData({
      name: proj.name,
      code: proj.code,
      client: proj.client,
      location: proj.location,
      latitude: proj.latitude,
      longitude: proj.longitude,
      radiusMeters: proj.radiusMeters,
      startDate: proj.startDate,
      endDate: proj.endDate,
      budget: proj.budget,
      description: proj.description,
      status: proj.status
    });
    setFormError('');
    setEditModalOpen(true);
  };

  const openArchiveModal = (proj) => {
    setSelectedProject(proj);
    setArchiveModalOpen(true);
  };

  const handleConfirmArchive = () => {
    archiveProject(selectedProject.id);
    setArchiveModalOpen(false);
    setSelectedProject(null);
  };

  const columns = [
    {
      header: 'Project Code & Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.code}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({row.id})</span>
          </div>
          <p
            onClick={() => navigate(`/projects/${row.id}`)}
            style={{ fontWeight: 700, color: '#1e3a8a', cursor: 'pointer', textDecoration: 'underline' }}
            title="Open dedicated project dashboard"
          >
            {row.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
            <MapPin size={12} />
            <span>{row.location}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Client & Geofence',
      accessor: 'client',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 600, color: '#0f172a' }}>{row.client}</p>
        </div>
      )
    },
    {
      header: 'Budget & Burn',
      accessor: 'budget',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>₹{(row.budget / 100000).toFixed(2)}L</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Spent: ₹{(row.spent / 100000).toFixed(2)}L ({Math.round((row.spent / (row.budget || 1)) * 100)}%)
          </span>
        </div>
      )
    },
    {
      header: 'Progress',
      accessor: 'progress',
      render: (row) => (
        <div style={{ minWidth: '110px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
            <span>{row.progress}%</span>
            <span style={{ color: '#64748b' }}>{row.workersCount} Workers</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${row.progress}%`,
                height: '100%',
                backgroundColor: row.status === 'COMPLETED' ? '#059669' : row.status === 'ON_HOLD' ? '#d97706' : '#1e3a8a',
                borderRadius: '9999px'
              }}
            />
          </div>
        </div>
      )
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
            variant="primary"
            icon={Eye}
            onClick={() => navigate(`/projects/${row.id}`)}
            title="Open Project Workspace"
          >
            Dashboard
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Edit2}
            onClick={() => openEditModal(row)}
            title="Edit Project Details"
          />

          {!row.isArchived && (
            <Button
              size="sm"
              variant="outline"
              icon={Archive}
              onClick={() => openArchiveModal(row)}
              title="Archive Project"
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
            <Briefcase size={22} style={{ color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Construction Projects Portfolio
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Create and monitor job sites and track multi-site milestones.
          </p>
        </div>

        <Button variant="warning" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Construction Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Active Portfolio', count: projects.filter((p) => !p.isArchived).length },
          { key: PROJECT_STATUSES.ACTIVE, label: 'Active', count: projects.filter((p) => p.status === 'ACTIVE' && !p.isArchived).length },
          { key: PROJECT_STATUSES.IN_PROGRESS, label: 'In Progress', count: projects.filter((p) => p.status === 'IN_PROGRESS' && !p.isArchived).length },
          { key: PROJECT_STATUSES.PLANNING, label: 'Planning', count: projects.filter((p) => p.status === 'PLANNING' && !p.isArchived).length },
          { key: PROJECT_STATUSES.ON_HOLD, label: 'On Hold', count: projects.filter((p) => p.status === 'ON_HOLD' && !p.isArchived).length },
          { key: PROJECT_STATUSES.COMPLETED, label: 'Completed', count: projects.filter((p) => p.status === 'COMPLETED' && !p.isArchived).length },
          { key: 'ARCHIVED', label: 'Archived', count: projects.filter((p) => p.isArchived).length }
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

      {/* Projects Table */}
      <Table
        title={`${activeTab.replace('_', ' ')} Projects (${filteredProjects.length})`}
        columns={columns}
        data={filteredProjects}
        searchPlaceholder="Search project by name, code, client, or address..."
      />

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Construction Project"
        subtitle="Initialize project site details and financial budget"
        maxWidth="680px"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              Create Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Apex Central Tower"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Project Code *
                </label>
                <button type="button" onClick={handleGenerateCode} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  <Wand2 size={12} /> Auto-Generate
                </button>
              </div>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. APX-CTR-01"
                value={formData.code}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Client / Owner Entity *
              </label>
              <input
                type="text"
                name="client"
                required
                placeholder="e.g. Sterling Real Estate Trust"
                value={formData.client}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Allocated Total Budget (₹) *
              </label>
              <input
                type="number"
                name="budget"
                required
                min="1"
                placeholder="e.g. 12500000"
                value={formData.budget}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Physical Site Location / Address *
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. 450 N Michigan Ave, Chicago, IL"
              value={formData.location}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>



          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Target Completion *
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value={PROJECT_STATUSES.PLANNING}>Planning</option>
                <option value={PROJECT_STATUSES.ACTIVE}>Active</option>
                <option value={PROJECT_STATUSES.IN_PROGRESS}>In Progress</option>
                <option value={PROJECT_STATUSES.ON_HOLD}>On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                Project Scope & Description
              </label>
              <button type="button" onClick={handleGenerateScope} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#1e3a8a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                <Sparkles size={12} /> AI Auto-Fill Scope
              </button>
            </div>
            <textarea
              rows={3}
              name="description"
              placeholder="Key structural milestones, trades involved, and architectural scope..."
              value={formData.description}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Project: ${selectedProject?.code}`}
        subtitle="Update project budget, status, or schedule milestones"
        maxWidth="680px"
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
          {formError && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', color: '#b91c1c', fontSize: '0.85rem' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
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
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                <option value={PROJECT_STATUSES.PLANNING}>Planning</option>
                <option value={PROJECT_STATUSES.ACTIVE}>Active</option>
                <option value={PROJECT_STATUSES.IN_PROGRESS}>In Progress</option>
                <option value={PROJECT_STATUSES.ON_HOLD}>On Hold</option>
                <option value={PROJECT_STATUSES.COMPLETED}>Completed</option>
                <option value={PROJECT_STATUSES.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Client Entity
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Allocated Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                min="1"
                value={formData.budget}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Site Address
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Target Completion Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Archive Modal */}
      <Modal
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        title={`Archive Project: ${selectedProject?.name}`}
        subtitle="This will move the project to the archived list and cancel active tasks"
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Archive} onClick={handleConfirmArchive}>
              Confirm Archive
            </Button>
          </>
        }
      >
        <p style={{ color: '#475569', fontSize: '0.9rem' }}>
          Are you sure you want to archive <strong>{selectedProject?.name} ({selectedProject?.code})</strong>? The project record will be preserved for audit compliance, but removed from active site operations.
        </p>
      </Modal>
    </div>
  );
}

