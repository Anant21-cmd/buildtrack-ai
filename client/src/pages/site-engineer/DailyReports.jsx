import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Activity,
  CheckCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';

export default function DailyReports() {
  const { currentUser } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use Data from Context
  const { reports, addReport } = useReports();

  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    workDescription: '',
    progressPct: '',
    manpowerCount: '',
    remarks: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const getProjectName = (id) => safeProjects.find(p => p.id === id)?.name || 'Unknown Project';
  const getTaskName = (id) => safeTasks.find(t => t.id === id)?.title || 'General Site Work';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newReport = {
      projectId: formData.projectId,
      taskId: formData.taskId || undefined, // Send undefined if empty
      workDescription: formData.workDescription,
      progressPct: Number(formData.progressPct),
      manpowerCount: Number(formData.manpowerCount),
      remarks: formData.remarks
    };
    
    try {
      await addReport(newReport);
      setIsModalOpen(false);
      setFormData({ projectId: '', taskId: '', workDescription: '', progressPct: '', manpowerCount: '', remarks: '' });
    } catch (error) {
      console.error('Failed to create report', error);
      alert('Failed to create report');
    }
  };

  // Apply filters
  const filteredReports = reports.filter(report => {
    // Search query (matches description or task/project name)
    const matchesSearch = searchQuery === '' || 
      report.workDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTaskName(report.taskId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProjectName(report.projectId).toLowerCase().includes(searchQuery.toLowerCase());
      
    // Date filter
    const reportDate = new Date(report.date).toISOString().split('T')[0];
    const matchesDate = dateFilter === '' || reportDate === dateFilter;
    
    // Project filter
    const matchesProject = projectFilter === '' || report.projectId === projectFilter;

    return matchesSearch && matchesDate && matchesProject;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Daily Site Reports (DPR)
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Document daily progress, manpower, and work completed.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create Report
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search reports by description or project..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
            <Clock size={16} color="#64748b" />
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.2rem 0.5rem', backgroundColor: '#f8fafc' }}>
            <MapPin size={16} color="#64748b" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#334155', fontSize: '0.9rem', padding: '0.5rem' }}
            >
              <option value="">All Projects</option>
              {safeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          {(searchQuery || dateFilter || projectFilter) && (
            <Button variant="ghost" onClick={() => { setSearchQuery(''); setDateFilter(''); setProjectFilter(''); }} style={{ color: '#ef4444' }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#334155', margin: '0 0 0.5rem 0' }}>No reports found</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start documenting your site progress by creating your first daily report.</p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create Report</Button>
          </div>
        ) : (
          filteredReports.map(report => (
            <Card key={report.id}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.1rem' }}>
                      {getTaskName(report.taskId)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {getProjectName(report.projectId)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {new Date(report.date).toLocaleDateString()}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Activity size={14} /> Created by {report.createdBy}
                      </span>
                    </div>
                  </div>
                  <Badge status={report.progressPct === 100 ? 'COMPLETED' : 'IN_PROGRESS'} />
                </div>
                
                <p style={{ margin: 0, color: '#334155', lineHeight: '1.5' }}>
                  {report.workDescription}
                </p>
                
                <div style={{ display: 'flex', gap: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Progress</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{report.progressPct}%</span>
                  </div>
                  <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                  <div>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Manpower</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={18} style={{ color: '#10b981' }} /> {report.manpowerCount}
                    </span>
                  </div>
                  {report.remarks && (
                    <>
                      <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Remarks</span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>{report.remarks}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Daily Site Report">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Project</label>
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
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Related Task</label>
              <select 
                value={formData.taskId}
                onChange={e => setFormData({...formData, taskId: e.target.value})}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">General Site Work (No specific task)</option>
                {safeTasks.filter(t => t.projectId === formData.projectId).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Work Completed Today</label>
            <textarea 
              required
              rows={3}
              value={formData.workDescription}
              onChange={e => setFormData({...formData, workDescription: e.target.value})}
              placeholder="Describe the activities performed today..."
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Task Progress (%)</label>
              <input 
                type="number" 
                required
                min="0" max="100"
                value={formData.progressPct}
                onChange={e => setFormData({...formData, progressPct: e.target.value})}
                placeholder="e.g. 65"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Total Manpower (Count)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.manpowerCount}
                onChange={e => setFormData({...formData, manpowerCount: e.target.value})}
                placeholder="Number of workers present"
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Remarks / Issues Faced (Optional)</label>
            <input 
              type="text" 
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
              placeholder="Any delays, material shortages, or weather issues?"
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" icon={CheckCircle}>Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}