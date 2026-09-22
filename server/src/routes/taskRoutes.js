const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createTask);
router.get('/', controller.getCompanyTasks);
router.put('/:id', controller.updateTask);

module.exports = router;
