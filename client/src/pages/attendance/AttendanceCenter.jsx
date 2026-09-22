import React, { useState } from 'react';
import {
  CalendarCheck,
  QrCode,
  Compass,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  User,
  LogOut,
  Camera,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import { useAttendance, ATTENDANCE_METHODS, ATTENDANCE_STATUS } from '../../context/AttendanceContext';
import { useWorkers } from '../../context/WorkerContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { calculateDistance } from '../../utils/geoDistance';

export default function AttendanceCenter() {
  const { currentUser } = useAuth();
  const { attendanceRecords, markAttendanceQR, markAttendanceGPS, markAttendanceManual, checkOutWorker } = useAttendance();
  const { workers } = useWorkers();
  const { projects } = useProjects();

  // Active Project Site Filter
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || 'PRJ-101');
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Active Method Tab ('QR', 'GPS', 'MANUAL')
  const [activeMethodTab, setActiveMethodTab] = useState('QR');

  // QR Method States
  const [qrInputToken, setQrInputToken] = useState('');
  const [qrScanSuccess, setQrScanSuccess] = useState(null);
  const [qrErrorMessage, setQrErrorMessage] = useState('');

  // GPS Method States
  const [gpsWorkerId, setGpsWorkerId] = useState('');
  const [workerGpsCoords, setWorkerGpsCoords] = useState({
    lat: selectedProject.latitude + 0.0003, // Default ~35m from center
    lon: selectedProject.longitude + 0.0002
  });
  const [gpsStatusResult, setGpsStatusResult] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Manual Method States
  const [manualWorkerId, setManualWorkerId] = useState('');
  const [manualStatus, setManualStatus] = useState(ATTENDANCE_STATUS.PRESENT);
  const [manualNotes, setManualNotes] = useState('No smartphone available; verified on-site');
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Workers assigned to selected site
  const siteWorkers = workers.filter((w) => w.assignedProjectId === selectedProjectId);

  // Filter attendance records for selected project for today
  const todayDate = new Date().toISOString().split('T')[0];
  const todaySiteAttendance = attendanceRecords.filter(
    (a) => a.projectId === selectedProjectId && a.date === todayDate
  );

  const qrCount = todaySiteAttendance.filter((a) => a.method === ATTENDANCE_METHODS.QR).length;
  const gpsCount = todaySiteAttendance.filter((a) => a.method === ATTENDANCE_METHODS.GPS).length;
  const manualCount = todaySiteAttendance.filter((a) => a.method === ATTENDANCE_METHODS.MANUAL).length;

  // Handler: QR Scan
  const handleScanQR = (tokenToScan) => {
    setQrErrorMessage('');
    setQrScanSuccess(null);
    const token = (tokenToScan || qrInputToken).trim();

    if (!token) {
      setQrErrorMessage('Please enter or select a valid worker QR token.');
      return;
    }

    const worker = workers.find((w) => w.qrCodeToken === token);
    if (!worker) {
      setQrErrorMessage(`Unrecognized QR Code token "${token}". Worker not found in directory.`);
      return;
    }

    try {
      const record = markAttendanceQR({
        worker,
        project: selectedProject,
        verifiedBy: `${currentUser.name} (${currentUser.role.replace('_', ' ')})`
      });
      setQrScanSuccess({ worker, record });
      setQrInputToken('');
    } catch (err) {
      setQrErrorMessage(err.message);
    }
  };

  // Handler: GPS Check-in
  const handleGPSCheckIn = (customCoords) => {
    setGpsStatusResult(null);
    const coords = customCoords || workerGpsCoords;
    const worker = workers.find((w) => w.id === gpsWorkerId);

    if (!worker) {
      setGpsStatusResult({
        success: false,
        message: 'Please select a worker for GPS verification.'
      });
      return;
    }

    try {
      const result = markAttendanceGPS({
        worker,
        project: selectedProject,
        workerLat: coords.lat,
        workerLon: coords.lon
      });
      setGpsStatusResult({
        success: true,
        message: `Check-in accepted! Distance from site: ${result.distance}m (Within allowed ${selectedProject.radiusMeters}m geofence).`,
        worker,
        distance: result.distance
      });
    } catch (err) {
      setGpsStatusResult({
        success: false,
        message: err.message
      });
    }
  };

  // Handler: Manual Attendance
  const handleManualSubmit = (e) => {
    e.preventDefault();
    setManualSuccessMsg('');
    const worker = workers.find((w) => w.id === manualWorkerId);

    if (!worker) {
      alert('Please select a worker.');
      return;
    }

    markAttendanceManual({
      worker,
      project: selectedProject,
      status: manualStatus,
      verifiedBy: currentUser.name,
      notes: manualNotes
    });

    setManualSuccessMsg(`Manual attendance recorded for ${worker.name} as ${manualStatus}.`);
    setTimeout(() => setManualSuccessMsg(''), 4000);
  };

  // Table Columns for Live Attendance Feed
  const columns = [
    {
      header: 'Worker Name & ID',
      accessor: 'workerName',
      render: (row) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{row.workerId}</span>
          <p style={{ fontWeight: 700, color: '#0f172a' }}>{row.workerName}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.workerRole}</span>
        </div>
      )
    },
    {
      header: 'Check-In / Out',
      accessor: 'checkInTime',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#059669' }}>
            <Clock size={13} />
            <span>In: {row.checkInTime}</span>
          </div>
          {row.checkOutTime ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#dc2626', marginTop: '0.15rem' }}>
              <LogOut size={13} />
              <span>Out: {row.checkOutTime}</span>
            </div>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>On Site (Not Checked Out)</span>
          )}
        </div>
      )
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (row) => {
        let badgeStyle = { backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' };
        if (row.method === 'GPS') badgeStyle = { backgroundColor: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd' };
        if (row.method === 'MANUAL') badgeStyle = { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };

        return (
          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, ...badgeStyle }}>
            {row.method === 'QR' && '📷 QR Code'}
            {row.method === 'GPS' && '📍 GPS Geofence'}
            {row.method === 'MANUAL' && '✍️ Manual Entry'}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />
    },
    {
      header: 'Verification Audit',
      accessor: 'verifiedBy',
      render: (row) => (
        <span style={{ fontSize: '0.75rem', color: '#475569' }}>
          {row.verifiedBy}
          {row.distanceMeters && ` (${row.distanceMeters}m from site center)`}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: 'actions',
      render: (row) =>
        !row.checkOutTime && row.status === 'PRESENT' ? (
          <Button size="sm" variant="outline" icon={LogOut} onClick={() => checkOutWorker(row.id)}>
            Check Out
          </Button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed</span>
        )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Site Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <CalendarCheck size={24} style={{ color: '#1e3a8a' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              3-Way Attendance Command Center
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Multi-modal check-in supporting QR Scanning, GPS Geofencing, and Manual Site Engineer fallback.
          </p>
        </div>

        {/* Site Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <MapPin size={16} style={{ color: '#1e3a8a' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Active Job Site:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setQrScanSuccess(null);
              setGpsStatusResult(null);
            }}
            style={{ border: 'none', fontSize: '0.875rem', fontWeight: 700, color: '#1e3a8a', outline: 'none', backgroundColor: 'transparent' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Turnout KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Site Turnout</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
            {todaySiteAttendance.length} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {siteWorkers.length || 48}</span>
          </p>
          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
            {siteWorkers.length > 0 ? Math.round((todaySiteAttendance.length / siteWorkers.length) * 100) : 94}% Present
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>QR Code Scans</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{qrCount}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Badge scanned at gate</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>GPS Mobile Geofence</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>{gpsCount}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Within {selectedProject.radiusMeters}m perimeter</span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Manual Fallback</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>{manualCount}</p>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Supervisor confirmed</span>
        </div>
      </div>

      {/* 3-Way Method Tabs Switcher */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            onClick={() => setActiveMethodTab('QR')}
            style={{
              padding: '1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderBottom: activeMethodTab === 'QR' ? '3px solid #1e3a8a' : '3px solid transparent',
              backgroundColor: activeMethodTab === 'QR' ? '#ffffff' : 'transparent',
              color: activeMethodTab === 'QR' ? '#1e3a8a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <QrCode size={18} />
            <span>Method A: QR Scanner</span>
          </button>

          <button
            onClick={() => setActiveMethodTab('GPS')}
            style={{
              padding: '1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderBottom: activeMethodTab === 'GPS' ? '3px solid #0284c7' : '3px solid transparent',
              backgroundColor: activeMethodTab === 'GPS' ? '#ffffff' : 'transparent',
              color: activeMethodTab === 'GPS' ? '#0284c7' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <Compass size={18} />
            <span>Method B: GPS Geofence</span>
          </button>

          <button
            onClick={() => setActiveMethodTab('MANUAL')}
            style={{
              padding: '1rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderBottom: activeMethodTab === 'MANUAL' ? '3px solid #d97706' : '3px solid transparent',
              backgroundColor: activeMethodTab === 'MANUAL' ? '#ffffff' : 'transparent',
              color: activeMethodTab === 'MANUAL' ? '#d97706' : '#64748b',
              cursor: 'pointer'
            }}
          >
            <FileCheck size={18} />
            <span>Method C: Manual Entry</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div style={{ padding: '1.75rem' }}>
          {/* PANE A: QR Scanner */}
          {activeMethodTab === 'QR' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
              {/* Virtual Scanner Viewfinder */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  padding: '2rem',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Camera size={18} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    AUTHORIZED GATE SCANNER ACTIVE
                  </span>
                </div>

                {/* Viewfinder Target */}
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    overflow: 'hidden'
                  }}
                >
                  {/* Corner Anchors */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '20px', borderTop: '3px solid #10b981', borderLeft: '3px solid #10b981' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '20px', height: '20px', borderTop: '3px solid #10b981', borderRight: '3px solid #10b981' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '20px', height: '20px', borderBottom: '3px solid #10b981', borderLeft: '3px solid #10b981' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderBottom: '3px solid #10b981', borderRight: '3px solid #10b981' }} />

                  {/* Animated laser scan line */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '2px',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981'
                    }}
                  />

                  <QrCode size={64} style={{ opacity: 0.35 }} />
                </div>

                <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: '280px' }}>
                  Align worker's digital badge or laminated hard hat QR code within frame.
                </p>
              </div>

              {/* QR Input & Simulator Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    Scanner Token Stream
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Simulate real-time camera scan by entering or choosing a worker's token.
                  </p>
                </div>

                {qrErrorMessage && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} />
                    <span>{qrErrorMessage}</span>
                  </div>
                )}

                {qrScanSuccess && (
                  <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={24} style={{ color: '#059669', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>Attendance Recorded: PRESENT</strong>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.15rem' }}>
                        <strong>{qrScanSuccess.worker.name}</strong> ({qrScanSuccess.worker.role}) checked in successfully at {qrScanSuccess.record.checkInTime}.
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter QR token (e.g. BT-QR-WRK-201-9872)..."
                    value={qrInputToken}
                    onChange={(e) => setQrInputToken(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                  <Button variant="success" icon={Check} onClick={() => handleScanQR()}>
                    Scan QR
                  </Button>
                </div>

                {/* Quick-Scan Roster Chips */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    Quick Simulator: Click to Scan Crew Member at Gate
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {workers.slice(0, 5).map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleScanQR(w.qrCodeToken)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          color: '#1e293b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <QrCode size={12} color="#059669" />
                        <span>{w.name} ({w.role})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PANE B: GPS Mobile Geofence */}
          {activeMethodTab === 'GPS' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  GPS Mobile Site Geofencing
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  Workers with smartphones open the attendance portal. The system captures coordinates and computes geodesic distance using the Haversine formula against the site perimeter.
                </p>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <MapPin size={16} style={{ color: '#0284c7' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      Target Site: {selectedProject.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Coordinates: <strong>{selectedProject.latitude}, {selectedProject.longitude}</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '0.2rem' }}>
                    Allowed Geofence Radius: <strong>{selectedProject.radiusMeters} meters</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Select Worker (Smartphone Holder):
                    </label>
                    <select
                      value={gpsWorkerId}
                      onChange={(e) => setGpsWorkerId(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    >
                      <option value="">Choose Worker...</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name} — {w.role} ({w.contractor})</option>
                      ))}
                    </select>
                  </div>

                  {/* Demonstration Simulator Buttons (Essential for College Presentations!) */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                      Demo Location Simulator (Haversine Testing)
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          const nearCoords = {
                            lat: selectedProject.latitude + 0.0003,
                            lon: selectedProject.longitude + 0.0002
                          };
                          setWorkerGpsCoords(nearCoords);
                          handleGPSCheckIn(nearCoords);
                        }}
                      >
                        🟢 Simulate At Site (45m Away)
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          const farCoords = {
                            lat: selectedProject.latitude + 0.0065, // ~720m away
                            lon: selectedProject.longitude + 0.005
                          };
                          setWorkerGpsCoords(farCoords);
                          handleGPSCheckIn(farCoords);
                        }}
                      >
                        🔴 Simulate Off-Site (720m Away)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GPS Live Result Feedback */}
              <div>
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '1.75rem',
                    color: '#ffffff',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Compass size={20} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                      GEOFENCE VALIDATION ENGINE
                    </span>
                  </div>

                  {gpsStatusResult ? (
                    <div
                      style={{
                        padding: '1.25rem',
                        borderRadius: '8px',
                        backgroundColor: gpsStatusResult.success ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)',
                        border: '1px solid',
                        borderColor: gpsStatusResult.success ? '#059669' : '#dc2626'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {gpsStatusResult.success ? (
                          <CheckCircle2 size={22} style={{ color: '#10b981' }} />
                        ) : (
                          <XCircle size={22} style={{ color: '#ef4444' }} />
                        )}
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: gpsStatusResult.success ? '#10b981' : '#ef4444' }}>
                          {gpsStatusResult.success ? 'CHECK-IN ACCEPTED' : 'CHECK-IN REJECTED'}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                        {gpsStatusResult.message}
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                      <Compass size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.85rem' }}>
                        Select a worker and trigger a location test to verify geodesic distance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PANE C: Manual Attendance Entry */}
          {activeMethodTab === 'MANUAL' && (
            <div style={{ maxWidth: '640px' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Manual Site Engineer Attendance Override
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Authorized fallback for workers without mobile phones, unreadable QR badges, or authorized site exceptions.
                </p>
              </div>

              {manualSuccessMsg && (
                <div style={{ padding: '0.85rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{manualSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Select Worker *
                  </label>
                  <select
                    value={manualWorkerId}
                    onChange={(e) => setManualWorkerId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  >
                    <option value="">Select Worker from Site Roster...</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.role}) — {w.assignedProjectName}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Attendance Status *
                    </label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    >
                      <option value={ATTENDANCE_STATUS.PRESENT}>Present (Full Shift)</option>
                      <option value={ATTENDANCE_STATUS.HALF_DAY}>Half-Day</option>
                      <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Authorized Supervisor Signature
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${currentUser.name} (${currentUser.role.replace('_', ' ')})`}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Reason / Verification Notes *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Broken phone screen; badge verified visually by engineer..."
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>

                <Button type="submit" variant="warning" icon={FileCheck} style={{ marginTop: '0.5rem' }}>
                  Record Manual Attendance
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Live Site Attendance Ledger Table */}
      <Table
        title={`Today's Verified Site Attendance Ledger (${todaySiteAttendance.length})`}
        columns={columns}
        data={todaySiteAttendance}
        searchPlaceholder="Search today's attendance by worker name or role..."
      />
    </div>
  );
}

