const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialRequestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/requirements', controller.getRequirements);
router.post('/', controller.createMaterialRequest);
router.get('/', controller.getCompanyMaterialRequests);
router.put('/:id/approve', controller.approveRequest);
router.put('/:id/reject', controller.rejectRequest);
router.put('/:id/issue', controller.issueMaterial);

module.exports = router;
