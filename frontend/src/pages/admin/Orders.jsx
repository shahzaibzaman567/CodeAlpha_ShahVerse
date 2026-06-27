import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, RefreshCw, Eye, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusConfig = {
  pending:    { color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  dot: 'bg-yellow-400'  },
  confirmed:  { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/30',    dot: 'bg-blue-400'    },
  processing: { color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30',  dot: 'bg-purple-400'  },
  shipped:    { color: 'text-primary-400', bg: 'bg-primary-400/10', border: 'border-primary-400/30', dot: 'bg-primary-400' },
  delivered:  { color: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/30',   dot: 'bg-green-400'   },
  cancelled:  { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     dot: 'bg-red-400'     },
}

// Status badge component
function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full capitalize font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {status}
    </span>
  )
}

// Order detail modal
function OrderModal({ order, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(order.orderStatus)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    if (newStatus === order.orderStatus) { onClose(); return }
    setUpdating(true)
    try {
      await api.put(`/orders/${order._id}/status`, { status: newStatus })
      onStatusChange(order._id, newStatus)
      toast.success(`Status updated to "${newStatus}"`)
      onClose()
    } catch (err) {
      console.error('handleUpdate error:', err?.response?.status, err?.response?.data)
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
    finally { setUpdating(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-charcoal-800 rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <p className="text-white font-semibold">Order Details</p>
            <p className="text-primary-400 font-mono text-xs mt-0.5">#{order._id?.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer */}
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {order.user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{order.user?.name}</p>
              <p className="text-gray-500 text-xs">{order.user?.email}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white font-bold">PKR {order.totalPrice?.toLocaleString()}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Items ({order.orderItems?.length})
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scroll">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.size && `Size: ${item.size} ·`} Qty: {item.quantity}</p>
                  </div>
                  <p className="text-gray-300 text-xs font-semibold flex-shrink-0">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          {order.shippingAddress && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Shipping Address</p>
              <p className="text-gray-300 text-sm bg-white/5 rounded-xl px-3 py-2">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                {order.shippingAddress.phone && ` · ${order.shippingAddress.phone}`}
              </p>
            </div>
          )}

          {/* Status update */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((s) => {
                const cfg = statusConfig[s]
                const isSelected = newStatus === s
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                      isSelected
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} scale-105`
                        : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10 hover:text-gray-300'
                    }`}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isSelected ? cfg.dot : 'bg-gray-600'}`} />
                    {s}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
              : 'Save Status'
            }
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/orders?limit=100${filter ? `&status=${filter}` : ''}`)
      setOrders(res.data.orders || [])
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter])

  // Optimistic status update — no re-fetch needed
  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o)
    )
  }

  // Quick inline status update from select
  const quickUpdate = async (orderId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return
    // Optimistic update immediately
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Status → ${newStatus}`)
    } catch (err) {
      // Rollback on failure
      console.error('quickUpdate error:', err?.response?.status, err?.response?.data)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: currentStatus } : o))
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  const filtered = orders.filter(o =>
    !search ||
    o._id?.slice(-8).toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} orders</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer..."
            className="input-luxury pl-9 text-sm bg-charcoal-800 border-white/10 text-white placeholder-gray-600 w-full sm:w-64"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              !filter ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({orders.length})
          </button>
          {statusOptions.map(s => {
            const count = orders.filter(o => o.orderStatus === s).length
            const cfg = statusConfig[s]
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? '' : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  filter === s
                    ? `${cfg.bg} ${cfg.color} border border-current/30`
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {s} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Quick Update', 'Detail'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="shimmer h-4 rounded-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Order ID */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-primary-400 text-sm font-semibold">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <p className="text-white text-sm font-medium truncate max-w-32">{order.user?.name}</p>
                      <p className="text-gray-500 text-xs truncate max-w-32">{order.user?.email}</p>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3.5 text-gray-400 text-sm">
                      {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3.5 text-white font-semibold text-sm whitespace-nowrap">
                      PKR {order.totalPrice?.toLocaleString()}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.isPaid
                          ? 'text-green-400 bg-green-400/10'
                          : 'text-yellow-400 bg-yellow-400/10'
                      }`}>
                        {order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                      </span>
                    </td>

                    {/* Status badge — updates instantly */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.orderStatus} />
                    </td>

                    {/* Quick update dropdown */}
                    <td className="px-4 py-3.5">
                      <div className="relative inline-block">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => quickUpdate(order._id, e.target.value, order.orderStatus)}
                          className={`appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all capitalize ${
                            statusConfig[order.orderStatus]
                              ? `${statusConfig[order.orderStatus].bg} ${statusConfig[order.orderStatus].color} ${statusConfig[order.orderStatus].border}`
                              : 'bg-white/5 text-gray-400 border-white/10'
                          }`}
                        >
                          {statusOptions.map(s => (
                            <option key={s} value={s} className="bg-charcoal-900 text-white capitalize">
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={11} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig[order.orderStatus]?.color || 'text-gray-500'}`} />
                      </div>
                    </td>

                    {/* Detail button */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-primary-500/10 text-gray-400 hover:text-primary-400 text-xs font-medium transition-all"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
