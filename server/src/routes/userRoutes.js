const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Get all users
router.get('/', protect, userController.getAllUsers);

// Invite a new user
router.post('/invite', protect, userController.inviteUser);

// Setup password / Reset password
router.post('/setup-password', userController.setupPassword);

router.post('/verify-email', userController.verifyEmail);

module.exports = router;

