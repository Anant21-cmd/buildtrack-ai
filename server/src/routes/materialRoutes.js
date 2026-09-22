const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', materialController.createMaterial);
router.get('/', materialController.getCompanyMaterials);
router.put('/:id', materialController.updateMaterial);

module.exports = router;
