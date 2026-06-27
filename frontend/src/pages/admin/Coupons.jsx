import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Tag, Percent, DollarSign, Clock, CheckCircle, XCircle, Users } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    usageLimit: '100',
    expiresAt: '',
    description: '',
    isActive: true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/coupons')
      setCoupons(res.data.coupons)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    const next30 = new Date()
    next30.setDate(next30.getDate() + 30)
    setForm({
      code: '', discountType: 'percentage', discountValue: '',
      minOrderAmount: '0', usageLimit: '100',
      expiresAt: next30.toISOString().split('T')[0],
      description: '', isActive: true,
    })
    setSelected(null)
    setModal('create')
  }

  const openEdit = (c) => {
    setForm({ ...c, expiresAt: c.expiresAt?.split('T')[0] || '', discountValue: String(c.discountValue), minOrderAmount: String(c.minOrderAmount || 0), usageLimit: String(c.usageLimit) })
    setSelected(c)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        usageLimit: Number(form.usageLimit),
      }
      if (modal === 'create') {
        await api.post('/coupons', data)
        toast.success('Coupon created!')
      } else {
        await api.put(`/coupons/${selected._id}`, data)
        toast.success('Coupon updated!')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return
    try {
      await api.delete(`/coupons/${id}`)
      toast.success('Deleted')
      load()
    } catch { toast.error('Failed') }
  }

  const isExpired = (date) => new Date(date) < new Date()
  const isActive = (coupon) => coupon.isActive && !isExpired(coupon.expiresAt) && coupon.usedCount < coupon.usageLimit

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} coupons created</p>
        </div>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Stats row */}
      {coupons.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: coupons.length, color: 'text-white', bg: 'bg-white/5' },
            { label: 'Active', value: coupons.filter(c => isActive(c)).length, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Expired', value: coupons.filter(c => isExpired(c.expiresAt)).length, color: 'text-red-400', bg: 'bg-red-400/10' },
            { label: 'Total Used', value: coupons.reduce((s, c) => s + (c.usedCount || 0), 0), color: 'text-primary-400', bg: 'bg-primary-400/10' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-white/5`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-48 rounded-2xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">No coupons yet</p>
          <button onClick={openCreate} className="btn-gold">Create First Coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, i) => {
            const active = isActive(coupon)
            const expired = isExpired(coupon.expiresAt)
            const usagePercent = Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100))

            return (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative bg-charcoal-800 rounded-2xl overflow-hidden border transition-all ${
                  active
                    ? 'border-primary-500/20 hover:border-primary-500/40'
                    : 'border-white/5 opacity-70'
                }`}
              >
                {/* Top strip */}
                <div className={`h-1.5 w-full ${active ? 'bg-gradient-to-r from-primary-500 to-gold-400' : expired ? 'bg-red-500/50' : 'bg-gray-600'}`} />

                <div className="p-5">
                  {/* Code + status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? 'bg-primary-500/15' : 'bg-white/5'}`}>
                        <Tag size={15} className={active ? 'text-primary-400' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className={`font-mono font-bold text-base tracking-widest ${active ? 'text-primary-400' : 'text-gray-500'}`}>
                          {coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 leading-tight">{coupon.description}</p>
                        )}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      active ? 'bg-green-400/10 text-green-400' :
                      expired ? 'bg-red-400/10 text-red-400' :
                      'bg-gray-400/10 text-gray-500'
                    }`}>
                      {active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {active ? 'Active' : expired ? 'Expired' : 'Inactive'}
                    </span>
                  </div>

                  {/* Discount value — big */}
                  <div className="bg-charcoal-900/60 rounded-xl px-4 py-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {coupon.discountType === 'percentage'
                        ? <Percent size={18} className="text-gold-400" />
                        : <DollarSign size={18} className="text-gold-400" />
                      }
                      <span className="text-2xl font-bold text-white">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `PKR ${Number(coupon.discountValue).toLocaleString()}`
                        }
                      </span>
                    </div>
                    {coupon.minOrderAmount > 0 && (
                      <span className="text-xs text-gray-500 text-right">
                        Min. order<br />
                        <span className="text-gray-400 font-medium">PKR {Number(coupon.minOrderAmount).toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2">
                    {/* Usage bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Users size={10} /> Usage</span>
                        <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-400' : usagePercent >= 60 ? 'bg-yellow-400' : 'bg-primary-500'}`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500"><Clock size={10} /> Expires</span>
                      <span className={expired ? 'text-red-400' : 'text-gray-400'}>
                        {new Date(coupon.expiresAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-primary-500/10 text-gray-400 hover:text-primary-400 transition-all text-sm font-medium"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all text-sm font-medium"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-800 rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto custom-scroll"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">
                {modal === 'create' ? 'Create Coupon' : 'Edit Coupon'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Coupon Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="SUMMER20"
                  className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600 font-mono tracking-widest uppercase"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Summer sale 2026..."
                  className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                />
              </div>

              {/* Discount type + value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="input-luxury bg-charcoal-900 border-white/10 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Value {form.discountType === 'percentage' ? '(%)' : '(PKR)'} *
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    required
                    min="1"
                    max={form.discountType === 'percentage' ? '100' : undefined}
                    placeholder={form.discountType === 'percentage' ? '10' : '500'}
                    className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Min order + limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Order (PKR)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    min="0"
                    placeholder="0"
                    className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    min="1"
                    placeholder="100"
                    className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Expires At *</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="input-luxury bg-charcoal-900 border-white/10 text-white"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <div
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? 'bg-primary-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-5.5 translate-x-1' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300">Active coupon</span>
              </label>

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-gold">
                  {modal === 'create' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
