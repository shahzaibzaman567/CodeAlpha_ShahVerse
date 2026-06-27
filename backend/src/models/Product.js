const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: { type: String, maxlength: 300 },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: { type: Number, default: 0 },
    images: [
      {
        public_id: { type: String },
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, default: 0 },
      },
    ],
    colors: [
      {
        name: { type: String },
        hex: { type: String },
      },
    ],
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    brand: { type: String, default: 'ShahVerse' },
    material: { type: String },
    gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids'], default: 'Unisex' },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
);

// Generate slug before save
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' + Date.now();
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = (total / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

// Indexes for search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isTrending: 1 });

module.exports = mongoose.model('Product', productSchema);
