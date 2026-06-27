import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, ShieldOff, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users${search ? `?search=${search}` : ''}`)
      setUsers(res.data.users)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRoleToggle = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin'
      await api.put(`/users/${user._id}`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      load()
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await api.delete(`/users/${id}`); toast.success('User deleted'); load() }
    catch { toast.error('Failed') }
  }

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive })
      toast.success(user.isActive ? 'User deactivated' : 'User activated')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users <span className="text-gray-500 font-normal text-lg">({users.length})</span></h1>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} placeholder="Search users..." className="input-luxury pl-9 text-sm bg-charcoal-800 border-white/10 text-white w-full" />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        <button onClick={load} className="btn-outline-gold border-white/20 text-gray-400 hover:text-white px-4 text-sm">Search</button>
      </div>

      <div className="bg-charcoal-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="border-b border-white/5">{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded-full" /></td>)}</tr>)
              ) : users.map((user, i) => (
                <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${user.role === 'admin' ? 'text-primary-400 bg-primary-400/10' : 'text-gray-400 bg-white/5'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${user.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRoleToggle(user)} title={user.role === 'admin' ? 'Remove admin' : 'Make admin'} className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all">
                        {user.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button onClick={() => handleDelete(user._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
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
