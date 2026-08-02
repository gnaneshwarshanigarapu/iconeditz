import React, { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Copy, Eye, GripVertical, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import DatabaseSetupNotice, { isMissingSchemaError } from './DatabaseSetupNotice'

const sectionSchema = z.object({
  eyebrow: z.string().max(80).optional(), heading: z.string().max(160).optional(), description: z.string().max(2000).optional(),
  primaryLabel: z.string().max(60).optional(), primaryUrl: z.string().max(300).optional(), secondaryLabel: z.string().max(60).optional(), secondaryUrl: z.string().max(300).optional(),
  imageUrl: z.string().max(1000).optional(), videoUrl: z.string().max(1000).optional(), status: z.enum(['draft', 'published']), sortOrder: z.coerce.number().int().min(0),
})

const emptySection = { eyebrow: '', heading: '', description: '', primaryLabel: '', primaryUrl: '', secondaryLabel: '', secondaryUrl: '', imageUrl: '', videoUrl: '', status: 'draft', sortOrder: 0 }

export default function VisualPageCms({ page, sections }) {
  const [active, setActive] = useState(sections[0])
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading, error } = useQuery({ queryKey: ['page-content', page], queryFn: async () => {
    const { data, error: requestError } = await supabase.from('page_content').select('id,section,content,updated_at').eq('page', page)
    if (requestError) throw requestError
    const current = data || []
    const existing = new Set(current.map((item) => item.section))
    const defaults = sections.filter((section) => !existing.has(section)).map((section, sortOrder) => ({ page, section, content: { ...emptySection, sortOrder: sections.indexOf(section) }, status: 'published', sort_order: sortOrder }))
    if (defaults.length) {
      const { error: seedError } = await supabase.from('page_content').upsert(defaults, { onConflict: 'page,section' })
      if (seedError) throw seedError
      const { data: seeded, error: reloadError } = await supabase.from('page_content').select('id,section,content,updated_at').eq('page', page)
      if (reloadError) throw reloadError
      return seeded || []
    }
    return current
  } })
  const row = rows.find((item) => item.section === active)
  const defaults = useMemo(() => ({ ...emptySection, sortOrder: sections.indexOf(active), ...(row?.content || {}) }), [row, active, sections])
  const form = useForm({ resolver: zodResolver(sectionSchema), defaultValues: defaults })
  useEffect(() => form.reset(defaults), [defaults, form])
  const mutation = useMutation({ mutationFn: async (values) => {
    const { error: requestError } = await supabase.from('page_content').upsert({ page, section: active, content: values, updated_at: new Date().toISOString() }, { onConflict: 'page,section' })
    if (requestError) throw requestError
  }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['page-content', page] }); queryClient.invalidateQueries({ queryKey: ['cms'] }) } })
  const remove = useMutation({ mutationFn: async () => { const { error: requestError } = await supabase.from('page_content').delete().eq('page', page).eq('section', active); if (requestError) throw requestError }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['page-content', page] }); queryClient.invalidateQueries({ queryKey: ['cms'] }); form.reset(emptySection) } })
  const duplicate = async () => { const values = form.getValues(); const { error: requestError } = await supabase.from('page_content').upsert({ page, section: `${active} Copy`, content: values }, { onConflict: 'page,section' }); if (requestError) return form.setError('root', { message: requestError.message }); queryClient.invalidateQueries({ queryKey: ['page-content', page] }); queryClient.invalidateQueries({ queryKey: ['cms'] }) }
  if (isLoading) return <div className="animate-pulse rounded-2xl bg-white/5 p-16 text-text-muted">Loading editor...</div>
  if (error) return <DatabaseSetupNotice error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['page-content', page] })} />
  return <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]"><aside className="rounded-2xl border border-white/10 bg-white/[.04] p-3"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted">{page}</p>{sections.map((section, index) => <button key={section} onClick={() => setActive(section)} className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm ${active === section ? 'bg-primary/20 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}><GripVertical className="h-4 w-4 opacity-50" />{section}<span className="ml-auto text-xs opacity-50">{index + 1}</span></button>)}</aside><section className="rounded-2xl border border-white/10 bg-white/[.04] p-5 sm:p-7"><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Section editor</p><h2 className="mt-1 text-2xl font-bold text-white">{active}</h2></div><div className="flex flex-wrap gap-2"><button type="button" onClick={duplicate} className="admin-button-secondary"><Copy className="h-4 w-4" />Duplicate</button><button type="button" onClick={() => remove.mutate()} className="admin-button-secondary text-red-200"><Trash2 className="h-4 w-4" />Delete</button><button form="section-form" className="admin-button-primary" disabled={mutation.isPending}><Save className="h-4 w-4" />{mutation.isPending ? 'Saving...' : 'Save'}</button></div></div><form id="section-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6"><FormError message={form.formState.errors.root?.message || mutation.error?.message} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Eyebrow" registration={form.register('eyebrow')} /><Input label="Heading" registration={form.register('heading')} /></div><TextArea label="Description" registration={form.register('description')} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Primary button label" registration={form.register('primaryLabel')} /><Input label="Primary button URL" registration={form.register('primaryUrl')} /><Input label="Secondary button label" registration={form.register('secondaryLabel')} /><Input label="Secondary button URL" registration={form.register('secondaryUrl')} /></div><div className="grid gap-4 sm:grid-cols-2"><MediaField label="Image" value={form.watch('imageUrl')} onChange={(value) => form.setValue('imageUrl', value)} /><MediaField label="Video" value={form.watch('videoUrl')} onChange={(value) => form.setValue('videoUrl', value)} /></div><div className="grid gap-4 sm:grid-cols-2"><Select label="Status" registration={form.register('status')} options={['draft', 'published']} /><Input label="Sort order" type="number" registration={form.register('sortOrder')} /></div><div className="flex justify-end"><button type="button" className="admin-button-secondary"><Eye className="h-4 w-4" />Live preview</button></div></form></section></div>
}

function Input({ label, registration, type = 'text' }) { return <label className="block text-sm font-medium text-white/80">{label}<input type={type} {...registration} className="admin-input mt-2" /></label> }
function TextArea({ label, registration }) { return <label className="block text-sm font-medium text-white/80">{label}<textarea {...registration} className="admin-input mt-2 min-h-32" /></label> }
function Select({ label, registration, options }) { return <label className="block text-sm font-medium text-white/80">{label}<select {...registration} className="admin-input mt-2">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> }
function MediaField({ label, value, onChange }) { return <label className="block text-sm font-medium text-white/80">{label} URL<input value={value || ''} onChange={(event) => onChange(event.target.value)} className="admin-input mt-2" placeholder="Upload integration ready" /></label> }
function FormError({ message }) { return message ? <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{isMissingSchemaError(message) ? 'This CMS section is not initialized yet. Run the database migration from Database Health.' : 'Could not save this section. Please try again.'}</p> : null }
