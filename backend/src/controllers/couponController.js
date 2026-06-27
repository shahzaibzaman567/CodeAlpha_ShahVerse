const Coupon = require('../models/Coupon');
const asyncHandler = require('express-async-handler');

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.status(200).json({ success: true, coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.status(200).json({ success: true, coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  await coupon.deleteOne();
  res.status(200).json({ success: true, message: 'Coupon deleted' });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });

  const validity = coupon.isValid(orderAmount, req.user.id);
  if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

  const discount = coupon.calculateDiscount(orderAmount);
  res.status(200).json({ success: true, discount, coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue } });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
