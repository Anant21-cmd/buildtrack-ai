import React, { useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  ArrowLeft,
  MapPin,
  Calendar,
  Settings,
  Plus,
  Compass,
  Clock,
  CheckCircle2,
  FileText,
  Truck,
  ShieldAlert,
  HardHat
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import SiteMap from '../../components/projects/SiteMap';
import { useProjects } from '../../context/ProjectContext';
import { useWorkers, TRADE_ROLES, CONTRACTOR_GROUPS } from '../../context/WorkerContext';
import { useAuth, ROLES } from '../../context/AuthContext';

export default function ProjectDashboard() {
  const { currentUser, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getProject } = useProjects();
  const { workers = [], addWorker } = useWorkers();

  const project = getProject(id);
  
  const activeTab = searchParams.get('tab') || 'OVERVIEW';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Assign Staff Modal State (For Admins)
  const [assignStaffModalOpen, setAssignStaffModalOpen] = useState(false);
  const [assignedStaff, setAssignedStaff] = useState([]); // Local state for immediate UI update
  const [isInviting, setIsInviting] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'SITE_ENGINEER'
  });

  // Invite Client Modal State
  const [inviteClientModalOpen, setInviteClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: project?.client || '',
    email: '',
    role: 'CLIENT'
  });

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(clientForm)
      });
      const data = await res.json();
      if (res.ok) {
        setInviteClientModalOpen(false);
        setClientForm({ name: project?.client || '', email: '', role: 'CLIENT' });
        alert('Client Portal invitation successfully dispatched to ' + clientForm.email);
      } else {
        alert(data.message || 'Failed to invite client');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while inviting the client.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      // 1. Hit the real database API to create the user and send verification email
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(staffForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // 2. Update UI instantly
        setAssignedStaff([...assignedStaff, {
          ...staffForm,
          id: data.user?.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Invited (Pending)'
        }]);
        setAssignStaffModalOpen(false);
        setStaffForm({ name: '', email: '', role: 'SITE_ENGINEER' });
        alert('Invitation sent successfully! An email has been dispatched to ' + staffForm.email);
      } else {
        alert(data.message || 'Failed to invite staff');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while inviting the staff member.');
    } finally {
      setIsInviting(false);
    }
  };

  // Add Worker Modal State (For Site Engineers/Contractors)
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    phone: '',
    role: (TRADE_ROLES && TRADE_ROLES[0]) || 'General Labor',
    contractorGroup: (CONTRACTOR_GROUPS && CONTRACTOR_GROUPS[0]) || 'Internal Staff',
    dailyWage: 0
  });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await addWorker({
      ...workerForm,
      assignedProjectId: project.id,
      assignedProjectName: project.name
    });
    setAddModalOpen(false);
    setWorkerForm({ 
      name: '', 
      phone: '', 
      role: (TRADE_ROLES && TRADE_ROLES[0]) || 'General Labor', 
      contractorGroup: (CONTRACTOR_GROUPS && CONTRACTOR_GROUPS[0]) || 'Internal Staff', 
      dailyWage: 0 
    });
  };

  if (!project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: '#0f172a', fontWeight: 800 }}>Project Not Found</h3>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>No project matching ID <strong>{id}</strong>.</p>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/projects')} style={{ marginTop: '1rem' }}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const remainingBudget = project.budget - project.spent;
  const budgetUtilization = Math.round((project.spent / (project.budget || 1)) * 100);
  
  const siteWorkers = workers.filter(w => w.assignedProjectId === project.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Back to List Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#1e3a8a',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Back to Projects Directory
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge status={project.status} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            ID: <strong>{project.id}</strong>
          </span>
        </div>
      </div>

      {/* Project Master Hero Card */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          borderLeft: '4px solid #f59e0b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ backgroundColor: '#d97706', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {project.code}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Client: <strong>{project.client}</strong>
                {(currentUser?.role === 'COMPANY_ADMIN' || currentUser?.role === ROLES?.COMPANY_ADMIN) && (
                  <button 
                    onClick={() => {
                      setClientForm({...clientForm, name: project.client || ''});
                      setInviteClientModalOpen(true);
                    }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    + Grant Access
                  </button>
                )}
              </span>
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{project.name}</h1>
            
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', maxWidth: '750px', marginTop: '0.35rem', lineHeight: 1.5 }}>
              {project.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} style={{ color: '#f59e0b' }} />
                <span>{project.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Compass size={15} style={{ color: '#10b981' }} />
                <span>GPS: {project.latitude}, {project.longitude} (&plusmn;{project.radiusMeters}m geofence)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} style={{ color: '#38bdf8' }} />
                <span>{new Date(project.startDate).toLocaleDateString()} &rarr; {new Date(project.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>
              {project.progress}%
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Physical Progress
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title="Physical Completion"
          value={`${project.progress}%`}
          subtitle={`Target date: ${new Date(project.endDate).toLocaleDateString()}`}
          icon={TrendingUp}
          iconBg="#eff6ff"
          iconColor="#1e3a8a"
          trend={project.progress > 0 ? "In Progress" : "Planning"}
          trendPositive={true}
        />
        <Card
          title="Assigned Workers"
          value={`${siteWorkers.length}`}
          subtitle="Registered Site Staff"
          icon={Users}
          iconBg="#ecfdf5"
          iconColor="#059669"
          trend="Real-time Tracking"
          trendPositive={true}
        />
        <Card
          title="Materials Logged"
          value={`${(project.materials || []).length} Materials`}
          subtitle="Approved Quota Baselines"
          icon={Package}
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          trend="Quota Secured"
          trendPositive={true}
        />
        <Card
          title="Budget Utilization"
          value={`₹${(project.spent || 0).toLocaleString('en-IN')}`}
          subtitle={`Remaining: ₹${(remainingBudget || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend={`${budgetUtilization}% Used`}
          trendPositive={budgetUtilization < 90}
        />
      </div>

      {/* Content Area */}

      {/* Tab 1: Overview & DPR */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          
          {/* Site Map View */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: '#1e3a8a' }} /> Real-Time Site Location
            </h3>
            <SiteMap 
              latitude={project.latitude} 
              longitude={project.longitude} 
              radiusMeters={project.radiusMeters} 
              name={project.name} 
              location={project.location} 
            />
          </div>

          {/* Daily Progress Reports */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: '#1e3a8a' }} /> Daily Site Progress Logs (DPR)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(project.dailyProgress || []).map((dpr) => (
                <div key={dpr.id} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>Date: {dpr.date}</span>
                    <Badge status="COMPLETED" text={`${dpr.progressPct}% Progress`} />
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.85rem', marginTop: '0.25rem' }}>{dpr.completed}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                    <span>Workers: <strong>{dpr.workersPresent} present</strong></span>
                    <span>Site Condition: <strong>Good</strong></span>
                  </div>
                  {dpr.issues && (
                    <p style={{ fontSize: '0.75rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.35rem 0.5rem', borderRadius: '4px', marginTop: '0.4rem' }}>
                      ⚠️ Site Issue: {dpr.issues}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Project Milestones & Critical Schedule */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#059669' }} /> Milestone Completion Schedule
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { name: 'Substructure & Foundation Piling', status: 'COMPLETED', date: 'March 2026' },
                { name: 'Core Shear Walls & Podium Slabs', status: 'COMPLETED', date: 'June 2026' },
                { name: 'Superstructure Framing (L15-L25)', status: 'IN_PROGRESS', date: 'October 2026' },
                { name: 'Curtain Wall & Facade Enclosure', status: 'PENDING', date: 'November 2026' },
                { name: 'MEP Fit-Out & Final Commissioning', status: 'PLANNING', date: 'December 2026' }
              ].map((m, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{m.name}</p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Target: {m.date}</span>
                  </div>
                  <Badge status={m.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workforce & Teams */}
      {activeTab === 'WORKFORCE' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          {(currentUser?.role === 'COMPANY_ADMIN' || currentUser?.role === ROLES?.COMPANY_ADMIN) ? (
            // ADMIN VIEW: Project Management Team Only
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Project Management Team
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Site Engineers and Contractors assigned to oversee operations at this site.
                  </p>
                </div>
                <div>
                  <Button variant="primary" size="sm" icon={Users} onClick={() => setAssignStaffModalOpen(true)}>
                    Assign Site Engineer / Contractor
                  </Button>
                </div>
              </div>
              <Table
                columns={[
                  { header: 'Staff Name', accessor: 'name' },
                  { header: 'System Role', accessor: 'role', render: (row) => row.role.replace('_', ' ') },
                  { header: 'Contact Email', accessor: 'email' },
                  { header: 'Assignment Status', accessor: 'status', render: () => <span style={{ color: '#059669', fontWeight: 600 }}>Active</span> }
                ]}
                data={assignedStaff}
              />
            </>
          ) : (
            // SITE ENGINEER VIEW: Granular Labor Attendance
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Assigned Site Workforce & Today's 3-Way Attendance
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Real-time turnout recorded via QR Badges, Site Geofenced GPS, and Manual Site Engineer fallback.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="badge badge-success">QR: 0</span>
                  <span className="badge badge-info">GPS: 0</span>
                  <span className="badge badge-pending">Manual: 0</span>
                  <Button variant="warning" size="sm" icon={Plus} onClick={() => setAddModalOpen(true)} style={{ marginLeft: '1rem' }}>
                    Register Field Worker
                  </Button>
                </div>
              </div>
    
              <Table
                searchable={true}
                searchPlaceholder="Filter workers by name or trade skill..."
                columns={[
                  {
                    header: 'Worker Name & ID',
                    accessor: 'name',
                    render: (row) => (
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.id}</span>
                        <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</p>
                      </div>
                    )
                  },
                  { header: 'Trade Skill / Role', accessor: 'role' },
                  { header: 'Contractor Group', accessor: 'contractor' },
                  {
                    header: 'Attendance Method',
                    accessor: 'method',
                    render: (row) => (
                      <span style={{ fontWeight: 700, color: row.method === 'GPS' ? '#0284c7' : row.method === 'QR' ? '#059669' : '#d97706' }}>
                        {row.method === 'NONE' ? '—' : row.method}
                      </span>
                    )
                  },
                  { header: 'Check-in Time', accessor: 'time' },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (row) => <Badge status={row.status === 'Present' ? 'COMPLETED' : 'PENDING'} text={row.status} />
                  }
                ]}
                data={siteWorkers}
              />
            </>
          )}
        </div>
      )}

      {/* Tab 3: Materials & Quota Scam Trap (Sections 12, 13, 14) */}
      {activeTab === 'MATERIALS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Scam Trap Warning Banner */}
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#991b1b' }}>
                <ShieldAlert size={18} /> Active Material Excess Prevention Engine
              </div>
              <p style={{ color: '#7f1d1d', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Formula: <code>Remaining Quota = Approved Baseline - Previously Issued</code>. Any request exceeding remaining quota automatically triggers a security lock.
              </p>
            </div>
            <Badge status="EXCESS_FLAGGED" text="Scam Trap Guard Active" />
          </div>

          {/* Project Materials Baseline vs Issued Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Project Material Quotas & Real-Time Warehouse Stock
            </h3>
            <Table
              searchable={false}
              columns={[
                {
                  header: 'Material Name',
                  accessor: 'name',
                  render: (row) => (
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category: {row.category}</span>
                    </div>
                  )
                },
                {
                  header: 'Approved Quota',
                  accessor: 'approvedQty',
                  render: (row) => <strong style={{ color: '#0f172a' }}>{row.approvedQty} {row.unit}</strong>
                },
                {
                  header: 'Issued to Site',
                  accessor: 'issuedQty',
                  render: (row) => <span>{row.issuedQty} {row.unit}</span>
                },
                {
                  header: 'Remaining Allowed',
                  accessor: 'remaining',
                  render: (row) => {
                    const remaining = row.approvedQty - row.issuedQty;
                    return (
                      <span style={{ fontWeight: 700, color: remaining <= 50 ? '#dc2626' : '#059669' }}>
                        {remaining} {row.unit}
                      </span>
                    );
                  }
                },
                {
                  header: 'Current Warehouse Stock',
                  accessor: 'stock',
                  render: (row) => (
                    <div>
                      <span>{row.stock} {row.unit}</span>
                      {row.stock <= row.minStock && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>
                          ⚠️ Below Min Threshold ({row.minStock})
                        </span>
                      )}
                    </div>
                  )
                },
                {
                  header: 'Quota Status',
                  accessor: 'status',
                  render: (row) => {
                    const pct = Math.round((row.issuedQty / row.approvedQty) * 100);
                    return <Badge status={pct >= 85 ? 'HIGH' : 'ACTIVE'} text={`${pct}% Consumed`} />;
                  }
                }
              ]}
              data={project.materials || []}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Tasks & Machinery (Sections 19 & 20) */}
      {activeTab === 'TASKS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {/* Construction Tasks Board */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={18} style={{ color: '#1e3a8a' }} /> Construction Tasks & Deliverables
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(project.tasks || []).map((task) => (
                <div key={task.id} style={{ padding: '0.85rem 1rem', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{task.id}</span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Badge status={task.priority} />
                      <Badge status={task.status} />
                    </div>
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{task.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                    <span>Trade: <strong>{task.assignedTo}</strong></span>
                    <span>Due: <strong>{task.dueDate}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heavy Equipment Allocated */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} style={{ color: '#d97706' }} /> Allocated Heavy Equipment & Machinery
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(project.equipment || []).map((eq) => (
                <div key={eq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '6px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{eq.id}</span>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{eq.name}</p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Operating Hours: <strong>{eq.operatingHours} hrs</strong></span>
                  </div>
                  <Badge status={eq.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Finance & Cost Ledgers (Section 22) */}
      {activeTab === 'FINANCE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Balance Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Budget</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>₹{project.budget.toLocaleString('en-IN')}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Verified Expenses</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>₹{project.spent.toLocaleString('en-IN')}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Remaining Balance</span>
              <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>₹{remainingBudget.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Itemized Expenses Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Itemized Site Expense Ledger
            </h3>
            <Table
              searchable={false}
              columns={[
                { header: 'Expense ID', accessor: 'id' },
                { header: 'Category', accessor: 'category', render: (row) => <Badge status="ACTIVE" text={row.category} /> },
                { header: 'Description', accessor: 'description' },
                { header: 'Posting Date', accessor: 'date' },
                {
                  header: 'Amount (₹)',
                  accessor: 'amount',
                  render: (row) => <strong style={{ color: '#0f172a' }}>₹{row.amount.toLocaleString()}</strong>
                }
              ]}
              data={project.expenses || []}
            />
          </div>
        </div>
      )}

      {/* Invite Client Modal (Company Admin) */}
      <Modal
        isOpen={inviteClientModalOpen}
        onClose={() => setInviteClientModalOpen(false)}
        title={`Grant Client Portal Access`}
        subtitle="Invite the client to track project progress, milestones, and reports."
        maxWidth="500px"
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteClientModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleClientSubmit} disabled={isInviting}>
              {isInviting ? 'Inviting...' : 'Send Invitation'}
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Client Name *</label>
            <input type="text" value={clientForm.name} onChange={(e) => setClientForm({...clientForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required placeholder="e.g. Anand" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email Address *</label>
            <input type="email" value={clientForm.email} onChange={(e) => setClientForm({...clientForm, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required placeholder="client@example.com" />
          </div>
        </form>
      </Modal>

      {/* Assign Staff Modal (Company Admin) */}
      <Modal
        isOpen={assignStaffModalOpen}
        onClose={() => setAssignStaffModalOpen(false)}
        title={`Assign Staff to ${project?.name}`}
        subtitle="Invite or assign a Site Engineer or Contractor to oversee operations."
        maxWidth="500px"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssignStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStaffSubmit} disabled={isInviting}>
              {isInviting ? 'Assigning...' : 'Assign to Site'}
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Full Name *</label>
            <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email Address *</label>
            <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required placeholder="rahul@example.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Project Role *</label>
            <select value={staffForm.role} onChange={(e) => setStaffForm({...staffForm, role: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="SITE_ENGINEER">Site Engineer</option>
              <option value="CONTRACTOR">Contractor</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Add Worker Modal (Site Engineer / Contractor) */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={`Register Worker for ${project.name}`}
        subtitle="This worker will be immediately assigned to this site"
        maxWidth="600px"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              Register to Site
            </Button>
          </>
        }
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Full Name *</label>
            <input type="text" value={workerForm.name} onChange={(e) => setWorkerForm({...workerForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Phone Number</label>
            <input type="text" value={workerForm.phone} onChange={(e) => setWorkerForm({...workerForm, phone: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Trade Role</label>
            <select value={workerForm.role} onChange={(e) => setWorkerForm({...workerForm, role: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              {(TRADE_ROLES || []).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Daily Wage (₹)</label>
            <input type="number" value={workerForm.dailyWage} onChange={(e) => setWorkerForm({...workerForm, dailyWage: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          </div>
        </form>
      </Modal>

    </div>
  );
}

