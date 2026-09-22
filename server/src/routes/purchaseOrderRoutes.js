const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', purchaseOrderController.createPurchaseOrder);
router.get('/', purchaseOrderController.getCompanyPurchaseOrders);
router.put('/:id', purchaseOrderController.updatePurchaseOrder);
router.post('/:id/receive', purchaseOrderController.receiveMaterial);
router.get('/receipts/all', purchaseOrderController.getAllReceipts);

module.exports = router;
