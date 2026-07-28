import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export const emptyHireUsContent = {
  hero: { backgroundImage: '', backgroundVideo: '', heading: 'Let’s create something iconic.', subtitle: 'Hire Icon Editz', description: 'Tell us your story and we will bring it to life.', ctaText: 'Start a project', ctaUrl: '#enquiry' },
  enquiry_form: { title: 'Start your project', subtitle: 'A few details and we’ll be in touch.', successMessage: 'Thanks! We’ll get back to you shortly.', projectTypes: ['Video Editing', 'Graphic Design'], budgetOptions: ['Under ₹10K', '₹10K – ₹25K'], emailRecipient: '', whatsappNumber: '', enabledFields: { name: true, email: true, phone: true, budget: true, project: true, message: true } },
  contact: { phone: '', email: '', address: '', googleMap: '', workingHours: '' },
  social: { instagram: '', youtube: '', facebook: '', linkedin: '', x: '' },
  seo: { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' },
  features: [], services: [], gallery: [], faq: [],
}

export function useHireUsContent() {
  const [content, setContent] = useState(emptyHireUsContent)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const results = await Promise.all([
      supabase.from('hire_us_content').select('section, content'),
      supabase.from('hire_us_features').select('*').order('sort_order'),
      supabase.from('hire_us_services').select('*').order('sort_order'),
      supabase.from('hire_us_gallery_items').select('*').order('sort_order'),
      supabase.from('hire_us_faq_items').select('*').order('sort_order'),
    ])
    const issue = results.map(r => r.error).find(Boolean)
    if (issue) { setError(issue); setLoading(false); return }
    const staticSections = results[0].data.reduce((all, row) => ({ ...all, [row.section]: row.content }), {})
    setContent({ ...emptyHireUsContent, ...staticSections, features: results[1].data || [], services: results[2].data || [], gallery: results[3].data || [], faq: results[4].data || [] })
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const updateSection = useCallback((section, next) => setContent(current => ({ ...current, [section]: typeof next === 'function' ? next(current[section]) : next })), [])

  const save = useCallback(async (published = false) => {
    setSaving(true); setError(null)
    const staticSections = ['hero', 'enquiry_form', 'contact', 'social', 'seo'].map(section => ({ section, content: content[section], published_at: published ? new Date().toISOString() : null, updated_at: new Date().toISOString() }))
    const dynamic = [
      ['hire_us_features', content.features.map((v, i) => ({ ...v, id: typeof v.id === 'number' ? v.id : undefined, sort_order: i, published }))],
      ['hire_us_services', content.services.map((v, i) => ({ ...v, id: typeof v.id === 'number' ? v.id : undefined, sort_order: i, published }))],
      ['hire_us_gallery_items', content.gallery.map((v, i) => ({ ...v, id: typeof v.id === 'number' ? v.id : undefined, sort_order: i, published }))],
      ['hire_us_faq_items', content.faq.map((v, i) => ({ ...v, id: typeof v.id === 'number' ? v.id : undefined, sort_order: i, published }))],
    ]
    // Remove only rows that were explicitly taken out in the editor, then upsert
    // the remaining rows. This preserves generated database IDs and makes Delete real.
    const tasks = [supabase.from('hire_us_content').upsert(staticSections)]
    for (const [table, rows] of dynamic) {
      const { data: existing, error: existingError } = await supabase.from(table).select('id')
      if (existingError) { setError(existingError); setSaving(false); return false }
      const kept = new Set(rows.filter(row => typeof row.id === 'number').map(row => row.id))
      const removed = (existing || []).map(row => row.id).filter(id => !kept.has(id))
      if (removed.length) tasks.push(supabase.from(table).delete().in('id', removed))
      if (rows.length) tasks.push(supabase.from(table).upsert(rows))
    }
    const outcome = await Promise.all(tasks)
    const issue = outcome.map(r => r.error).find(Boolean)
    if (issue) setError(issue)
    else await fetchData()
    setSaving(false)
    return !issue
  }, [content, fetchData])

  return { content, loading, error, saving, refetch: fetchData, updateSection, save }
}
