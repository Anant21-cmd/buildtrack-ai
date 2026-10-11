const prisma = require('../config/prisma');

// CREATE a daily site report
exports.createReport = async (req, res, next) => {
  try {
    const { projectId, taskId, workDescription, progressPct, manpowerCount, remarks, date } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const report = await prisma.dailySiteReport.create({
      data: {
        projectId,
        taskId: taskId || null,
        workDescription,
        progressPct: parseFloat(progressPct) || 0,
        manpowerCount: parseInt(manpowerCount, 10) || 0,
        remarks: remarks || null,
        date: date ? new Date(date) : new Date(),
        createdBy: req.user.name || req.user.id || 'Unknown',
      }
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// GET reports for a project or user's company
exports.getReports = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let whereClause = {};
    if (projectId) {
      whereClause.projectId = projectId;
    } else if (req.user?.companyId) {
      const companyProjects = await prisma.project.findMany({
        where: { companyId: req.user.companyId },
        select: { id: true }
      });
      whereClause.projectId = { in: companyProjects.map(p => p.id) };
    }

    const reports = await prisma.dailySiteReport.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: { task: true, project: true }
    });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    next(error);
  }
};

// CREATE a site photo
exports.createPhoto = async (req, res, next) => {
  try {
    const { projectId, taskId, url, description } = req.body;

    if (!projectId || !url) {
      return res.status(400).json({ message: 'Project ID and URL are required' });
    }

    const photo = await prisma.sitePhoto.create({
      data: {
        projectId,
        taskId: taskId || null,
        url,
        description: description || null,
        uploadedBy: req.user.name || req.user.id || 'Unknown',
      }
    });

    res.status(201).json({ success: true, photo });
  } catch (error) {
    next(error);
  }
};

// GET photos for a project or user's company
exports.getPhotos = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let whereClause = {};
    if (projectId) {
      whereClause.projectId = projectId;
    } else if (req.user?.companyId) {
      const companyProjects = await prisma.project.findMany({
        where: { companyId: req.user.companyId },
        select: { id: true }
      });
      whereClause.projectId = { in: companyProjects.map(p => p.id) };
    }

    const photos = await prisma.sitePhoto.findMany({
      where: whereClause,
      orderBy: { uploadDate: 'desc' },
      include: { task: true, project: true }
    });

    res.status(200).json({ success: true, photos });
  } catch (error) {
    next(error);
  }
};

exports.deletePhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.sitePhoto.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    next(error);
  }
};
