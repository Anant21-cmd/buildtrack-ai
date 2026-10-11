const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(safetyController.createSafetyReport)
  .get(safetyController.getSafetyReports);

router.route('/:id')
  .put(safetyController.updateSafetyReport);

module.exports = router;

