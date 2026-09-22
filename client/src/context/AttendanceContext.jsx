import React, { createContext, useContext, useState } from 'react';
import { checkGeofence } from '../utils/geoDistance';

const AttendanceContext = createContext();

export const ATTENDANCE_METHODS = {
  QR: 'QR',
  GPS: 'GPS',
  MANUAL: 'MANUAL'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  HALF_DAY: 'HALF_DAY',
  ABSENT: 'ABSENT'
};

export function AttendanceProvider({ children }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const todayDate = new Date().toISOString().split('T')[0];

  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // 1. QR Code Attendance Check-In
  const markAttendanceQR = ({ worker, project, verifiedBy = 'Authorized Staff' }) => {
    // Duplicate prevention check (Section 33 & 34)
    const existing = attendanceRecords.find(
      (a) => a.workerId === worker.id && a.date === todayDate && a.projectId === project.id
    );

    if (existing) {
      throw new Error(`Worker already marked present for today at ${existing.checkInTime}.`);
    }

    const newRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      projectId: project.id,
      projectName: project.name,
      date: todayDate,
      checkInTime: formatCurrentTime(),
      checkOutTime: null,
      method: ATTENDANCE_METHODS.QR,
      status: ATTENDANCE_STATUS.PRESENT,
      latitude: null,
      longitude: null,
      distanceMeters: null,
      verifiedBy
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  // 2. GPS Geofenced Attendance Check-In
  const markAttendanceGPS = ({ worker, project, workerLat, workerLon }) => {
    // Duplicate check
    const existing = attendanceRecords.find(
      (a) => a.workerId === worker.id && a.date === todayDate && a.projectId === project.id
    );

    if (existing) {
      throw new Error(`Worker already marked present for today at ${existing.checkInTime}.`);
    }

    // Evaluate Geofence using Haversine
    const geoResult = checkGeofence(
      workerLat,
      workerLon,
      project.latitude,
      project.longitude,
      project.radiusMeters || 250
    );

    if (!geoResult.isInside) {
      throw new Error(
        `Check-in rejected. You are located ${geoResult.distance}m away from the construction site boundary. Allowed site radius is ${geoResult.allowedRadiusMeters}m.`
      );
    }

    const newRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      workerId: worker.id,
      workerName: worker.name,
      workerRole: worker.role,
      projectId: project.id,
      projectName: project.name,
      date: todayDate,
      checkInTime: formatCurrentTime(),
      checkOutTime: null,
      method: ATTENDANCE_METHODS.GPS,
      status: ATTENDANCE_STATUS.PRESENT,
      latitude: workerLat,
      longitude: workerLon,
      distanceMeters: geoResult.distance,
      verifiedBy: 'Automated GPS Geofence'
    };

    setAttendanceRecords((prev) => [newRecord, ...prev]);
    return { record: newRecord, distance: geoResult.distance };
  };

  // 3. Manual Attendance Check-In / Adjustment
  const markAttendanceManual = ({ worker, project, status = ATTENDANCE_STATUS.PRESENT, verifiedBy, notes }) => {
    // Check if record exists for update or create new
    const existingIndex = attendanceRecords.findIndex(
      (a) => a.workerId === worker.id && a.date === todayDate && a.projectId === project.id
    );

    if (existingIndex >= 0) {
      // Update existing record
      setAttendanceRecords((prev) =>
        prev.map((rec, idx) =>
          idx === existingIndex
            ? {
                ...rec,
                status,
                method: ATTENDANCE_METHODS.MANUAL,
                verifiedBy: `${verifiedBy || 'Site Engineer'} (Manual Update: ${notes || 'Supervisor Verified'})`
              }
            : rec
        )
      );
      return attendanceRecords[existingIndex];
    } else {
      // Create new record
      const newRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        workerId: worker.id,
        workerName: worker.name,
        workerRole: worker.role,
        projectId: project.id,
        projectName: project.name,
        date: todayDate,
        checkInTime: status === ATTENDANCE_STATUS.ABSENT ? '-' : formatCurrentTime(),
        checkOutTime: null,
        method: ATTENDANCE_METHODS.MANUAL,
        status,
        latitude: null,
        longitude: null,
        distanceMeters: null,
        verifiedBy: `${verifiedBy || 'Site Engineer'} (${notes || 'Manual Entry'})`
      };

      setAttendanceRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    }
  };

  // Worker Check-Out
  const checkOutWorker = (attendanceId) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) =>
        rec.id === attendanceId ? { ...rec, checkOutTime: formatCurrentTime() } : rec
      )
    );
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        markAttendanceQR,
        markAttendanceGPS,
        markAttendanceManual,
        checkOutWorker,
        ATTENDANCE_METHODS,
        ATTENDANCE_STATUS
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

