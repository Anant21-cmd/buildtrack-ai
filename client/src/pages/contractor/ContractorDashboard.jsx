import React from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Hammer, CalendarCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export default function ContractorDashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();

  const myTasks = tasks.filter(t => !t.assignedToId || t.assignedToId === currentUser.id);
  const pendingTasks = myTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const inProgressCount = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = myTasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Contractor View
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Your assigned tasks and pending deliverables.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard title="Total Pending Tasks" value={pendingTasks.length.toString()} icon={CalendarCheck} color="#dc2626" />
        <MetricCard title="In Progress" value={inProgressCount.toString()} icon={Hammer} color="#2563eb" />
        <MetricCard title="Completed" value={completedCount.toString()} icon={CheckCircle} color="#16a34a" />
      </div>

      <Card title="My Action Items">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          {pendingTasks.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No pending tasks assigned to you right now.</p>
          ) : (
            pendingTasks.map(t => (
              <ActionRow key={t.id} task={t.title} deadline={t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'} status={t.status || 'PENDING'} />
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{value}</h3>
      </div>
    </div>
  );
}

function ActionRow({ task, deadline, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.9rem' }}>{task}</h4>
        <p style={{ margin: 0, color: '#dc2626', fontSize: '0.8rem', fontWeight: 500 }}>Due: {deadline}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Badge status={status} />
        <button style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
      </div>
    </div>
  );
}
