import React, { useState } from 'react';
import { CheckSquare, Search, Filter, AlertCircle, Clock, MapPin, Target, Users, Camera, AlertTriangle, ChevronRight, MessageSquare, Percent } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useTasks } from '../../context/TaskContext';

export default function ContractorTasks() {
  const { tasks, updateTaskStatus } = useTasks();
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [executionData, setExecutionData] = useState({
    status: '',
    progress: 0,
    assignedWorkers: '',
    delayReason: '',
    materialNotes: ''
  });

  const openManageModal = (task) => {
    setSelectedTask(task);
    setExecutionData({
      status: task.status || 'PENDING',
      progress: task.progress || 0,
      assignedWorkers: task.assignedWorkers || '',
      delayReason: task.delayReason || '',
      materialNotes: task.materialNotes || ''
    });
    setIsManageModalOpen(true);
  };

  const handleSaveExecution = (e) => {
    e.preventDefault();
    // In a real app, this would dispatch an update to the context with all the data
    updateTaskStatus(selectedTask.id, executionData.status);
    setIsManageModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Task Execution</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Manage your assigned tasks, assign workers, update execution progress, and report delays.</p>
      </div>

      <Card>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search tasks..." style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} />
          </div>
          <Button variant="outline" icon={Filter}>Filter Status</Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {safeTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <CheckSquare size={32} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
              <p style={{ color: '#475569', fontWeight: 500 }}>No tasks assigned to your team.</p>
            </div>
          ) : (
            safeTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', flexDirection: 'column', mdFlexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ flex: 1, width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>{task.title}</h3>
                    <Badge status={task.status || 'PENDING'} />
                    {task.priority === 'High' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '999px' }}><AlertCircle size={12} /> HIGH PRIORITY</span>}
                  </div>
                  
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', maxWidth: '800px' }}>
                    {task.description || 'No detailed description provided for this task.'}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={14} /> Zone: {task.location || 'Site Wide'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Percent size={14} /> Progress: {task.progress || 0}%</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minWidth: '150px' }}>
                  <Button 
                    variant="primary"
                    onClick={() => openManageModal(task)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Manage Execution
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} title="Manage Task Execution" maxWidth="600px">
        {selectedTask && (
          <form onSubmit={handleSaveExecution} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{selectedTask.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Update the execution details, assign workforce, and report any blockers.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Execution Status</label>
                <select 
                  value={executionData.status} 
                  onChange={(e) => setExecutionData({...executionData, status: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DELAYED">Delayed / Blocked</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Work Progress (%)</label>
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={executionData.progress} 
                  onChange={(e) => setExecutionData({...executionData, progress: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
              </div>
            </div>

            {executionData.status === 'DELAYED' && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626' }}>
                  <AlertTriangle size={14} /> Delay Reason / Blocker
                </label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Explain why this task is delayed..."
                  value={executionData.delayReason}
                  onChange={(e) => setExecutionData({...executionData, delayReason: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2' }} 
                />
              </div>
            )}

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <Users size={14} /> Assigned Workers / Labour Count
              </label>
              <input 
                type="text" 
                placeholder="e.g. 2 Masons, 3 Helpers (or specific names)" 
                value={executionData.assignedWorkers} 
                onChange={(e) => setExecutionData({...executionData, assignedWorkers: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <Camera size={14} /> Proof of Work (Photos/Videos)
              </label>
              <label style={{ display: 'block', border: '2px dashed #cbd5e1', padding: '1.5rem', textAlign: 'center', borderRadius: '6px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                <Camera size={24} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Click to choose site photos or videos to show progress</p>
                <input type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={(e) => {
                  if(e.target.files.length > 0) {
                     // Just a simple visual feedback for the mock
                     e.target.parentElement.style.borderColor = '#16a34a';
                     e.target.parentElement.style.backgroundColor = '#f0fdf4';
                     e.target.parentElement.querySelector('p').innerText = `${e.target.files.length} file(s) attached`;
                     e.target.parentElement.querySelector('p').style.color = '#16a34a';
                  }
                }} />
              </label>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                <MessageSquare size={14} /> Material Usage & Needs
              </label>
              <textarea 
                rows={2}
                placeholder="Report any material shortages, damages, or equipment needs here..."
                value={executionData.materialNotes}
                onChange={(e) => setExecutionData({...executionData, materialNotes: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <Button variant="outline" type="button" onClick={() => setIsManageModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Execution Data</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
