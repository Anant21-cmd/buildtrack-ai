const prisma = require('../config/prisma');

exports.createMaterial = async (req, res, next) => {
  try {
    const { name, category, sku, unit, unitCost, currentStock, minStock } = req.body;
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const material = await prisma.material.create({
      data: {
        name,
        category,
        unit,
        stock: Number(currentStock) || 0,
        minThreshold: Number(minStock) || 0,
        companyId: req.user.companyId
      }
    });
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyMaterials = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const materials = await prisma.material.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: 'asc' }
    });

    const mapped = materials.map(m => ({
      ...m,
      currentStock: m.stock,
      minStock: m.minThreshold,
      unitCost: 10.00 // mock since db doesn't have it
    }));
    res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

exports.updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.findUnique({ where: { id } });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.companyId !== req.user.companyId) return res.status(403).json({ message: 'Not authorized' });

    const updateData = { ...req.body };
    if (updateData.unitPrice !== undefined) updateData.unitPrice = Number(updateData.unitPrice);
    if (updateData.stockLevel !== undefined) updateData.stockLevel = Number(updateData.stockLevel);
    if (updateData.minStockLevel !== undefined) updateData.minStockLevel = Number(updateData.minStockLevel);

    const updated = await prisma.material.update({
      where: { id },
      data: updateData
    });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
