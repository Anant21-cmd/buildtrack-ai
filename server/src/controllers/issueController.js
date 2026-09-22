const prisma = require('../config/prisma');

exports.createIssue = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    /* We assume project is valid */
    
    const record = await prisma.issue.create({ data: req.body });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyIssues = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const projects = await prisma.project.findMany({ where: { companyId: req.user.companyId }, select: { id: true } });
    const projectIds = projects.map(p => p.id);
    const records = await prisma.issue.findMany({ where: { projectId: { in: projectIds } } });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.issue.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.issue.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
