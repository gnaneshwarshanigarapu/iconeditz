import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { request } from '../utils/api'

const services = ['Video Editing', 'Motion Graphics', 'Branding', 'Logo Design', 'YouTube Editing', 'Instagram Reels', 'Wedding Editing', 'Commercial Ads', 'Other']
const initialForm = { client_name: '', email: '', phone: '', company: '', project_type: '', budget: '', deadline: '', location: '', service: '', message: '', reference_link: '', preferred_contact: 'Email' }
const fieldClass = 'mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20'

export default function HireFromUsPage() {
  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setNotice('')
    if (!event.currentTarget.reportValidity()) return
    setSubmitting(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => body.append(key, value))
      files.forEach((file) => body.append('files', file))
      await request('/api/hire-requests', { method: 'POST', body, token: null })
      setForm(initialForm)
      setFiles([])
      event.currentTarget.reset()
      setNotice('Thank you! We received your enquiry.')
    } catch (error) { setNotice(error.message || 'Unable to send your enquiry. Please try again.') } finally { setSubmitting(false) }
  }

  return <div className="relative overflow-hidden bg-[#0b0717] py-32 text-white"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,.25),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(192,38,211,.16),transparent_30%)]" />
    <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[.82fr_1fr] lg:px-8">
      <motion.section initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="self-center">
        <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-[.18em] text-violet-100">BOOK ICON EDITZ</span>
        <h1 className="mt-6 text-5xl font-semibold leading-[.96] tracking-tight sm:text-6xl">Let&apos;s Build Your<br />Next Creative<br />Project Together</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg">Tell us about your project and we&apos;ll prepare the perfect editing, motion graphics, branding, or content creation solution.</p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">{['Fast Response', 'Professional Editing', 'Brand Strategy', 'Worldwide Remote Service'].map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-xl"><span className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/20 text-violet-200"><Check className="h-4 w-4" /></span><span className="text-sm font-semibold">{item}</span></div>)}</div>
      </motion.section>

      <motion.form initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} onSubmit={submit} className="rounded-[2rem] border border-violet-500/20 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Client Name" required value={form.client_name} onChange={(v) => set('client_name', v)} />
          <Field label="Email Address" type="email" required value={form.email} onChange={(v) => set('email', v)} />
          <Field label="Phone Number" type="tel" required value={form.phone} onChange={(v) => set('phone', v)} />
          <Field label="Company (optional)" value={form.company} onChange={(v) => set('company', v)} />
          <Field label="Project Type" required value={form.project_type} onChange={(v) => set('project_type', v)} />
          <Field label="Budget" required value={form.budget} onChange={(v) => set('budget', v)} placeholder="e.g. ₹25,000–₹50,000" />
          <Field label="Deadline" type="date" required value={form.deadline} onChange={(v) => set('deadline', v)} />
          <Field label="Location" required value={form.location} onChange={(v) => set('location', v)} />
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white/80">Service Required</span><select required value={form.service} onChange={(e) => set('service', e.target.value)} className={fieldClass}><option value="">Select a service</option>{services.map((service) => <option key={service}>{service}</option>)}</select></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-white/80">Message</span><textarea required value={form.message} onChange={(e) => set('message', e.target.value)} rows="4" className={fieldClass} /></label>
          <Field label="Reference Link" type="url" value={form.reference_link} onChange={(v) => set('reference_link', v)} placeholder="https://" />
          <label className="block"><span className="text-sm font-medium text-white/80">Upload Files</span><input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-2 block w-full text-sm text-white/60 file:mr-3 file:rounded-full file:border-0 file:bg-violet-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-100" />{files.length > 0 && <p className="mt-2 text-xs text-white/50">{files.length} file(s) selected</p>}</label>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-white/80">Preferred Contact</legend><div className="mt-2 flex flex-wrap gap-3">{['Email', 'WhatsApp', 'Call'].map((option) => <label key={option} className="cursor-pointer"><input className="sr-only" type="radio" checked={form.preferred_contact === option} onChange={() => set('preferred_contact', option)} /><span className={`inline-flex rounded-full border px-4 py-2 text-sm ${form.preferred_contact === option ? 'border-violet-400/60 bg-violet-500/20 text-white' : 'border-white/10 bg-black/20 text-white/60'}`}>{option}</span></label>)}</div></fieldset>
        </div>
        {notice && <p className={`mt-5 rounded-xl border p-3 text-sm ${notice.startsWith('Thank') ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-red-400/30 bg-red-400/10 text-red-100'}`}>{notice}</p>}
        <button disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-4 font-semibold shadow-[0_0_28px_rgba(139,92,246,.45)] transition hover:scale-[1.01] disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}Send Project Enquiry</button>
      </motion.form>
    </div>
  </div>
}

function Field({ label, type = 'text', required, value, onChange, placeholder }) { return <label className="block"><span className="text-sm font-medium text-white/80">{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={fieldClass} /></label> }
