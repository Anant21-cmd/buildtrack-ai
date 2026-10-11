import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, Filter, Phone, Mail, FileText, CheckCircle, Settings, Trash2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useWorkers } from '../../context/WorkerContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export default function ContractorWorkers() {
  const { workers, addWorker, updateWorker } = useWorkers();
  const { projects } = useProjects();
  const { currentUser } = useAuth();
  
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [newWorker, setNewWorker] = useState({ name: '', trade: 'General Labor', phone: '', idNumber: '', projectId: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const trades = ['General Labor', 'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Steel Fixer', 'Heavy Machinery Operator'];

  const contractorWorkers = useMemo(() => {
    return workers.filter(w => w.contractorId === currentUser?.id);
  }, [workers, currentUser]);
  
  const filteredWorkers = useMemo(() => {
    if (!searchQuery) return contractorWorkers;
    return contractorWorkers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (w.badgeId && w.badgeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (w.idNumber && w.idNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contractorWorkers, searchQuery]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      await addWorker({
        name: newWorker.name,
        trade: newWorker.trade,
        badgeId: newWorker.idNumber || undefined,
        phone: newWorker.phone || undefined,
        assignedProjectId: newWorker.projectId || undefined,
      });
      setNewWorker({ name: '', trade: 'General Labor', phone: '', idNumber: '', projectId: '' });
      setIsOnboardModalOpen(false);
      showToast('Worker onboarded successfully.');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleManageClick = (worker) => {
    setSelectedWorker(worker);
    setIsManageModalOpen(true);
  };

  const handleUpdateStatus = async (status) => {
    try {
      await updateWorker(selectedWorker.id, { status });
      setSelectedWorker({ ...selectedWorker, status });
      showToast(`Worker status updated to ${status}.`);
    } catch (err) {
      showToast(`Error updating status: ${err.message}`);
    }
  };
  
  const handleRemoveWorker = () => {
    // Backend doesn't support hard delete easily, so set inactive or leave it mock for UI
    setIsManageModalOpen(false);
    setSelectedWorker(null);
    showToast('Worker removal requested (contact admin).');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Workforce Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Register and manage your workers and tradesmen on site.</p>
        </div>
        <Button onClick={() => setIsOnboardModalOpen(true)} icon={UserPlus}>Onboard Worker</Button>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or trade..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} 
            />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>WORKER DETAILS</th>
                <th style={{ padding: '1rem' }}>TRADE / SKILL</th>
                <th style={{ padding: '1rem' }}>ASSIGNED PROJECT</th>
                <th style={{ padding: '1rem' }}>CONTACT INFO</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <Users size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No workers found. Click "Onboard Worker" to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(worker => (
                  <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{worker.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {worker.badgeId || worker.idNumber || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{worker.trade}</td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
                      {worker.assignedProjectName || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {worker.phone || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}><Badge status={worker.status} /></td>
                    <td style={{ padding: '1rem' }}>
                      <Button variant="ghost" size="sm" onClick={() => handleManageClick(worker)} icon={Settings}>Manage</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isOnboardModalOpen} onClose={() => setIsOnboardModalOpen(false)} title="Onboard New Worker">
        <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Full Name *</label>
            <input type="text" required value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>National ID / Passport *</label>
            <input type="text" required value={newWorker.idNumber} onChange={e => setNewWorker({...newWorker, idNumber: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Assign Project</label>
            <select value={newWorker.projectId} onChange={e => setNewWorker({...newWorker, projectId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
              <option value="">Unassigned (Reserve)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Trade / Skill</label>
              <select value={newWorker.trade} onChange={e => setNewWorker({...newWorker, trade: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}>
                {trades.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Phone Number</label>
              <input type="tel" value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsOnboardModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={CheckCircle}>Register Worker</Button>
          </div>
        </form>
      </Modal>

      {selectedWorker && (
        <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title={`Manage ${selectedWorker.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>ID Number</div>
                  <div style={{ fontWeight: 500 }}>{selectedWorker.idNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Trade</div>
                  <div style={{ fontWeight: 500 }}>{selectedWorker.trade}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Phone</div>
                  <div style={{ fontWeight: 500 }}>{selectedWorker.phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Current Status</div>
                  <Badge status={selectedWorker.status} />
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#334155' }}>Update Status</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant={selectedWorker.status === 'ACTIVE' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('ACTIVE')}>Set Active</Button>
                <Button variant={selectedWorker.status === 'ON_LEAVE' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('ON_LEAVE')}>Set On Leave</Button>
                <Button variant={selectedWorker.status === 'INJURED' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('INJURED')}>Report Injured</Button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outline" style={{ color: '#dc2626', borderColor: '#fca5a5' }} icon={Trash2} onClick={handleRemoveWorker}>Remove Worker</Button>
              <Button variant="primary" onClick={() => setIsManageModalOpen(false)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
