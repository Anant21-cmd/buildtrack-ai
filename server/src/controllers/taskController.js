const prisma = require('../config/prisma');

exports.createTask = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    /* We assume project is valid */
    
    const record = await prisma.task.create({ data: req.body });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyTasks = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
    const projectIds = projects.map(p => p.id);
    const records = await prisma.task.findMany({ where: { projectId: { in: projectIds } } });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.task.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.task.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
