import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useIssues } from '../../context/IssueContext';
import { useProjects } from '../../context/ProjectContext';

export default function SiteEngineerDashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const { issues } = useIssues();
  const { projects } = useProjects();

  const myTasks = tasks.filter(t => t.status !== 'COMPLETED' && (!t.assignedToId || t.assignedToId === currentUser.id));
  const pendingIssues = issues.filter(i => i.status !== 'RESOLVED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          Site Engineer Workspace
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage your daily task execution, crew attendance, and site issues.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Active Tasks */}
        <Card title="My Active Tasks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {myTasks.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No pending tasks assigned to you.</p>
            ) : (
              myTasks.slice(0,5).map(t => (
                <TaskRow key={t.id} title={t.title} project={t.project?.name || 'Unknown Project'} status={t.status || 'PENDING'} />
              ))
            )}
          </div>
        </Card>

        {/* Recent Issues */}
        <Card title="Pending Issues">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {pendingIssues.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No open issues.</p>
            ) : (
              pendingIssues.slice(0,5).map(i => (
                <IssueRow key={i.id} title={i.title} severity={i.severity || 'MEDIUM'} />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({ title, project, status }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '0.9rem' }}>{title}</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>Project: {project}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Badge status={status} />
        <Button variant="outline" size="sm">Update</Button>
      </div>
    </div>
  );
}

function IssueRow({ title, severity }) {
  const isHigh = severity === 'HIGH' || severity === 'CRITICAL';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: isHigh ? '#fef2f2' : '#ffffff', border: `1px solid ${isHigh ? '#fecaca' : '#e2e8f0'}`, borderRadius: '6px' }}>
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isHigh ? '#991b1b' : '#334155' }}>
        {title}
      </span>
      <Badge status={severity} />
    </div>
  );
}
