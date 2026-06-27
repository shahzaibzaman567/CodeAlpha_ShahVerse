import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import api from '../api/axios'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => {})
  }, [id])

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center max-w-md mx-auto p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
        <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your order. We'll process it shortly.
        </p>
        {order && (
          <div className="bg-gray-50 dark:bg-charcoal-800 rounded-2xl p-4 mb-6 text-sm text-left space-y-2 border border-gray-100 dark:border-white/10">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-bold text-primary-500">{order.orderNumber || order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">PKR {order.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="capitalize text-green-500 font-medium">{order.orderStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Link to="/orders" className="btn-gold flex items-center justify-center gap-2">
            <Package size={16} /> View Orders
          </Link>
          <Link to="/products" className="btn-outline-gold flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
