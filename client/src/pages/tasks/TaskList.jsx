import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus } from 'lucide-react';

const TaskList = () => {
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { projects } = useProjects();
  const { currentUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    priority: 'Medium',
    dueDate: '',
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      default: return 'neutral';
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    const taskPayload = { ...formData, assigneeId: currentUser.id };
    
    // Prisma expects a full ISO DateTime for dates, or null if empty
    if (taskPayload.dueDate) {
      taskPayload.dueDate = new Date(taskPayload.dueDate).toISOString();
    } else {
      delete taskPayload.dueDate; // Remove empty string so Prisma doesn't throw an error
    }

    await addTask(taskPayload);
    setIsModalOpen(false);
    setFormData({ title: '', projectId: '', priority: 'Medium', dueDate: '' });
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { 
      header: 'Project', 
      accessor: 'projectId',
      render: (row) => projects.find(p => p.id === row.projectId)?.name || 'Unknown Project'
    },
    { header: 'Priority', accessor: 'priority' },
    { header: 'Due Date', accessor: 'dueDate', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A' },
    { header: 'Status', accessor: 'status', render: row => <Badge status={row.status} /> },
    {
      header: 'Actions',
      accessor: 'id',
      render: (row) => (
        <select 
          value={row.status} 
          onChange={e => updateTaskStatus(row.id, e.target.value)}
          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Site Tasks
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage and update the status of your assigned tasks.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add New Task
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={tasks} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
        subtitle="Add a new task for your site"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateTask}>Save Task</Button>
          </>
        }
      >
        <form id="create-task-form" onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              placeholder="e.g. Inspect Foundation Concrete"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Project *</label>
            <select
              required
              value={formData.projectId}
              onChange={e => setFormData({...formData, projectId: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
            >
              <option value="">Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default TaskList;
