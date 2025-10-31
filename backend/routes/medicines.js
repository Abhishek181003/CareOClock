const express = require('express');
const { getMedicines, createMedicine, updateMedicine, deleteMedicine, getLowStockMedicines } = require('../controllers/medicineController');
const { protect, checkResourceAccess } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);

// Routes without userId
router.get('/', checkResourceAccess(), getMedicines);
router.post('/', checkResourceAccess(), createMedicine);
router.get('/low-stock', checkResourceAccess(), getLowStockMedicines);

// Routes with userId
router.get('/:userId', checkResourceAccess(), getMedicines);
router.post('/:userId', checkResourceAccess(), createMedicine);
router.get('/low-stock/:userId', checkResourceAccess(), getLowStockMedicines);

router.patch('/:id', updateMedicine);
router.delete('/:id', deleteMedicine);

module.exports = router;
