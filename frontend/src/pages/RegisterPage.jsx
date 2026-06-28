import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Crown, ArrowRight, Check } from 'lucide-react'
import { register } from '../store/slices/authSlice'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => { if (user) navigate('/') }, [user])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await dispatch(register({ name: form.name, email: form.email, password: form.password }))
    if (!result.error) {
      navigate('/login', { state: { registered: true, email: form.email } })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Visual */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://i.pinimg.com/236x/53/5d/e1/535de1bb6119298d8b5d27c72312b8b3.jpg"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
        <div className="absolute bottom-12 right-12 text-white text-right">
          <p className="font-display text-4xl font-light mb-2">Join ShahVerse</p>
          <p className="text-white/70">Exclusive access to premium fashion</p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-charcoal-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-xl flex items-center justify-center shadow-gold">
              <Crown size={18} className="text-white" />
            </div>
            <span className="font-display text-xl text-gray-900 dark:text-white font-semibold">
              Shah<span className="gradient-text">Verse</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-2">Create account</h1>
          <p className="text-gray-500 mb-8">Join the ShahVerse community today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Shahzaib Zaman' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input
                  type={type}
                  required
                  value={form[key]}
                  onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }) }}
                  placeholder={placeholder}
                  className={`input-luxury ${errors[key] ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                />
                {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }) }}
                  placeholder="Min 6 characters"
                  className={`input-luxury pr-10 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setErrors({ ...errors, confirm: '' }) }}
                placeholder="Repeat password"
                className={`input-luxury ${errors.confirm ? 'ring-2 ring-red-500' : ''}`}
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:text-primary-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
