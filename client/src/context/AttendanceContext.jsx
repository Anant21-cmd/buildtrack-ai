import React, { createContext, useContext, useState, useEffect } from 'react';

const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [reports, setReports] = useState(null);

  const getToken = () => localStorage.getItem('buildtrack_token');

  // Fetch Attendance
  const fetchAttendance = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch('/api/attendance?' + params, {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceRecords(data.records);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    }
  };

  // Fetch Reports
  const fetchReports = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch('/api/attendance/reports?' + params, {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // QR Scan Check-In/Check-Out
  const qrScan = async (workerId, projectId) => {
    try {
      const res = await fetch('/api/attendance/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify({ workerId, projectId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed QR scan');
      await fetchAttendance();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Manual Attendance
  const manualAttendance = async (data) => {
    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed manual attendance');
      await fetchAttendance();
      return resData;
    } catch (err) {
      throw err;
    }
  };

  // Verify Attendance (Site Engineer)
  const verifyAttendance = async (id, verificationStatus, remarks) => {
    try {
      const res = await fetch('/api/attendance/' + id + '/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify({ verificationStatus, remarks })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed verification');
      await fetchAttendance();
      return resData;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        reports,
        fetchAttendance,
        fetchReports,
        qrScan,
        manualAttendance,
        verifyAttendance
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
