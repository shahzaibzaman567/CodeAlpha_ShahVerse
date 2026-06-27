import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Check, Truck, Shield, RotateCcw } from 'lucide-react'
import { fetchProduct } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { currentProduct: product, loading } = useSelector((s) => s.products)
  const { user } = useSelector((s) => s.auth)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [tab, setTab] = useState('description')

  useEffect(() => {
    dispatch(fetchProduct(id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  useEffect(() => {
    if (product && user) {
      setWishlisted(user?.wishlist?.some(id => id === product._id || id?._id === product._id))
    }
  }, [product, user])

  if (loading) return (
    <div className="pt-20 page-container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="shimmer aspect-square rounded-2xl" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="shimmer h-6 rounded-full" style={{ width: `${80 - i * 10}%` }} />)}
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="pt-20 text-center py-20">
      <p className="text-gray-500">Product not found</p>
      <Link to="/products" className="btn-gold mt-4 inline-block">Back to Products</Link>
    </div>
  )

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }
    dispatch(addToCart({ product, quantity, size: selectedSize, color: selectedColor }))
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return }
    try {
      await api.put(`/users/wishlist/${product._id}`)
      setWishlisted(!wishlisted)
    } catch { toast.error('Failed') }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to review'); return }
    setSubmittingReview(true)
    try {
      await api.post(`/products/${product._id}/reviews`, { rating: reviewRating, comment: reviewText })
      toast.success('Review submitted!')
      setReviewText('')
      dispatch(fetchProduct(id))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSubmittingReview(false) }
  }

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="page-container py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-500 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate max-w-40">{product.name}</span>
        </nav>
      </div>

      <div className="page-container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-charcoal-800">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images?.[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </div>
              )}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === i ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
            <div>
              <Link to={`/products?category=${product.category?._id}`} className="text-primary-500 text-sm font-medium hover:text-primary-400 transition-colors">
                {product.category?.name}
              </Link>
              <h1 className="font-display text-3xl md:text-4xl font-light text-gray-900 dark:text-white mt-1 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(product.rating) ? 'text-gold-500 fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{product.rating} ({product.numReviews} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">PKR {product.price?.toLocaleString()}</span>
                {product.comparePrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">PKR {product.comparePrice?.toLocaleString()}</span>
                    <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">Save {discount}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Color: <span className="font-normal text-gray-500">{selectedColor || 'Select'}</span>
                </p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === c.name ? 'border-primary-500 scale-110' : 'border-white dark:border-charcoal-800 shadow'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Size: <span className="font-normal text-gray-500">{selectedSize || 'Select'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      disabled={s.stock === 0}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedSize === s.size
                          ? 'bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 border-charcoal-900 dark:border-white'
                          : s.stock === 0
                          ? 'border-gray-200 dark:border-white/10 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through'
                          : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-bold text-lg">−</button>
                  <span className="px-5 py-2 font-semibold text-gray-900 dark:text-white min-w-10 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-bold text-lg">+</button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-gold flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  wishlisted
                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-500'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders PKR 5000+' },
                { icon: Shield, label: 'Secure Payment', sub: 'SSL Encrypted' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <Icon size={20} className="text-primary-500 mb-1" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            {(product.material || product.brand) && (
              <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                {product.material && <p><span className="font-medium text-gray-900 dark:text-white">Material:</span> {product.material}</p>}
                {product.brand && <p><span className="font-medium text-gray-900 dark:text-white">Brand:</span> {product.brand}</p>}
                {product.sku && <p><span className="font-medium text-gray-900 dark:text-white">SKU:</span> {product.sku}</p>}
              </div>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 dark:border-white/10 mb-8 gap-6">
            {['description', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  tab === t ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {t === 'reviews' ? `Reviews (${product.numReviews || 0})` : t}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
            </motion.div>
          )}

          {tab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Reviews list */}
              <div className="space-y-4 mb-10">
                {product.reviews?.length === 0 && <p className="text-gray-500 italic">No reviews yet. Be the first!</p>}
                {product.reviews?.map((r, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-charcoal-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {r.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={11} className={j < r.rating ? 'text-gold-500 fill-current' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                  </div>
                ))}
              </div>

              {/* Write review */}
              {user && (
                <form onSubmit={handleReview} className="max-w-lg space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Write a Review</h3>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((s) => (
                      <button type="button" key={s} onClick={() => setReviewRating(s)}>
                        <Star size={24} className={s <= reviewRating ? 'text-gold-500 fill-current' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    required
                    className="input-luxury resize-none"
                  />
                  <button type="submit" disabled={submittingReview} className="btn-gold disabled:opacity-50">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
              {!user && <p className="text-gray-500"><Link to="/login" className="text-primary-500 hover:underline">Login</Link> to write a review</p>}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
