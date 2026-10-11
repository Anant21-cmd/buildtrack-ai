const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialRequestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/requirements', controller.getRequirements);
router.post('/', controller.createMaterialRequest);
router.get('/', controller.getCompanyMaterialRequests);
router.put('/:id/status', controller.updateStatus);

module.exports = router;
