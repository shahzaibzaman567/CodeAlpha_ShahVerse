import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Sun, Moon, Menu, X, Crown, LogOut, Settings, Package } from 'lucide-react'
import { toggleTheme, toggleCart, toggleMobileMenu, closeMobileMenu } from '../store/slices/uiSlice'
import { logout } from '../store/slices/authSlice'
import { selectCartTotal } from '../store/slices/cartSlice'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Collections' },
  { to: '/products?gender=Men', label: 'Men' },
  { to: '/products?gender=Women', label: 'Women' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((s) => s.auth)
  const { theme, mobileMenuOpen } = useSelector((s) => s.ui)
  const { itemCount } = useSelector(selectCartTotal)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { dispatch(closeMobileMenu()) }, [location])

  const handleLogout = async () => {
    await dispatch(logout())
    setUserMenuOpen(false)
    navigate('/')
  }

  /* text color helper based on scroll + theme
     - scrolled: always use explicit light/dark classes
     - not scrolled + dark theme: white text (header is transparent over dark hero)
     - not scrolled + light theme: dark text (header is transparent over light bg) */
  const iconCls = scrolled
    ? 'text-gray-700 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-white/10'
    : theme === 'dark'
      ? 'text-white hover:text-primary-300 hover:bg-white/10'
      : 'text-gray-800 hover:text-primary-600 hover:bg-black/5'

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-xl shadow-luxury border-b border-gray-100 dark:border-white/5'
        : 'bg-transparent'
    }`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-gold-400 rounded-lg flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
              <Crown size={16} className="text-white" />
            </div>
            <span className={`font-display text-xl font-semibold tracking-wide transition-colors ${
              scrolled
                ? 'text-gray-900 dark:text-white'
                : theme === 'dark'
                  ? 'text-white'
                  : 'text-gray-900'
            }`}>
              Shah<span className="gradient-text">Verse</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  scrolled
                    ? location.pathname === to
                      ? 'text-primary-500 bg-primary-50 dark:bg-primary-500/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-white/5'
                    : theme === 'dark'
                      ? location.pathname === to
                        ? 'text-primary-300 bg-white/10'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                      : location.pathname === to
                        ? 'text-primary-600 bg-black/5'
                        : 'text-gray-800 hover:text-gray-900 hover:bg-black/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`p-2 rounded-full transition-all ${iconCls}`}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className={`p-2 rounded-full transition-all hidden sm:flex ${iconCls}`}>
                <Heart size={18} />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className={`p-2 rounded-full transition-all relative ${iconCls}`}
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </motion.span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all ${
                    scrolled
                      ? 'bg-gray-100 dark:bg-white/10 hover:bg-primary-50 dark:hover:bg-primary-500/10'
                      : 'bg-white/15 hover:bg-white/25'
                  }`}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-gold-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block max-w-20 truncate transition-colors ${
                    scrolled
                      ? 'text-gray-700 dark:text-gray-200'
                      : theme === 'dark'
                        ? 'text-white'
                        : 'text-gray-800'
                  }`}>
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-charcoal-800 rounded-2xl shadow-luxury border border-gray-100 dark:border-white/10 overflow-hidden z-20"
                      >
                        <div className="p-3 border-b border-gray-100 dark:border-white/10">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Settings size={15} /> Profile
                          </Link>
                          <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <Package size={15} /> Orders
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                              <Crown size={15} /> Admin Panel
                            </Link>
                          )}
                          <hr className="my-1 border-gray-100 dark:border-white/10" />
                          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full">
                            <LogOut size={15} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={`hidden sm:flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  scrolled
                    ? 'bg-primary-500 text-white hover:bg-primary-400'
                    : 'bg-white text-gray-900 hover:bg-white/90'
                }`}
              >
                Sign In
              </Link>
            )}

            {/* Mobile burger — always visible */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className={`md:hidden p-2 rounded-full transition-all ${iconCls}`}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-charcoal-900 border-t border-gray-100 dark:border-white/10 overflow-hidden"
          >
            <div className="page-container py-4 space-y-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={label}
                  to={to}
                  className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/wishlist" className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">Wishlist</Link>
                  <Link to="/orders" className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">Orders</Link>
                  <Link to="/profile" className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-3 rounded-xl text-primary-500 font-medium">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl text-red-500 font-medium">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 text-center btn-gold mt-2">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
