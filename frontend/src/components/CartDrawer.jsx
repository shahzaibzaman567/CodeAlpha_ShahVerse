import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { closeCart } from '../store/slices/uiSlice'
import { removeFromCart, updateQuantity, selectCartTotal } from '../store/slices/cartSlice'

export default function CartDrawer() {
  const dispatch = useDispatch()
  const { cartOpen } = useSelector((s) => s.ui)
  const { items } = useSelector((s) => s.cart)
  const { itemsTotal, shipping, tax, discount, total, itemCount } = useSelector(selectCartTotal)

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeCart())}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-charcoal-900 shadow-luxury z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary-500" />
                <h2 className="font-display text-xl font-semibold text-gray-900 dark:text-white">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <button
                    onClick={() => dispatch(closeCart())}
                    className="btn-outline-gold text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 bg-gray-50 dark:bg-white/5 rounded-xl p-3"
                  >
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </p>
                      {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                      <p className="text-primary-500 font-bold text-sm mt-1">
                        PKR {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => dispatch(updateQuantity({ index, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ index, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(index))}
                          className="ml-auto p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>PKR {itemsTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-500">Free</span> : `PKR ${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (5%)</span>
                    <span>PKR {tax.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount</span>
                      <span>-PKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="divider-gold" />
                  <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span className="gradient-text">PKR {total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="btn-gold w-full text-center block"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={() => dispatch(closeCart())}
                  className="btn-outline-gold w-full text-center block text-sm"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
