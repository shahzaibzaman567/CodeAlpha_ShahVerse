import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { getMe } from '../store/slices/authSlice'
import { addToCart } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.wishlist?.length > 0) {
      api.get('/auth/me').then(r => {
        setWishlist(r.data.user.wishlist || [])
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleRemove = async (productId) => {
    try {
      await api.put(`/users/wishlist/${productId}`)
      setWishlist(wishlist.filter(p => p._id !== productId))
      dispatch(getMe())
      toast.success('Removed from wishlist')
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="pt-20 page-container py-10"><div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="shimmer aspect-[3/4] rounded-2xl" />)}</div></div>

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-10">
        <h1 className="font-display text-4xl font-light text-gray-900 dark:text-white mb-8">
          My Wishlist <span className="text-gray-400 text-2xl">({wishlist.length})</span>
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-4">Your wishlist is empty</p>
            <Link to="/products" className="btn-gold">Discover Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlist.map((product, i) => (
              <motion.div key={product._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="group relative">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gray-100 dark:bg-charcoal-800">
                  <Link to={`/products/${product.slug || product._id}`}>
                    <img src={product.images?.[0]?.url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <button onClick={() => handleRemove(product._id)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-charcoal-800/90 rounded-full flex items-center justify-center text-red-500 shadow-lg">
                    <Heart size={15} fill="currentColor" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button onClick={() => dispatch(addToCart({ product, quantity: 1 }))} className="w-full bg-charcoal-900/90 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-500 transition-colors">
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{product.name}</p>
                  <p className="font-bold text-primary-500 mt-1">PKR {product.price?.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
