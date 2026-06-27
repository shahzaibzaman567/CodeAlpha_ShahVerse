import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { User, Lock, MapPin, Package, Settings } from 'lucide-react'
import { updateProfile } from '../store/slices/authSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'password', icon: Lock, label: 'Password' },
  { id: 'address', icon: MapPin, label: 'Address' },
]

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((s) => s.auth)
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [address, setAddress] = useState(user?.addresses?.[0] || { street: '', city: '', state: '', zipCode: '', country: 'Pakistan', isDefault: true })

  const handleProfileSave = (e) => {
    e.preventDefault()
    dispatch(updateProfile(profile))
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.newPass.length < 6) { toast.error('Min 6 characters'); return }
    try {
      await api.put('/auth/password', { currentPassword: passwords.current, newPassword: passwords.newPass })
      toast.success('Password changed!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleAddressSave = (e) => {
    e.preventDefault()
    dispatch(updateProfile({ addresses: [address] }))
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="page-container py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-gold-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === id
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Personal Information</h2>
                <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-luxury" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                    <input value={user?.email} disabled className="input-luxury opacity-50 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+92 300 0000000" className="input-luxury" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-gold">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            )}

            {tab === 'password' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {[
                    { key: 'current', label: 'Current Password', placeholder: '••••••••' },
                    { key: 'newPass', label: 'New Password', placeholder: 'Min 6 characters' },
                    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                      <input type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} placeholder={placeholder} className="input-luxury" required />
                    </div>
                  ))}
                  <button type="submit" className="btn-gold">Update Password</button>
                </form>
              </motion.div>
            )}

            {tab === 'address' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Default Address</h2>
                <form onSubmit={handleAddressSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street</label>
                    <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                    <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State</label>
                    <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Postal Code</label>
                    <input value={address.zipCode} onChange={(e) => setAddress({ ...address, zipCode: e.target.value })} className="input-luxury" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                    <input value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="input-luxury" />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={loading} className="btn-gold">{loading ? 'Saving...' : 'Save Address'}</button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
