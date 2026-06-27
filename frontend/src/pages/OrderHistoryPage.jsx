import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import api from '../api/axios'

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10', label: 'Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10', label: 'Confirmed' },
  processing: { icon: Package, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500 bg-green-50 dark:bg-green-500/10', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-500/10', label: 'Cancelled' },
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="pt-20 page-container py-10">
      <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}</div>
    </div>
  )

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-10">
        <h1 className="font-display text-4xl font-light text-gray-900 dark:text-white mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-4">No orders yet</p>
            <Link to="/products" className="btn-gold">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = statusConfig[order.orderStatus] || statusConfig.pending
              const StatusIcon = status.icon
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/orders/${order._id}`}
                    className="block bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {order.orderItems?.slice(0, 3).map((item, j) => (
                            <img key={j} src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border-2 border-white dark:border-charcoal-800" />
                          ))}
                          {order.orderItems?.length > 3 && (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/10 border-2 border-white dark:border-charcoal-800 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{order.orderItems.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">{order.orderItems?.length} items · {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900 dark:text-white">PKR {order.totalPrice?.toLocaleString()}</p>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
