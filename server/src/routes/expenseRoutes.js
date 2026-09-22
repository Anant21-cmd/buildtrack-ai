const express = require('express');
const router = express.Router();
const controller = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createExpense);
router.get('/', controller.getCompanyExpenses);
router.put('/:id', controller.updateExpense);

module.exports = router;
