import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-primary-400 bg-primary-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/orders${filter ? `?status=${filter}` : ''}`)
      setOrders(res.data.orders)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed') } finally { setUpdatingId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Orders <span className="text-gray-500 font-normal text-lg">({orders.length})</span></h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!filter ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>All</button>
          {statusOptions.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-charcoal-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Update'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="border-b border-white/5">{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded-full" /></td>)}</tr>)
              ) : orders.map((order, i) => (
                <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary-400 text-sm">#{order._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{order.user?.name}</p>
                    <p className="text-gray-500 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{order.orderItems?.length} items</td>
                  <td className="px-4 py-3 text-white font-medium text-sm">PKR {order.totalPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${order.isPaid ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${statusColors[order.orderStatus] || 'text-gray-400 bg-gray-400/10'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="appearance-none pl-2 pr-6 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-primary-500 cursor-pointer"
                      >
                        {statusOptions.map(s => <option key={s} value={s} className="bg-charcoal-900 capitalize">{s}</option>)}
                      </select>
                      <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
