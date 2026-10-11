const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, reportController.createReport);
router.get('/', protect, reportController.getReports);

router.post('/photos', protect, reportController.createPhoto);
router.get('/photos', protect, reportController.getPhotos);
router.delete('/photos/:id', protect, reportController.deletePhoto);

module.exports = router;

