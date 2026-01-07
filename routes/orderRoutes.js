const express = require('express');
const router = express.Router();
const {
  getOrders,
  getUserOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

router.get('/', getOrders);
router.get('/user-orders', getUserOrders);
router.post('/', createOrder);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

module.exports = router;