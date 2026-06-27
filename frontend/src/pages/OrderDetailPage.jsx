import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, MapPin, CreditCard, CheckCircle } from 'lucide-react'
import api from '../api/axios'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="pt-20 page-container py-10"><div className="shimmer h-64 rounded-2xl" /></div>
  if (!order) return <div className="pt-20 text-center py-20 text-gray-500">Order not found</div>

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-10">
        <Link to="/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white">
            Order #{order._id?.slice(-8).toUpperCase()}
          </h1>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600 dark:bg-green-500/10' :
            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
            'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
          }`}>
            {order.orderStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Items */}
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Package size={16} className="text-primary-500" /> Items</h3>
              <div className="space-y-4">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.size && `Size: ${item.size}`} × {item.quantity}</p>
                    </div>
                    <p className="font-bold">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MapPin size={16} className="text-primary-500" /> Shipping Address</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                {order.shippingAddress?.country}<br />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-gray-100 dark:border-white/5 h-fit space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>PKR {order.itemsPrice?.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `PKR ${order.shippingPrice}`}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>PKR {order.taxPrice?.toLocaleString()}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-PKR {order.discountAmount?.toLocaleString()}</span></div>}
              <div className="divider-gold" />
              <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white"><span>Total</span><span className="gradient-text">PKR {order.totalPrice?.toLocaleString()}</span></div>
            </div>
            <div className="pt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between"><span>Payment</span><span className="capitalize">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span>Paid</span><span className={order.isPaid ? 'text-green-500' : 'text-yellow-500'}>{order.isPaid ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
