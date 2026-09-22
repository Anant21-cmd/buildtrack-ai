const express = require('express');
const router = express.Router();
const controller = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', controller.createEquipment);
router.get('/', controller.getCompanyEquipments);
router.put('/:id', controller.updateEquipment);

module.exports = router;
