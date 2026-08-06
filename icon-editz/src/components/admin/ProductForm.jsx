import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FiFolder, FiUploadCloud, FiImage, FiVideo, FiFileText } from 'react-icons/fi'
import MediaPickerModal from './MediaPickerModal'

export default function ProductForm({ defaultValues, onSubmit }) {
  const [activeMediaTarget, setActiveMediaTarget] = useState(null) // 'thumbnail', 'demoVideo', 'downloadUrl'

  const defaults = useMemo(
    () => ({
      title: '',
      category: 'Instagram Reels',
      thumbnail: '',
      screenshots: '',
      demoVideo: '',
      downloadUrl: '',
      description: '',
      features: '',
      price: '',
      discountPrice: '',
      tags: '',
      status: 'published',
      featured: true,
      ...(defaultValues || {}),
    }),
    [defaultValues],
  )

  const { register, handleSubmit, control, reset, setValue, watch } = useForm({ defaultValues: defaults })

  useEffect(() => reset(defaults), [defaults, reset])

  const watchThumbnail = watch('thumbnail')
  const watchDemoVideo = watch('demoVideo')

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#0b0717]/80 px-3.5 py-2.5 text-xs text-white outline-none transition-all placeholder:text-text-muted focus:border-primary/50 focus:bg-white/[0.08]'
  const labelClass = 'mb-1.5 block text-xs font-semibold text-text-muted'

  const handleMediaSelect = (url) => {
    if (activeMediaTarget) {
      setValue(activeMediaTarget, url)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
      {/* Title & Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Product Title *</label>
          <input {...register('title', { required: true })} className={inputClass} placeholder="e.g. 3D Lyrics Video Pack" />
        </div>

        <div>
          <label className={labelClass}>Category *</label>
          <select {...register('category')} className={inputClass}>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="Wedding Videos">Wedding Videos</option>
            <option value="Birthday Videos">Birthday Videos</option>
            <option value="3D Lyric Videos">3D Lyric Videos</option>
            <option value="YouTube Content">YouTube Content</option>
            <option value="Motion Graphics">Motion Graphics</option>
          </select>
        </div>
      </div>

      {/* Pricing & Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label className={labelClass}>Regular Price (₹) *</label>
          <input type="number" step="1" {...register('price', { required: true })} className={inputClass} placeholder="1999" />
        </div>
        <div>
          <label className={labelClass}>Sale Price (₹)</label>
          <input type="number" step="1" {...register('discountPrice')} className={inputClass} placeholder="1499" />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select {...register('status')} className={inputClass}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Featured Asset</label>
          <select {...register('featured')} className={inputClass}>
            <option value={true}>Yes (Featured)</option>
            <option value={false}>No</option>
          </select>
        </div>
      </div>

      {/* Thumbnail with Media Library Picker */}
      <div>
        <label className={labelClass}>Thumbnail Image URL *</label>
        <div className="flex gap-2">
          <input {...register('thumbnail', { required: true })} className={inputClass} placeholder="https://..." />
          <button
            type="button"
            onClick={() => setActiveMediaTarget('thumbnail')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/20 px-3 py-2 text-xs font-bold text-white hover:bg-primary/30"
          >
            <FiFolder /> Media Library
          </button>
        </div>
        {watchThumbnail && (
          <div className="mt-2 h-20 w-32 overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <img src={watchThumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* Demo Video URL with Media Library Picker */}
      <div>
        <label className={labelClass}>Demo Video Preview URL</label>
        <div className="flex gap-2">
          <input {...register('demoVideo')} className={inputClass} placeholder="https://...mp4" />
          <button
            type="button"
            onClick={() => setActiveMediaTarget('demoVideo')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/20 px-3 py-2 text-xs font-bold text-white hover:bg-primary/30"
          >
            <FiVideo /> Pick Video
          </button>
        </div>
      </div>

      {/* Protected ZIP Asset Download URL */}
      <div>
        <label className={labelClass}>Protected ZIP File Download URL (Cloudflare R2 / Supabase Storage)</label>
        <div className="flex gap-2">
          <input {...register('downloadUrl')} className={inputClass} placeholder="https://...product-pack.zip" />
          <button
            type="button"
            onClick={() => setActiveMediaTarget('downloadUrl')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
          >
            <FiFileText /> Pick ZIP File
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className={inputClass}
              rows={4}
              placeholder="Detailed description of project asset, software format, layers, resolutions..."
            />
          )}
        />
      </div>

      {/* Features & Tags */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Features List (comma-separated)</label>
          <input {...register('features')} className={inputClass} placeholder="1080p 60fps, After Effects template, Music included" />
        </div>

        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input {...register('tags')} className={inputClass} placeholder="3D, Lyrics, Motion, Fast Beat" />
        </div>
      </div>

      {/* Submit */}
      <div className="pt-3">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-hover hover:scale-[1.01] transition-all"
        >
          Save & Publish Product
        </button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={Boolean(activeMediaTarget)}
        onClose={() => setActiveMediaTarget(null)}
        onSelect={handleMediaSelect}
      />
    </form>
  )
}
