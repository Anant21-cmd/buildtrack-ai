const prisma = require('../config/prisma');
const whatsappService = require('../services/whatsappService');

/**
 * Record a status history entry
 */
const recordHistory = async (tx, requestId, status, changedById, remarks = '') => {
  await tx.materialRequestHistory.create({
    data: {
      requestId,
      status,
      changedById,
      remarks
    }
  });
};

/**
 * Helper to fetch admin/reviewer for a project/company
 */
const getStoreManagerPhone = async (companyId) => {
  const manager = await prisma.user.findFirst({
    where: { companyId, role: 'COMPANY_ADMIN' },
    select: { name: true, id: true }
  });
  return manager;
};

exports.createMaterialRequest = async (req, res, next) => {
  try {
    const { projectId, materialId, qty, purpose, location, requiredDate, priority, requestedBy } = req.body;
    
    if (!projectId || !materialId) {
      return res.status(400).json({ message: 'Both Project and Material must be selected.' });
    }

    // Verify Project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(400).json({ message: `Project with ID ${projectId} does not exist.` });
    }

    // Verify Material exists
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      return res.status(400).json({ message: `Material with ID ${materialId} does not exist.` });
    }

    // Company check (allow SUPER_ADMIN)
    if (req.user.role !== 'SUPER_ADMIN') {
      if (!req.user.companyId || req.user.companyId !== project.companyId) {
        return res.status(403).json({ message: 'Must belong to the company that owns this project.' });
      }
    }
    
    const record = await prisma.$transaction(async (tx) => {
      const newRecord = await tx.materialRequest.create({ 
        data: {
          projectId,
          materialId,
          qty: parseFloat(qty) || 0,
          reason: purpose || 'Material requisition', // mapped to reason
          location,
          requiredDate: requiredDate ? new Date(requiredDate) : null,
          priority: priority || 'Medium',
          requestedBy: requestedBy || req.user.name,
          status: 'Pending'
        },
        include: { project: true, material: true }
      });
      
      await recordHistory(tx, newRecord.id, 'Pending', req.user.id, 'Request created');
      
      return newRecord;
    });

    let targetPhone = req.body.recipientPhone || process.env.TEST_WHATSAPP_PHONE || '916382069963'; 
    const requestUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/materials/requests`;

    const waData = {
      id: record.id,
      project: record.project.name,
      material: record.material.name,
      qty: record.qty,
      unit: record.material.unit,
      requiredDate: record.requiredDate ? new Date(record.requiredDate).toLocaleDateString() : '',
      priority: record.priority,
      reason: record.reason,
      requester: record.requestedBy,
      requestUrl
    };

    const waResult = await whatsappService.sendNotification(targetPhone, waData);
    
    if (waResult.mode === 'real_whatsapp' || waResult.mode === 'api' || waResult.mode === 'link') {
      await prisma.materialRequest.update({
        where: { id: record.id },
        data: {
          waMessageId: waResult.messageId || null,
          waStatus: waResult.status || (waResult.success ? 'sent' : 'failed'),
          waFailureReason: waResult.error || null,
          waSentAt: waResult.success ? new Date() : null
        }
      });
    }

    res.status(201).json({ record, whatsapp: waResult });
  } catch (error) {
    next(error);
  }
};

exports.getCompanyMaterialRequests = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
      const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
      const projectIds = projects.map(p => p.id);
      whereClause = { projectId: { in: projectIds } };
    }

    const records = await prisma.materialRequest.findMany({ 
      where: whereClause,
      include: { project: true, material: true, histories: { orderBy: { createdAt: 'desc' } } },
      orderBy: { requestDate: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.getRequirements = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
      const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
      const projectIds = projects.map(p => p.id);
      whereClause = { projectId: { in: projectIds } };
    }
    
    const allocations = await prisma.projectMaterialAllocation.findMany({
      where: whereClause,
      include: { project: true, material: true }
    });
    
    res.status(200).json(allocations);
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Approved', 'Partially Available', 'Insufficient Stock', 'Purchase Required', 'Ready for Issue', 'Issued', 'Delivered', 'Rejected'];
    const normalizedInput = (status || '').toLowerCase().replace(/_/g, ' ').trim();
    const matchedStatus = validStatuses.find(s => s.toLowerCase() === normalizedInput);
    if (!matchedStatus) {
      return res.status(400).json({ message: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` });
    }
    const finalStatus = matchedStatus;

    const request = await prisma.materialRequest.findUnique({ 
      where: { id },
      include: { material: true, project: true }
    });
    if (!request) return res.status(404).json({ message: 'Not found' });

    let finalRecord;

    await prisma.$transaction(async (tx) => {
      // Inventory checks
      if (finalStatus === 'Ready for Issue' || finalStatus === 'Issued') {
        const material = await tx.material.findUnique({ where: { id: request.materialId } });
        if (material && material.stock < request.qty) {
          throw new Error(`Insufficient stock. Available: ${material.stock}, Requested: ${request.qty}`);
        }
      }

      // Deduct stock on Issue
      if (finalStatus === 'Issued' && request.status !== 'Issued') {
        await tx.material.update({
          where: { id: request.materialId },
          data: { stock: { decrement: request.qty } }
        });
      }

      finalRecord = await tx.materialRequest.update({
        where: { id },
        data: { status: finalStatus },
        include: { project: true, material: true }
      });

      await recordHistory(tx, id, finalStatus, req.user.id, remarks || `Status changed to ${finalStatus}`);
    });

    let targetPhone = process.env.TEST_WHATSAPP_PHONE || '916382069963';
    const requestUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/materials/requests`;

    const waData = {
      id: finalRecord.id,
      material: finalRecord.material.name,
      status: finalRecord.status,
      remarks,
      requestUrl
    };

    let waResult = null;
    try {
      waResult = await whatsappService.sendStatusUpdateNotification(targetPhone, waData);
    } catch (waErr) {
      console.error('WhatsApp notify error', waErr);
    }
    
    res.status(200).json({ record: finalRecord, whatsapp: waResult });
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
