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
    if (!req.user.companyId) {
      return res.status(403).json({ message: 'User must belong to a company to view projects' });
    }

    const projects = await prisma.project.findMany({
      where: { companyId: req.user.companyId },
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

    // Convert budget to number if present
    if (updateData.budget !== undefined) {
      updateData.budget = Number(updateData.budget);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    next(error);
  }
};
