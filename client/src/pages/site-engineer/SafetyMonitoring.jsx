import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  CheckCircle,
  Activity,
  HardHat
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { useSafety } from '../../context/SafetyContext';

export default function SafetyMonitoring() {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const { incidents, addIncident, updateIncident } = useSafety();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const initialForm = {
    projectId: '',
    title: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    immediateAction: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const getProjectName = (id) => safeProjects.find(p => p.id === id)?.name || 'Unknown Project';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newIncident = {
      projectId: formData.projectId,
      description: `[${formData.title}] ${formData.description}`,
      location: formData.location,
      severity: formData.severity,
      correctiveAction: formData.immediateAction
    };
    
    try {
      await addIncident(newIncident);
      setIsModalOpen(false);
      setFormData(initialForm);
    } catch (err) {
      console.error('Failed to add incident', err);
      alert('Failed to log safety incident');
    }
  };

  const updateIncidentStatus = async (id, newStatus) => {
    try {
      await updateIncident(id, { status: newStatus === 'RESOLVED' ? 'Resolved' : 'Open' });
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    const desc = inc.description || '';
    const loc = inc.location || '';
    const matchesSearch = 
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === '' || inc.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Calculate stats
  const totalIncidents = incidents.length;
  const openHazards = incidents.filter(i => i.status === 'Open').length;
  const criticalAlerts = incidents.filter(i => i.status === 'Open' && (i.severity === 'HIGH' || i.severity === 'CRITICAL')).length;
  const resolvedIncidents = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={28} style={{ color: '#ef4444' }} />
            Safety Monitoring & Incident Logs
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Log safety hazards, near-misses, and ensure OSHA compliance across site perimeters.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
          Report Hazard / Incident
        </Button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Logs</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{totalIncidents}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Open Hazards</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>{openHazards}</p>
        </div>
        <div style={{ backgroundColor: '#fef2f2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fecaca', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Critical / High Risk</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{criticalAlerts}</p>
        </div>
        <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Hazards Resolved</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{resolvedIncidents}</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by hazard title, location, or description..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
            >
              <option value="">All Severities</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Safety Incident List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <HardHat size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No safety incidents logged</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Keep your site compliant and safe by logging any near-misses or hazards.</p>
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>Report a Hazard</Button>
          </div>
        ) : (
          filteredIncidents.map(inc => (
            <Card key={inc.id}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {inc.id}
                      </span>
                      <Badge status={inc.severity} />
                      <Badge status={inc.status === 'Resolved' ? 'COMPLETED' : 'PENDING'} text={inc.status.toUpperCase()} />
                    </div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
                      {inc.description.split(']')[0] + ']'} 
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {getProjectName(inc.projectId)} ({inc.location || 'Site Wide'})
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {new Date(inc.reportDate || inc.date || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {inc.status === 'Open' && (
                    <button 
                      onClick={() => updateIncidentStatus(inc.id, 'RESOLVED')}
                      style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <CheckCircle size={14} /> Mark Safe/Resolved
                    </button>
                  )}
                </div>
                
                <div style={{ padding: '1rem', backgroundColor: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: '1px solid', borderColor: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#fecaca' : '#e2e8f0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#b91c1c' : '#475569', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                    <AlertTriangle size={14} /> Hazard Description
                  </span>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? '#7f1d1d' : '#334155' }}>
                    {inc.description.split(']').length > 1 ? inc.description.split(']').slice(1).join(']') : inc.description}
                  </p>
                </div>

                {inc.correctiveAction && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem' }}>
                    <span><strong>Immediate Action Taken:</strong> {inc.correctiveAction}</span>
                    <span>Reported by: <strong>{inc.reportedBy}</strong></span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Report Hazard Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Safety Hazard / Incident">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Incident Title / Brief Description *</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Unsecured Scaffolding on 3rd Floor"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

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
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Severity Level *</label>
              <select 
                required
                value={formData.severity}
                onChange={e => setFormData({...formData, severity: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 600, color: formData.severity === 'CRITICAL' || formData.severity === 'HIGH' ? '#ef4444' : formData.severity === 'MEDIUM' ? '#f59e0b' : '#10b981' }}
              >
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="CRITICAL">CRITICAL (Stop Work)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Specific Location on Site *</label>
            <input 
              type="text"
              required
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="e.g. Sector C, Near Main Hoist"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Detailed Description *</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what happened or what was observed..."
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Immediate Action Taken</label>
            <textarea 
              rows={2}
              value={formData.immediateAction}
              onChange={e => setFormData({...formData, immediateAction: e.target.value})}
              placeholder="e.g. Area cordoned off, workers evacuated..."
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>Log Incident</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}