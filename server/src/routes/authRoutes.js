const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/seed-admin', authController.seedSuperAdmin);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;

