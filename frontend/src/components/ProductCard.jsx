import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { addToCart } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const [wishListed, setWishListed] = useState(
    user?.wishlist?.includes(product._id)
  )
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const handleAddToCart = (e) => {
    e.preventDefault()
    dispatch(addToCart({ product, quantity: 1 }))
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login to add to wishlist'); return }
    if (wishlistLoading) return
    setWishlistLoading(true)
    try {
      await api.put(`/users/wishlist/${product._id}`)
      setWishListed((prev) => {
        toast.success(prev ? 'Removed from wishlist' : 'Added to wishlist')
        return !prev
      })
    } catch {
      toast.error('Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/products/${product.slug || product._id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-charcoal-800 aspect-[3/4]">
          {/* Image */}
          <img
            src={product.images?.[imgIdx]?.url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onMouseEnter={() => product.images?.length > 1 && setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-charcoal-900/90 text-white text-xs font-medium px-2 py-1 rounded-full">
                New
              </span>
            )}
            {product.isTrending && (
              <span className="bg-gradient-gold text-white text-xs font-medium px-2 py-1 rounded-full">
                Trending
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center shadow-lg transition-all ${
                wishListed
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 dark:bg-charcoal-800/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={wishListed ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-charcoal-900/90 backdrop-blur-sm text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-500 transition-colors"
            >
              <ShoppingBag size={14} />
              Quick Add
            </button>
          </div>

          {/* Low stock */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-3 left-3">
              <span className="bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full">
                Only {product.stock} left
              </span>
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-full text-sm">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 px-1">
          <p className="text-xs text-primary-500 font-medium mb-0.5">
            {product.category?.name || product.gender}
          </p>
          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight mb-1.5 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">
                PKR {product.price?.toLocaleString()}
              </span>
              {product.comparePrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  PKR {product.comparePrice?.toLocaleString()}
                </span>
              )}
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={12} className="text-gold-500 fill-current" />
                <span className="text-xs text-gray-500">{product.rating}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
