import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Package, DollarSign, TrendingUp, Clock, CheckCircle, Truck } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import api from '../../api/axios'

const COLORS = ['#d4821e', '#f5c842', '#3b82f6', '#10b981', '#8b5cf6']

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/analytics').then(r => setAnalytics(r.data.analytics)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Revenue', value: analytics ? `PKR ${analytics.totalRevenue?.toLocaleString()}` : '—', icon: DollarSign, color: 'from-primary-500 to-gold-400', change: '+12.5%' },
    { label: 'Total Orders', value: analytics?.totalOrders || '—', icon: ShoppingBag, color: 'from-blue-500 to-blue-400', change: '+8.2%' },
    { label: 'Avg Order Value', value: analytics ? `PKR ${Math.round((analytics.totalRevenue || 0) / (analytics.totalOrders || 1)).toLocaleString()}` : '—', icon: TrendingUp, color: 'from-purple-500 to-purple-400', change: '+3.1%' },
    { label: 'Top Products', value: analytics?.topProducts?.length || '—', icon: Package, color: 'from-green-500 to-green-400', change: 'Active' },
  ]

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="shimmer h-64 rounded-2xl" />
        <div className="shimmer h-64 rounded-2xl" />
      </div>
    </div>
  )

  const revenueData = analytics?.revenueByMonth?.map(r => ({
    name: new Date(2024, r._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: r.revenue,
    orders: r.orders,
  })) || []

  const statusData = analytics?.ordersByStatus?.map(s => ({
    name: s._id,
    value: s.count,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, Admin. Here's your overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-charcoal-800 rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className="text-white" />
              </div>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{card.change}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Revenue Overview</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4821e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4821e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(212,130,30,0.3)', borderRadius: '12px', color: '#fff' }}
                  formatter={(v) => [`PKR ${v?.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4821e" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-center py-10 text-sm">No data yet</p>}
        </motion.div>

        {/* Orders by Status */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Orders by Status</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(212,130,30,0.3)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-400 capitalize">{s.name}</span>
                    <span className="text-white font-semibold ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-500 text-center py-10 text-sm">No data yet</p>}
        </motion.div>
      </div>

      {/* Top Products */}
      {analytics?.topProducts?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{p.name}</p>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mt-1">
                    <div className="bg-gradient-to-r from-primary-500 to-gold-400 h-1.5 rounded-full" style={{ width: `${(p.totalSold / (analytics.topProducts[0]?.totalSold || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-bold">{p.totalSold} sold</p>
                  <p className="text-gray-500 text-xs">PKR {p.revenue?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
