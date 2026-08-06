import React, { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Copy, Eye, GripVertical, Save, Trash2, Plus, Code } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import DatabaseSetupNotice, { isMissingSchemaError } from './DatabaseSetupNotice'

const sectionSchema = z.object({
  eyebrow: z.string().max(300).optional(),
  heading: z.string().max(500).optional(),
  title: z.string().max(500).optional(),
  subtitle: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  primaryCta: z.string().max(100).optional(),
  primaryHref: z.string().max(500).optional(),
  secondaryCta: z.string().max(100).optional(),
  secondaryHref: z.string().max(500).optional(),
  primaryLabel: z.string().max(100).optional(),
  primaryUrl: z.string().max(500).optional(),
  secondaryLabel: z.string().max(100).optional(),
  secondaryUrl: z.string().max(500).optional(),
  imageUrl: z.string().max(1000).optional(),
  videoUrl: z.string().max(1000).optional(),
  thumbnail: z.string().max(1000).optional(),
  status: z.enum(['draft', 'published']),
  sortOrder: z.coerce.number().int().min(0),
})

const emptySection = {
  eyebrow: '',
  heading: '',
  title: '',
  subtitle: '',
  description: '',
  primaryCta: '',
  primaryHref: '',
  secondaryCta: '',
  secondaryHref: '',
  primaryLabel: '',
  primaryUrl: '',
  secondaryLabel: '',
  secondaryUrl: '',
  imageUrl: '',
  videoUrl: '',
  thumbnail: '',
  status: 'published',
  sortOrder: 0,
}

const normalizeSectionContent = (value) => {
  if (value == null) return {}
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return { rawValue: value }
    }
  }
  if (Array.isArray(value)) return { items: value }
  if (typeof value !== 'object') return {}
  return value
}

const buildFormDefaults = (value, sectionName, availableSections) => {
  const normalized = normalizeSectionContent(value)
  const resolvedSortOrder = normalized.sortOrder ?? availableSections.indexOf(sectionName)
  return {
    ...emptySection,
    ...normalized,
    eyebrow: normalized.eyebrow || '',
    heading: normalized.heading || normalized.title || normalized.label || '',
    title: normalized.title || normalized.heading || '',
    subtitle: normalized.subtitle || '',
    description: normalized.description || '',
    primaryCta: normalized.primaryCta || normalized.primaryLabel || '',
    primaryHref: normalized.primaryHref || normalized.primaryUrl || '',
    secondaryCta: normalized.secondaryCta || normalized.secondaryLabel || '',
    secondaryHref: normalized.secondaryHref || normalized.secondaryUrl || '',
    primaryLabel: normalized.primaryLabel || normalized.primaryCta || '',
    primaryUrl: normalized.primaryUrl || normalized.primaryHref || '',
    secondaryLabel: normalized.secondaryLabel || normalized.secondaryCta || '',
    secondaryUrl: normalized.secondaryUrl || normalized.secondaryHref || '',
    imageUrl: normalized.imageUrl || normalized.thumbnail || '',
    videoUrl: normalized.videoUrl || '',
    thumbnail: normalized.thumbnail || normalized.imageUrl || '',
    status: normalized.status || 'published',
    sortOrder: resolvedSortOrder,
  }
}

