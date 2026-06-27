import { useEffect, useRef, useState } from 'react'import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Play, Star, TrendingUp, Sparkles, Users, Package, Award } from 'lucide-react'
import { fetchProducts, fetchFeatured, fetchCategories } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'

// ─── Hero Video Section ───────────────────────────────────────────────────────
// TO CHANGE VIDEO: Replace the VIDEO_URL constant below with your desired video URL
// The Pexels video is already embedded. To update, change the src attribute.
const HERO_VIDEO_URL = 'https://www.pexels.com/download/video/10211616/'

function HeroSection() {
  const videoRef = useRef(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {/* 
          ═══════════════════════════════════════════════════
          HERO VIDEO PLACEHOLDER
          To replace video: change the src below to your URL
          Current video: Pexels Fashion Video #10211616
          ═══════════════════════════════════════════════════
        */}
        <video
          ref={videoRef}
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Fallback gradient when video loads */}
        {!videoLoaded && (
          <div className="absolute inset-0 bg-gradient-luxury" />
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white page-container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 text-white text-sm font-medium tracking-[0.3em] uppercase mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <Sparkles size={14} className="text-gold-400" />
            New Collection 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-6"
        >
          Define Your
          <br />
          <span className="italic gradient-text font-medium">Verse</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-10 font-light"
        >
          Premium fashion crafted for those who dare to stand apart. Luxury redefined for the modern era.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/products" className="btn-gold px-8 py-4 text-base flex items-center gap-2 justify-center">
            Explore Collection
            <ArrowRight size={18} />
          </Link>
          <Link to="/products?isNewArrival=true" className="btn-outline-gold border-white/50 text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-base">
            New Arrivals
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  )
}

// ─── Stats Section ────────────────────────────────────────────────────────────
const stats = [
  { icon: Users, value: '50K+', label: 'Happy Customers' },
  { icon: Package, value: '1000+', label: 'Premium Products' },
  { icon: Award, value: '5★', label: 'Average Rating' },
  { icon: TrendingUp, value: '100%', label: 'Authentic Luxury' },
]

function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-16 bg-charcoal-900">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-primary-400" />
              </div>
              <p className="font-display text-3xl font-semibold text-white mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Categories Section ───────────────────────────────────────────────────────
function CategoriesSection({ categories }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [imgErrors, setImgErrors] = useState({})

  const fallbacks = [
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
  ]

  return (
    <section ref={ref} className="py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mb-3">Browse By</p>
          <h2 className="section-title">Our Collections</h2>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={`/products?category=${cat._id}`}
                className="group block relative overflow-hidden rounded-2xl aspect-square bg-gray-100 dark:bg-charcoal-800"
              >
                <img
                  src={imgErrors[cat._id] ? fallbacks[i % fallbacks.length] : (cat.image?.url || fallbacks[i % fallbacks.length])}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setImgErrors(p => ({ ...p, [cat._id]: true }))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <p className="text-white font-semibold text-sm drop-shadow">{cat.name}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Products Grid Section ────────────────────────────────────────────────────
function ProductsSection({ title, subtitle, products, link }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-16">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mb-2">{subtitle}</p>
            <h2 className="section-title">{title}</h2>
          </div>
          <Link to={link} className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {products.slice(0, 8).map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
        <Link to={link} className="sm:hidden flex items-center justify-center gap-2 mt-8 text-primary-500 font-medium">
          View All <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Aisha Rahman',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    text: 'ShahVerse has completely transformed my wardrobe. The quality is unmatched and every piece feels like it was made just for me.',
    rating: 5,
  },
  {
    name: 'Omar Farouk',
    role: 'Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    text: 'The tailoring is exquisite. I\'ve been wearing ShahVerse to every important meeting and the compliments never stop.',
    rating: 5,
  },
  {
    name: 'Zara Malik',
    role: 'Creative Director',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    text: 'Finally a Pakistani brand that matches international luxury standards. ShahVerse is my go-to for everything premium.',
    rating: 5,
  },
]

function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-20 bg-gray-50 dark:bg-charcoal-900">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-12">
          <p className="text-primary-500 text-sm font-medium tracking-widest uppercase mb-3">Testimonials</p>
          <h2 className="section-title">What Our Clients Say</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className="card-glass p-6 rounded-2xl bg-white dark:bg-charcoal-800 border border-gray-100 dark:border-white/10"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="text-gold-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const dispatch = useDispatch()
  const { items: products, featured, categories } = useSelector((s) => s.products)

  useEffect(() => {
    dispatch(fetchFeatured())
    dispatch(fetchProducts({ isTrending: true, limit: 8 }))
    dispatch(fetchCategories())
  }, [])

  const trending = products.filter((p) => p.isTrending)
  const newArrivals = featured.filter((p) => p.isNewArrival)

  return (
    <div>
      <HeroSection />
      <StatsSection />
      {categories.length > 0 && <CategoriesSection categories={categories} />}

      {/* Featured */}
      {featured.length > 0 && (
        <ProductsSection
          title="Featured Pieces"
          subtitle="Curated For You"
          products={featured}
          link="/products?isFeatured=true"
        />
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-4 bg-gray-50 dark:bg-charcoal-900">
          <ProductsSection
            title="Trending Now"
            subtitle="What's Hot"
            products={trending}
            link="/products?isTrending=true"
          />
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <ProductsSection
          title="New Arrivals"
          subtitle="Just Dropped"
          products={newArrivals}
          link="/products?isNewArrival=true"
        />
      )}

      <TestimonialsSection />

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-luxury text-white text-center">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-primary-400 text-sm tracking-widest uppercase mb-4">Limited Time</p>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4">
              Free Shipping on Orders Over{' '}
              <span className="gradient-text font-medium">PKR 5,000</span>
            </h2>
            <p className="text-gray-400 mb-8">Use code <span className="text-primary-400 font-bold">SHAHVERSE10</span> for an extra 10% off</p>
            <Link to="/products" className="btn-gold px-10 py-4 text-base">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
