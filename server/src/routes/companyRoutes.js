const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.post('/register', companyController.registerCompany);

// Company Admin update current company route
router.put('/current', protect, companyController.updateCurrentCompany);

// Protected Super Admin Routes
router.use(protect);
router.use(superAdminOnly);

router.get('/', companyController.getAllCompanies);
router.put('/:id/approve', companyController.approveCompany);
router.put('/:id/reject', companyController.rejectCompany);
router.put('/:id/suspend', companyController.suspendCompany);
router.get('/audit-logs', companyController.getAuditLogs);

module.exports = router;

