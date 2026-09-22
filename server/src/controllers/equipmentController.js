const prisma = require('../config/prisma');

exports.createEquipment = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });
    
    // Validate if the parent belongs to the company
    let parentCompanyId = null;
    req.body.companyId = req.user.companyId;
    
    const record = await prisma.equipment.create({ data: req.body });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyEquipments = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const records = await prisma.equipment.findMany({ where: { companyId: req.user.companyId } });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

exports.updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.equipment.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.equipment.update({
      where: { id },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
