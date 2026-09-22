const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', vendorController.createVendor);
router.get('/', vendorController.getCompanyVendors);
router.put('/:id', vendorController.updateVendor);

module.exports = router;
