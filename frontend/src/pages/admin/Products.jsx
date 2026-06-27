import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, X, Package } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', comparePrice: '', stock: '',
    category: '', gender: 'Unisex', material: '', brand: 'ShahVerse',
    isFeatured: false, isNewArrival: false, isTrending: false,
    images: [{ url: '' }],
  })

  const load = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([api.get('/products?limit=100'), api.get('/categories')])
      setProducts(prodRes.data.products)
      setCategories(catRes.data.categories)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', comparePrice: '', stock: '', category: '', gender: 'Unisex', material: '', brand: 'ShahVerse', isFeatured: false, isNewArrival: false, isTrending: false, images: [{ url: '' }] })
    setSelected(null)
    setModal('create')
  }

  const openEdit = (product) => {
    setForm({
      ...product,
      category: product.category?._id || product.category,
      price: String(product.price),
      comparePrice: String(product.comparePrice || ''),
      stock: String(product.stock),
      images: product.images?.length ? product.images : [{ url: '' }],
    })
    setSelected(product)
    setModal('edit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, price: Number(form.price), comparePrice: Number(form.comparePrice) || 0, stock: Number(form.stock) }
    try {
      if (modal === 'create') {
        await api.post('/products', data)
        toast.success('Product created!')
      } else {
        await api.put(`/products/${selected._id}`, data)
        toast.success('Product updated!')
      }
      setModal(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Products <span className="text-gray-500 font-normal text-lg">({products.length})</span></h1>
        <button onClick={openCreate} className="btn-gold flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-luxury pl-9 text-sm bg-charcoal-800 border-white/10 text-white" />
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      {/* Table */}
      <div className="bg-charcoal-800 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded-full" /></td>)}
                  </tr>
                ))
              ) : filtered.map((product, i) => (
                <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      <p className="text-white text-sm font-medium truncate max-w-40">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{product.category?.name}</td>
                  <td className="px-4 py-3 text-white text-sm font-medium">PKR {product.price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-400' : product.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.isFeatured && <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">Featured</span>}
                      {product.isNewArrival && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>}
                      {product.isTrending && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Trending</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-charcoal-800 rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scroll"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">{modal === 'create' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-luxury bg-charcoal-900 border-white/10 text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="input-luxury bg-charcoal-900 border-white/10 text-white resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Price (PKR) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="input-luxury bg-charcoal-900 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Compare Price (PKR)</label>
                <input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="input-luxury bg-charcoal-900 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Stock *</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required className="input-luxury bg-charcoal-900 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="input-luxury bg-charcoal-900 border-white/10 text-white">
                  <option value="">Select</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-luxury bg-charcoal-900 border-white/10 text-white">
                  {['Men', 'Women', 'Unisex', 'Kids'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Material</label>
                <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input-luxury bg-charcoal-900 border-white/10 text-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Image URLs</label>
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={img.url} onChange={(e) => { const imgs = [...form.images]; imgs[i] = { url: e.target.value }; setForm({ ...form, images: imgs }) }} placeholder="https://..." className="input-luxury bg-charcoal-900 border-white/10 text-white flex-1 text-sm" />
                    {i > 0 && <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-red-400 p-2"><X size={14} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setForm({ ...form, images: [...form.images, { url: '' }] })} className="text-xs text-primary-400 hover:text-primary-300">+ Add Image</button>
              </div>
              <div className="sm:col-span-2 flex gap-4">
                {[
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isTrending', label: 'Trending' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="accent-primary-500 w-4 h-4" />
                    {label}
                  </label>
                ))}
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setModal(null)} className="btn-outline-gold border-white/20 text-gray-400 hover:text-white px-5">Cancel</button>
                <button type="submit" className="btn-gold">{modal === 'create' ? 'Create' : 'Update'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
