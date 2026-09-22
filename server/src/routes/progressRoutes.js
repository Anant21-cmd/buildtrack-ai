const express = require('express');
const router = express.Router();
const controller = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createDailyProgress);
router.get('/', controller.getCompanyDailyProgresss);
router.put('/:id', controller.updateDailyProgress);

module.exports = router;
