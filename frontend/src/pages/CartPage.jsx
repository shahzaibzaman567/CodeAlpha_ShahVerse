import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, X } from 'lucide-react'
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon, selectCartTotal } from '../store/slices/cartSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function CartPage() {
  const dispatch = useDispatch()
  const { items, coupon } = useSelector((s) => s.cart)
  const { itemsTotal, shipping, tax, discount, total, itemCount } = useSelector(selectCartTotal)
  const { user } = useSelector((s) => s.auth)
  const [couponCode, setCouponCode] = useState('')
  const [loadingCoupon, setLoadingCoupon] = useState(false)

  const handleCoupon = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to apply coupon'); return }
    setLoadingCoupon(true)
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: itemsTotal })
      dispatch(applyCoupon({ coupon: res.data.coupon, discount: res.data.discount }))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
    } finally { setLoadingCoupon(false) }
  }

  if (items.length === 0) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Discover our premium collections and add something special</p>
        <Link to="/products" className="btn-gold px-8">Start Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-10">
        <h1 className="font-display text-4xl font-light text-gray-900 dark:text-white mb-8">
          Shopping Cart <span className="text-gray-400 text-2xl">({itemCount} items)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="flex gap-5 p-4 bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5"
                >
                  <Link to={`/products/${item.product.slug || item.product._id}`}>
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.name}
                      className="w-24 h-28 object-cover rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-primary-500 font-medium mb-0.5">{item.product.category?.name}</p>
                        <Link to={`/products/${item.product.slug || item.product._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-500 transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <div className="flex gap-2 mt-1 text-sm text-gray-500">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(index))}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                        <button onClick={() => dispatch(updateQuantity({ index, quantity: item.quantity - 1 }))} className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <Minus size={13} />
                        </button>
                        <span className="px-4 text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ index, quantity: item.quantity + 1 }))} className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">PKR {(item.product.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">PKR {item.product.price?.toLocaleString()} each</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>PKR {itemsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-500 font-medium">Free</span> : `PKR ${shipping}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add PKR {(5000 - itemsTotal).toLocaleString()} more for free shipping</p>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (5%)</span>
                  <span>PKR {tax.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Coupon ({coupon?.code})
                      <button onClick={() => dispatch(removeCoupon())} className="text-red-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                    <span>-PKR {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="divider-gold" />
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="gradient-text text-lg">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon */}
              {!coupon && (
                <form onSubmit={handleCoupon} className="flex gap-2 mt-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="COUPON CODE"
                    className="input-luxury text-sm flex-1 py-2.5"
                  />
                  <button type="submit" disabled={loadingCoupon} className="btn-outline-gold text-sm px-4 py-2.5 flex-shrink-0">
                    Apply
                  </button>
                </form>
              )}

              <Link to="/checkout" className="btn-gold w-full text-center mt-4 py-3.5 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-primary-500 transition-colors mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
