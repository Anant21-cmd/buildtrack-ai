import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Hammer, CalendarCheck, CheckCircle, Users, Package, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';

export default function ContractorDashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const myTasks = safeTasks.filter(t => !t.assignedToId || t.assignedToId === currentUser?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS' || t.status === 'DELAYED');
  
  const inProgressCount = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = myTasks.filter(t => t.status === 'COMPLETED').length;
  const delayedCount = myTasks.filter(t => t.status === 'DELAYED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            Contractor Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage workforce, execute tasks, report issues, and claim payments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" icon={Users} onClick={() => navigate('/contractor/attendance')}>Mark Attendance</Button>
          <Button variant="primary" icon={Hammer} onClick={() => navigate('/contractor/tasks')}>Execute Tasks</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <MetricCard title="Total Pending Tasks" value={pendingTasks.length.toString()} icon={CalendarCheck} color="#3b82f6" />
        <MetricCard title="Tasks In Progress" value={inProgressCount.toString()} icon={Hammer} color="#f59e0b" />
        <MetricCard title="Delayed / Blocked" value={delayedCount.toString()} icon={AlertTriangle} color="#dc2626" />
        <MetricCard title="Completed Tasks" value={completedCount.toString()} icon={CheckCircle} color="#10b981" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <Card title="My Action Items" action={<Button variant="ghost" size="sm" onClick={() => navigate('/contractor/tasks')}>View All <ArrowRight size={14}/></Button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {pendingTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <CheckCircle size={32} style={{ color: '#94a3b8', margin: '0 auto 1rem' }} />
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>All caught up! No pending tasks.</p>
              </div>
            ) : (
              pendingTasks.slice(0, 5).map(t => (
                <ActionRow key={t.id} task={t.title} deadline={t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'} status={t.status || 'PENDING'} onAction={() => navigate('/contractor/tasks')} />
              ))
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Quick Responsibilities">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="outline" onClick={() => navigate('/contractor/workers')} style={{ justifyContent: 'flex-start' }}><Users size={16} style={{ marginRight: '0.5rem', color: '#3b82f6' }} /> Manage Workforce</Button>
              <Button variant="outline" onClick={() => navigate('/contractor/attendance')} style={{ justifyContent: 'flex-start' }}><CalendarCheck size={16} style={{ marginRight: '0.5rem', color: '#10b981' }} /> Log Attendance</Button>
              <Button variant="outline" onClick={() => navigate('/contractor/materials')} style={{ justifyContent: 'flex-start' }}><Package size={16} style={{ marginRight: '0.5rem', color: '#f59e0b' }} /> Material Usage</Button>
              <Button variant="outline" onClick={() => navigate('/issues')} style={{ justifyContent: 'flex-start' }}><AlertTriangle size={16} style={{ marginRight: '0.5rem', color: '#dc2626' }} /> Report Issue</Button>
              <Button variant="outline" onClick={() => navigate('/contractor/billing')} style={{ justifyContent: 'flex-start', gridColumn: '1 / -1' }}><FileText size={16} style={{ marginRight: '0.5rem', color: '#6366f1' }} /> Submit Payment Claim</Button>
            </div>
          </Card>

          <Card title="Recent Announcements" action={<Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>All <ArrowRight size={14}/></Button>}>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e3a8a', fontSize: '0.9rem' }}>Site Safety Protocol Updated</h4>
              <p style={{ margin: 0, color: '#1e40af', fontSize: '0.8rem' }}>Please ensure all your workers wear high-visibility vests and hard hats in Sector B starting tomorrow.</p>
            </div>
          </Card>
        </div>
      </div>
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
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{value}</h3>
      </div>
    </div>
  );
}

function ActionRow({ task, deadline, status, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>{task}</h4>
        <p style={{ margin: 0, color: '#dc2626', fontSize: '0.8rem', fontWeight: 500 }}>Due: {deadline}</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Badge status={status} />
        <button onClick={onAction} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>Manage</button>
      </div>
    </div>
  );
}
