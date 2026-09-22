const express = require('express');
const router = express.Router();
const controller = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createIssue);
router.get('/', controller.getCompanyIssues);
router.put('/:id', controller.updateIssue);

module.exports = router;
