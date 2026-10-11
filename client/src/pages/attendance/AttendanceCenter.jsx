import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  MapPin,
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
  Flag,
  Edit3
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useAttendance } from '../../context/AttendanceContext';
import { useProjects } from '../../context/ProjectContext';

export default function AttendanceCenter() {
  const { attendanceRecords, fetchAttendance, verifyAttendance } = useAttendance();
  const { projects } = useProjects();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [verificationAction, setVerificationAction] = useState('VERIFIED');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  useEffect(() => {
    if (safeProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(safeProjects[0].id);
    }
  }, [safeProjects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId && selectedDate) {
      fetchAttendance({ projectId: selectedProjectId, date: selectedDate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, selectedDate]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;

    if (['REJECTED', 'CORRECTION_REQUIRED', 'FLAGGED'].includes(verificationAction) && !verificationRemarks) {
      alert("Remarks are required for this action.");
      return;
    }

    try {
      await verifyAttendance(selectedRecord.id, verificationAction, verificationRemarks);
      setVerifyModalOpen(false);
      setVerificationRemarks('');
    } catch (err) {
      alert(err.message);
    }
  };

  const openVerifyModal = (record, action) => {
    setSelectedRecord(record);
    setVerificationAction(action);
    setVerifyModalOpen(true);
  };

  const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
  const pendingCount = attendanceRecords.filter(a => a.verificationStatus === 'PENDING').length;

  const columns = [
    {
      header: 'Worker',
      accessor: 'workerName',
      render: (row) => (
        <div>
          <p style={{ fontWeight: 700, color: '#0f172a', margin: 0 }}>{row.worker?.name || 'Unknown'}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Trade: {row.worker?.trade || '-'}</span>
        </div>
      )
    },
    {
      header: 'Time In/Out',
      accessor: 'time',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
            <Clock size={13} />
            <span>In: {row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</span>
          </div>
          {row.checkOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#dc2626', marginTop: '0.15rem' }}>
              <LogOut size={13} />
              <span>Out: {new Date(row.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Method & Status',
      accessor: 'status',
      render: (row) => (
        <div>
          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', display: 'inline-block', marginBottom: '0.2rem' }}>
            {row.method}
          </span>
          <br/>
          <Badge status={row.status} />
        </div>
      )
    },
    {
      header: 'Verification',
      accessor: 'verification',
      render: (row) => (
        <div>
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            borderRadius: '4px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: row.verificationStatus === 'VERIFIED' ? '#dcfce7' : row.verificationStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7',
            color: row.verificationStatus === 'VERIFIED' ? '#16a34a' : row.verificationStatus === 'REJECTED' ? '#dc2626' : '#d97706'
          }}>
            {row.verificationStatus.replace('_', ' ')}
          </span>
          {row.verificationRemarks && <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{row.verificationRemarks}</p>}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {row.verificationStatus !== 'VERIFIED' && (
            <Button size="sm" variant="outline" icon={CheckCircle} onClick={() => openVerifyModal(row, 'VERIFIED')} style={{ color: '#16a34a', borderColor: '#16a34a' }}>
              Verify
            </Button>
          )}
          <Button size="sm" variant="outline" icon={XCircle} onClick={() => openVerifyModal(row, 'REJECTED')} style={{ color: '#dc2626', borderColor: '#dc2626' }}>
            Reject
          </Button>
          <Button size="sm" variant="outline" icon={Edit3} onClick={() => openVerifyModal(row, 'CORRECTION_REQUIRED')} style={{ color: '#d97706', borderColor: '#d97706' }}>
            Correction
          </Button>
          <Button size="sm" variant="outline" icon={Flag} onClick={() => openVerifyModal(row, 'FLAGGED')} style={{ color: '#4f46e5', borderColor: '#4f46e5' }}>
            Flag
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={28} style={{ color: '#3b82f6' }} /> Site Attendance Verification
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Evaluate and verify contractor workforce attendance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#ffffff', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <MapPin size={18} style={{ color: '#3b82f6' }} />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ border: 'none', fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', outline: 'none', backgroundColor: 'transparent' }}
            >
              <option value="">Select Project Site...</option>
              {safeProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Records</span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{attendanceRecords.length}</p>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Present</span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '0.25rem 0' }}>{presentCount}</p>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Absent</span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', margin: '0.25rem 0' }}>{absentCount}</p>
        </div>
        
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Pending Verification</span>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '0.25rem 0' }}>{pendingCount}</p>
        </div>
      </div>

      <Table
        title="Live Attendance Ledger"
        columns={columns}
        data={attendanceRecords}
        searchPlaceholder="Search records..."
      />

      {/* Verify Action Modal */}
      <Modal isOpen={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title={`Action: ${verificationAction.replace('_', ' ')}`}>
        <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
            Worker: <strong>{selectedRecord?.worker?.name}</strong> <br/>
            Current Status: <strong>{selectedRecord?.status}</strong> <br/>
            Method: <strong>{selectedRecord?.method}</strong>
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Remarks {['REJECTED', 'CORRECTION_REQUIRED', 'FLAGGED'].includes(verificationAction) ? '*' : '(Optional)'}
            </label>
            <textarea
              required={['REJECTED', 'CORRECTION_REQUIRED', 'FLAGGED'].includes(verificationAction)}
              rows={3}
              value={verificationRemarks}
              onChange={(e) => setVerificationRemarks(e.target.value)}
              placeholder="Enter remarks..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
