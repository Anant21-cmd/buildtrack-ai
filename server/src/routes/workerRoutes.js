const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', workerController.createWorker);
router.get('/', workerController.getCompanyWorkers);
router.put('/:id', workerController.updateWorker);

module.exports = router;

