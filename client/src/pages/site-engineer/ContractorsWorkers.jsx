import React, { useState } from 'react';
import { Users, Search, Filter, Phone, QrCode, HardHat, Badge as BadgeIcon } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useWorkers } from '../../context/WorkerContext';
import { useProjects } from '../../context/ProjectContext';

export default function ContractorsWorkers() {
  const { workers } = useWorkers();
  const { projects } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // For site engineers, ideally we filter by projects they are assigned to.
  // Assuming `projects` in context only contains projects they have access to.
  const projectIds = projects.map(p => p.id);
  
  const siteWorkers = workers.filter(w => 
    w.assignedProjectId && projectIds.includes(w.assignedProjectId)
  );

  const filteredWorkers = siteWorkers.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (w.badgeId && w.badgeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.trade && w.trade.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesProject = projectFilter === '' || w.assignedProjectId === projectFilter;
    
    return matchesSearch && matchesProject;
  });

  const openQrBadgeModal = (worker) => {
    setSelectedWorker(worker);
    setQrModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Site Workforce & Contractors</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>View workers and contractors assigned to your project sites.</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or trade..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} 
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value)}
              style={{ padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">All My Sites</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>WORKER DETAILS</th>
                <th style={{ padding: '1rem' }}>TRADE / SKILL</th>
                <th style={{ padding: '1rem' }}>PROJECT SITE</th>
                <th style={{ padding: '1rem' }}>CONTACT</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No workers assigned to your sites currently.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(worker => (
                  <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{worker.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <BadgeIcon size={12} /> {worker.badgeId || worker.idNumber || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{worker.trade || worker.role}</td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                      {worker.assignedProjectName || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {worker.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}><Badge status={worker.status} /></td>
                    <td style={{ padding: '1rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => openQrBadgeModal(worker)} icon={QrCode}>View ID</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* QR Badge Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Worker QR Badge" maxWidth="400px">
        {selectedWorker && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '100%', backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <HardHat size={20} color="#3b82f6" />
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>BUILDTRACK <span style={{ color: '#3b82f6' }}>AI</span></span>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.5rem 0' }}>{selectedWorker.name}</h3>
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 700 }}>{selectedWorker.trade || selectedWorker.role}</span>
              <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#fff', borderRadius: '8px', display: 'inline-block' }}>
                <QrCode size={100} color="#0f172a" />
              </div>
              <code style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8' }}>ID: {selectedWorker.badgeId || selectedWorker.id}</code>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '1rem' }}>Site: {selectedWorker.assignedProjectName}</p>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button onClick={() => setQrModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}