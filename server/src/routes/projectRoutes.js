const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', projectController.createProject);
router.get('/', projectController.getCompanyProjects);
router.put('/:id', projectController.updateProject);

module.exports = router;

