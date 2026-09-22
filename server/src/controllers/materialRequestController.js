const prisma = require('../config/prisma');

exports.getRequirements = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
    const projectIds = projects.map(p => p.id);
    
    const allocations = await prisma.projectMaterialAllocation.findMany({
      where: { projectId: { in: projectIds } },
      include: { project: true, material: true }
    });
    
    res.status(200).json(allocations);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyMaterialRequests = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
    const projectIds = projects.map(p => p.id);
    const records = await prisma.materialRequest.findMany({ 
      where: { projectId: { in: projectIds } },
      include: { project: true, material: true },
      orderBy: { requestDate: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.createMaterialRequest = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    const { projectId, materialId, qty, purpose, requestedBy } = req.body;
    
    // Fetch or create allocation
    let allocation = await prisma.projectMaterialAllocation.findUnique({
      where: { projectId_materialId: { projectId, materialId } }
    });
    
    if (!allocation) {
      allocation = await prisma.projectMaterialAllocation.create({
        data: { projectId, materialId, allocatedQty: 500, issuedQty: 0 }
      });
    }

    const remainingQuota = allocation.allocatedQty - allocation.issuedQty;
    const isExcess = qty > remainingQuota;
    const excessQty = isExcess ? qty - remainingQuota : 0;
    const status = isExcess ? 'EXCESS_FLAGGED' : 'PENDING';
    
    const record = await prisma.materialRequest.create({ 
      data: {
        projectId,
        materialId,
        qty,
        purpose,
        requestedBy: requestedBy || req.user.name,
        isExcess,
        excessQty,
        approvedQuota: allocation.allocatedQty,
        previouslyIssued: allocation.issuedQty,
        status
      },
      include: { project: true, material: true }
    });
    
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewerName, justificationReason } = req.body;
    
    const request = await prisma.materialRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    
    if (request.isExcess && (!justificationReason || !justificationReason.trim())) {
      return res.status(400).json({ message: 'Formal justification required for excess quota override.' });
    }
    
    const updated = await prisma.materialRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewerName,
        excessJustification: request.isExcess ? justificationReason : null
      },
      include: { project: true, material: true }
    });
    
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewerName, reason } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required.' });
    }
    
    const updated = await prisma.materialRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewerName,
        rejectionReason: reason
      },
      include: { project: true, material: true }
    });
    
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

exports.issueMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { storeManagerName } = req.body;
    
    const request = await prisma.materialRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Not found' });
    
    if (request.status === 'EXCESS_FLAGGED') {
      return res.status(400).json({ message: 'Cannot issue: Requires management authorization for excess quantity.' });
    }
    if (request.status === 'REJECTED') {
      return res.status(400).json({ message: 'Cannot issue a rejected request.' });
    }

    // Deduct stock from material (in a transaction)
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Update MaterialRequest
      const updatedReq = await tx.materialRequest.update({
        where: { id },
        data: { status: 'ISSUED', reviewerName: storeManagerName },
        include: { project: true, material: true }
      });
      
      // 2. Update ProjectMaterialAllocation
      await tx.projectMaterialAllocation.update({
        where: { projectId_materialId: { projectId: request.projectId, materialId: request.materialId } },
        data: { issuedQty: { increment: request.qty } }
      });
      
      // 3. Deduct stock from warehouse
      await tx.material.update({
        where: { id: request.materialId },
        data: { stock: { decrement: request.qty } }
      });
      
      return updatedReq;
    });
    
    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};