export default function VisualPageCms({ page, sections }) {
  const [active, setActive] = useState(sections[0])
  const [rawJsonText, setRawJsonText] = useState('')
  const [jsonError, setJsonError] = useState(null)
  const [showJsonEditor, setShowJsonEditor] = useState(false)
  const queryClient = useQueryClient()

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ['page-content', page],
    queryFn: async () => {
      const { data, error: requestError } = await supabase
        .from('page_content')
        .select('id,section,content,updated_at,status,sort_order')
        .eq('page', page)
      if (requestError) throw requestError
      return data || []
    },
  })

  const selectedSection = useMemo(() => rows.find((item) => item.section === active) ?? null, [rows, active])
  const currentContent = useMemo(() => normalizeSectionContent(selectedSection?.content), [selectedSection?.content])
  const defaults = useMemo(() => buildFormDefaults(selectedSection?.content, active, sections), [selectedSection?.content, active, sections])

  const form = useForm({ resolver: zodResolver(sectionSchema), defaultValues: defaults })

  useEffect(() => {
    form.reset(defaults)
    setRawJsonText(JSON.stringify(currentContent, null, 2))
    setJsonError(null)
  }, [defaults, currentContent, form])

  const mutation = useMutation({
    mutationFn: async (values) => {
      let finalContent = { ...currentContent, ...values }

      if (showJsonEditor && rawJsonText) {
        try {
          const parsed = JSON.parse(rawJsonText)
          finalContent = { ...finalContent, ...parsed }
        } catch (err) {
          throw new Error(`Invalid JSON syntax in advanced editor: ${err.message}`)
        }
      }

      const { error: requestError } = await supabase
        .from('page_content')
        .upsert(
          { page, section: active, content: finalContent, status: values.status || 'published', sort_order: values.sortOrder || 0, updated_at: new Date().toISOString() },
          { onConflict: 'page,section' }
        )
      if (requestError) throw requestError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content', page] })
      queryClient.invalidateQueries({ queryKey: ['page-content'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
    },
  })

  const remove = useMutation({
    mutationFn: async () => {
      const { error: requestError } = await supabase.from('page_content').delete().eq('page', page).eq('section', active)
      if (requestError) throw requestError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-content', page] })
      queryClient.invalidateQueries({ queryKey: ['page-content'] })
      queryClient.invalidateQueries({ queryKey: ['cms'] })
      form.reset(emptySection)
    },
  })

  const handleItemUpdate = (itemIndex, field, value) => {
    if (!Array.isArray(currentContent.items)) return
    const newItems = [...currentContent.items]
    if (typeof newItems[itemIndex] === 'object' && newItems[itemIndex] !== null) {
      newItems[itemIndex] = { ...newItems[itemIndex], [field]: value }
    } else {
      newItems[itemIndex] = value
    }
    const updated = { ...currentContent, items: newItems }
    setRawJsonText(JSON.stringify(updated, null, 2))
  }

  const handleAddItem = () => {
    const newItems = Array.isArray(currentContent.items) ? [...currentContent.items] : []
    const sampleItem = newItems.length > 0 && typeof newItems[0] === 'object'
      ? Object.fromEntries(Object.keys(newItems[0]).map(k => [k, k === 'id' ? `item-${Date.now()}` : '']))
      : { id: `item-${Date.now()}`, title: 'New Item', description: '' }
    newItems.push(sampleItem)
    const updated = { ...currentContent, items: newItems }
    setRawJsonText(JSON.stringify(updated, null, 2))
  }

  const handleRemoveItem = (index) => {
    if (!Array.isArray(currentContent.items)) return
    const newItems = currentContent.items.filter((_, i) => i !== index)
    const updated = { ...currentContent, items: newItems }
    setRawJsonText(JSON.stringify(updated, null, 2))
  }

  if (isLoading) return <div className="animate-pulse rounded-2xl bg-white/5 p-16 text-text-muted">Loading editor...</div>
  if (error) return <DatabaseSetupNotice error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['page-content', page] })} />

  return (
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-white/10 bg-white/[.04] p-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">{page}</p>
        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => setActive(section)}
            className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm transition ${
              active === section ? 'bg-primary/20 text-white font-semibold' : 'text-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <GripVertical className="h-4 w-4 opacity-50" />
            {section}
            <span className="ml-auto text-xs opacity-50">{index + 1}</span>
          </button>
        ))}
      </aside>

      <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-7">
        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Section editor</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{active}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowJsonEditor(!showJsonEditor)} className="admin-button-secondary">
              <Code className="h-4 w-4" />
              {showJsonEditor ? 'Form View' : 'Advanced JSON'}
            </button>
            <button type="button" onClick={() => remove.mutate()} className="admin-button-secondary text-red-200">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button form="section-form" className="admin-button-primary" disabled={mutation.isPending}>
              <Save className="h-4 w-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <form id="section-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
          <FormError message={form.formState.errors.root?.message || mutation.error?.message || jsonError} />

          {/* Core Content Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Eyebrow / Subtitle" registration={form.register('eyebrow')} />
            <Input label="Heading / Title" registration={form.register('heading')} />
          </div>

          <TextArea label="Description" registration={form.register('description')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Primary Button Label" registration={form.register('primaryLabel')} />
            <Input label="Primary Button URL" registration={form.register('primaryUrl')} />
            <Input label="Secondary Button Label" registration={form.register('secondaryLabel')} />
            <Input label="Secondary Button URL" registration={form.register('secondaryUrl')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <MediaField label="Image URL / Thumbnail" value={form.watch('imageUrl')} onChange={(val) => form.setValue('imageUrl', val)} />
            <MediaField label="Video URL" value={form.watch('videoUrl')} onChange={(val) => form.setValue('videoUrl', val)} />
          </div>

          {/* Structured Items List Editor (Cards, Services, Packages, FAQ, Testimonials, Badges, Software, etc.) */}
          {Array.isArray(currentContent.items) && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Section Items ({currentContent.items.length})</h3>
                  <p className="text-xs text-text-muted">Edit individual cards, list items, features, or options below.</p>
                </div>
                <button type="button" onClick={handleAddItem} className="admin-button-secondary text-xs">
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {currentContent.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-white/5 bg-white/[.02] p-4 relative group space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary uppercase">Item #{idx + 1} {item.title || item.name || item.question || item.skill || ''}</span>
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-300 p-1 text-xs">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {typeof item === 'object' && item !== null ? (
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        {Object.entries(item).map(([k, v]) => (
                          <label key={k} className="block space-y-1">
                            <span className="text-text-muted capitalize">{k}</span>
                            {typeof v === 'boolean' ? (
                              <input
                                type="checkbox"
                                checked={Boolean(v)}
                                onChange={(e) => handleItemUpdate(idx, k, e.target.checked)}
                                className="block mt-1"
                              />
                            ) : Array.isArray(v) ? (
                              <input
                                type="text"
                                value={v.join(', ')}
                                onChange={(e) => handleItemUpdate(idx, k, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                                className="admin-input"
                              />
                            ) : (
                              <input
                                type="text"
                                value={String(v ?? '')}
                                onChange={(e) => handleItemUpdate(idx, k, e.target.value)}
                                className="admin-input"
                              />
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={String(item)}
                        onChange={(e) => handleItemUpdate(idx, null, e.target.value)}
                        className="admin-input text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Raw JSON Editor Toggle */}
          {showJsonEditor && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <label className="block text-sm font-semibold text-primary">Advanced JSON Content Payload</label>
              <textarea
                value={rawJsonText}
                onChange={(e) => {
                  setRawJsonText(e.target.value)
                  try {
                    JSON.parse(e.target.value)
                    setJsonError(null)
                  } catch (err) {
                    setJsonError(`JSON Syntax Error: ${err.message}`)
                  }
                }}
                className="font-mono text-xs admin-input min-h-48 text-emerald-400 bg-black/60"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Status" registration={form.register('status')} options={['published', 'draft']} />
            <Input label="Sort Order" type="number" registration={form.register('sortOrder')} />
          </div>
        </form>
      </section>
    </div>
  )
}

function Input({ label, registration, type = 'text' }) {
  return (
    <label className="block text-sm font-medium text-white/80">
      {label}
      <input type={type} {...registration} className="admin-input mt-2" />
    </label>
  )
}

function TextArea({ label, registration }) {
  return (
    <label className="block text-sm font-medium text-white/80">
      {label}
      <textarea {...registration} className="admin-input mt-2 min-h-24" />
    </label>
  )
}

function Select({ label, registration, options }) {
  return (
    <label className="block text-sm font-medium text-white/80">
      {label}
      <select {...registration} className="admin-input mt-2">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function MediaField({ label, value, onChange }) {
  return (
    <label className="block text-sm font-medium text-white/80">
      {label}
      <input
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input mt-2"
        placeholder="https://..."
      />
    </label>
  )
}

function FormError({ message }) {
  return message ? (
    <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
      {isMissingSchemaError(message)
        ? 'This CMS section is not initialized yet. Run the database migration from Database Health.'
        : message}
    </p>
  ) : null
}
