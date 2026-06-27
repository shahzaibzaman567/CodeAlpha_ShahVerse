const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc  Get all users (Admin)
// @route GET /api/users
// @access Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = {};
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, users, total, pages: Math.ceil(total / limit) });
});

// @desc  Get single user (Admin)
// @route GET /api/users/:id
// @access Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, user });
});

// @desc  Update user role (Admin)
// @route PUT /api/users/:id
// @access Admin
const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role, isActive },
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, user });
});

// @desc  Delete user (Admin)
// @route DELETE /api/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc  Toggle wishlist
// @route PUT /api/users/wishlist/:productId
// @access Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const productId = req.params.productId;
  const index = user.wishlist.indexOf(productId);

  if (index === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(index, 1);
  }

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    wishlist: user.wishlist,
    message: index === -1 ? 'Added to wishlist' : 'Removed from wishlist',
  });
});

// @desc  Get user stats (Admin)
// @route GET /api/users/stats
// @access Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const newUsersThisMonth = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  const usersByMonth = await User.aggregate([
    { $match: { role: 'user' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({ success: true, stats: { totalUsers, newUsersThisMonth, usersByMonth } });
});

module.exports = { getAllUsers, getUser, updateUser, deleteUser, toggleWishlist, getUserStats };
