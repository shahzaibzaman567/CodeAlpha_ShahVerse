const express = require('express');
const router = express.Router();
const {
  createOrder, updateOrderToPaid, getMyOrders,
  getOrder, getAllOrders, updateOrderStatus, getOrderAnalytics,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyOrders);
router.get('/analytics', protect, authorize('admin'), getOrderAnalytics);
router.get('/', protect, authorize('admin'), getAllOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
