import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Crown, ArrowRight, CheckCircle } from 'lucide-react'
import { login } from '../store/slices/authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  // Came from register page?
  const justRegistered = location.state?.registered === true
  // Redirect destination after login
  const from = location.state?.from?.pathname || '/'

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/profile', { replace: true })
    }
  }, [user])

  // Pre-fill email if coming from register
  useEffect(() => {
    if (justRegistered && location.state?.email) {
      setForm(f => ({ ...f, email: location.state.email }))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (!result.error) {
      const role = result.payload?.user?.role
      // Admin → /admin dashboard, User → /profile
      navigate(role === 'admin' ? '/admin' : '/profile', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-charcoal-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-xl flex items-center justify-center shadow-gold">
              <Crown size={18} className="text-white" />
            </div>
            <span className="font-display text-xl text-gray-900 dark:text-white font-semibold">
              Shah<span className="gradient-text">Verse</span>
            </span>
          </Link>

          {/* Success banner — shown after register */}
          <AnimatePresence>
            {justRegistered && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3.5 mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl"
              >
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Account created! Please sign in to continue.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <h1 className="font-display text-3xl font-light text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">Sign in to your ShahVerse account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-luxury"
                autoFocus={justRegistered}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-luxury pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-500 font-medium hover:text-primary-400 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-xs text-gray-500">
            <p className="font-semibold mb-1 text-gray-700 dark:text-gray-300">Demo credentials:</p>
            <p>Admin: shahzaibzaman465@gmail.com / admin123</p>
            <p>User: user@shahverse.com / user123456</p>
          </div>
        </motion.div>
      </div>

      {/* Right — Visual */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30" />
        <div className="absolute bottom-12 left-12 text-white">
          <p className="font-display text-4xl font-light mb-2">Luxury Redefined</p>
          <p className="text-white/70">Premium fashion for the modern era</p>
        </div>
      </div>
    </div>
  )
}
