import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Check,
  X,
  Eye,
  AlertTriangle,
  FileText,
  Filter,
  Ban,
  RotateCcw
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useCompany } from '../../context/CompanyContext';

export default function CompanyManagement() {
  const { companies, approveCompany, rejectCompany, suspendCompany } = useCompany();
  const location = useLocation();

  // If navigated to /super-admin/pending-approvals, default tab to PENDING
  const isPendingView = location.pathname.includes('pending-approvals');
  const [activeTab, setActiveTab] = useState(isPendingView ? 'PENDING' : 'ALL');

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [reasonInput, setReasonInput] = useState('');

  // Filter based on tab
  const filteredCompanies = companies.filter((c) => {
    if (activeTab === 'ALL') return true;
    return c.status === activeTab;
  });

  const handleApprove = (company) => {
    approveCompany(company.id);
  };

  const openRejectModal = (company) => {
    setSelectedCompany(company);
    setReasonInput('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!reasonInput.trim()) {
      alert('Please provide a reason for rejecting this company.');
      return;
    }
    rejectCompany(selectedCompany.id, reasonInput.trim());
    setRejectModalOpen(false);
    setSelectedCompany(null);
  };

  const openSuspendModal = (company) => {
    setSelectedCompany(company);
    setReasonInput('');
    setSuspendModalOpen(true);
  };

  const handleConfirmSuspend = () => {
    if (!reasonInput.trim()) {
      alert('Please provide a reason for suspending this company account.');
      return;
    }
    suspendCompany(selectedCompany.id, reasonInput.trim());
    setSuspendModalOpen(false);
    setSelectedCompany(null);
  };

  const openDetails = (company) => {
    setSelectedCompany(company);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      header: 'Company & Registration',
      accessor: 'name',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.regNumber}</span>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</p>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.address}</span>
        </div>
      )
    },
    {
      header: 'Owner / Contact',
      accessor: 'ownerName',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 600, color: '#1e293b' }}>{row.ownerName}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.email}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Submitted Date',
      accessor: 'registeredAt'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Button size="sm" variant="outline" icon={Eye} onClick={() => openDetails(row)}>
            Details
          </Button>

          {row.status === 'PENDING' && (
            <>
              <Button size="sm" variant="success" icon={Check} onClick={() => handleApprove(row)}>
                Approve
              </Button>
              <Button size="sm" variant="danger" icon={X} onClick={() => openRejectModal(row)}>
                Reject
              </Button>
            </>
          )}

          {row.status === 'APPROVED' && (
            <Button size="sm" variant="danger" icon={Ban} onClick={() => openSuspendModal(row)}>
              Suspend
            </Button>
          )}

          {row.status === 'REJECTED' && (
            <Button size="sm" variant="success" icon={RotateCcw} onClick={() => handleApprove(row)}>
              Re-approve
            </Button>
          )}

          {row.status === 'SUSPENDED' && (
            <Button size="sm" variant="success" icon={RotateCcw} onClick={() => handleApprove(row)}>
              Reactivate
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {isPendingView ? 'Pending Company Approvals' : 'Construction Company Directory'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Verify corporate identity, tax certificates, and grant or revoke access to BuildTrack AI.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Companies', count: companies.length },
          { key: 'PENDING', label: 'Pending Review', count: companies.filter((c) => c.status === 'PENDING').length },
          { key: 'APPROVED', label: 'Approved', count: companies.filter((c) => c.status === 'APPROVED').length },
          { key: 'REJECTED', label: 'Rejected', count: companies.filter((c) => c.status === 'REJECTED').length },
          { key: 'SUSPENDED', label: 'Suspended', count: companies.filter((c) => c.status === 'SUSPENDED').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === tab.key ? '#1e3a8a' : '#ffffff',
              color: activeTab === tab.key ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeTab === tab.key ? '#1e3a8a' : '#cbd5e1',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                color: activeTab === tab.key ? '#ffffff' : '#334155'
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Data Table */}
      <Table
        title={`${activeTab.replace('_', ' ')} Companies (${filteredCompanies.length})`}
        columns={columns}
        data={filteredCompanies}
        searchPlaceholder="Search company by name, registration code, or owner..."
      />

      {/* Rejection Modal with Mandatory Reason */}
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
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="State the compliance or document deficiency..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={`Suspend Account: ${selectedCompany?.name || ''}`}
        subtitle="Revoke platform access immediately"
        footer={
          <>
            <Button variant="outline" onClick={() => setSuspendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={Ban} onClick={handleConfirmSuspend}>
              Confirm Suspension
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#fff7ed', borderRadius: '6px', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '0.85rem' }}>
            Suspending this company will immediately block all associated employees, site engineers, and store managers from accessing company modules.
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Suspension Reason *
            </label>
            <textarea
              rows={4}
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Audit investigation, safety violation, non-payment..."
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
    </div>
  );
}


