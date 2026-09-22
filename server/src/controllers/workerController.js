const prisma = require('../config/prisma');

exports.createWorker = async (req, res, next) => {
  try {
    const { name, trade, role, badgeId, projectId, assignedProjectId } = req.body;

    if (!req.user.companyId) {
      return res.status(403).json({ message: 'User must belong to a company to add workers' });
    }

    const actualTrade = trade || role || 'Laborer';
    const actualProjectId = projectId || assignedProjectId || null;
    const actualBadgeId = badgeId || 'WRK-' + Math.floor(100000 + Math.random() * 900000);

    const existingBadge = await prisma.worker.findUnique({ where: { badgeId: actualBadgeId } });
    if (existingBadge) {
      return res.status(400).json({ message: 'Badge ID already in use' });
    }

    const worker = await prisma.worker.create({
      data: {
        name,
        trade: actualTrade,
        badgeId: actualBadgeId,
        companyId: req.user.companyId,
        projectId: actualProjectId,
      }
    });

    res.status(201).json(worker);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyWorkers = async (req, res, next) => {
  try {
    if (!req.user.companyId) {
      return res.status(403).json({ message: 'User must belong to a company' });
    }

    const workers = await prisma.worker.findMany({
      where: { companyId: req.user.companyId },
      include: { project: true },
      orderBy: { name: 'asc' }
    });

    const mappedWorkers = workers.map(w => ({
      id: w.id,
      name: w.name,
      role: w.trade,
      trade: w.trade,
      badgeId: w.badgeId,
      status: w.status,
      assignedProjectId: w.projectId,
      assignedProjectName: w.project ? w.project.name : 'Unassigned Reserve',
      phone: '+91-XXXXXXXXXX', // mock as DB lacks it
      contractor: 'Internal', // mock as DB lacks it
      skill: 'General', // mock as DB lacks it
      qrCodeToken: w.badgeId
    }));

    res.status(200).json(mappedWorkers);
  } catch (error) {
    next(error);
  }
};

exports.updateWorker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const worker = await prisma.worker.findUnique({ where: { id } });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    
    if (worker.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to update this worker' });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(updatedWorker);
  } catch (error) {
    next(error);
  }
};

