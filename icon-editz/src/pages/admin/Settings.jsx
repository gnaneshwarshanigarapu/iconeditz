import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave, FiCheckCircle, FiShield, FiGlobe, FiDatabase, FiCloud, FiCreditCard } from 'react-icons/fi'
import { supabase } from '../../utils/supabase'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [notice, setNotice] = useState('')
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      siteName: 'ICON EDITZ',
      logoUrl: '/assets/images/og-icon-editz.png',
      faviconUrl: '/favicon.ico',
      contactEmail: 'contact@iconeditz.com',
      contactPhone: '+91 9876543210',
      seoTitle: 'Icon Editz | Video Editing & Motion Graphics Studio',
      seoDescription: 'Crafting high-impact video edits, motion graphics, and creative assets.',
      instagram: 'https://instagram.com/iconeditz',
      youtube: 'https://youtube.com/@iconeditz',
      ga4Id: 'G-XXXXXXXXXX',
      metaPixelId: 'META_123456789',
      resendKey: 're_123456789',
      storageProvider: 'supabase',
      storageBucket: 'uploads',
    },
  })

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .eq('id', 'site')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          reset(data.value)
        }
      })
  }, [reset])

  const onSubmit = async (values) => {
    setNotice('')
    try {
      const { error } = await supabase.from('settings').upsert({ id: 'site', value: values })
      if (error) throw error
      setNotice('✅ Settings updated and saved to Supabase successfully!')
    } catch (err) {
      setNotice(`🔴 Error saving settings: ${err.message}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'general', label: 'General & Branding', icon: FiGlobe },
          { id: 'seo', label: 'SEO & Social Links', icon: FiGlobe },
          { id: 'integrations', label: 'Analytics & SMTP', icon: FiShield },
          { id: 'infrastructure', label: 'Storage & Credentials', icon: FiDatabase },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon />
              {tab.label}
            </button>
          )
        })}
      </div>

      {notice && (
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs font-semibold text-white">
          {notice}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white mb-4">General Site Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-text-muted mb-1 font-semibold">Site Name</label>
                <input
                  {...register('siteName')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Contact Email</label>
                <input
                  {...register('contactEmail')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Logo URL</label>
                <input
                  {...register('logoUrl')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Favicon URL</label>
                <input
                  {...register('faviconUrl')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white mb-4">SEO Defaults & Social Media Handles</h3>
            <div>
              <label className="block text-text-muted mb-1 font-semibold">Default Meta Title</label>
              <input
                {...register('seoTitle')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-text-muted mb-1 font-semibold">Default Meta Description</label>
              <textarea
                {...register('seoDescription')}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <label className="block text-text-muted mb-1 font-semibold">Instagram Profile URL</label>
                <input
                  {...register('instagram')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">YouTube Channel URL</label>
                <input
                  {...register('youtube')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white mb-4">Tracking Pixels & Email SMTP</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-text-muted mb-1 font-semibold">Google Analytics 4 ID (GA4)</label>
                <input
                  {...register('ga4Id')}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-text-muted mb-1 font-semibold">Meta Pixel ID</label>
                <input
                  {...register('metaPixelId')}
                  placeholder="123456789"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Infrastructure Tab */}
        {activeTab === 'infrastructure' && (
          <div className="rounded-2xl border border-white/10 bg-[#120c24]/80 p-6 shadow-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white mb-4">Platform Infrastructure & Service Status</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <FiDatabase /> Database Status
                </div>
                <p className="text-text-muted">Supabase PostgreSQL Connected</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <FiCloud /> Storage Provider Architecture
                </div>
                <p className="text-text-muted">StorageService Active Provider: Supabase Storage (R2 Ready)</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <FiSave /> {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
