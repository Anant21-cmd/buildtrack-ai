const prisma = require('../config/prisma');

exports.createSafetyReport = async (req, res, next) => {
  try {
    const { projectId, description, severity, location, correctiveAction, photoUrl } = req.body;

    if (!projectId || !description) {
      return res.status(400).json({ message: 'Project ID and Description are required' });
    }

    const report = await prisma.safetyReport.create({
      data: {
        projectId,
        description,
        severity: severity || 'Medium',
        location: location || null,
        correctiveAction: correctiveAction || null,
        photoUrl: photoUrl || null,
        status: 'Open',
        reportedBy: req.user.name || req.user.id || 'Unknown',
      }
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

exports.getSafetyReports = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    
    if (!req.user.companyId) {
      return res.status(403).json({ message: 'User must belong to a company' });
    }

    let whereClause = { project: { companyId: req.user.companyId } };
    
    if (projectId) {
      whereClause.projectId = projectId;
    }
    
    if (req.user.role === 'CLIENT') {
      whereClause.project = { ...whereClause.project, client: req.user.name };
    }

    const reports = await prisma.safetyReport.findMany({
      where: whereClause,
      orderBy: { reportDate: 'desc' },
      include: { project: true }
    });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

exports.updateSafetyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const report = await prisma.safetyReport.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

