import React, { useState } from 'react';
import { Package, Search, Filter, AlertTriangle, MessageSquare, Camera, CheckCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useMaterials } from '../../context/MaterialContext';

export default function ContractorMaterials() {
  const { materials } = useMaterials();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLogUsageModalOpen, setIsLogUsageModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [reportData, setReportData] = useState({ type: 'SHORTAGE', quantity: '', reason: '' });
  const [usageData, setUsageData] = useState({ quantity: '', task: '', notes: '' });
  const [toastMessage, setToastMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openReportModal = (item) => {
    setSelectedMaterial(item);
    setReportData({ type: 'SHORTAGE', quantity: '', reason: '' });
    setUploadedFiles([]);
    setIsReportModalOpen(true);
  };

  const openLogUsageModal = (item) => {
    setSelectedMaterial(item);
    setUsageData({ quantity: '', task: '', notes: '' });
    setIsLogUsageModalOpen(true);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsReportModalOpen(false);
    showToast(`Issue reported for ${selectedMaterial.name}.`);
  };

  const handleLogUsageSubmit = (e) => {
    e.preventDefault();
    setIsLogUsageModalOpen(false);
    showToast(`Usage logged for ${selectedMaterial.name}.`);
  };

  const handleFileUpload = (e) => {
    if (e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      showToast(`${e.target.files.length} file(s) attached.`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Allocated Materials & Equipment</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Track materials and equipment assigned to your team. Report usage, shortages, or damages.</p>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search materials..." style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {materials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <Package size={32} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
              <p style={{ color: '#475569', fontWeight: 500 }}>No materials or equipment currently allocated to your team.</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Allocations from the Site Engineer will appear here.</p>
            </div>
          ) : (
            materials.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Allocated: <strong>{item.quantity} {item.unit}</strong></p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="outline" size="sm" onClick={() => openReportModal(item)} style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                    <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} /> Report Issue
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => openLogUsageModal(item)}>Log Usage</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Report Material/Equipment Issue">
        {selectedMaterial && (
          <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedMaterial.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Allocated: {selectedMaterial.quantity} {selectedMaterial.unit}</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Issue Type</label>
              <select 
                value={reportData.type} 
                onChange={(e) => setReportData({...reportData, type: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="SHORTAGE">Material Shortage</option>
                <option value="DAMAGE">Damaged Material</option>
                <option value="EQUIPMENT_BREAKDOWN">Equipment Breakdown</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Affected Quantity (Optional)</label>
              <input 
                type="number" 
                value={reportData.quantity} 
                onChange={(e) => setReportData({...reportData, quantity: e.target.value})}
                placeholder={`e.g. 50`}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <MessageSquare size={14} /> Description & Reason
              </label>
              <textarea 
                required
                rows={3}
                placeholder="Describe the damage, reason for shortage, or breakdown details..."
                value={reportData.reason}
                onChange={(e) => setReportData({...reportData, reason: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <Camera size={14} /> Photo Evidence
              </label>
              <label style={{ display: 'block', border: '2px dashed #cbd5e1', padding: '1.5rem', textAlign: 'center', borderRadius: '6px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                <Camera size={24} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Click to upload photo of damage/breakdown</p>
                <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={14} /> {uploadedFiles.length} file(s) attached
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
              <Button variant="danger" type="submit">Submit Report</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={isLogUsageModalOpen} onClose={() => setIsLogUsageModalOpen(false)} title="Log Material Usage">
        {selectedMaterial && (
          <form onSubmit={handleLogUsageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{selectedMaterial.name}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Allocated: {selectedMaterial.quantity} {selectedMaterial.unit}</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Quantity Used *</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  required
                  value={usageData.quantity} 
                  onChange={(e) => setUsageData({...usageData, quantity: e.target.value})}
                  placeholder="0"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{selectedMaterial.unit}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Used for Task / Location</label>
              <input 
                type="text" 
                value={usageData.task} 
                onChange={(e) => setUsageData({...usageData, task: e.target.value})}
                placeholder="e.g. Ground Floor Foundation"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Notes (Optional)</label>
              <textarea 
                rows={2}
                value={usageData.notes}
                onChange={(e) => setUsageData({...usageData, notes: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsLogUsageModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Log Usage</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
