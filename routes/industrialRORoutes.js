const express = require('express');
const router = express.Router();
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/industrialROController');

// Generic routes for all industrial RO products
router.get('/:type', getProducts);
router.post('/:type', createProduct);
router.put('/:type/:id', updateProduct);
router.delete('/:type/:id', deleteProduct);

module.exports = router;