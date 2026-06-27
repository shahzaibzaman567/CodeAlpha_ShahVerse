import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Crown, Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await api.post('/newsletter/subscribe', { email })
      toast.success('Subscribed! Welcome to ShahVerse.')
      setEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-charcoal-950 text-gray-300 pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-gold-400 rounded-xl flex items-center justify-center shadow-gold">
                <Crown size={18} className="text-white" />
              </div>
              <span className="font-display text-xl text-white font-semibold">
                Shah<span className="gradient-text">Verse</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Premium fashion that speaks for itself. Elevating your wardrobe with luxury pieces crafted for the modern connoisseur.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-white/5 hover:bg-primary-500/20 hover:text-primary-400 rounded-full flex items-center justify-center transition-all duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h4>
            <ul className="space-y-2.5">
              {['New Arrivals', 'Men\'s Collection', 'Women\'s Collection', 'Accessories', 'Footwear', 'Sale'].map(item => (
                <li key={item}>
                  <Link to="/products" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Help</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Contact', 'Size Guide', 'Shipping Policy', 'Returns', 'FAQ'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Get exclusive offers, new arrivals, and style inspiration delivered to your inbox.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-10 h-10 bg-primary-500 hover:bg-primary-400 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>© 2024 ShahVerse. All rights reserved.</p>
          <p>Crafted with ♥ by Shahzaib Zaman</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
