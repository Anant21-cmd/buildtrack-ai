const prisma = require('../config/prisma');

exports.getMarketPrices = async (req, res, next) => {
  try {
    const { category, city } = req.query;
    
    // Filter logic
    const where = {};
    if (city) where.city = city;
    
    const prices = await prisma.materialMarketPrice.findMany({
      where,
      orderBy: { materialName: 'asc' },
    });
    
    res.status(200).json(prices);
  } catch (error) {
    next(error);
  }
};

exports.getMarketPriceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const price = await prisma.materialMarketPrice.findUnique({
      where: { id },
      include: { history: { orderBy: { retrievedAt: 'desc' }, take: 10 } }
    });
    
    if (!price) return res.status(404).json({ message: 'Market price not found' });
    res.status(200).json(price);
  } catch (error) {
    next(error);
  }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const history = await prisma.materialPriceHistory.findMany({
      where: { marketPriceId: materialId },
      orderBy: { retrievedAt: 'asc' },
    });
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

exports.getPriceTrends = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const history = await prisma.materialPriceHistory.findMany({
      where: { marketPriceId: materialId },
      orderBy: { retrievedAt: 'asc' },
    });
    
    // Simple trends mapping for chart format
    const trends = history.map(h => ({
      date: h.retrievedAt.toISOString().split('T')[0],
      price: h.price
    }));
    
    res.status(200).json(trends);
  } catch (error) {
    next(error);
  }
};

exports.getSources = async (req, res, next) => {
  try {
    const sources = await prisma.materialMarketPrice.findMany({
      select: { sourceName: true },
      distinct: ['sourceName']
    });
    res.status(200).json(sources.map(s => s.sourceName).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

exports.updateMarketPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const price = await prisma.materialMarketPrice.update({
      where: { id },
      data: updateData
    });
    
    res.status(200).json(price);
  } catch (error) {
    next(error);
  }
};

// Mock triggering manual Google search update
exports.triggerManualUpdate = async (req, res, next) => {
  try {
    // In a real scenario, this would trigger the backend web scraper/API call service
    // For now, we mock the success response.
    res.status(200).json({ message: 'Market price update job triggered successfully.' });
  } catch (error) {
    next(error);
  }
};

