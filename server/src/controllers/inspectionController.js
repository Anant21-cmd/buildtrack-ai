const prisma = require('../config/prisma');

// CREATE an inspection
exports.createInspection = async (req, res, next) => {
  try {
    const { projectId, taskId, activity, status, remarks, correctiveAction, photoUrl } = req.body;

    if (!projectId || !activity) {
      return res.status(400).json({ message: 'Project ID and Activity are required' });
    }

    const inspection = await prisma.qualityInspection.create({
      data: {
        projectId,
        taskId: taskId || null,
        activity,
        status: status || 'Needs Attention',
        remarks: remarks || null,
        correctiveAction: correctiveAction || null,
        photoUrl: photoUrl || null,
        inspectedBy: req.user.name || req.user.id || 'Unknown',
      }
    });

    res.status(201).json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

// GET inspections
exports.getInspections = async (req, res, next) => {
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

    const inspections = await prisma.qualityInspection.findMany({
      where: whereClause,
      orderBy: { inspectionDate: 'desc' },
      include: { task: true, project: true }
    });

    res.status(200).json({ success: true, inspections });
  } catch (error) {
    next(error);
  }
};

// UPDATE inspection
exports.updateInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const inspection = await prisma.qualityInspection.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({ success: true, inspection });
  } catch (error) {
    next(error);
  }
};

