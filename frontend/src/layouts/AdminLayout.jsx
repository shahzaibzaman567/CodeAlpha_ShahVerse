import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  Ticket, BarChart3, LogOut, Menu, X, ChevronRight, Crown
} from 'lucide-react'
import { logout } from '../store/slices/authSlice'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/coupons', icon: Ticket, label: 'Coupons' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user } = useSelector((s) => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/')
  }

  const SidebarContent = ({ onClose }) => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-gold">
          <Crown size={18} className="text-white" />
        </div>
        {(sidebarOpen || onClose) && (
          <div className="min-w-0">
            <p className="font-display text-white font-semibold text-base leading-tight">ShahVerse</p>
            <p className="text-primary-400 text-xs">Admin Panel</p>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600/30 to-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {(sidebarOpen || onClose) && (
              <span className="text-sm font-medium truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/5">
        {(sidebarOpen || onClose) && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-gold-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(sidebarOpen || onClose) && <span className="text-sm">Logout</span>}
        </button>
        {/* Sidebar collapse/expand toggle — only on desktop (no onClose) */}
        {!onClose && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-3 px-3 py-2 mt-1 w-full rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-200"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronRight size={18} className={`flex-shrink-0 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`} />
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-charcoal-950 flex">

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-charcoal-900 border-r border-white/5 z-50 flex flex-col lg:hidden"
            >
              <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative hidden lg:flex flex-col bg-charcoal-900 border-r border-white/5 flex-shrink-0 min-h-screen overflow-hidden"
      >
        <SidebarContent onClose={null} />
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="h-14 bg-charcoal-900 border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0">
          {/* Mobile burger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-gold-400 rounded-lg flex items-center justify-center">
              <Crown size={14} className="text-white" />
            </div>
            <span className="font-display text-white font-semibold text-sm">ShahVerse Admin</span>
          </div>

          <div className="flex-1" />

          <NavLink
            to="/"
            className="text-gray-400 hover:text-primary-400 text-sm transition-colors flex items-center gap-1.5"
          >
            ← View Store
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 custom-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
