const prisma = require('../config/prisma');

// Helper to log audit
const logAudit = async (actorName, actorRole, action, entity, entityId, prevValue, newValue, reason, projectId) => {
  await prisma.auditLog.create({
    data: {
      actorName: actorName || 'Authorized User',
      actorRole: actorRole || 'UNKNOWN',
      action,
      entity,
      entityId,
      previousValue: prevValue ? JSON.stringify(prevValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      reason,
      projectId
    }
  });
};

exports.qrScan = async (req, res, next) => {
  try {
    // Expected: workerId (from QR), projectId (from QR or device context)
    const { workerId, projectId, lat, lng } = req.body;

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return res.status(404).json({ success: false, message: 'Invalid Worker ID (QR Token)' });

    // Ensure worker is active
    if (worker.status !== 'Active' && worker.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Worker is not active.' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find existing attendance for today
    let record = await prisma.attendance.findUnique({
      where: {
        workerId_projectId_date: {
          workerId: worker.id,
          projectId: projectId,
          date: today
        }
      }
    });

    if (!record) {
      // Check-In
      record = await prisma.attendance.create({
        data: {
          workerId: worker.id,
          projectId,
          contractorId: worker.contractorId, // if assigned
          date: today,
          checkIn: new Date(),
          status: 'Present',
          method: 'QR',
          verificationStatus: 'Pending Verification',
          recordedById: req.user.id
        }
      });

      await logAudit(req.user.name, req.user.role, 'QR_CHECKIN', 'Attendance', record.id, null, 'Present', 'QR Scan Check-In', projectId);
      
      return res.status(200).json({ success: true, message: 'Check-in successful', record });
    } else {
      // If already checked out
      if (record.checkOut) {
        return res.status(400).json({ success: false, message: 'Worker already checked out for today.' });
      }

      // Check-Out
      const checkOutTime = new Date();
      const checkInTime = new Date(record.checkIn);
      const hours = Math.abs(checkOutTime - checkInTime) / 36e5; // in hours

      const updated = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          checkOut: checkOutTime,
          totalHours: hours
        }
      });

      await logAudit(req.user.name, req.user.role, 'QR_CHECKOUT', 'Attendance', record.id, record.totalHours, hours, 'QR Scan Check-Out', projectId);

      return res.status(200).json({ success: true, message: 'Check-out successful', record: updated });
    }
  } catch (error) {
    next(error);
  }
};

exports.manualAttendance = async (req, res, next) => {
  try {
    const { workerId, projectId, status, checkIn, checkOut, reason } = req.body;
    
    // Authorization
    if (!['CONTRACTOR', 'SITE_ENGINEER', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    if (req.user.role === 'CONTRACTOR' && worker.contractorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Can only manage your own workers' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await prisma.attendance.findUnique({
      where: {
        workerId_projectId_date: {
          workerId: worker.id,
          projectId: projectId,
          date: today
        }
      }
    });

    const method = req.user.role === 'SITE_ENGINEER' ? 'Site Engineer Manual' : 'Contractor Manual';
    
    // If SE marks attendance, it's automatically verified
    const verificationStatus = req.user.role === 'SITE_ENGINEER' ? 'Verified' : 'Pending Verification';
    const verifiedById = req.user.role === 'SITE_ENGINEER' ? req.user.id : null;
    const verificationTime = req.user.role === 'SITE_ENGINEER' ? new Date() : null;

    let record;
    if (!existing) {
      record = await prisma.attendance.create({
        data: {
          workerId: worker.id,
          projectId,
          contractorId: worker.contractorId,
          date: today,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          status,
          method,
          verificationStatus,
          verifiedById,
          verificationTime,
          recordedById: req.user.id
        }
      });
      await logAudit(req.user.name, req.user.role, 'MANUAL_CREATE', 'Attendance', record.id, null, status, reason || 'Manual Attendance', projectId);
    } else {
      // Update
      if (existing.verificationStatus === 'Verified' && req.user.role !== 'SITE_ENGINEER' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, message: 'Cannot edit verified attendance' });
      }

      record = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status,
          checkIn: checkIn ? new Date(checkIn) : existing.checkIn,
          checkOut: checkOut ? new Date(checkOut) : existing.checkOut,
          method: existing.method === 'QR' ? 'QR' : method,
          verificationStatus: req.user.role === 'SITE_ENGINEER' ? 'Verified' : existing.verificationStatus,
          verifiedById: req.user.role === 'SITE_ENGINEER' ? req.user.id : existing.verifiedById,
          verificationTime: req.user.role === 'SITE_ENGINEER' ? new Date() : existing.verificationTime,
        }
      });
      await logAudit(req.user.name, req.user.role, 'MANUAL_UPDATE', 'Attendance', record.id, existing.status, status, reason || 'Manual Correction', projectId);
    }

    res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

exports.verifyAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus, remarks } = req.body; // 'Verified', 'Rejected', 'Correction Required', 'Flagged for Review'

    if (req.user.role !== 'SITE_ENGINEER' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Only Site Engineers can verify attendance' });
    }

    if (['Rejected', 'Correction Required'].includes(verificationStatus) && !remarks) {
      return res.status(400).json({ success: false, message: 'Remarks are required for rejection or correction requests.' });
    }

    const existing = await prisma.attendance.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Record not found' });

    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        verificationStatus,
        verificationRemarks: remarks,
        verifiedById: req.user.id,
        verificationTime: new Date()
      }
    });

    await logAudit(req.user.name, req.user.role, 'VERIFY', 'Attendance', updated.id, existing.verificationStatus, verificationStatus, remarks || 'Verification Update', existing.projectId);

    res.status(200).json({ success: true, record: updated });
  } catch (error) {
    next(error);
  }
};

exports.getAttendances = async (req, res, next) => {
  try {
    const { projectId, date, contractorId, verificationStatus } = req.query;
    
    let where = {};
    if (projectId) where.projectId = projectId;
    if (date) where.date = date;
    if (contractorId) where.contractorId = contractorId;
    if (verificationStatus) where.verificationStatus = verificationStatus;

    if (req.user.role === 'CONTRACTOR') {
      where.contractorId = req.user.id; // Contractors can only see their own
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        worker: { select: { name: true, trade: true, badgeId: true } },
        contractor: { select: { name: true } },
        verifiedBy: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });

    res.status(200).json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { entity: 'Attendance', entityId: id },
      orderBy: { timestamp: 'desc' }
    });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { projectId, startDate, endDate, contractorId } = req.query;
    let where = {};
    if (projectId) where.projectId = projectId;
    if (contractorId) where.contractorId = contractorId;
    
    // date filtering: assume date is stored as string 'YYYY-MM-DD'
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    } else if (startDate) {
      where.date = { gte: startDate };
    } else if (endDate) {
      where.date = { lte: endDate };
    }

    if (req.user.role === 'CONTRACTOR') {
      where.contractorId = req.user.id;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        worker: { select: { name: true, trade: true } },
        contractor: { select: { name: true } }
      }
    });

    // Summary calculations
    const summary = {
      totalRecords: records.length,
      present: records.filter(r => r.status === 'Present').length,
      absent: records.filter(r => r.status === 'Absent').length,
      halfDay: records.filter(r => r.status === 'Half Day').length,
      leave: records.filter(r => r.status === 'Leave').length,
      verified: records.filter(r => r.verificationStatus === 'Verified').length,
      pending: records.filter(r => r.verificationStatus === 'Pending Verification').length,
    };

    res.status(200).json({ success: true, summary, records });
  } catch (error) {
    next(error);
  }
};
