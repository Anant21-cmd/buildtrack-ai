import React, { useState } from 'react';
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
  Eye
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
  const { currentUser } = useAuth();
  const { requests, createMaterialRequest, approveStandardRequest, approveExcessTrap, rejectRequest, issueMaterial, getRequirement } = useMaterialRequests();
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
  const [formFeedback, setFormFeedback] = useState(null);

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

  // Filtered requests list
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'EXCESS') return r.isExcess;
    return r.status === activeTab;
  });

  const excessCount = requests.filter((r) => r.status === REQUEST_STATUSES.EXCESS_FLAGGED).length;
  const pendingCount = requests.filter((r) => r.status === REQUEST_STATUSES.PENDING).length;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!numericQty || !purpose.trim()) {
      alert('Please specify a positive quantity and purpose for this request.');
      return;
    }

    const proj = projects.find((p) => p.id === selectedProjectId);
    const mat = materials.find((m) => m.id === selectedMaterialId);

    const result = await createMaterialRequest({
      projectId: selectedProjectId,
      projectName: proj ? proj.name : 'Site',
      materialId: selectedMaterialId,
      materialName: mat ? mat.name : 'Material',
      unit: mat ? mat.unit : 'Units',
      requestedQuantity: numericQty,
      purpose: purpose.trim(),
      requestedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`
    });

    setFormFeedback(result);
    setTimeout(() => {
      setCreateModalOpen(false);
      setFormFeedback(null);
      setRequestedQty('');
      setPurpose('');
    }, 2000);
  };

  const openExcessAuthModal = (req) => {
    setSelectedRequest(req);
    setExcessJustification('');
    setExcessModalOpen(true);
  };

  const handleConfirmExcessApproval = async () => {
    try {
      approveExcessTrap(
        selectedRequest.id,
        `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
        excessJustification
      );
      setExcessModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const openRejectDialog = (req) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      rejectRequest(
        selectedRequest.id,
        `${currentUser.name} (${currentUser.role.replace('_', ' ')})`,
        rejectionReason
      );
      setRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleIssue = async (req) => {
    try {
      issueMaterial(req.id, `${currentUser.name} (${currentUser.role.replace('_', ' ')})`);
      alert(`Success: Issued ${req.requestedQuantity} ${req.unit} of ${req.materialName} to site! Warehouse stock updated.`);
    } catch (err) {
      alert(err.message);
    }
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
      header: 'Store / Admin Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* EXCESS TRAP ACTIONS */}
          {row.status === REQUEST_STATUSES.EXCESS_FLAGGED && (
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

          {/* STANDARD PENDING ACTIONS */}
          {row.status === REQUEST_STATUSES.PENDING && (
            <>
              <Button
                size="sm"
                variant="success"
                icon={Check}
                onClick={() => approveStandardRequest(row.id, `${currentUser.name} (${currentUser.role.replace('_', ' ')})`)}
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
          {row.status === REQUEST_STATUSES.APPROVED && (
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
          {row.status === REQUEST_STATUSES.ISSUED && (
            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={14} /> Material Issued
            </span>
          )}

          {/* REJECTED */}
          {row.status === REQUEST_STATUSES.REJECTED && (
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
            <ShieldAlert size={24} style={{ color: '#dc2626' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Material Requisition & Excess Scam Trap
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Enforcing strict quota baselines: prevents contractor fraud, material hoarding, and unauthorized site over-issuing.
          </p>
        </div>

        <Button variant="warning" icon={Plus} onClick={() => setCreateModalOpen(true)}>
          Create Material Indent / Request
        </Button>
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
              ANTI-FRAUD ENGINE
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
              Mathematical Quota Guard: Remaining = Approved Quota - Previously Issued
            </span>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            Whenever a requested quantity exceeds the remaining approved quota, the system <strong>blocks automatic approval</strong>, triggers an excess alarm, and requires elevated administrative justification with permanent audit logging.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#1e293b', padding: '0.6rem 1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: excessCount > 0 ? '#f87171' : '#10b981' }}>
              {excessCount}
            </span>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>Excess Traps</span>
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
          { key: REQUEST_STATUSES.EXCESS_FLAGGED, label: '🚨 Excess Alerts (Trapped)', count: excessCount },
          { key: REQUEST_STATUSES.PENDING, label: 'Pending Store Review', count: pendingCount },
          { key: REQUEST_STATUSES.APPROVED, label: 'Approved (Ready to Issue)', count: requests.filter((r) => r.status === REQUEST_STATUSES.APPROVED).length },
          { key: REQUEST_STATUSES.ISSUED, label: 'Issued to Site', count: requests.filter((r) => r.status === REQUEST_STATUSES.ISSUED).length },
          { key: REQUEST_STATUSES.REJECTED, label: 'Rejected', count: requests.filter((r) => r.status === REQUEST_STATUSES.REJECTED).length }
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
              backgroundColor: activeTab === tab.key ? (tab.key === REQUEST_STATUSES.EXCESS_FLAGGED ? '#dc2626' : '#1e3a8a') : '#ffffff',
              color: activeTab === tab.key ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: activeTab === tab.key ? (tab.key === REQUEST_STATUSES.EXCESS_FLAGGED ? '#dc2626' : '#1e3a8a') : '#cbd5e1',
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
              {isFormExcess ? 'Submit with Excess Alert' : 'Submit Indent'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formFeedback && (
            <div
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                backgroundColor: formFeedback.isExcess ? '#fef2f2' : '#ecfdf5',
                border: '1px solid',
                borderColor: formFeedback.isExcess ? '#fca5a5' : '#a7f3d0',
                color: formFeedback.isExcess ? '#b91c1c' : '#047857',
                fontSize: '0.85rem'
              }}
            >
              {formFeedback.isExcess ? (
                <div>
                  <strong>⚠️ Excess Scam Trap Activated:</strong> Request submitted but trapped in <code>EXCESS_FLAGGED</code> status. Management authorization required before store issuance.
                </div>
              ) : (
                <div>
                  <strong>✅ Indent Submitted:</strong> Request sent to Store Manager for normal inventory issuance.
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Job Site Project *
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                Material Item *
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                ))}
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
              placeholder={`Try entering more than ${remainingQuota} to test excess trap...`}
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

          {/* Real-Time Mathematical Scam Warning Box (Section 14 Requirement) */}
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
                  New Request ({numericQty} {selectedMaterial?.unit}) exceeds Remaining Allowed ({remainingQuota} {selectedMaterial?.unit}) by <strong>{calculatedFormExcess} {selectedMaterial?.unit}</strong>. The system will disallow automatic store issuance and lock this request in the Management Excess Trap.
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
        </form>
      </Modal>

      {/* Modal: Authorize Excess Trap (High-Security Management Action) */}
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
              <ShieldAlert size={18} /> High-Risk Financial & Quota Override
            </div>
            This action will override the pre-approved project baseline budget and authorize an excess of <strong>+{selectedRequest?.excessQuantity} {selectedRequest?.unit}</strong>. This event will be logged in the permanent company audit trail with your digital signature.
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
    </div>
  );
}

