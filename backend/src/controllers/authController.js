const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  
  // Safe default to 30 days if JWT_COOKIE_EXPIRE is not defined or is not a valid number
  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRE) || 30;
  const options = {
    expires: new Date(Date.now() + cookieDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    addresses: user.addresses,
    wishlist: user.wishlist,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: userObj,
  });
};

// @desc  Register user
// @route POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Create user in a single save round-trip with lastLogin set to now
  const user = await User.create({
    name,
    email,
    password,
    lastLogin: Date.now()
  });

  sendTokenResponse(user, 201, res);
});


// @desc  Login user
// @route POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc  Logout
// @route POST /api/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc  Get current user
// @route GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name price images');
  res.status(200).json({ success: true, user });
});

// @desc  Update profile
// @route PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addresses } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, addresses },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, user });
});

// @desc  Change password
// @route PUT /api/auth/password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
