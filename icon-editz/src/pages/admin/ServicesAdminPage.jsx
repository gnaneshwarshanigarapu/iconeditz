import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Briefcase,
  Layers,
  DollarSign,
  HelpCircle,
  Globe,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../utils/supabase'
import { useToast } from '../../components/ui/ToastProvider'
import EmptyState from '../../components/ui/EmptyState'
import { TableRowSkeleton } from '../../components/ui/SkeletonLoader'

const initialForm = {
  id: null,
  title: '',
  slug: '',
  description: '',
  price: '',
  category: 'Video Editing',
  icon: 'FiVideo',
  image_url: '',
  status: 'published',
  seo_title: '',
  seo_description: '',
  faq_list: [{ question: '', answer: '' }],
}

export default function ServicesAdminPage() {
  const toast = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formData, setFormData] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const categories = ['All', 'Video Editing', 'Color Grading', 'VFX & Motion', 'Graphic Design', 'Audio Design']

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      toast.error('Failed to load services: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleOpenDrawer = (service = null) => {
    if (service) {
      setFormData({
        id: service.id,
        title: service.title || '',
        slug: service.slug || '',
        description: service.description || '',
        price: service.price || '',
        category: service.category || 'Video Editing',
        icon: service.icon || 'FiVideo',
        image_url: service.image_url || '',
        status: service.status || 'published',
        seo_title: service.seo_title || '',
        seo_description: service.seo_description || '',
        faq_list: service.faq_list?.length ? service.faq_list : [{ question: '', answer: '' }],
      })
    } else {
      setFormData(initialForm)
    }
    setDrawerOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title) {
      toast.error('Title is required')
      return
    }

    setSaving(true)
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const payload = {
      title: formData.title,
      slug,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : 0,
      category: formData.category,
      icon: formData.icon,
      image_url: formData.image_url,
      status: formData.status,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      faq_list: formData.faq_list.filter((f) => f.question && f.answer),
      updated_at: new Date().toISOString(),
    }

    try {
      if (formData.id) {
        const { error } = await supabase.from('services').update(payload).eq('id', formData.id)
        if (error) throw error
        toast.success('Service updated successfully')
      } else {
        const { error } = await supabase.from('services').insert([payload])
        if (error) throw error
        toast.success('Service created successfully')
      }
      setDrawerOpen(false)
      fetchServices()
    } catch (err) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      toast.success('Service deleted')
      fetchServices()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleTogglePublish = async (service) => {
    const newStatus = service.status === 'published' ? 'draft' : 'published'
    try {
      const { error } = await supabase.from('services').update({ status: newStatus }).eq('id', service.id)
      if (error) throw error
      toast.success(`Service status changed to ${newStatus}`)
      fetchServices()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = services.filter((s) => {
    const matchesSearch = s.title?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'all' || s.category?.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-amber-400" />
            <span>Services Management</span>
          </h2>
          <p className="text-xs text-text-muted">Manage service offerings, pricing, FAQs, and publishing states.</p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenDrawer()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat.toLowerCase())}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === cat.toLowerCase()
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white/[0.05] text-text-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-text-muted uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={5} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyState
                      icon={Briefcase}
                      title="No Services Found"
                      description="Click 'Add New Service' to create your first offered service."
                      actionLabel="Create Service"
                      onAction={() => handleOpenDrawer()}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {service.image_url ? (
                          <img src={service.image_url} alt="" className="h-10 w-10 rounded-xl object-cover border border-white/10" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                            {service.title?.[0] || 'S'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{service.title}</p>
                          <p className="text-[11px] text-text-muted truncate max-w-xs">{service.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-text-muted border border-white/10">
                        {service.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-400">
                      ₹{service.price ? Number(service.price).toLocaleString() : 'Custom'}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(service)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          service.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${service.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{service.status || 'draft'}</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDrawer(service)}
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Service"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-[#0e0a22] border-l border-white/10 p-6 overflow-y-auto h-full flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <h3 className="text-lg font-bold text-white">
                    {formData.id ? 'Edit Service' : 'Add New Service'}
                  </h3>
                  <button onClick={() => setDrawerOpen(false)} className="text-text-muted hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-text-muted font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Cinema Color Grading"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-muted font-medium mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="2999"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-white outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-muted font-medium mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-[#120d2b] px-4 py-2.5 text-white outline-none focus:border-primary"
                      >
                        <option value="Video Editing">Video Editing</option>
                        <option value="Color Grading">Color Grading</option>
                        <option value="VFX & Motion">VFX & Motion</option>
                        <option value="Graphic Design">Graphic Design</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-muted font-medium mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed breakdown of the service offering..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-text-muted font-medium mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <p className="font-bold text-white mb-2">SEO Settings</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="SEO Title"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-white outline-none focus:border-primary"
                      />
                      <textarea
                        rows={2}
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder="SEO Description"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-white outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="publish_service"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                    />
                    <label htmlFor="publish_service" className="text-white font-medium">
                      Publish immediately on website
                    </label>
                  </div>
                </form>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-xl border border-white/10 py-3 font-semibold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save Service</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
