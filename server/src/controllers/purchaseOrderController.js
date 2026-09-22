const prisma = require('../config/prisma');

exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const { poNumber, vendorId, projectId, totalAmount, status, items } = req.body;
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    // Assuming we just store items as JSON since we don't have a specific POItem table in schema
    // Wait, let's check schema.prisma for PurchaseOrder
    // purchaseOrders PurchaseOrder[] in Project
    
    // We will just create the PO with totalAmount
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId,
        projectId,
        totalAmount: Number(totalAmount) || 0,
        status: status || 'DRAFT',
        items: items ? JSON.stringify(items) : null
      }
    });

    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyPurchaseOrders = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    // To get POs for the company, we find POs attached to projects belonging to this company
    const projects = await prisma.project.findMany({
      where: { companyId: req.user.companyId },
      select: { id: true }
    });
    const projectIds = projects.map(p => p.id);

    const pos = await prisma.purchaseOrder.findMany({
      where: { projectId: { in: projectIds } },
      include: { vendor: true, project: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(pos);
  } catch (error) {
    next(error);
  }
};

exports.updatePurchaseOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const po = await prisma.purchaseOrder.findUnique({ 
      where: { id },
      include: { project: true }
    });

    if (!po) return res.status(404).json({ message: 'PO not found' });
    if (po.project.companyId !== req.user.companyId) return res.status(403).json({ message: 'Not authorized' });

    const updateData = { ...req.body };
    if (updateData.totalAmount !== undefined) updateData.totalAmount = Number(updateData.totalAmount);

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: { vendor: true, project: true }
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

exports.receiveMaterial = async (req, res, next) => {
  try {
    const { id } = req.params; // PO ID
    const { materialId, orderedQty, deliveredQty, receivedBy, mismatchReason } = req.body;
    
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { project: true } });
    if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
    if (po.project.companyId !== req.user.companyId) return res.status(403).json({ message: 'Not authorized' });

    const ordered = Number(orderedQty);
    const delivered = Number(deliveredQty);
    const isMismatch = delivered !== ordered;
    const status = isMismatch ? 'MISMATCH_FLAGGED' : 'VERIFIED';

    const transaction = await prisma.$transaction(async (tx) => {
      // Create receipt
      const receipt = await tx.materialReceipt.create({
        data: {
          poId: id,
          materialId,
          orderedQty: ordered,
          deliveredQty: delivered,
          isMismatch,
          mismatchReason: isMismatch ? mismatchReason : null,
          receivedBy: receivedBy || req.user.name,
          status
        }
      });

      // Update PO status to PARTIAL or COMPLETED (basic heuristic)
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'DELIVERED' } // Simpler state flow for now
      });

      // Add to inventory
      await tx.material.update({
        where: { id: materialId },
        data: { stock: { increment: delivered } }
      });

      return receipt;
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

exports.getAllReceipts = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    // Find all projects for this company
    const projects = await prisma.project.findMany({
      where: { companyId: req.user.companyId },
      select: { id: true }
    });
    const projectIds = projects.map(p => p.id);

    // Find all POs for these projects
    const pos = await prisma.purchaseOrder.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true }
    });
    const poIds = pos.map(p => p.id);

    const receipts = await prisma.materialReceipt.findMany({
      where: { poId: { in: poIds } },
      include: {
        purchaseOrder: { include: { vendor: true } },
        material: true
      },
      orderBy: { dateReceived: 'desc' }
    });

    res.status(200).json(receipts);
  } catch (error) {
    next(error);
  }
};
