import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Grid3x3, List, Search } from 'lucide-react'
import { fetchProducts } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'

const sortOptions = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Top Rated' },
  { value: '-soldCount', label: 'Best Selling' },
]

export default function ProductsPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, categories, loading, total, pages, currentPage } = useSelector((s) => s.products)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [gridCols, setGridCols] = useState(3)
  const [localSearch, setLocalSearch] = useState('')

  // Parse filters from URL
  const filters = {
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
    isTrending: searchParams.get('isTrending') || '',
  }

  useEffect(() => {
    const params = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
    dispatch(fetchProducts({ ...params, limit: 12 }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams.toString()])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    if (key !== 'page') newParams.delete('page')
    setSearchParams(newParams)
  }

  const clearAllFilters = () => setSearchParams({})

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilter('search', localSearch)
  }

  const hasActiveFilters = ['category', 'gender', 'minPrice', 'maxPrice', 'search', 'isFeatured', 'isNewArrival', 'isTrending']
    .some(k => searchParams.get(k))

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-charcoal-900 py-10 border-b border-gray-100 dark:border-white/5">
        <div className="page-container">
          <h1 className="section-title mb-2">
            {filters.gender ? `${filters.gender}'s Collection` :
             filters.isNewArrival ? 'New Arrivals' :
             filters.isTrending ? 'Trending Now' :
             filters.isFeatured ? 'Featured' : 'All Collections'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} products found</p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                filtersOpen || hasActiveFilters
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
            </button>

            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <X size={14} /> Clear All
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="input-luxury pl-9 py-2 text-sm w-48"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-charcoal-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Grid toggle */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
              <button onClick={() => setGridCols(3)} className={`p-1.5 rounded ${gridCols === 3 ? 'bg-white dark:bg-charcoal-800 shadow-sm' : ''}`}>
                <Grid3x3 size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => setGridCols(2)} className={`p-1.5 rounded ${gridCols === 2 ? 'bg-white dark:bg-charcoal-800 shadow-sm' : ''}`}>
                <List size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-5 bg-gray-50 dark:bg-charcoal-800 rounded-2xl border border-gray-100 dark:border-white/10">
                {/* Gender */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gender</p>
                  <div className="space-y-1">
                    {['Men', 'Women', 'Unisex'].map(g => (
                      <button
                        key={g}
                        onClick={() => updateFilter('gender', filters.gender === g ? '' : g)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.gender === g
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</p>
                  <div className="space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat._id}
                        onClick={() => updateFilter('category', filters.category === cat._id ? '' : cat._id)}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          filters.category === cat._id
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min PKR"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="input-luxury text-sm py-1.5"
                    />
                    <input
                      type="number"
                      placeholder="Max PKR"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="input-luxury text-sm py-1.5"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Filter By</p>
                  <div className="space-y-1">
                    {[
                      { key: 'isFeatured', label: 'Featured' },
                      { key: 'isNewArrival', label: 'New Arrivals' },
                      { key: 'isTrending', label: 'Trending' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => updateFilter(key, searchParams.get(key) ? '' : 'true')}
                        className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          searchParams.get(key)
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-5 md:gap-6 grid-cols-2 md:grid-cols-${gridCols}`}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="shimmer aspect-[3/4] rounded-2xl" />
                <div className="mt-3 space-y-2">
                  <div className="shimmer h-3 rounded-full w-1/3" />
                  <div className="shimmer h-4 rounded-full w-2/3" />
                  <div className="shimmer h-4 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-2">No products found</p>
            <button onClick={clearAllFilters} className="btn-outline-gold text-sm">Clear Filters</button>
          </div>
        ) : (
          <div className={`grid gap-5 md:gap-6 grid-cols-2 ${gridCols === 3 ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
            {items.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => updateFilter('page', String(i + 1))}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                  currentPage === i + 1
                    ? 'bg-primary-500 text-white shadow-gold'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-500'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
