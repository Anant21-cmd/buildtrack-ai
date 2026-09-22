const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createAttendance);
router.get('/', controller.getCompanyAttendances);
router.put('/:id', controller.updateAttendance);

module.exports = router;
