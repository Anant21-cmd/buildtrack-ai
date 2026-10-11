const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', controller.getAttendances);
router.get('/reports', controller.getReports);
router.post('/qr', controller.qrScan);
router.post('/manual', controller.manualAttendance);
router.put('/:id/verify', controller.verifyAttendance);
router.get('/:id/history', controller.getAttendanceHistory);

module.exports = router;
