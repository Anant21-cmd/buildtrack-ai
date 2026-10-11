const prisma = require('../config/prisma');

exports.createProject = async (req, res, next) => {
  try {
    const { name, code, client, location, latitude, longitude, radiusMeters, description, budget, startDate, endDate, status } = req.body;
    
    // Only users assigned to a company can create projects
    if (!req.user.companyId) {
      return res.status(403).json({ message: 'User must belong to a company to create projects' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        code,
        client,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        radiusMeters: radiusMeters ? parseFloat(radiusMeters) : 250,
        description,
        budget: Number(budget) || 0,
        companyId: req.user.companyId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || 'PLANNING'
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyProjects = async (req, res, next) => {
  try {
    let whereClause = {};
    if (req.user.role !== 'SUPER_ADMIN') {
      if (!req.user.companyId) {
        return res.status(403).json({ message: 'User must belong to a company to view projects' });
      }
      whereClause.companyId = req.user.companyId;
      if (req.user.role === 'CLIENT') {
        whereClause.client = req.user.name;
      }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        dailyProgress: { orderBy: { createdAt: 'desc' } },
        allocations: { include: { material: true } },
        tasks: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Ensure the project belongs to the user's company
    if (project.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Sanitize and convert types for Prisma
    const payload = { ...updateData };
    if (payload.budget !== undefined && payload.budget !== null && payload.budget !== '') {
      payload.budget = Number(payload.budget);
    }
    if (payload.latitude !== undefined && payload.latitude !== null && payload.latitude !== '') {
      payload.latitude = parseFloat(payload.latitude);
    }
    if (payload.longitude !== undefined && payload.longitude !== null && payload.longitude !== '') {
      payload.longitude = parseFloat(payload.longitude);
    }
    if (payload.radiusMeters !== undefined && payload.radiusMeters !== null && payload.radiusMeters !== '') {
      payload.radiusMeters = parseFloat(payload.radiusMeters);
    }
    if (payload.startDate) {
      payload.startDate = new Date(payload.startDate);
    }
    if (payload.endDate) {
      payload.endDate = new Date(payload.endDate);
    }

    // Clean relations and read-only fields
    delete payload.dailyProgress;
    delete payload.allocations;
    delete payload.tasks;
    delete payload.company;
    delete payload.attendances;
    delete payload.dailyReports;
    delete payload.equipment;
    delete payload.expenses;
    delete payload.issues;
    delete payload.materialReqs;
    delete payload.purchaseOrders;
    delete payload.qualityInspections;
    delete payload.safetyReports;
    delete payload.sitePhotos;
    delete payload.workers;
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: payload
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};
