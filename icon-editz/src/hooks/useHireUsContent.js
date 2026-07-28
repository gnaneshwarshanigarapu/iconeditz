import { useState, useEffect, useCallback } from 'react'
import { request } from '../utils/api'

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
    try { const data = await request('/api/cms/hire-us', { token: null }); const staticSections = data.sections.reduce((all, row) => ({ ...all, [row.section]: row.content }), {}); setContent({ ...emptyHireUsContent, ...staticSections, features: data.features || [], services: data.services || [], gallery: data.gallery || [], faq: data.faq || [] }) }
    catch (issue) { setError(issue) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  const updateSection = useCallback((section, next) => setContent(current => ({ ...current, [section]: typeof next === 'function' ? next(current[section]) : next })), [])

  const save = useCallback(async (published = false) => {
    setSaving(true); setError(null)
    try { await request('/api/cms/hire-us', { method: 'PUT', body: { sections: ['hero','enquiry_form','contact','social','seo'].map(section => ({ section, content: content[section] })), features: content.features, services: content.services, gallery: content.gallery, faq: content.faq, published } }); await fetchData(); setSaving(false); return true }
    catch (issue) { setError(issue) }
    setSaving(false)
    return false
  }, [content, fetchData])

  return { content, loading, error, saving, refetch: fetchData, updateSection, save }
}
