import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react'
import api from '../../api/axios'

// Theme-aware custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  const isDark = document.documentElement.classList.contains('dark')
  return (
    <div style={{
      background: isDark ? '#1a1a1a' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(212,130,30,0.4)' : 'rgba(212,130,30,0.25)'}`,
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.1)',
      minWidth: '130px',
    }}>
      {label && <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '11px', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: i > 0 ? '4px' : 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px', textTransform: 'capitalize' }}>{entry.name}</span>
          <span style={{ color: isDark ? '#ffffff' : '#111827', fontSize: '13px', fontWeight: 700, marginLeft: 'auto' }}>
            {entry.name === 'revenue' ? `PKR ${Number(entry.value).toLocaleString()}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/orders/analytics'), api.get('/users/stats')])
      .then(([o, u]) => { setAnalytics(o.data.analytics); setUserStats(u.data.stats) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-48 rounded-2xl" />)}</div>

  const revenueData = analytics?.revenueByMonth?.map(r => ({
    month: new Date(2024, r._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: r.revenue,
    orders: r.orders,
  })) || []

  const userData = userStats?.usersByMonth?.map(u => ({
    month: new Date(2024, u._id.month - 1).toLocaleString('default', { month: 'short' }),
    users: u.count,
  })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `PKR ${(analytics?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-primary-500 to-gold-400' },
          { label: 'Total Orders', value: analytics?.totalOrders || 0, icon: ShoppingBag, color: 'from-blue-500 to-blue-400' },
          { label: 'Total Users', value: userStats?.totalUsers || 0, icon: Users, color: 'from-purple-500 to-purple-400' },
          { label: 'New This Month', value: userStats?.newUsersThisMonth || 0, icon: TrendingUp, color: 'from-green-500 to-green-400' },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-charcoal-800 rounded-2xl p-4 border border-white/5">
            <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} className="text-white" />
            </div>
            <p className="text-xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
        <h3 className="text-white font-semibold mb-4">Revenue & Orders (Monthly)</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#d4821e" radius={[6, 6, 0, 0]} name="revenue" />
              <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 text-center py-10 text-sm">No revenue data yet. Start selling!</p>}
      </div>

      {/* User growth */}
      <div className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
        <h3 className="text-white font-semibold mb-4">User Growth</h3>
        {userData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} name="users" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 text-center py-10 text-sm">No user data yet</p>}
      </div>

      {/* Top products table */}
      {analytics?.topProducts?.length > 0 && (
        <div className="bg-charcoal-800 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/5">{['Rank', 'Product', 'Units Sold', 'Revenue'].map(h => <th key={h} className="text-left py-2 px-3 text-xs text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {analytics.topProducts.map((p, i) => (
                  <tr key={p._id} className="border-b border-white/5">
                    <td className="py-3 px-3"><span className="w-6 h-6 bg-primary-500/10 text-primary-400 text-xs rounded-full flex items-center justify-center font-bold">{i + 1}</span></td>
                    <td className="py-3 px-3 text-white truncate max-w-48">{p.name}</td>
                    <td className="py-3 px-3 text-gray-300">{p.totalSold}</td>
                    <td className="py-3 px-3 text-primary-400 font-medium">PKR {p.revenue?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
