const prisma = require('../config/prisma');

exports.createVendor = async (req, res, next) => {
  try {
    const { name, category, contactPerson, email, phone, address, rating, status } = req.body;

    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category,
        contactPerson,
        email,
        phone,
        address,
        rating: rating ? Number(rating) : 5.0,
        status: status || 'ACTIVE',
        companyId: req.user.companyId
      }
    });

    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

exports.getCompanyVendors = async (req, res, next) => {
  try {
    if (!req.user.companyId) return res.status(403).json({ message: 'Must belong to a company' });

    const vendors = await prisma.vendor.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: 'asc' }
    });

    res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({ where: { id } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    if (vendor.companyId !== req.user.companyId) return res.status(403).json({ message: 'Not authorized' });

    const updated = await prisma.vendor.update({
      where: { id },
      data: req.body
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
