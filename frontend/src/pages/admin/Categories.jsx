import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Tag, ImageOff } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const FALLBACK_IMAGES = {
  Men: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600',
  Women: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
  Accessories: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
  Footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  Outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
  Streetwear: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', image: { url: '' } })
  const [imgErrors, setImgErrors] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      setCategories(res.data.categories)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '', image: { url: '' } })
    setSelected(null)
    setModal('create')
  }

  const openEdit = (cat) => {
    setForm({ ...cat, image: cat.image || { url: '' } })
    setSelected(cat)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modal === 'create') {
        await api.post('/categories', form)
        toast.success('Category created!')
      } else {
        await api.put(`/categories/${selected._id}`, form)
        toast.success('Updated!')
      }
      setModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — products may exist in this category')
    }
  }

  const getImageUrl = (cat) => {
    if (cat.image?.url) return cat.image.url
    return FALLBACK_IMAGES[cat.name] || `https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shimmer h-52 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No categories yet</p>
          <button onClick={openCreate} className="btn-gold mt-4">Create First Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-charcoal-800 rounded-2xl overflow-hidden border border-white/5 group hover:border-primary-500/30 transition-all"
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden bg-charcoal-900">
                {imgErrors[cat._id] ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-gold-400/5">
                    <div className="text-center">
                      <Tag size={28} className="text-primary-500/50 mx-auto mb-1" />
                      <span className="text-primary-400/70 font-display text-xl font-light">{cat.name}</span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={getImageUrl(cat)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImgErrors(prev => ({ ...prev, [cat._id]: true }))}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-7 h-7 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 hover:text-primary-500 transition-colors shadow"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="w-7 h-7 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors shadow"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{cat.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                      {cat.description || 'No description'}
                    </p>
                    <p className="text-primary-400/70 text-xs mt-1 font-mono">/{cat.slug}</p>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    cat.isActive
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-800 rounded-2xl p-6 w-full max-w-md border border-white/10"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">
                {modal === 'create' ? 'Add Category' : 'Edit Category'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Men, Women, Accessories"
                  className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description..."
                  className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Image URL</label>
                <input
                  value={form.image?.url || ''}
                  onChange={(e) => setForm({ ...form, image: { url: e.target.value } })}
                  placeholder="https://images.unsplash.com/..."
                  className="input-luxury bg-charcoal-900 border-white/10 text-white placeholder-gray-600"
                />
                {form.image?.url && (
                  <div className="mt-2 h-20 rounded-lg overflow-hidden bg-charcoal-900">
                    <img
                      src={form.image.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold">
                  {modal === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
