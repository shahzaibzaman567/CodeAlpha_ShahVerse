const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');

// @desc  Get all products with filtering, sorting, pagination
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, sort = '-createdAt',
    category, gender, minPrice, maxPrice,
    search, isFeatured, isNewArrival, isTrending,
    brand, tags,
  } = req.query;

  const query = { isActive: true };

  if (category) query.category = category;
  if (gender) query.gender = gender;
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (isFeatured === 'true') query.isFeatured = true;
  if (isNewArrival === 'true') query.isNewArrival = true;
  if (isTrending === 'true') query.isTrending = true;
  if (tags) query.tags = { $in: tags.split(',') };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    products,
  });
});

// @desc  Get single product
// @route GET /api/products/:id
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [
      { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
      { slug: req.params.id },
    ],
    isActive: true,
  })
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.status(200).json({ success: true, product });
});

// @desc  Get featured products
// @route GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name slug')
    .limit(8)
    .sort('-createdAt');
  res.status(200).json({ success: true, products });
});

// @desc  Add review
// @route POST /api/products/:id/reviews
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user.id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: 'You already reviewed this product' });
  }

  product.reviews.push({
    user: req.user.id,
    name: req.user.name,
    avatar: req.user.avatar?.url,
    rating: Number(rating),
    comment,
  });

  product.calculateAverageRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added', product });
});

// @desc  Create product (Admin)
// @route POST /api/products
// @access Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc  Update product (Admin)
// @route PUT /api/products/:id
// @access Admin
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, product });
});

// @desc  Delete product (Admin)
// @route DELETE /api/products/:id
// @access Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted' });
});

// @desc  Get product stats (Admin)
// @route GET /api/products/stats
// @access Admin
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' },
        totalSold: { $sum: '$soldCount' },
      },
    },
  ]);
  res.status(200).json({ success: true, stats: stats[0] });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  addReview,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
};
