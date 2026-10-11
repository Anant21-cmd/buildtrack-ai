const express = require('express');
const router = express.Router();
const inspectionController = require('../controllers/inspectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(inspectionController.createInspection)
  .get(inspectionController.getInspections);

router.route('/:id')
  .put(inspectionController.updateInspection);

module.exports = router;

