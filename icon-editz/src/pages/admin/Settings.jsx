import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../utils/supabase'

export default function Settings() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({ defaultValues: { analytics: { gtmId: '', gaId: '', metaPixelId: '', clarityId: '' } } })
  const [loading, setLoading] = useState(true); const [notice, setNotice] = useState('')
  useEffect(() => { supabase.from('settings').select('key,value').then(({ data, error }) => { if (error) setNotice(error.message); else reset({ analytics: (data || []).reduce((all, row) => ({ ...all, [row.key]: row.value }), {}) }); setLoading(false) }) }, [reset])
  const submit = async ({ analytics }) => { setNotice(''); const rows = Object.entries(analytics).map(([key, value]) => ({ key, value })); const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' }); setNotice(error ? error.message : 'Settings saved successfully.') }
  if (loading) return <p className="text-text-muted">Loading settings…</p>
  return <form onSubmit={handleSubmit(submit)} className="max-w-4xl space-y-6"><div><h2 className="text-2xl font-bold">SEO & Analytics Settings</h2><p className="text-text-muted">Settings are saved directly to Supabase.</p></div><div className="grid gap-5 rounded-2xl border border-white/10 bg-white/[.05] p-6 md:grid-cols-2">{[['gtmId','Google Tag Manager ID','GTM-XXXXXX'],['gaId','Google Analytics ID','G-XXXXXXXXXX'],['metaPixelId','Meta Pixel ID','META_PIXEL_ID'],['clarityId','Microsoft Clarity Project ID','CLARITY_PROJECT_ID']].map(([key,label,placeholder]) => <label key={key} className="block text-sm font-medium">{label}<input {...register(`analytics.${key}`)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white" /></label>)}</div>{notice && <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">{notice}</p>}<button disabled={isSubmitting} className="rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-60">{isSubmitting ? 'Saving…' : 'Save Settings'}</button></form>
}
