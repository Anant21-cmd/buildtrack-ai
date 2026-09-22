import React, { useMemo } from 'react';
import { useCompany } from '../../context/CompanyContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Building2, Shield, Users, Activity, CheckCircle, Clock, XCircle, AlertOctagon } from 'lucide-react';

export default function SystemReports() {
  const { companies, auditLogs } = useCompany();

  // Aggregate Data
  const metrics = useMemo(() => {
    const totalCompanies = companies.length;
    const approved = companies.filter(c => c.status === 'APPROVED').length;
    const pending = companies.filter(c => c.status === 'PENDING').length;
    const rejected = companies.filter(c => c.status === 'REJECTED').length;
    const suspended = companies.filter(c => c.status === 'SUSPENDED').length;

    const totalAuditActions = auditLogs.length;
    const highRiskActions = auditLogs.filter(l => l.action === 'COMPANY_REJECTED' || l.action === 'COMPANY_SUSPENDED').length;

    return { totalCompanies, approved, pending, rejected, suspended, totalAuditActions, highRiskActions };
  }, [companies, auditLogs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
          System Reports & Analytics
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Platform-wide metrics covering all registered companies and system events.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard title="Total Companies" value={metrics.totalCompanies} icon={Building2} color="#1e3a8a" />
        <MetricCard title="Approved Entities" value={metrics.approved} icon={CheckCircle} color="#16a34a" />
        <MetricCard title="Pending Review" value={metrics.pending} icon={Clock} color="#ca8a04" />
        <MetricCard title="Total Audit Actions" value={metrics.totalAuditActions} icon={Shield} color="#6366f1" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Registration Status Distribution (CSS Chart) */}
        <Card title="Company Status Distribution">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <StatusBar label="Approved" count={metrics.approved} total={metrics.totalCompanies} color="#16a34a" />
            <StatusBar label="Pending" count={metrics.pending} total={metrics.totalCompanies} color="#eab308" />
            <StatusBar label="Rejected" count={metrics.rejected} total={metrics.totalCompanies} color="#dc2626" />
            <StatusBar label="Suspended" count={metrics.suspended} total={metrics.totalCompanies} color="#9333ea" />
          </div>
        </Card>

        {/* Audit Log Risk Assessment */}
        <Card title="Security & Compliance">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertOctagon size={40} style={{ color: '#dc2626' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{metrics.highRiskActions}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>High-Risk Audit Events (Rejections & Suspensions)</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* List View */}
      <Card title="Recent Registrations Ledger">
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Company Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Reg Number</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 10).map((company) => (
                <tr key={company.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#1e293b' }}>{company.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{company.regNumber}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><Badge status={company.status} /></td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No companies registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Helper component for Top Metrics
function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
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

// Helper component for CSS Bar Chart
function StatusBar({ label, count, total, color }) {
  const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
        <span style={{ fontWeight: 600, color: '#334155' }}>{label} ({count})</span>
        <span style={{ color: '#64748b' }}>{percentage}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px', transition: 'width 0.5s ease-out' }} />
      </div>
    </div>
  );
}

