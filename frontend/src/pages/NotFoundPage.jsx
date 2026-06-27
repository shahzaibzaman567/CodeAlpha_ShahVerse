import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-charcoal-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-display text-[10rem] font-light text-gray-100 dark:text-white/5 leading-none select-none">404</p>
        <h1 className="font-display text-4xl font-light text-gray-900 dark:text-white -mt-8 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-gold px-8">Back to Home</Link>
      </motion.div>
    </div>
  )
}
