const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', controller.getNotifications);
router.put('/mark-all-read', controller.markAllAsRead);
router.delete('/clear-all', controller.clearAll);
router.put('/:id/read', controller.markAsRead);

module.exports = router;

