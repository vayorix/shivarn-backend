const express = require('express');
const router = express.Router();
const {
  getAllTopSellingProducts,
  getTopSellingProductById,
  createTopSellingProduct,
  updateTopSellingProduct,
  deleteTopSellingProduct,
  upload
} = require('../controllers/topSellingController');

// Public routes
router.get('/', getAllTopSellingProducts);
router.get('/:id', getTopSellingProductById);

// Admin routes (protected)
router.post('/', upload.single('image'), createTopSellingProduct);
router.put('/:id', upload.single('image'), updateTopSellingProduct);
router.delete('/:id', deleteTopSellingProduct);

module.exports = router;