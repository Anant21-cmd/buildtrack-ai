const prisma = require('../config/prisma');

exports.createAttendance = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    /* We assume worker is valid */
    
    const record = await prisma.attendance.create({ data: req.body });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyAttendances = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const workers = await prisma.worker.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
    const workerIds = workers.map(w => w.id);
    const records = await prisma.attendance.findMany({ where: { workerId: { in: workerIds } } });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.attendance.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.attendance.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
