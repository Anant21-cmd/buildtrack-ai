import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileCheck,
  Check,
  X,
  Send,
  Eye,
  MessageSquare,
  QrCode,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useMaterialRequests, REQUEST_STATUSES } from '../../context/MaterialRequestContext';
import { useMaterials } from '../../context/MaterialContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth, ROLES } from '../../context/AuthContext';

export default function MaterialRequests() {
  const { currentUser, token } = useAuth();
  const { requests, createMaterialRequest, updateRequestStatus, getRequirement } = useMaterialRequests();
  const { materials } = useMaterials();
  const { projects } = useProjects();

  // Filter Tabs
  const [activeTab, setActiveTab] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [excessModalOpen, setExcessModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form State for Request Indent
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [selectedMaterialId, setSelectedMaterialId] = useState(materials[0]?.id || '');
  const [requestedQty, setRequestedQty] = useState('');
  const [purpose, setPurpose] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('916382069963');
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);
  const [formFeedback, setFormFeedback] = useState(null);

  // Auto-sync project and material selections when data loads
  useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (materials.length > 0 && (!selectedMaterialId || !materials.some((m) => m.id === selectedMaterialId))) {
      setSelectedMaterialId(materials[0].id);
    }
  }, [materials, selectedMaterialId]);

  // WhatsApp Web Bridge state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrStatus, setQrStatus] = useState(null);
  const [refreshingQr, setRefreshingQr] = useState(false);

  const fetchQrStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr-status', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setQrStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp bridge status:', err);
    }
  };

  useEffect(() => {
    fetchQrStatus();
    const interval = setInterval(fetchQrStatus, qrModalOpen ? 2000 : 6000);
    return () => clearInterval(interval);
  }, [token, qrModalOpen]);

  const handleRestartBridge = async () => {
    setRefreshingQr(true);
    try {
      await fetch('/api/whatsapp/restart-session', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setTimeout(fetchQrStatus, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingQr(false);
    }
  };

  // Excess Approval Justification input
  const [excessJustification, setExcessJustification] = useState('');
  // Rejection Reason input
  const [rejectionReason, setRejectionReason] = useState('');

  // Calculate live quota status for the create form
  const currentRequirement = getRequirement(selectedProjectId, selectedMaterialId);
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
  const approvedQuota = currentRequirement ? currentRequirement.approvedQuantity : 500;
  const previouslyIssued = currentRequirement ? currentRequirement.previouslyIssued : 0;
  const remainingQuota = approvedQuota - previouslyIssued;
  const numericQty = Number(requestedQty) || 0;
  const isFormExcess = numericQty > remainingQuota;
  const calculatedFormExcess = isFormExcess ? numericQty - remainingQuota : 0;

  const norm = (s) => (s || '').toUpperCase().replace(/[\s_]+/g, '');

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'EXCESS' || activeTab === REQUEST_STATUSES.EXCESS_FLAGGED) return r.isExcess;
    return norm(r.status) === norm(activeTab);
  });

  const excessCount = requests.filter((r) => r.isExcess || norm(r.status) === 'EXCESSFLAGGED').length;
  const pendingCount = requests.filter((r) => norm(r.status) === 'PENDING' || norm(r.status) === 'UNDERREVIEW').length;
  const approvedCount = requests.filter((r) => norm(r.status) === 'APPROVED').length;
  const issuedCount = requests.filter((r) => norm(r.status) === 'ISSUED').length;
  const rejectedCount = requests.filter((r) => norm(r.status) === 'REJECTED').length;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!numericQty || !purpose.trim()) {
      alert('Please specify a positive quantity and purpose for this request.');
      return;
    }

    const activeProjectId = selectedProjectId || projects[0]?.id;
    const activeMaterialId = selectedMaterialId || materials[0]?.id;

    if (!activeProjectId || !activeMaterialId) {
      alert('Please select a valid Project and Material before submitting.');
      return;
    }

    const proj = projects.find((p) => p.id === activeProjectId);
    const mat = materials.find((m) => m.id === activeMaterialId);
    const cleanPhone = whatsappPhone ? whatsappPhone.replace(/[^0-9]/g, '') : '916382069963';

    try {
      const result = await createMaterialRequest({
        projectId: activeProjectId,
        projectName: proj ? proj.name : 'Site',
        materialId: activeMaterialId,
        materialName: mat ? mat.name : 'Material',
        unit: mat ? mat.unit : 'Units',
        requestedQuantity: numericQty,
        purpose: purpose.trim(),
        requestedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
        recipientPhone: cleanPhone
      });

      // Format clean slip number (e.g. #IND-4091)
      const rawId = result?.request?.id || '';
      const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, '');
      const slipNo = cleanId.length > 5 ? cleanId.slice(-4).toUpperCase() : (cleanId.toUpperCase() || 'NEW');
      const engineerName = (currentUser.name || 'Site In-Charge').replace(/\s*\([^)]*\)/g, '').trim();
      const timeString = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Construct formatted WhatsApp message
      const waText = `📋 *SITE MATERIAL INDENT SLIP*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Project Site:* ${proj ? proj.name : 'Site'}
🧱 *Material Item:* ${mat ? mat.name : 'Material'}
📦 *Required Quantity:* ${numericQty} ${mat ? mat.unit : 'Units'}
📍 *Work Area / Purpose:* ${purpose.trim()}
⏰ *Required Delivery:* Immediate / Site Stock
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 *Indent Slip No:* #${slipNo}
👷 *Raised By:* ${engineerName} (Site In-Charge)
📅 *Date & Time:* ${timeString}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Store Manager Notice:*
Please verify warehouse stock availability and arrange material dispatch to site.`;

      const directWaLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
      const finalWaLink = result?.whatsapp?.link || directWaLink;

      // Real WhatsApp message was automatically delivered in background if connected
      const isReal = result?.whatsapp?.mode === 'real_whatsapp';
      if (!isReal && sendViaWhatsapp) {
        window.open(finalWaLink, '_blank');
      }

      setFormFeedback({
        ...result,
        waLink: finalWaLink,
        targetPhone: cleanPhone,
        isRealWhatsApp: isReal
      });

      setTimeout(() => {
        setCreateModalOpen(false);
        setFormFeedback(null);
        setRequestedQty('');
        setPurpose('');
      }, 6000);
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    }
  };

  const openExcessAuthModal = (req) => {
    setSelectedRequest(req);
    setExcessJustification('');
    setExcessModalOpen(true);
  };

  const handleApprove = async (req) => {
    try {
      await updateRequestStatus(req.id, 'Approved', 'Approved by authorized user');
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleConfirmExcessApproval = async () => {
    if (!selectedRequest) return;
    try {
      await updateRequestStatus(selectedRequest.id, 'Approved', excessJustification || 'Excess authorized by management');
      setExcessModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.message || 'Failed to approve excess request');
    }
  };

  const openRejectDialog = (req) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    try {
      await updateRequestStatus(selectedRequest.id, 'Rejected', rejectionReason || 'Rejected by reviewer');
      setRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleIssue = async (req) => {
    try {
      await updateRequestStatus(req.id, 'Issued', `Material issued to site by ${currentUser?.name || 'Store'}`);
    } catch (err) {
      alert(err.message || 'Failed to issue material');
    }
  };

  const getWhatsAppShareUrl = (row) => {
    const rawId = row.id || '';
    const cleanId = rawId.replace(/[^a-zA-Z0-9]/g, '');
    const slipNo = cleanId.length > 5 ? cleanId.slice(-4).toUpperCase() : (cleanId.toUpperCase() || 'NEW');
    const engineerName = (row.requestedBy || 'Site In-Charge').replace(/\s*\([^)]*\)/g, '').trim();

    const text = `📋 *SITE MATERIAL INDENT SLIP*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *Project Site:* ${row.projectName}
🧱 *Material Item:* ${row.materialName}
📦 *Required Quantity:* ${row.requestedQuantity} ${row.unit}
📍 *Work Area / Purpose:* ${row.purpose || 'Site Construction'}
📊 *Status:* *${(row.status || 'PENDING').toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔢 *Indent Slip No:* #${slipNo}
👷 *Raised By:* ${engineerName}
📅 *Date:* ${row.requestedAt || new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Store Manager Notice:*
Please verify warehouse stock availability and arrange material dispatch to site.`;

    const targetPhone = whatsappPhone ? whatsappPhone.replace(/[^0-9]/g, '') : '916382069963';
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const columns = [
    {
      header: 'Request ID & Material',
      accessor: 'materialName',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.id}</span>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.materialName}</p>
          <span style={{ fontSize: '0.75rem', color: '#1e3a8a', fontWeight: 600 }}>Site: {row.projectName}</span>
        </div>
      )
    },
    {
      header: 'Quota & Request Math',
      accessor: 'requestedQuantity',
      render: (row) => (
        <div style={{ fontSize: '0.8rem' }}>
          <div>
            Approved Quota: <strong>{row.approvedQuota} {row.unit}</strong>
          </div>
          <span style={{ color: '#64748b' }}>
            Issued: {row.previouslyIssued} &bull; Remaining: <strong>{row.remainingQuota} {row.unit}</strong>
          </span>
          <div style={{ marginTop: '0.2rem', fontWeight: 700, color: row.isExcess ? '#dc2626' : '#0f172a' }}>
            Requested: {row.requestedQuantity} {row.unit}
            {row.isExcess && (
              <span style={{ display: 'block', color: '#dc2626', fontSize: '0.75rem' }}>
                ⚠️ Excess: +{row.excessQuantity} {row.unit}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Purpose / Work Area',
      accessor: 'purpose',
      render: (row) => (
        <div>
          <p style={{ fontSize: '0.85rem', color: '#334155' }}>{row.purpose}</p>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            By: {row.requestedBy} &bull; {row.requestedAt}
          </span>
          {row.excessJustification && (
            <p style={{ fontSize: '0.75rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
              Auth Override: {row.excessJustification} (Approved by {row.excessApprovedBy})
            </p>
          )}
          {row.rejectionReason && (
            <p style={{ fontSize: '0.75rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '0.25rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
              Rejection Note: {row.rejectionReason}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'WhatsApp Notification',
      accessor: 'waStatus',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
          {row.waStatus === 'sent' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontSize: '0.725rem', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
              <CheckCircle2 size={12} /> API Sent
            </span>
          ) : (
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Direct Share
            </span>
          )}
          <a
            href={getWhatsAppShareUrl(row)}
            target="_blank"
            rel="noopener noreferrer"
            title="Open pre-filled alert in WhatsApp Web or Mobile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: '#25D366',
              color: '#ffffff',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.25rem 0.55rem',
              borderRadius: '6px',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
            }}
          >
            <MessageSquare size={12} /> WhatsApp
          </a>
        </div>
      )
    },
    {
      header: 'Store / Admin Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* EXCESS TRAP ACTIONS */}
          {(row.isExcess && (norm(row.status) === 'EXCESSFLAGGED' || norm(row.status) === 'PENDING' || norm(row.status) === 'UNDERREVIEW')) && (
            <>
              <Button
                size="sm"
                variant="danger"
                icon={ShieldAlert}
                onClick={() => openExcessAuthModal(row)}
                title="Management Excess Authorization"
              >
                Authorize Excess
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={X}
                onClick={() => openRejectDialog(row)}
                title="Reject Request"
              />
            </>
          )}

          {/* STANDARD PENDING / UNDER REVIEW ACTIONS */}
          {(!row.isExcess && (norm(row.status) === 'PENDING' || norm(row.status) === 'UNDERREVIEW')) && (
            <>
              <Button
                size="sm"
                variant="success"
                icon={Check}
                onClick={() => handleApprove(row)}
                title="Approve Material Request"
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={X}
                onClick={() => openRejectDialog(row)}
                title="Reject Request"
              />
            </>
          )}

          {/* APPROVED READY TO ISSUE */}
          {norm(row.status) === 'APPROVED' && (
            <Button
              size="sm"
              variant="primary"
              icon={Send}
              onClick={() => handleIssue(row)}
              title="Issue Material & Deduct Warehouse Stock"
            >
              Issue from Store
            </Button>
          )}

          {/* ALREADY ISSUED */}
          {norm(row.status) === 'ISSUED' && (
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} /> Material Issued
            </span>
          )}

          {/* REJECTED */}
          {norm(row.status) === 'REJECTED' && (
            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
              Rejected
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Package size={24} style={{ color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Material Requisition
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Manage site material requests, monitor allocation quotas, and process issuances.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: qrStatus?.isConnected ? '#ecfdf5' : '#f0fdf4',
              color: qrStatus?.isConnected ? '#047857' : '#15803d',
              border: `1px solid ${qrStatus?.isConnected ? '#a7f3d0' : '#86efac'}`,
              borderRadius: '8px',
              padding: '0.55rem 0.9rem',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: qrStatus?.isConnected ? '#10b981' : '#f59e0b',
              boxShadow: qrStatus?.isConnected ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
            }} />
            <MessageSquare size={16} style={{ color: '#25D366' }} />
            {qrStatus?.isConnected
              ? `WhatsApp Linked (+${qrStatus.connectedUser})`
              : 'Link WhatsApp (Scan QR)'}
          </button>

          <Button variant="warning" icon={Plus} onClick={() => setCreateModalOpen(true)}>
            Create Material Indent / Request
          </Button>
        </div>
      </div>

      {/* Real-World Problem Banner (Section 14) */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          borderLeft: '4px solid #dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              ALLOCATION QUOTA ENFORCEMENT
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
              Allocation Rules: Remaining = Approved Quota - Previously Issued
            </span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            Whenever a requested quantity exceeds the remaining approved quota, the system <strong>requires management authorization</strong> and triggers an over-quota flag for review.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '0.6rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: excessCount > 0 ? '#f87171' : '#10b981' }}>
              {excessCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>Over-Quota Flags</span>
          </div>
          <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '0.6rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {pendingCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>Pending Review</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Indents', count: requests.length },
          { key: 'EXCESS', label: '⚠️ Over-Quota Requests', count: excessCount },
          { key: 'PENDING', label: 'Pending Store Review', count: pendingCount },
          { key: 'APPROVED', label: 'Approved (Ready to Issue)', count: approvedCount },
          { key: 'ISSUED', label: 'Issued to Site', count: issuedCount },
          { key: 'REJECTED', label: 'Rejected', count: rejectedCount }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: activeTab === tab.key ? (tab.key === 'EXCESS' ? '#dc2626' : '#1e3a8a') : '#ffffff',
              color: activeTab === tab.key ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeTab === tab.key ? (tab.key === 'EXCESS' ? '#dc2626' : '#1e3a8a') : '#cbd5e1',
              cursor: 'pointer'
            }}
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '9999px',
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === tab.key ? '#ffffff' : '#334155'
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <Table
        title={`Material Requests Ledger (${filteredRequests.length})`}
        columns={columns}
        data={filteredRequests}
        searchPlaceholder="Search by material, site, or purpose..."
      />

      {/* Create Material Request Modal (With Live Quota Math Calculator!) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Site Material Indent"
        subtitle="Site Engineer requisition with automatic baseline quota inspection"
        maxWidth="650px"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant={isFormExcess ? 'danger' : 'primary'} onClick={handleCreateSubmit}>
              {isFormExcess ? 'Submit (Over-Quota)' : 'Submit Indent'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formFeedback && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                backgroundColor: formFeedback.isExcess ? '#fef2f2' : '#ecfdf5',
                border: '1px solid',
                borderColor: formFeedback.isExcess ? '#fca5a5' : '#a7f3d0',
                color: formFeedback.isExcess ? '#b91c1c' : '#047857',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <CheckCircle2 size={16} />
                {formFeedback.isExcess ? 'Over-Quota Request Submitted!' : 'Material Indent Created Successfully!'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                {formFeedback.isExcess 
                  ? 'Request flagged as over-quota. Management authorization is required before store issuance.'
                  : 'Your indent request has been recorded in the database.'}
              </div>

              {formFeedback.isRealWhatsApp ? (
                <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', backgroundColor: '#ecfdf5', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                    <span>⚡ Real WhatsApp Message sent directly to Store Manager (+{formFeedback.targetPhone})!</span>
                  </div>
                </div>
              ) : (formFeedback.waLink || formFeedback.whatsapp?.link) ? (
                <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 600, fontSize: '0.825rem' }}>
                    <MessageSquare size={15} style={{ color: '#f59e0b' }} />
                    WhatsApp Bridge not linked yet. Click to send manually:
                  </div>
                  <a
                    href={formFeedback.waLink || formFeedback.whatsapp?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MessageSquare size={14} /> Open in WhatsApp
                  </a>
                </div>
              ) : null}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Job Site Project *
              </label>
              <select
                value={selectedProjectId || projects[0]?.id || ''}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {projects.length === 0 ? (
                  <option value="" disabled>Loading projects...</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code || 'PRJ'})</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Material Item *
              </label>
              <select
                value={selectedMaterialId || materials[0]?.id || ''}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {materials.length === 0 ? (
                  <option value="" disabled>Loading materials...</option>
                ) : (
                  materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit || 'Units'})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Live Baseline Quota Inspection Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.75rem',
              textAlign: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Approved Baseline</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {approvedQuota} {selectedMaterial?.unit}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Previously Issued</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706' }}>
                {previouslyIssued} {selectedMaterial?.unit}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>Remaining Allowed</span>
              <p style={{ fontSize: '1rem', fontWeight: 800, color: remainingQuota <= 50 ? '#dc2626' : '#059669' }}>
                {remainingQuota} {selectedMaterial?.unit}
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Required Quantity ({selectedMaterial?.unit}) *
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder={`Enter quantity (max ${remainingQuota} before flag)...`}
              value={requestedQty}
              onChange={(e) => setRequestedQty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isFormExcess ? '#dc2626' : '#cbd5e1',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Real-Time Mathematical Over-Quota Warning Box (Section 14 Requirement) */}
          {isFormExcess && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                color: '#b91c1c'
              }}
            >
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.15rem' }}>
                  Requested quantity exceeds the remaining approved quantity!
                </strong>
                <span>
                  New Request ({numericQty} {selectedMaterial?.unit}) exceeds Remaining Allowed ({remainingQuota} {selectedMaterial?.unit}) by <strong>{calculatedFormExcess} {selectedMaterial?.unit}</strong>. The system will disallow automatic store issuance and flag this request for management review.
                </span>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
              Specific Purpose / Floor Work Area *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5th floor slab casting, east grid columns..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>

          {/* Store Manager WhatsApp Notification Configuration */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} style={{ color: '#25D366' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  Store Manager WhatsApp Notification
                </span>
              </div>

              {qrStatus?.isConnected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                  <CheckCircle2 size={12} /> Auto-Bridge Connected
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#b45309',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <QrCode size={12} /> Link WhatsApp Web via QR
                </button>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Store Manager Mobile / WhatsApp Number *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. 916382069963 or 6382069963"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Enter the Store Manager&apos;s 10-digit number (or with 91 country code). When you submit this indent, the message will be delivered automatically in real time to this phone number.
              </p>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal: Authorize Over-Quota Request (Management Action) */}
      <Modal
        isOpen={excessModalOpen}
        onClose={() => setExcessModalOpen(false)}
        title={`Authorize Excess Quota: ${selectedRequest?.id}`}
        subtitle={`Material: ${selectedRequest?.materialName} • Site: ${selectedRequest?.projectName}`}
        maxWidth="600px"
        footer={
          <>
            <Button variant="outline" onClick={() => setExcessModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={ShieldAlert} onClick={handleConfirmExcessApproval}>
              Authorize Excess Override
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              padding: '1rem',
              color: '#991b1b',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <ShieldAlert size={18} /> Management Authorization Required
            </div>
            This action will override the pre-approved project baseline allocation and authorize an excess of <strong>+{selectedRequest?.excessQuantity} {selectedRequest?.unit}</strong>. This event will be recorded in the system's audit trail.
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Approved Project Quota:</span>
              <strong>{selectedRequest?.approvedQuota} {selectedRequest?.unit}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Previously Issued to Site:</span>
              <strong>{selectedRequest?.previouslyIssued} {selectedRequest?.unit}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Remaining Allowed Quota:</span>
              <strong>{selectedRequest?.remainingQuota} {selectedRequest?.unit}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', color: '#dc2626' }}>
              <span style={{ fontWeight: 700 }}>Requested Quantity (Excess):</span>
              <strong style={{ fontSize: '1rem' }}>{selectedRequest?.requestedQuantity} (+{selectedRequest?.excessQuantity} Excess)</strong>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Mandatory Engineering Justification Reason *
            </label>
            <textarea
              rows={4}
              required
              value={excessJustification}
              onChange={(e) => setExcessJustification(e.target.value)}
              placeholder="State the structural change order, design revision, or site rationale explaining why additional materials beyond baseline are authorized..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Reject Request */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Indent: ${selectedRequest?.id}`}
        subtitle="Provide a recorded explanation for blocking this request"
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
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
            Rejection Reason *
          </label>
          <textarea
            rows={4}
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Unjustified material excess, work scope already completed, or inventory reallocated..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>
      </Modal>

      {/* Modal: Link WhatsApp via QR Code (Baileys Web Bridge) */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Link WhatsApp to BuildTrack AI"
        subtitle="Connect WhatsApp to deliver material requisitions directly in real time"
        maxWidth="520px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              icon={refreshingQr ? Loader2 : RefreshCw}
              onClick={handleRestartBridge}
              disabled={refreshingQr}
            >
              {refreshingQr ? 'Refreshing...' : 'Generate New QR'}
            </Button>
            <Button variant="primary" onClick={() => setQrModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.25rem', padding: '0.5rem 0' }}>
          {qrStatus?.isConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  WhatsApp Connected!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>
                  Linked Number: +{qrStatus.connectedUser || 'Active'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', maxWidth: '380px' }}>
                  Every material request submitted will automatically send a real-time WhatsApp message to the designated Store Manager.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestartBridge}
                style={{ marginTop: '0.5rem', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Disconnect / Switch Account
              </Button>
            </div>
          ) : qrStatus?.qrCode ? (
            <>
              <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <img
                  src={qrStatus.qrCode}
                  alt="Scan WhatsApp QR"
                  style={{ width: '240px', height: '240px', display: 'block', borderRadius: '6px' }}
                />
              </div>

              <div style={{ width: '100%', textAlign: 'left', backgroundColor: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                  <QrCode size={16} style={{ color: '#25D366' }} />
                  How to link WhatsApp:
                </div>
                <ol style={{ fontSize: '0.8rem', color: '#475569', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
                  <li>Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> &gt; <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong> and point your camera at this QR code</li>
                </ol>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontSize: '0.775rem', fontWeight: 600 }}>
                <Loader2 size={13} className="animate-spin" />
                <span>Waiting for scan... QR refreshes automatically</span>
              </div>
            </>
          ) : (
            <div style={{ padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#25D366' }} />
              <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                Generating WhatsApp QR Code...
              </p>
              <p style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                Please wait a moment while the bridge initializes.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

