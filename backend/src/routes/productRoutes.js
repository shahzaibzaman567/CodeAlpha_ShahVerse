const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getFeaturedProducts,
  addReview, createProduct, updateProduct,
  deleteProduct, getProductStats,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/stats', protect, authorize('admin'), getProductStats);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
