import React, { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

const blankPage = { title: '', slug: '', content: '', seo_title: '', seo_description: '', published: false }

export default function LegalPagesAdmin() {
  const [pages, setPages] = useState([])
  const [draft, setDraft] = useState(blankPage)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('legal_pages').select('*').order('title')
    setPages(data || [])
    setNotice(error?.message || '')
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const set = (field, value) => setDraft((current) => ({ ...current, [field]: value }))
  const save = async () => {
    if (!draft.title.trim() || !draft.slug.trim()) return setNotice('Title and slug are required.')
    const payload = { ...draft, slug: draft.slug.trim().replace(/^\/+|\/+$/g, '') }
    const { data, error } = draft.id
      ? await supabase.from('legal_pages').update(payload).eq('id', draft.id).select().single()
      : await supabase.from('legal_pages').insert(payload).select().single()
    if (error) return setNotice(error.message)
    setPages((current) => draft.id ? current.map((item) => item.id === data.id ? data : item) : [...current, data].sort((a, b) => a.title.localeCompare(b.title)))
    setDraft(data)
    setNotice('Legal page saved successfully.')
  }
  const remove = async () => {
    if (!draft.id) return
    const { error } = await supabase.from('legal_pages').delete().eq('id', draft.id)
    if (error) return setNotice(error.message)
    setPages((current) => current.filter((item) => item.id !== draft.id))
    setDraft(blankPage)
    setNotice('Legal page deleted.')
  }

  return <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <button onClick={() => { setDraft(blankPage); setNotice('') }} className="mb-3 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Add legal page</button>
      {loading ? <p className="p-3 text-sm text-text-muted">Loading...</p> : pages.map((item) => <button key={item.id} onClick={() => { setDraft(item); setNotice('') }} className={`mb-1 w-full rounded-xl px-3 py-2 text-left text-sm ${draft.id === item.id ? 'bg-primary/20 text-white' : 'text-text-muted hover:bg-white/5'}`}>{item.title}</button>)}
    </aside>
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">Legal Page Editor</h2><div className="flex gap-2"><button onClick={save} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Save</button>{draft.id && <button onClick={remove} className="rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-300">Delete</button>}</div></div>
      {notice && <p className="rounded-xl border border-white/10 px-3 py-2 text-sm text-text-muted">{notice}</p>}
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Title" value={draft.title} onChange={(value) => set('title', value)} /><Field label="Slug" value={draft.slug} onChange={(value) => set('slug', value)} /></div>
      <Field label="SEO title" value={draft.seo_title || ''} onChange={(value) => set('seo_title', value)} />
      <Field label="SEO description" value={draft.seo_description || ''} onChange={(value) => set('seo_description', value)} textarea />
      <Field label="Content" value={draft.content} onChange={(value) => set('content', value)} textarea large />
      <label className="flex items-center gap-2 text-sm text-text-muted"><input type="checkbox" checked={draft.published} onChange={(event) => set('published', event.target.checked)} /> Publish this page</label>
    </div>
  </div>
}

function Field({ label, value, onChange, textarea, large }) {
  const className = "w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-primary"
  return <label className="block text-sm text-text-muted">{label}{textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${className} mt-2 ${large ? 'min-h-64' : 'min-h-24'}`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={`${className} mt-2`} />}</label>
}
