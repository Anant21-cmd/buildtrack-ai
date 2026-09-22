const prisma = require('../config/prisma');

exports.createDailyProgress = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    /* We assume project is valid */
    
    // Add companyId explicitly from req.user
    const record = await prisma.dailyProgress.create({ 
      data: { ...req.body, companyId: req.user.companyId } 
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyDailyProgresss = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const records = await prisma.dailyProgress.findMany({ 
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.updateDailyProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.dailyProgress.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.dailyProgress.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
