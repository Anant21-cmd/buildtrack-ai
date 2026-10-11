import React, { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, Search, Filter, CheckCircle, XCircle, UserPlus, UploadCloud, DownloadCloud, AlertCircle, QrCode, MapPin, UserCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { useProjects } from '../../context/ProjectContext';
import { useAttendance } from '../../context/AttendanceContext';

export default function ContractorAttendance() {
  const { currentUser } = useAuth();
  const { workers } = useWorkers();
  const { projects } = useProjects();
  const { attendanceRecords, fetchAttendance, manualAttendance } = useAttendance();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrWorkerId, setQrWorkerId] = useState('');
  const [qrMessage, setQrMessage] = useState('');
  const { qrScan } = useAttendance();

  // Initial load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch attendance when project or date changes
  useEffect(() => {
    if (selectedProjectId && selectedDate) {
      fetchAttendance({
        projectId: selectedProjectId,
        date: selectedDate,
        contractorId: currentUser?.id
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId, selectedDate, currentUser]);

  // Filter workers assigned to this contractor
  const contractorWorkers = useMemo(() => {
    return workers.filter(w => w.contractorId === currentUser?.id);
  }, [workers, currentUser]);

  const filteredWorkers = useMemo(() => {
    let result = contractorWorkers;
    if (selectedProjectId) {
      result = result.filter(w => w.projectId === selectedProjectId || w.assignedProjectId === selectedProjectId);
    }
    if (searchQuery) {
      result = result.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [contractorWorkers, searchQuery, selectedProjectId]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQrScan = async (e) => {
    e.preventDefault();
    if (!qrWorkerId || !selectedProjectId) {
      setQrMessage('Please ensure a project is selected and Worker ID is entered.');
      return;
    }
    try {
      setQrMessage('Scanning...');
      const res = await qrScan(qrWorkerId, selectedProjectId);
      setQrMessage(`Success! Worker ${qrWorkerId} checked ${res.record?.checkOut ? 'out' : 'in'}.`);
      setQrWorkerId('');
      setTimeout(() => setQrMessage(''), 3000);
    } catch (err) {
      setQrMessage(`Error: ${err.message}`);
    }
  };

  const handleMarkAttendance = async (workerId, status) => {
    if (!selectedProjectId) {
      showToast('Please select a project first.');
      return;
    }
    
    try {
      await manualAttendance({
        workerId,
        projectId: selectedProjectId,
        date: selectedDate,
        status,
        remarks: 'Contractor Manual Entry'
      });
      showToast(`Attendance marked as ${status} successfully.`);
    } catch (error) {
      showToast(`Error: ${error.message}`);
    }
  };

  // Build a map of workerId -> attendance record for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach(record => {
      map[record.workerId] = record;
    });
    return map;
  }, [attendanceRecords]);

  const handleSubmitLog = () => {
    setIsSubmitModalOpen(true);
  };

  const confirmSubmit = () => {
    setIsSubmitModalOpen(false);
    showToast("Today's log submitted to Site Engineer successfully!");
  };

  const handleExport = () => {
    showToast('Timesheet exported to CSV successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem', position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#10b981', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Worker Attendance</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Log and manage daily attendance for your assigned workforce.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" icon={QrCode} onClick={() => setIsQrModalOpen(true)} style={{ color: '#059669', borderColor: '#059669' }}>QR Kiosk</Button>
          <Button variant="outline" icon={DownloadCloud} onClick={handleExport}>Export</Button>
          <Button variant="primary" icon={UploadCloud} onClick={handleSubmitLog}>Submit Log</Button>
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Project</label>
              <select 
                value={selectedProjectId} 
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#fff', minWidth: '200px' }}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '200px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search workers..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>WORKER NAME</th>
                <th style={{ padding: '1rem' }}>TRADE</th>
                <th style={{ padding: '1rem' }}>TIME IN</th>
                <th style={{ padding: '1rem' }}>STATUS</th>
                <th style={{ padding: '1rem' }}>VERIFICATION</th>
                <th style={{ padding: '1rem' }}>METHOD</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>CHECK-IN OPTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <CalendarCheck size={32} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 500, margin: 0 }}>No workers found.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Make sure you have workers assigned to you.</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(worker => {
                  const record = attendanceMap[worker.id];
                  const status = record?.status || 'UNMARKED';
                  const method = record?.method;
                  const verificationStatus = record?.verificationStatus || 'NOT_SUBMITTED';
                  
                  let timeIn = '-';
                  if (record?.checkIn) {
                    timeIn = new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                  }
                  
                  const isVerified = verificationStatus === 'VERIFIED';

                  return (
                    <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#1e293b' }}>{worker.name}</td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{worker.trade}</td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>{timeIn}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: status === 'PRESENT' ? '#dcfce7' : status === 'ABSENT' ? '#fee2e2' : status === 'HALF_DAY' ? '#fef3c7' : status === 'LEAVE' ? '#e0e7ff' : '#f1f5f9',
                          color: status === 'PRESENT' ? '#16a34a' : status === 'ABSENT' ? '#dc2626' : status === 'HALF_DAY' ? '#d97706' : status === 'LEAVE' ? '#4f46e5' : '#64748b'
                        }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          backgroundColor: verificationStatus === 'VERIFIED' ? '#dcfce7' : verificationStatus === 'REJECTED' ? '#fee2e2' : verificationStatus === 'PENDING' ? '#fef3c7' : '#f1f5f9',
                          color: verificationStatus === 'VERIFIED' ? '#16a34a' : verificationStatus === 'REJECTED' ? '#dc2626' : verificationStatus === 'PENDING' ? '#d97706' : '#64748b'
                        }}>
                          {verificationStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                        {method === 'QR' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 600 }}><QrCode size={14}/> QR</span>}
                        {method === 'CONTRACTOR_MANUAL' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 600 }}><UserCheck size={14}/> Manual</span>}
                        {method === 'SITE_ENGINEER_MANUAL' && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4f46e5', fontWeight: 600 }}><UserCheck size={14}/> Engineer</span>}
                        {!method && '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Mark Present" 
                            disabled={isVerified}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: status === 'PRESENT' ? '#ecfdf5' : 'transparent', borderColor: status === 'PRESENT' ? '#a7f3d0' : '#e2e8f0', opacity: isVerified ? 0.5 : 1 }} 
                            onClick={() => handleMarkAttendance(worker.id, 'PRESENT')}
                          >
                            <CheckCircle size={16} color={status === 'PRESENT' ? '#059669' : '#94a3b8'} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Mark Half Day" 
                            disabled={isVerified}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: status === 'HALF_DAY' ? '#fffbeb' : 'transparent', borderColor: status === 'HALF_DAY' ? '#fde68a' : '#e2e8f0', opacity: isVerified ? 0.5 : 1 }} 
                            onClick={() => handleMarkAttendance(worker.id, 'HALF_DAY')}
                          >
                            <UserCheck size={16} color={status === 'HALF_DAY' ? '#d97706' : '#94a3b8'} />
                          </Button>
                          <div style={{ width: '1px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }}></div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="Mark Absent" 
                            disabled={isVerified}
                            style={{ padding: '0.25rem 0.5rem', backgroundColor: status === 'ABSENT' ? '#fef2f2' : 'transparent', borderColor: status === 'ABSENT' ? '#fecaca' : '#e2e8f0', opacity: isVerified ? 0.5 : 1 }} 
                            onClick={() => handleMarkAttendance(worker.id, 'ABSENT')}
                          >
                            <XCircle size={16} color={status === 'ABSENT' ? '#dc2626' : '#94a3b8'} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submit Today's Log">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '8px', border: '1px solid #fed7aa' }}>
            <AlertCircle size={20} color="#ea580c" style={{ marginTop: '0.1rem' }} />
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#9a3412', fontSize: '0.9rem' }}>Confirm Submission</h4>
              <p style={{ margin: 0, color: '#c2410c', fontSize: '0.85rem' }}>
                You are about to submit today's attendance log to the Site Engineer. 
                All records will be marked as PENDING for verification.
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmSubmit} icon={CheckCircle}>Confirm & Submit</Button>
          </div>
        </div>
      </Modal>

      {/* QR Kiosk Modal */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="QR Kiosk Mode">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <QrCode size={64} style={{ color: '#059669', margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Scan Worker QR Code</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
            In a production environment, this would be connected to a camera scanner. <br/>
            For demonstration, please type the Worker ID (or Badge ID) below and submit.
          </p>

          <form onSubmit={handleQrScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
            <input 
              type="text" 
              placeholder="Enter Worker ID" 
              value={qrWorkerId} 
              onChange={e => setQrWorkerId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', textAlign: 'center', fontSize: '1.1rem' }}
              autoFocus
            />
            <Button variant="primary" type="submit" style={{ width: '100%' }}>Simulate Scan</Button>
          </form>

          {qrMessage && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: qrMessage.startsWith('Error') ? '#fef2f2' : '#ecfdf5', color: qrMessage.startsWith('Error') ? '#dc2626' : '#059669', fontWeight: 600 }}>
              {qrMessage}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
