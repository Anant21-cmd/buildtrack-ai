import React, { useState } from 'react';
import { useProgress } from '../../context/ProgressContext';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

const DailyProgress = () => {
  const { dprs, addDPR, loading: fetchingDprs } = useProgress();
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '',
    date: new Date().toISOString().split('T')[0],
    progressPct: '',
    completed: '',
    workersPresent: '',
    issues: ''
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrls = [];
      if (files.length > 0) {
        const fileData = new FormData();
        files.forEach(f => fileData.append('media', f));

        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: fileData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          mediaUrls = uploadData.mediaUrls;
        }
      }

      const reportData = {
        projectId: formData.projectId,
        date: formData.date,
        progressPct: parseFloat(formData.progressPct) || 0,
        completed: formData.completed,
        workersPresent: parseInt(formData.workersPresent) || 0,
        issues: formData.issues,
        mediaUrls
      };

      await addDPR(reportData);
      
      setFormData({
        projectId: '',
        date: new Date().toISOString().split('T')[0],
        progressPct: '',
        completed: '',
        workersPresent: '',
        issues: ''
      });
      setFiles([]);
      setShowForm(false);
    } catch (err) {
      alert('Failed to submit progress report');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'date' },
    { 
      header: 'Project', 
      accessor: 'projectId',
      render: (row) => {
        const p = projects?.find(p => p.id === row.projectId);
        return p ? p.name : 'Unknown';
      }
    },
    { header: 'Completed', accessor: 'completed' },
    { header: 'Workers', accessor: 'workersPresent' },
    { header: 'Progress', accessor: 'progressPct', render: row => `${row.progressPct}%` },
    { 
      header: 'Media', 
      accessor: 'mediaUrls', 
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {row.mediaUrls && row.mediaUrls.length > 0 ? (
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              {row.mediaUrls.length} Files
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No media</span>
          )}
        </div>
      ) 
    }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Daily Progress Reports (DPR)</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ New Report</Button>
        )}
      </div>

      {showForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            Submit Daily Progress Update
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Project</label>
                <select 
                  required
                  value={formData.projectId} 
                  onChange={e => setFormData({...formData, projectId: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">Select Project</option>
                  {projects?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Date</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Workers Present</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.workersPresent}
                  onChange={e => setFormData({...formData, workersPresent: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Total Project % Complete</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.progressPct}
                  onChange={e => setFormData({...formData, progressPct: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Work Completed Today</label>
              <textarea 
                required
                rows={3}
                value={formData.completed}
                onChange={e => setFormData({...formData, completed: e.target.value})}
                placeholder="e.g. Poured 500 cubic yards of concrete for foundation..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Issues / Delays (Optional)</label>
              <textarea 
                rows={2}
                value={formData.issues}
                onChange={e => setFormData({...formData, issues: e.target.value})}
                placeholder="e.g. Delayed 2 hours due to rain..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              />
            </div>

            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Camera size={32} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>Attach Photos & Videos for the Client</p>
              
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Upload size={16} /> Choose Files
                <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileChange} />
              </label>

              {files.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                      <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      <X size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => removeFile(idx)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Submit Report'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {fetchingDprs ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : (
          <Table columns={columns} data={dprs} />
        )}
      </Card>
    </div>
  );
};
export default DailyProgress;
