import React, { useState } from 'react';
import { 
  CheckSquare, 
  AlertCircle, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle,
  Wrench,
  Filter
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useInspections } from '../../context/InspectionContext';

export default function QualityInspection() {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const { inspections, addInspection, updateInspection } = useInspections();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const initialForm = {
    projectId: '',
    element: '',
    inspectionType: 'Concrete Pouring (Pre-Check)',
    status: 'PASS',
    defects: '',
    reworkAssignedTo: '',
    reworkDeadline: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const INSPECTION_TYPES = [
    'Concrete Pouring (Pre-Check)',
    'Concrete Pouring (Post-Check)',
    'Steel Reinforcement (Rebar)',
    'Formwork & Shuttering',
    'Blockwork & Masonry',
    'Waterproofing',
    'MEP Rough-in'
  ];

  const getProjectName = (id) => safeProjects.find(p => p.id === id)?.name || 'Unknown Project';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newInspection = {
      projectId: formData.projectId,
      activity: formData.inspectionType + ' - ' + formData.element,
      status: formData.status,
      remarks: formData.defects || null,
      correctiveAction: (formData.status === 'FAIL' || formData.status === 'REWORK') 
        ? `Assignee: ${formData.reworkAssignedTo} | Deadline: ${formData.reworkDeadline}`
        : null
    };
    
    try {
      await addInspection(newInspection);
      setIsModalOpen(false);
      setFormData(initialForm);
    } catch (err) {
      console.error('Failed to add inspection:', err);
      alert('Failed to add inspection');
    }
  };

  const updateReworkStatus = async (id, newStatus) => {
    try {
      await updateInspection(id, { status: newStatus === 'COMPLETED' ? 'PASS' : 'REWORK' });
    } catch (err) {
      console.error('Failed to update rework status', err);
    }
  };

  const filteredInspections = inspections.filter(ins => {
    const activity = ins.activity || '';
    const remarks = ins.remarks || '';
    const matchesSearch = 
      activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ins.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remarks.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || ins.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalChecks = inspections.length;
  const passedChecks = inspections.filter(i => i.status === 'PASS').length;
  const failedChecks = inspections.filter(i => i.status === 'FAIL' || i.status === 'REWORK').length;
  const pendingReworks = inspections.filter(i => i.status === 'REWORK').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={28} style={{ color: '#10b981' }} />
            Quality Control & Inspections
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Log QA/QC checks, flag defects (snags), and track rework resolutions.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          New Inspection
        </Button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Inspections</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalChecks}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Passed QA</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{passedChecks}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Failed / Defective</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{failedChecks}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Pending Rework</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{pendingReworks}</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by ID, element, or defect description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
            >
              <option value="">All Statuses</option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="REWORK">Needs Rework</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Inspection List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredInspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <CheckSquare size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No inspections logged yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Keep track of site quality by conducting your first QA/QC check.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create Inspection Report</Button>
          </div>
        ) : (
          filteredInspections.map(ins => (
            <Card key={ins.id}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {ins.id}
                      </span>
                      <Badge status={ins.status} />
                    </div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
                      {ins.activity}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {getProjectName(ins.projectId)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {new Date(ins.inspectionDate || ins.date || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Rework Status Badge & Action */}
                  {(ins.status === 'FAIL' || ins.status === 'REWORK') && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: ins.status === 'FAIL' ? '#dc2626' : '#f59e0b' }}>
                        {ins.status === 'FAIL' ? <AlertCircle size={14} /> : <Wrench size={14} />}
                        {ins.status}
                      </div>
                      {ins.status === 'REWORK' && (
                        <button 
                          onClick={() => updateReworkStatus(ins.id, 'COMPLETED')}
                          style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>Details</span>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{ins.correctiveAction || 'None'}</span>
                  </div>
                  
                  {ins.remarks && (
                    <div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                        <ShieldAlert size={14} /> Observations / Remarks
                      </span>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f1d1d' }}>{ins.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Inspection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Quality Inspection">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Project Site *</label>
              <select 
                required
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">Select Project</option>
                {safeProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Inspection Category *</label>
              <select 
                required
                value={formData.inspectionType}
                onChange={e => setFormData({...formData, inspectionType: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                {INSPECTION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Element / Location Inspected *</label>
            <input 
              type="text"
              required
              value={formData.element}
              onChange={e => setFormData({...formData, element: e.target.value})}
              placeholder="e.g. Tower B - 5th Floor Slab, Column C12-C15"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Inspection Result *</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="radio" name="status" value="PASS" checked={formData.status === 'PASS'} onChange={e => setFormData({...formData, status: e.target.value})} />
                <span style={{ fontWeight: 600, color: '#10b981' }}>PASS</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="radio" name="status" value="REWORK" checked={formData.status === 'REWORK'} onChange={e => setFormData({...formData, status: e.target.value})} />
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>NEEDS REWORK</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                <input type="radio" name="status" value="FAIL" checked={formData.status === 'FAIL'} onChange={e => setFormData({...formData, status: e.target.value})} />
                <span style={{ fontWeight: 600, color: '#ef4444' }}>FAIL (CRITICAL)</span>
              </label>
            </div>
          </div>

          {(formData.status === 'FAIL' || formData.status === 'REWORK') && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Defects / Snags Found *</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.defects}
                  onChange={e => setFormData({...formData, defects: e.target.value})}
                  placeholder="Describe the issues (e.g. Honeycombing observed, spacing incorrect...)"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', outline: 'none', resize: 'vertical' }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Assign Rework To</label>
                  <input 
                    type="text"
                    value={formData.reworkAssignedTo}
                    onChange={e => setFormData({...formData, reworkAssignedTo: e.target.value})}
                    placeholder="Contractor or Team Name"
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Rework Deadline</label>
                  <input 
                    type="date"
                    value={formData.reworkDeadline}
                    onChange={e => setFormData({...formData, reworkDeadline: e.target.value})}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {formData.status === 'PASS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Remarks (Optional)</label>
              <textarea 
                rows={2}
                value={formData.defects}
                onChange={e => setFormData({...formData, defects: e.target.value})}
                placeholder="Any positive notes or observations?"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Log Inspection</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}