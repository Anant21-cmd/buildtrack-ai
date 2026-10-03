import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  FileText,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  X
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useCompany } from '../../context/CompanyContext';

export default function SuperAdminDashboard() {
  const { companies, auditLogs, approveCompany, rejectCompany } = useCompany();

  // State for rejection dialog
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filter company counts
  const pendingCompanies = companies.filter((c) => c.status === 'PENDING');
  const approvedCompanies = companies.filter((c) => c.status === 'APPROVED');
  const rejectedCompanies = companies.filter((c) => c.status === 'REJECTED');
  const suspendedCompanies = companies.filter((c) => c.status === 'SUSPENDED');

  const handleApprove = (company) => {
    approveCompany(company.id);
  };

  const openRejectModal = (company) => {
    setSelectedCompany(company);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) {
      alert('A rejection reason is required for compliance logging.');
      return;
    }
    rejectCompany(selectedCompany.id, rejectionReason.trim());
    setRejectModalOpen(false);
    setSelectedCompany(null);
  };

  const openDetails = (company) => {
    setSelectedCompany(company);
    setDetailModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Platform Banner */}
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
          gap: '1rem',
          borderLeft: '4px solid #d97706'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Shield size={20} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
              Platform Governance Console
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Super Admin Center</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review company verification requests, monitor system-wide compliance, and audit critical actions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          
          <Link to="/super-admin/companies">
            <Button variant="outline" size="sm" style={{ color: '#ffffff', borderColor: '#475569' }}>
              View All Companies
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <Card
          title="Total Registrations"
          value={companies.length}
          subtitle="All onboarded firms"
          icon={Building2}
          iconBg="#eff6ff"
          iconColor="#1e3a8a"
        />
        <Card
          title="Pending Approvals"
          value={pendingCompanies.length}
          subtitle={pendingCompanies.length > 0 ? "Requires review" : "Queue clear"}
          icon={Clock}
          iconBg="#fef3c7"
          iconColor="#d97706"
          trend={pendingCompanies.length > 0 ? "Action Needed" : "Clear"}
          trendPositive={pendingCompanies.length === 0}
        />
        <Card
          title="Approved Companies"
          value={approvedCompanies.length}
          subtitle="Active on platform"
          icon={CheckCircle2}
          iconBg="#ecfdf5"
          iconColor="#059669"
        />
        <Card
          title="Rejected / Suspended"
          value={rejectedCompanies.length + suspendedCompanies.length}
          subtitle={`${rejectedCompanies.length} Rejected Â· ${suspendedCompanies.length} Suspended`}
          icon={XCircle}
          iconBg="#fef2f2"
          iconColor="#dc2626"
        />
      </div>

      {/* Pending Approvals Review Section */}
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
              <Clock size={20} style={{ color: '#d97706' }} /> Pending Company Verification Queue
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Companies awaiting review before they can access company-level features.
            </p>
          </div>
          <Link to="/super-admin/pending-approvals" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Open Dedicated Queue <ArrowRight size={16} />
          </Link>
        </div>

        {pendingCompanies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingCompanies.slice(0, 3).map((company) => (
              <div
                key={company.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: '#fcfdfd'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{company.name}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {company.regNumber}
                    </span>
                    <Badge status="PENDING" />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                    Admin: <strong>{company.ownerName}</strong> &bull; {company.email} &bull; {company.phone}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Location: {company.address} &bull; Submitted: {company.registeredAt}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Button size="sm" variant="outline" icon={Eye} onClick={() => openDetails(company)}>
                    View Details
                  </Button>
                  <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(company)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" icon={X} onClick={() => openRejectModal(company)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: 600 }}>All company applications have been reviewed.</p>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>New contractor and builder signups will appear here automatically.</p>
          </div>
        )}
      </div>

      {/* Recent System Audit Logs */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} style={{ color: '#1e3a8a' }} /> Recent Platform Audit Trail
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Live immutable log of governance and high-stakes administrative decisions.
            </p>
          </div>
          <Link to="/super-admin/audit-logs" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Audit Logs <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {auditLogs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{log.action.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>on {log.entityId}</span>
                  <Badge status={log.action.includes('APPROVED') ? 'APPROVED' : log.action.includes('REJECTED') ? 'REJECTED' : 'PENDING'} showDot={false} />
                </div>
                <p style={{ color: '#475569', fontSize: '0.8rem' }}>Reason: {log.reason}</p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  By <strong>{log.actorName}</strong> ({log.actorRole})
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal with Mandatory Reason Input */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Company: ${selectedCompany?.name || ''}`}
        subtitle="Provide an official compliance reason for rejecting this registration"
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
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '6px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <AlertTriangle size={16} /> Important Accountability Requirement
            </div>
            This rejection reason will be permanently archived in the system audit log and displayed to the company owner upon login.
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Rejection Reason *
            </label>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid corporate tax ID, expired safety certification, or unverifiable business address..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Company Details Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCompany?.name || 'Company Details'}
        subtitle={`Registration Code: ${selectedCompany?.regNumber}`}
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
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Owner / Admin</label>
                <p style={{ fontWeight: 600, color: '#0f172a' }}>{selectedCompany.ownerName}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</label>
                <div><Badge status={selectedCompany.status} /></div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Email</label>
                <p style={{ color: '#334155' }}>{selectedCompany.email}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone</label>
                <p style={{ color: '#334155' }}>{selectedCompany.phone}</p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Headquarters Address</label>
              <p style={{ color: '#334155' }}>{selectedCompany.address}</p>
            </div>

            {selectedCompany.documentsSubmitted && selectedCompany.documentsSubmitted.length > 0 && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Verification Document (Needs AI OCR Check later)</label>
                <div style={{ marginTop: '0.2rem' }}>
                  <a href={selectedCompany.documentsSubmitted[0]} download={`Verification_Document_${selectedCompany.name}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: '0.85rem' }}>
                    View / Download Attached Document
                  </a>
                </div>
              </div>
            )}

            {selectedCompany.rejectionReason && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Rejection Reason</label>
                <p style={{ color: '#991b1b', fontSize: '0.85rem', marginTop: '0.2rem' }}>{selectedCompany.rejectionReason}</p>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Uploaded Documents</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem' }}>
                {(selectedCompany.documentsSubmitted || ['Business_Registration.pdf']).map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e3a8a' }}>
                    <FileText size={16} />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


