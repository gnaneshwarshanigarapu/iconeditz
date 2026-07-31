import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSiteContent } from '../../hooks/useSiteContent'
import { defaultServicesPage } from '../../data/defaultServicesPage'
import { Sparkles, Zap, BadgeCheck, Palette, Share2, Clapperboard, Film, Image, PenTool, Save } from 'lucide-react'

const iconLibrary = {
  Sparkles,
  Zap,
  BadgeCheck,
  Palette,
  Share2,
  Clapperboard,
  Film,
  Image,
  PenTool,
}

const inputsForHero = [
  { key: 'heading', label: 'Heading', type: 'text' },
  { key: 'subtitle', label: 'Subtitle', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'primaryCta', label: 'Primary CTA', type: 'text' },
  { key: 'secondaryCta', label: 'Secondary CTA', type: 'text' },
]

export default function SiteContentAdmin() {
  const { content, updateSection } = useSiteContent()
  const [activeSection, setActiveSection] = useState('hero')

  const sections = useMemo(
    () => [
      { id: 'hero', label: 'Hero' },
      { id: 'services', label: 'Featured Services' },
      { id: 'projects', label: 'Featured Projects' },
      { id: 'testimonials', label: 'Testimonials' },
      { id: 'cta', label: 'CTA' },
    ],
    [],
  )

  const renderSectionEditor = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <div className="space-y-5">
            {inputsForHero.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-2 block text-sm font-semibold text-white">{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={content.hero[field.key] || ''}
                    onChange={(event) => updateSection('hero', (current) => ({ ...current, [field.key]: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={content.hero[field.key] || ''}
                    onChange={(event) => updateSection('hero', (current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                  />
                )}
              </label>
            ))}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-white">Badges</span>
              <textarea
                value={(content.hero.badges || []).join('\n')}
                onChange={(event) => updateSection('hero', (current) => ({ ...current, badges: event.target.value.split('\n').filter(Boolean) }))}
                className="min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>
        )
      case 'showreel':
        return (
          <div className="space-y-5">
            {['title', 'description', 'videoUrl', 'thumbnail', 'buttonText'].map((key) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-white">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="text"
                  value={content.showreel[key] || ''}
                  onChange={(event) => updateSection('showreel', (current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                />
              </label>
            ))}
          </div>
        )
      case 'services':
        return (
          <div className="space-y-4">
            {(content.services.items || []).map((service, index) => (
              <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">Service {index + 1}</span>
                  <label className="flex items-center gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={service.visible}
                      onChange={() => updateSection('services', (current) => ({
                        ...current,
                        items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, visible: !item.visible } : item),
                      }))}
                    />
                    Visible
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={service.title}
                    onChange={(event) => updateSection('services', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    placeholder="Title"
                  />
                  <select
                    value={service.icon || 'Sparkles'}
                    onChange={(event) => updateSection('services', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, icon: event.target.value } : item) }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                  >
                    {Object.keys(iconLibrary).map((name) => <option key={name} value={name}>{name}</option>)}
                  </select>
                  <textarea
                    value={service.description}
                    onChange={(event) => updateSection('services', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))}
                    className="md:col-span-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        )
      case 'servicesPage': {
        const page = { ...defaultServicesPage, ...(content.servicesPage || {}) }
        const collections = ['services', 'process', 'features', 'industries', 'software', 'packages', 'faq', 'testimonials']
        const updateCollection = (collection, updater) => updateSection('servicesPage', (current = {}) => ({ ...current, [collection]: updater(current[collection] || []) }))
        const updateItem = (collection, index, changes) => updateCollection(collection, (items) => items.map((entry, entryIndex) => entryIndex === index ? { ...entry, ...changes } : entry))
        const moveItem = (collection, index, direction) => updateCollection(collection, (items) => {
          const target = index + direction
          if (target < 0 || target >= items.length) return items
          const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; return next
        })
        return (
          <div className="space-y-6">
            <p className="text-sm leading-6 text-text-muted">Manage every Services page collection. Changes save automatically; use visibility and status to hide, show, publish, or draft content.</p>
            {['hero', 'homeServices', 'cta'].map((section) => (
              <div key={section} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 font-semibold text-white">{section === 'hero' ? 'Hero' : section === 'homeServices' ? 'Homepage Services CTA' : 'Closing CTA'}</p>
                <div className="grid gap-3 md:grid-cols-2">{Object.entries(page[section] || {}).filter(([key]) => !['visible', 'status'].includes(key)).map(([key, value]) => <input key={key} value={value || ''} onChange={(event) => updateSection('servicesPage', (current = {}) => ({ ...current, [section]: { ...(current[section] || {}), [key]: event.target.value } }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder={key} />)}</div>
                <div className="mt-3 flex gap-3 text-sm text-text-muted"><button type="button" onClick={() => updateSection('servicesPage', (current = {}) => ({ ...current, [section]: { ...(current[section] || {}), visible: !(current[section]?.visible) } }))}>{page[section]?.visible ? 'Hide' : 'Show'}</button><button type="button" onClick={() => updateSection('servicesPage', (current = {}) => ({ ...current, [section]: { ...(current[section] || {}), status: current[section]?.status === 'published' ? 'draft' : 'published' } }))}>{page[section]?.status === 'published' ? 'Draft' : 'Publish'}</button></div>
              </div>
            ))}
            {collections.map((collection) => <div key={collection} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="mb-3 flex items-center justify-between"><p className="font-semibold capitalize text-white">{collection}</p><button type="button" onClick={() => updateCollection(collection, (items) => [...items, { id: `${collection}-${Date.now()}`, title: 'New item', description: '', visible: true, status: 'draft' }])} className="text-sm text-primary">+ Add</button></div><div className="space-y-3">{(page[collection] || []).map((entry, index) => <div key={entry.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="grid gap-2 md:grid-cols-2"><input value={entry.title || ''} onChange={(event) => updateItem(collection, index, { title: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white" placeholder="Title" /><input value={entry.price || entry.percentage || ''} onChange={(event) => updateItem(collection, index, collection === 'software' ? { percentage: Number(event.target.value) } : { price: event.target.value })} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white" placeholder="Price / skill %" /><textarea value={entry.description || entry.review || ''} onChange={(event) => updateItem(collection, index, entry.review !== undefined ? { review: event.target.value } : { description: event.target.value })} className="md:col-span-2 min-h-16 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white" placeholder="Description" /><textarea value={(entry.features || []).join('\n')} onChange={(event) => updateItem(collection, index, { features: event.target.value.split('\n').filter(Boolean) })} className="md:col-span-2 min-h-14 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-white" placeholder="Features (one per line)" /></div><div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted"><button type="button" onClick={() => updateItem(collection, index, { visible: !entry.visible })}>{entry.visible ? 'Hide' : 'Show'}</button>{collection === 'services' && <button type="button" onClick={() => updateItem(collection, index, { featured: !entry.featured })}>{entry.featured ? 'Featured' : 'Not featured'}</button>}<button type="button" onClick={() => updateItem(collection, index, { status: entry.status === 'published' ? 'draft' : 'published' })}>{entry.status === 'published' ? 'Draft' : 'Publish'}</button><button type="button" onClick={() => moveItem(collection, index, -1)}>Move up</button><button type="button" onClick={() => moveItem(collection, index, 1)}>Move down</button><button type="button" onClick={() => updateCollection(collection, (items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-red-300">Delete</button></div></div>)}</div></div>)}
          </div>
        )
      }
      case 'projects':
        return (
          <div className="space-y-4">
            {(content.projects.items || []).map((project, index) => (
              <div key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-primary">Project {index + 1}</span>
                  <label className="flex items-center gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={project.visible}
                      onChange={() => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, visible: !item.visible } : item) }))}
                    />
                    Visible
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={project.title} onChange={(event) => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Title" />
                  <input value={project.category} onChange={(event) => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, category: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Category" />
                  <textarea value={project.description} onChange={(event) => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))} className="md:col-span-2 min-h-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Description" />
                  <input value={project.videoUrl} onChange={(event) => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, videoUrl: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Video URL" />
                  <input value={project.thumbnail} onChange={(event) => updateSection('projects', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, thumbnail: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Thumbnail" />
                </div>
              </div>
            ))}
          </div>
        )
      case 'tools':
        return (
          <div className="space-y-4">
            {(content.tools.items || []).map((tool, index) => (
              <div key={tool.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={tool.name} onChange={(event) => updateSection('tools', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Software" />
                  <input value={tool.percentage} onChange={(event) => updateSection('tools', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, percentage: Number(event.target.value) } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Percentage" />
                  <textarea value={tool.description} onChange={(event) => updateSection('tools', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item) }))} className="md:col-span-2 min-h-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Description" />
                </div>
              </div>
            ))}
          </div>
        )
      case 'testimonials':
        return (
          <div className="space-y-4">
            {(content.testimonials.items || []).map((testimonial, index) => (
              <div key={testimonial.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={testimonial.name} onChange={(event) => updateSection('testimonials', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Name" />
                  <input value={testimonial.company} onChange={(event) => updateSection('testimonials', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, company: event.target.value } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Company" />
                  <textarea value={testimonial.review} onChange={(event) => updateSection('testimonials', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, review: event.target.value } : item) }))} className="md:col-span-2 min-h-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Review" />
                  <input value={testimonial.rating} onChange={(event) => updateSection('testimonials', (current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, rating: Number(event.target.value) } : item) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Rating" />
                </div>
              </div>
            ))}
          </div>
        )
      case 'faq':
        return (
          <div className="space-y-4">
            {(content.faq.items || []).map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-3">
                  <input value={item.question} onChange={(event) => updateSection('faq', (current) => ({ ...current, items: current.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, question: event.target.value } : entry) }))} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Question" />
                  <textarea value={item.answer} onChange={(event) => updateSection('faq', (current) => ({ ...current, items: current.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, answer: event.target.value } : entry) }))} className="min-h-24 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white" placeholder="Answer" />
                </div>
              </div>
            ))}
          </div>
        )
      case 'cta':
        return (
          <div className="space-y-5">
            {['heading', 'description', 'primaryCta', 'secondaryCta', 'primaryHref', 'secondaryHref'].map((key) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-white">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="text"
                  value={content.cta[key] || ''}
                  onChange={(event) => updateSection('cta', (current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                />
              </label>
            ))}
          </div>
        )
      case 'site':
        return (
          <div className="space-y-5">
            {['brandName', 'email', 'instagram', 'linkedin', 'youtube', 'github', 'copyright'].map((key) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-semibold text-white">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="text"
                  value={content.site[key] || ''}
                  onChange={(event) => updateSection('site', (current) => ({ ...current, [key]: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none"
                />
              </label>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-primary/20 bg-[#100b21]/90 p-6 shadow-2xl shadow-black/30">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-primary">Site Content</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Homepage editor</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          <Save className="h-4 w-4" />
          Auto-saved locally
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${activeSection === section.id ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">{renderSectionEditor()}</div>
    </motion.div>
  )
}
