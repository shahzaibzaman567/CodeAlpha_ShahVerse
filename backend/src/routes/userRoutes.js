const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateUser, deleteUser, toggleWishlist, getUserStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/wishlist/:productId', protect, toggleWishlist);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
