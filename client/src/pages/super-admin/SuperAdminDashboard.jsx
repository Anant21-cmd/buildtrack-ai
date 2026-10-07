import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Clock, CheckCircle2, XCircle, Shield, FileText,
  AlertTriangle, ArrowRight, Eye, Check, X, ShieldAlert,
  Activity, Users, Search, MoreVertical, LayoutGrid, CheckSquare,
  TrendingUp, TrendingDown, Calendar, ArrowUpRight, Zap
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/AuthContext';

export default function SuperAdminDashboard() {
  const { companies, auditLogs, approveCompany, rejectCompany } = useCompany();
  const { currentUser } = useAuth();

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const pendingCompanies = companies.filter((c) => c.status === 'PENDING');
  const approvedCompanies = companies.filter((c) => c.status === 'APPROVED');
  const rejectedCompanies = companies.filter((c) => c.status === 'REJECTED');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleApprove = (company) => approveCompany(company.id);
  const openRejectModal = (company) => { setSelectedCompany(company); setRejectionReason(''); setRejectModalOpen(true); };
  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) { alert('Reason required'); return; }
    rejectCompany(selectedCompany.id, rejectionReason.trim());
    setRejectModalOpen(false); setSelectedCompany(null);
  };
  const openDetails = (company) => { setSelectedCompany(company); setDetailModalOpen(true); };

  const styleSheet = `
    /* ULTRA PREMIUM LIGHT MODE SAAS THEME */
    .sa-dashboard {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Hero Section */
    .sa-hero {
      position: relative;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.05);
      overflow: hidden;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .sa-hero::before {
      content: ''; position: absolute; top: 0; right: 0; width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(234, 88, 12, 0.05) 0%, rgba(255,255,255,0) 70%);
      border-radius: 50%; transform: translate(30%, -30%); pointer-events: none;
    }
    .sa-hero-title {
      font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .sa-hero-desc { font-size: 1.05rem; color: #64748b; font-weight: 400; }
    .sa-hero-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 99px;
      font-size: 0.85rem; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;
    }

    /* KPI Cards */
    .sa-kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;
    }
    .sa-kpi-card {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.75rem;
      border: 1px solid #f1f5f9;
      box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative; overflow: hidden;
    }
    .sa-kpi-card:hover {
      transform: translateY(-4px); box-shadow: 0 12px 30px -8px rgba(15, 23, 42, 0.08); border-color: #e2e8f0;
    }
    .sa-kpi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .sa-icon-wrapper {
      width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
    }
    .sa-kpi-title { font-size: 0.9rem; font-weight: 600; color: #64748b; }
    .sa-kpi-value { font-size: 2.25rem; font-weight: 800; color: #0f172a; line-height: 1; margin-top: 0.5rem; }
    .sa-kpi-trend {
      display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; font-weight: 600; margin-top: 1rem;
    }
    .sa-trend-up { color: #10b981; } .sa-trend-up-bg { background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 6px; }
    .sa-trend-down { color: #ef4444; } .sa-trend-down-bg { background: rgba(239, 68, 68, 0.1); padding: 2px 6px; border-radius: 6px; }
    .sa-trend-text { color: #94a3b8; font-weight: 400; }

    /* Main Grid */
    .sa-grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 1024px) { .sa-grid-layout { grid-template-columns: 1fr; } }

    /* Sections / Tables */
    .sa-panel {
      background: #ffffff; border-radius: 20px; border: 1px solid #f1f5f9;
      box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.03); overflow: hidden;
    }
    .sa-panel-header {
      padding: 1.5rem 1.75rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafaf9;
    }
    .sa-panel-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 0.5rem; }
    .sa-panel-action { font-size: 0.85rem; font-weight: 600; color: #ea580c; display: flex; align-items: center; gap: 0.25rem; }
    .sa-panel-action:hover { text-decoration: underline; }

    .sa-table { width: 100%; border-collapse: collapse; }
    .sa-table th { text-align: left; padding: 1rem 1.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #f1f5f9; background: #ffffff; }
    .sa-table td { padding: 1.25rem 1.75rem; font-size: 0.9rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
    .sa-table tr:last-child td { border-bottom: none; }
    .sa-table tr:hover td { background: #f8fafc; }

    /* Status Pills */
    .sa-pill { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
    .sa-pill.pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .sa-pill.success { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .sa-pill.danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .sa-pill-dot { width: 6px; height: 6px; border-radius: 50%; }

    /* Elegant Buttons */
    .sa-btn-icon {
      width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0; background: #ffffff;
      display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: 0.2s;
    }
    .sa-btn-icon:hover { border-color: #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .sa-btn-icon:hover.approve { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .sa-btn-icon:hover.reject { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    
    /* Modern Timeline */
    .sa-timeline { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .sa-timeline-item { display: flex; gap: 1rem; position: relative; }
    .sa-timeline-item::before {
      content: ''; position: absolute; left: 15px; top: 32px; bottom: -1.5rem; width: 2px; background: #f1f5f9;
    }
    .sa-timeline-item:last-child::before { display: none; }
    .sa-timeline-icon {
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 2; border: 4px solid #ffffff;
    }
    .sa-timeline-content { flex: 1; padding-top: 0.25rem; }
    .sa-timeline-title { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
    .sa-timeline-desc { font-size: 0.85rem; color: #64748b; margin-top: 0.25rem; }
    .sa-timeline-time { font-size: 0.75rem; color: #94a3b8; font-weight: 500; margin-top: 0.35rem; display: flex; align-items: center; gap: 0.35rem; }

    /* Empty States */
    .sa-empty { padding: 4rem 2rem; text-align: center; }
    .sa-empty-icon { width: 64px; height: 64px; border-radius: 20px; background: #f8fafc; display: inline-flex; align-items: center; justify-content: center; color: #94a3b8; margin-bottom: 1rem; }
    .sa-empty-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .sa-empty-desc { font-size: 0.9rem; color: #64748b; max-width: 300px; margin: 0 auto; }
  `;

  return (
    <>
      <style>{styleSheet}</style>
      <div className="sa-dashboard">
        
        {/* Hero Section */}
        <div className="sa-hero">
          <div>
            <div className="sa-hero-badge" style={{ marginBottom: '1.25rem' }}>
              <Shield size={16} color="#ea580c" /> Platform Governance Console
            </div>
            <h1 className="sa-hero-title">Welcome back, {currentUser?.name?.split(' ')[0] || 'Admin'}</h1>
            <p className="sa-hero-desc">Here is the latest snapshot of your platform's operational health.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 600, marginTop: '0.25rem' }}>{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="sa-kpi-grid">
          <div className="sa-kpi-card">
            <div className="sa-kpi-header">
              <div>
                <div className="sa-kpi-title">Total Registrations</div>
                <div className="sa-kpi-value">{companies.length || 0}</div>
              </div>
              <div className="sa-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Building2 size={24} strokeWidth={2.5} /></div>
            </div>
            
          </div>
          
          <div className="sa-kpi-card">
            <div className="sa-kpi-header">
              <div>
                <div className="sa-kpi-title">Pending Verifications</div>
                <div className="sa-kpi-value">{pendingCompanies.length || 0}</div>
              </div>
              <div className="sa-icon-wrapper" style={{ background: '#fff7ed', color: '#ea580c' }}><Clock size={24} strokeWidth={2.5} /></div>
            </div>
            
          </div>
          
          <div className="sa-kpi-card">
            <div className="sa-kpi-header">
              <div>
                <div className="sa-kpi-title">Active Companies</div>
                <div className="sa-kpi-value">{approvedCompanies.length || 0}</div>
              </div>
              <div className="sa-icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}><CheckCircle2 size={24} strokeWidth={2.5} /></div>
            </div>
            
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="sa-grid-layout">
          
          {/* Approval Queue Panel */}
          <div className="sa-panel">
            <div className="sa-panel-header">
              <div className="sa-panel-title">
                <div style={{ padding: '6px', background: '#fff7ed', borderRadius: '8px', color: '#ea580c' }}><CheckSquare size={18} /></div>
                Action Required: Approvals
              </div>
              <Link to="/super-admin/companies" className="sa-panel-action">View All <ArrowRight size={16} /></Link>
            </div>
            
            {pendingCompanies.length > 0 ? (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Company Identity</th>
                    <th>Admin Contact</th>
                    <th>Submitted On</th>
                    <th style={{ textAlign: 'right' }}>Decisions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map(company => (
                    <tr key={company.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#334155' }}>
                            {company.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{company.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>Reg: {company.regNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{company.ownerName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{company.email}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Today</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="sa-btn-icon approve" onClick={() => handleApprove(company)} title="Approve"><Check size={18} /></button>
                          <button className="sa-btn-icon reject" onClick={() => openRejectModal(company)} title="Reject"><X size={18} /></button>
                          <button className="sa-btn-icon" onClick={() => openDetails(company)} title="View Details"><Eye size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="sa-empty">
                <div className="sa-empty-icon"><CheckCircle2 size={32} /></div>
                <div className="sa-empty-title">Inbox Zero</div>
                <div className="sa-empty-desc">All company registrations have been processed. You are fully caught up.</div>
              </div>
            )}
          </div>

          {/* Audit Log Timeline */}
          <div className="sa-panel">
            <div className="sa-panel-header">
              <div className="sa-panel-title">
                <div style={{ padding: '6px', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Activity size={18} /></div>
                System Audit Trail
              </div>
            </div>
            
            {auditLogs && auditLogs.length > 0 ? (
              <div className="sa-timeline">
                {auditLogs.slice(0, 6).map(log => {
                   const isApprove = log.action.includes('APPROVED');
                   const isReject = log.action.includes('REJECTED');
                   const iconBg = isApprove ? '#10b981' : isReject ? '#ef4444' : '#3b82f6';
                   const IconCmp = isApprove ? Check : isReject ? X : Activity;
                   return (
                    <div className="sa-timeline-item" key={log.id}>
                      <div className="sa-timeline-icon" style={{ background: iconBg, color: '#fff' }}>
                        <IconCmp size={14} strokeWidth={3} />
                      </div>
                      <div className="sa-timeline-content">
                        <div className="sa-timeline-title">{log.action.replace(/_/g, ' ')}</div>
                        <div className="sa-timeline-desc">Entity: <span style={{fontWeight: 500}}>{log.entityId}</span></div>
                        {log.reason && <div className="sa-timeline-desc" style={{fontStyle: 'italic'}}>"{log.reason}"</div>}
                        <div className="sa-timeline-time"><Clock size={12} /> {new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sa-empty">
                <div className="sa-empty-icon"><Activity size={32} /></div>
                <div className="sa-empty-title">No Recent Activity</div>
                <div className="sa-empty-desc">The system log is currently clean. Critical actions will appear here.</div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject: ${selectedCompany?.name || ''}`}
        subtitle="Mandatory audit trail reason required"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={X} onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <AlertTriangle size={16} /> Audit Log Record
            </div>
            This rejection reason will be stored in the permanent system audit log.
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Rejection Reason *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State the compliance or document deficiency..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCompany?.name || 'Company Profile'}
        subtitle={`System ID: ${selectedCompany?.id}`}
        footer={
          <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedCompany && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Registration Number</label>
                <p style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCompany.regNumber}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</label>
                <div><Badge status={selectedCompany.status} /></div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Authorized Owner</label>
                <p style={{ color: '#0f172a', fontWeight: 600 }}>{selectedCompany.ownerName}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Email</label>
                <p style={{ color: '#334155' }}>{selectedCompany.email}</p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Registered Site Address</label>
              <p style={{ color: '#334155' }}>{selectedCompany.address}</p>
            </div>

            {selectedCompany.rejectionReason && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Recorded Rejection / Suspension Reason</label>
                <p style={{ color: '#991b1b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{selectedCompany.rejectionReason}</p>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Submitted Compliance Files</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                {(selectedCompany.documentsSubmitted || ['Corporate_License.pdf']).map((doc, i) => { const isData = typeof doc === 'string' && doc.startsWith('data:'); const name = isData ? 'Submitted_Document_' + (i+1) + '.pdf' : doc; return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e3a8a', overflow: 'hidden' }}><FileText size={16} style={{ flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{isData ? <a href={doc} download={name} style={{ color: 'inherit', textDecoration: 'underline' }}>{name}</a> : name}</span></div>); })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

