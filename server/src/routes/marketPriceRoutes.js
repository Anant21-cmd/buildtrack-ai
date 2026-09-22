const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPriceController');
const { protect } = require('../middleware/authMiddleware');

// Custom authorize middleware for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

router.use(protect);

// Anyone can view market prices (including clients)
router.get('/', marketPriceController.getMarketPrices);
router.get('/sources', marketPriceController.getSources);
router.get('/:id', marketPriceController.getMarketPriceById);
router.get('/history/:materialId', marketPriceController.getPriceHistory);
router.get('/trends/:materialId', marketPriceController.getPriceTrends);

// Only Super Admin and Company Admin can trigger updates manually
router.post('/update-now', authorize('SUPER_ADMIN', 'COMPANY_ADMIN'), marketPriceController.triggerManualUpdate);
router.put('/:id', authorize('SUPER_ADMIN', 'COMPANY_ADMIN'), marketPriceController.updateMarketPrice);

module.exports = router;
