import React, { useState } from 'react';
import { Briefcase, MapPin, Calendar, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';

export default function ContractorProjects() {
  const { projects } = useProjects();
  const { tasks, updateTaskStatus } = useTasks();
  
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [selectedProject, setSelectedProject] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleViewTasks = (project) => {
    setSelectedProject(project);
    setIsTaskModalOpen(true);
  };

  const projectTasks = selectedProject 
    ? safeTasks.filter(t => t.projectId === selectedProject.id)
    : [];

  const handleStatusChange = (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
    updateTaskStatus(taskId, nextStatus);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Assigned Projects</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Overview of all projects your team is currently working on.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {safeProjects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <Briefcase size={32} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
            <p style={{ color: '#475569', fontWeight: 500 }}>No projects currently assigned to you.</p>
          </div>
        ) : (
          safeProjects.map(project => (
            <Card key={project.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{project.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <MapPin size={14} /> {project.location || 'Location not specified'}
                  </div>
                </div>
                <Badge status={project.status || 'ACTIVE'} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Start Date</span>
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Target End</span>
                  <span style={{ color: '#1e293b', fontWeight: 500 }}>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Button variant="outline" onClick={() => handleViewTasks(project)} style={{ width: '100%', justifyContent: 'center' }}>
                <CheckSquare size={16} style={{ marginRight: '0.5rem' }} /> View Project Tasks
              </Button>
            </Card>
          ))
        )}
      </div>

      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        title={`Tasks for ${selectedProject?.name}`}
        maxWidth="800px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {projectTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <CheckSquare size={32} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
              <p style={{ color: '#475569', fontWeight: 500 }}>No tasks assigned to your team for this project yet.</p>
            </div>
          ) : (
            projectTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', flexDirection: 'column', mdFlexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 600 }}>{task.title}</h4>
                    <Badge status={task.status || 'PENDING'} />
                    {task.priority === 'High' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '999px' }}><AlertCircle size={12} /> HIGH</span>}
                  </div>
                  
                  <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem', maxWidth: '100%' }}>
                    {task.description || 'No detailed description provided.'}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Clock size={14} /> Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={14} /> Zone: {task.location || 'Site Wide'}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', minWidth: '140px' }}>
                  <Button 
                    variant={task.status === 'COMPLETED' ? 'outline' : 'primary'} 
                    size="sm"
                    onClick={() => handleStatusChange(task.id, task.status)}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {task.status === 'PENDING' ? 'Start Work' : task.status === 'IN_PROGRESS' ? 'Mark Completed' : 'Re-open Task'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
