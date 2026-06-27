const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const stripe = require('../config/stripe');
const asyncHandler = require('express-async-handler');

// @desc  Create order & payment intent
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ success: false, message: 'No order items' });
  }

  // Verify products and calculate prices
  let itemsPrice = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}`,
      });
    }

    const price = product.price;
    itemsPrice += price * item.quantity;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
    });
  }

  // Shipping
  const shippingPrice = itemsPrice > 5000 ? 0 : 200;
  // Tax (5%)
  const taxPrice = Math.round(itemsPrice * 0.05);

  // Coupon discount
  let discountAmount = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(itemsPrice, req.user.id);
      if (validity.valid) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
        appliedCoupon = coupon;
      }
    }
  }

  const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discountAmount,
    couponCode: appliedCoupon ? appliedCoupon.code : '',
    totalPrice,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
  });

  // Update stock
  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  // Update coupon usage
  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    appliedCoupon.usedBy.push(req.user.id);
    await appliedCoupon.save();
  }

  // Create Stripe Payment Intent if stripe payment
  let clientSecret = null;
  if (paymentMethod === 'stripe') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice), // PKR has no sub-unit, amount in rupees directly
      currency: 'usd', // using usd for Stripe test compatibility (1 USD ~ symbolic)
      metadata: { orderId: order._id.toString(), userId: req.user.id.toString() },
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();
    clientSecret = paymentIntent.client_secret;
  }

  res.status(201).json({
    success: true,
    order,
    clientSecret,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// @desc  Confirm payment
// @route PUT /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'confirmed';
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.update_time,
    emailAddress: req.body.email_address,
  };
  order.statusHistory.push({ status: 'confirmed', note: 'Payment confirmed' });
  await order.save();

  res.status(200).json({ success: true, order });
});

// @desc  Get my orders
// @route GET /api/orders/my
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('orderItems.product', 'name images slug')
    .sort('-createdAt');
  res.status(200).json({ success: true, orders });
});

// @desc  Get single order
// @route GET /api/orders/:id
// @access Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images slug');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  res.status(200).json({ success: true, order });
});

// @desc  Get all orders (Admin)
// @route GET /api/orders
// @access Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = {};
  if (status) query.orderStatus = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.status(200).json({ success: true, orders, total, pages: Math.ceil(total / limit) });
});

// @desc  Update order status (Admin)
// @route PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || '' });

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();
  res.status(200).json({ success: true, order });
});

// @desc  Get order analytics (Admin)
// @route GET /api/orders/analytics
// @access Admin
const getOrderAnalytics = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  const revenueByMonth = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      revenueByMonth,
      topProducts,
    },
  });
});

module.exports = {
  createOrder,
  updateOrderToPaid,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderAnalytics,
};
