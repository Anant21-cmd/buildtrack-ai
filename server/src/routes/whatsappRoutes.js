const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/config', whatsappController.getConfig);
router.post('/config', whatsappController.updateConfig);
router.get('/qr-status', whatsappController.getBridgeStatus);
router.post('/restart-session', whatsappController.restartBridge);
router.post('/test', whatsappController.sendTestMessage);

module.exports = router;
