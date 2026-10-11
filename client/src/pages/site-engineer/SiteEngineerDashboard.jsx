import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase,
  CheckSquare,
  TrendingUp,
  Package,
  AlertTriangle,
  Users,
  Image as ImageIcon,
  ShieldAlert,
  Activity,
  Clock,
  MapPin,
  ArrowRight,
  PlusCircle,
  FileText
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { useIssues } from '../../context/IssueContext';
import { useProjects } from '../../context/ProjectContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useMaterialRequests } from '../../context/MaterialRequestContext';
import { useReports } from '../../context/ReportContext';

export default function SiteEngineerDashboard() {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();
  const { issues } = useIssues();
  const { projects } = useProjects();
  const { attendanceRecords } = useAttendance();
  const { requests: materialRequests } = useMaterialRequests();
  const { photos, reports } = useReports();
  const navigate = useNavigate();

  // Safety fallbacks
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeIssues = Array.isArray(issues) ? issues : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeAttendance = Array.isArray(attendanceRecords) ? attendanceRecords : [];
  const safeMaterialRequests = Array.isArray(materialRequests) ? materialRequests : [];

  // Data processing
  const myProjects = safeProjects.filter(p => !p.isArchived);
  const myTasks = safeTasks.filter(t => !t.assigneeId || t.assigneeId === currentUser?.id);
  const todaysTasks = myTasks.filter(t => t.status?.toUpperCase() !== 'COMPLETED');
  const delayedTasks = myTasks.filter(t => t.status?.toUpperCase() === 'DELAYED');
  
  const pendingIssues = safeIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = safeAttendance.filter(a => a.date?.startsWith(todayStr)).length || safeAttendance.length;
  const pendingMatReq = safeMaterialRequests.filter(m => m.status?.toUpperCase() === 'PENDING').length;

  // Mock data for new sections (to be wired to backend later)
  const recentActivities = (reports && reports.length > 0)
    ? reports.slice(0, 5).map(r => ({
        id: r.id,
        type: 'general',
        time: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        text: r.workDescription
      }))
    : [];
  
  const recentPhotos = (photos && photos.length > 0)
    ? photos.slice(0, 6).map(p => p.url)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            Site Engineer Command Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={FileText} onClick={() => navigate('/engineer/daily-reports')}>New DPR</Button>
          <Button variant="outline" icon={Package} onClick={() => navigate('/materials/requests')}>Request Material</Button>
          <Button variant="primary" icon={AlertTriangle} onClick={() => navigate('/issues')}>Report Issue</Button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SummaryCard title="Active Projects" value={myProjects.length} icon={Briefcase} color="#475569" onClick={() => navigate('/projects')} />
        <SummaryCard title="Today's Tasks" value={todaysTasks.length} icon={CheckSquare} color="#3b82f6" onClick={() => navigate('/tasks')} />
        <SummaryCard title="Delayed Tasks" value={delayedTasks.length} icon={Clock} color="#f59e0b" onClick={() => navigate('/tasks')} />
        <SummaryCard title="Pending Material" value={pendingMatReq} icon={Package} color="#8b5cf6" onClick={() => navigate('/materials/requests')} />
        <SummaryCard title="Open Issues" value={pendingIssues.length} icon={AlertTriangle} color="#ef4444" onClick={() => navigate('/issues')} />
        <SummaryCard title="Workers Present" value={todayAttendance} icon={Users} color="#10b981" onClick={() => navigate('/attendance')} />
      </div>

      {/* MAIN SECTIONS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* ROW 1: Project Progress & Site Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {/* Project Progress */}
          <Card title="Project Progress" action={<Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>Update <ArrowRight size={14} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              {myProjects.length === 0 ? (
                <EmptyState icon={Briefcase} message="No active projects assigned." />
              ) : (
                myProjects.slice(0, 3).map(p => (
                  <div key={p.id} onClick={() => navigate('/progress')} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6' }}>{p.progress || 0}%</span>
                    </div>
                    {/* Progress bar visual */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Today's Site Activity (Timeline) */}
          <Card title="Today's Site Activity" action={<Button variant="ghost" size="sm" onClick={() => navigate('/engineer/daily-reports')}>Full Log <ArrowRight size={14} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', position: 'relative' }}>
              {/* Vertical line for timeline */}
              <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }}></div>
              
              {recentActivities.length === 0 ? (
                <EmptyState icon={Activity} message="No recent site activity logged today." />
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} onClick={() => navigate('/engineer/daily-reports')} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, cursor: 'pointer' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: act.type === 'safety' ? '#fef08a' : act.type === 'material' ? '#ddd6fe' : '#bbf7d0',
                      border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                      <Activity size={12} color={act.type === 'safety' ? '#ca8a04' : act.type === 'material' ? '#7c3aed' : '#16a34a'} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{act.time}</span>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>{act.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* ROW 2: Delayed Tasks & Material Requests */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          <Card title="Delayed Tasks" action={<Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>All Tasks <ArrowRight size={14} /></Button>}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
               {delayedTasks.length === 0 ? (
                 <EmptyState icon={CheckSquare} message="No delayed tasks! Great job." />
               ) : (
                 delayedTasks.slice(0, 4).map(t => (
                   <div key={t.id} onClick={() => navigate('/tasks')} style={{ padding: '0.85rem', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                     <div>
                       <h4 style={{ margin: '0 0 0.25rem 0', color: '#991b1b', fontSize: '0.9rem', fontWeight: 600 }}>{t.title}</h4>
                       <span style={{ fontSize: '0.8rem', color: '#b91c1c' }}>Assignee: Contractor</span>
                     </div>
                     <Badge status="DELAYED" />
                   </div>
                 ))
               )}
             </div>
          </Card>

          <Card title="Recent Material Requests" action={<Button variant="ghost" size="sm" onClick={() => navigate('/materials/requests')}>View All <ArrowRight size={14} /></Button>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
               {safeMaterialRequests.length === 0 ? (
                 <EmptyState icon={Package} message="No recent material requests." />
               ) : (
                 safeMaterialRequests.slice(0, 4).map(m => (
                   <div key={m.id} onClick={() => navigate('/materials/requests')} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                     <div>
                       <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: 600 }}>{m.materialName || m.material?.name || 'Material'} ({m.requestedQuantity || m.qty} {m.unit || m.material?.unit || ''})</h4>
                       <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Purpose: {m.purpose || m.reason || 'Site Work'}</span>
                     </div>
                     <Badge status={m.status} />
                   </div>
                 ))
               )}
            </div>
          </Card>
        </div>

        {/* ROW 3: Open Issues & Site Photos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          
          <Card title="Open Issues & Safety Alerts" action={<Button variant="ghost" size="sm" onClick={() => navigate('/issues')}>Manage <ArrowRight size={14} /></Button>}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
               {pendingIssues.length === 0 ? (
                 <EmptyState icon={ShieldAlert} message="No open issues or safety alerts." />
               ) : (
                 pendingIssues.slice(0, 4).map(i => (
                   <div key={i.id} onClick={() => navigate('/issues')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                     <ShieldAlert size={20} style={{ color: i.severity === 'HIGH' || i.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b' }} />
                     <div style={{ flex: 1 }}>
                       <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: 600 }}>{i.title}</h4>
                       <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{i.category}</span>
                     </div>
                     <Badge status={i.severity || 'OPEN'} />
                   </div>
                 ))
               )}
             </div>
          </Card>

          <Card title="Recent Progress Photos" action={<Button variant="ghost" size="sm" onClick={() => navigate('/engineer/media')}>Gallery <ArrowRight size={14} /></Button>}>
             <div style={{ display: 'grid', gridTemplateColumns: recentPhotos.length === 0 ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
               {recentPhotos.length === 0 ? (
                 <EmptyState icon={ImageIcon} message="No site photos uploaded yet." />
               ) : (
                 recentPhotos.map((url, idx) => (
                   <div key={idx} style={{ 
                     height: '100px', borderRadius: '8px', overflow: 'hidden', 
                     backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                     border: '1px solid #e2e8f0'
                   }} />
                 ))
               )}
             </div>
             <Button variant="outline" onClick={() => navigate('/engineer/media')} style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}>
               <ImageIcon size={16} style={{ marginRight: '0.5rem' }} /> Upload New Photo
             </Button>
          </Card>

        </div>

      </div>
    </div>
  );
}

// Sub-components

function SummaryCard({ title, value, icon: Icon, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        backgroundColor: '#fff', 
        borderRadius: '12px', 
        padding: '1.25rem', 
        border: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
        }
      }}
    >
      <div style={{ backgroundColor: `${color}15`, padding: '0.8rem', borderRadius: '10px' }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{title}</p>
        <h3 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{value}</h3>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
      <Icon size={32} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>
    </div>
  );
}
