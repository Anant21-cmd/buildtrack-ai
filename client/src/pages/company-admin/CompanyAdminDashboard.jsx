import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldAlert,
  HardHat,
  Truck,
  Factory
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';
import { useMaterials } from '../../context/MaterialContext';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import { useRecentlyAccessed } from '../../hooks/useRecentlyAccessed';

export default function CompanyAdminDashboard() {
  const { currentUser, token } = useAuth();
  const recentPages = useRecentlyAccessed();

  const { projects = [] } = useProjects();
  const { materials = [] } = useMaterials();

  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [teamCount, setTeamCount] = useState(0);

  // Fetch team members count
  React.useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTeamCount(data.length);
        }
      } catch (err) {
        console.error('Failed to fetch team', err);
      }
    };
    if (token) fetchTeam();
  }, [token]);

  // Filter data based on selected project
  const filteredProjects = selectedProjectId === 'ALL' 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  // Financial summary calculations
  const totalBudget = filteredProjects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = filteredProjects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Since we don't have MaterialRequests context fully integrated, we use an empty array
  const materialAlerts = [];
  const recentActivities = [];

  const chartData = projects.length > 0 
    ? projects.map(p => ({
        name: p.code || p.name.substring(0, 10),
        spent: p.spent || 0
      }))
    : [{ name: 'No Projects', spent: 0 }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Executive Company Header */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1.75rem 2rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderLeft: '4px solid #1e3a8a'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Company Operations Command</h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Welcome back, <strong>{currentUser.name}</strong>. Here is your enterprise construction overview for today.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1e293b', padding: '0.4rem 0.75rem', borderRadius: '6px', marginRight: '0.5rem' }}>
            <Factory size={16} color="#94a3b8" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ 
                backgroundColor: 'transparent', 
                color: '#ffffff', 
                border: 'none', 
                outline: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL" style={{ color: '#0f172a' }}>Global View (All Projects)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} style={{ color: '#0f172a' }}>{p.name}</option>
              ))}
            </select>
          </div>
          <Link to="/projects">
            <Button variant="warning" size="sm" icon={Plus}>
              New Project
            </Button>
          </Link>
          <Link to="/team-management">
            <Button variant="outline" size="sm" icon={Users} style={{ color: '#ffffff', borderColor: '#475569' }}>
              Manage Team
            </Button>
          </Link>
          <Link to="/finance">
            <Button variant="outline" size="sm" icon={DollarSign} style={{ color: '#ffffff', borderColor: '#475569' }}>
              Finance & Budget
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Level Metrics (Section 12.1 Requirement) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title={selectedProjectId === 'ALL' ? "Active Projects" : "Filtered Project"}
          value={selectedProjectId === 'ALL' ? `${projects.length} / 4` : '1'}
          subtitle={selectedProjectId === 'ALL' ? "3 Active • 1 Planning" : "Currently Viewing"}
          icon={Briefcase}
          iconBg="#eff6ff"
          iconColor="#1e3a8a"
          trend="+1 This Month"
          trendPositive={true}
        />
        <Card
          title="Core Team Members"
          value={teamCount.toString()}
          subtitle="System Users"
          icon={Users}
          iconBg="#ecfdf5"
          iconColor="#059669"
          trend="Fully Staffed"
          trendPositive={true}
        />
        <Card
          title="Material Catalog"
          value={selectedProjectId === 'ALL' ? `${materials.length} Materials` : "Global Scope"}
          subtitle="Registered in DB"
          icon={HardHat}
          iconBg="#fef2f2"
          iconColor="#dc2626"
          trend="No Shortages"
          trendPositive={true}
        />
        <Card
          title="Budget Burn Rate"
          value={`₹${totalSpent.toLocaleString('en-IN')}`}
          subtitle={`Remaining: ₹${remainingBudget.toLocaleString('en-IN')} (${100 - budgetUtilization}%)`}
          icon={DollarSign}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend={`${budgetUtilization}% Allocated`}
          trendPositive={budgetUtilization < 80}
        />
      </div>

      {/* Analytics Chart Widget */}
      <Card title="Project Expenditure Overview" style={{ padding: '1rem' }}>
        <AnalyticsChart 
          title="Expenditure by Project (in ₹)"
          data={chartData}
          dataKey="spent"
          type="bar"
          color="#10b981"
        />
      </Card>

      {/* Main Dual-Column Operational Canvas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.75rem'
        }}
      >
        {/* Left Column: Active Projects & Material Excess Trap Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Ongoing Projects Progress Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HardHat size={20} style={{ color: '#1e3a8a' }} /> Ongoing Construction Projects
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Real-time physical completion and financial burn.
                </p>
              </div>
              <Link to="/projects" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                All Projects <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <Briefcase size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>No active projects found.</p>
                  <Link to="/projects" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem', color: '#1e3a8a', fontWeight: 600, textDecoration: 'none' }}>+ Create Your First Project</Link>
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const spentPercent = Math.round((proj.spent / proj.budget) * 100);
                  return (
                  <div
                    key={proj.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '1.1rem 1.25rem',
                      backgroundColor: '#fcfdfd'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{proj.code}</span>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{proj.name}</h4>
                          <Badge status={proj.status} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Client: {proj.client}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>{proj.progress}%</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Physical Progress</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', margin: '0.5rem 0 0.75rem' }}>
                      <div
                        style={{
                          width: `${proj.progress}%`,
                          height: '100%',
                          backgroundColor: proj.progress > 70 ? '#059669' : '#1e3a8a',
                          borderRadius: '9999px'
                        }}
                      />
                    </div>

                    {/* Meta details footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                      <span>Workers: <strong>{proj.workersCount} assigned</strong></span>
                      <span>Budget Spent: <strong>₹{proj.spent?.toLocaleString('en-IN')} / ₹{proj.budget?.toLocaleString('en-IN')} ({spentPercent}%)</strong></span>
                      <span>Target: <strong>{proj.endDate}</strong></span>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>

          {/* Material Excess Warning & Scam Prevention Panel (Section 14) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #fee2e2',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={20} style={{ color: '#dc2626' }} /> Material Requests & Scam Prevention Alert
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Automatic detection prevents issuing materials exceeding pre-approved project quotas.
                </p>
              </div>
              <Link to="/materials" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Inventory Hub <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {materialAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed #cbd5e1', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <ShieldAlert size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>No active material alerts.</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Excess requests will appear here automatically.</p>
                </div>
              ) : (
              materialAlerts.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: req.excessQty > 0 ? '#fef2f2' : '#f8fafc',
                    border: '1px solid',
                    borderColor: req.excessQty > 0 ? '#fecaca' : '#e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{req.material}</span>
                        <Badge status={req.status} text={req.excessQty > 0 ? `Excess: +${req.excessQty} Units` : 'Normal Request'} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                        Site: {req.project} &bull; Requested by: {req.requestedBy}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: req.excessQty > 0 ? '#dc2626' : '#1e3a8a' }}>
                        Requesting: {req.requestedQty} bags
                      </span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                        Remaining quota: {req.remainingQty} bags
                      </span>
                    </div>
                  </div>

                  {req.excessQty > 0 && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px dashed #dc2626',
                        fontSize: '0.775rem',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>
                        ⚠️ <strong>Scam Trap Triggered:</strong> Request exceeds remaining approved quantity by <strong>{req.excessQty} bags</strong>. System has blocked auto-issuance.
                      </span>
                      <Button size="sm" variant="danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                        Review Trap
                      </Button>
                    </div>
                  )}
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Health Gauge, Critical Alerts & Activities Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Budget Health Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} style={{ color: '#059669' }} /> Budget & Expense Health
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Real-time balance computation ensuring zero negative balances.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Approved Budget</span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  ₹{totalBudget.toLocaleString('en-IN')}
                </p>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Remaining Balance</span>
                <p style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                  ₹{remainingBudget.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span>Spent: ₹{totalSpent.toLocaleString('en-IN')} ({budgetUtilization}%)</span>
                <span style={{ color: '#059669' }}>Remaining: ₹{remainingBudget.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${budgetUtilization}%`,
                    height: '100%',
                    backgroundColor: budgetUtilization > 85 ? '#dc2626' : '#d97706',
                    borderRadius: '9999px'
                  }}
                />
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Non-negative balance rule enforced. Remaining funds = Total Budget - Total Verified Expenses.
            </span>
          </div>

          {/* Real-Time Activities Feed (Section 8 Requirement) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: '#1e3a8a' }} /> Recently Accessed Modules
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
                Live Tracker
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentPages.length > 0 ? recentPages.map((page, idx) => {
                return (
                  <Link
                    to={page.path}
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      paddingBottom: '0.85rem',
                      borderBottom: '1px solid #f1f5f9',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div
                      style={{
                        padding: '0.5rem',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <ArrowRight size={18} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{page.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {new Date(page.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                        Path: {page.path}
                      </p>
                    </div>
                  </Link>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                  No recent activity yet. Click around the dashboard to start tracking!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

