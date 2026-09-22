const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

router.post('/register', companyController.registerCompany);

// Protected Super Admin Routes
router.use(protect);
router.use(superAdminOnly);

router.get('/', companyController.getAllCompanies);
router.put('/:id/approve', companyController.approveCompany);
router.put('/:id/reject', companyController.rejectCompany);
router.get('/audit-logs', companyController.getAuditLogs);

module.exports = router;

