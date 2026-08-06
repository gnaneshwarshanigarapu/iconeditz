import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FiFolder, FiUploadCloud, FiImage, FiFileText, FiX, FiSave } from 'react-icons/fi'
import MediaPickerModal from './MediaPickerModal'
import { request } from '../../utils/api'

export default function ProductForm({ defaultValues, onSubmit, isEditing = false }) {
  const [activeMediaTarget, setActiveMediaTarget] = useState(null) // 'thumbnail', 'mainImage', 'downloadUrl'
  const [uploadingField, setUploadingField] = useState(null)

  const defaults = useMemo(
    () => ({
      title: '',
      slug: '',
      category: '',
      price: 0,
      discountPrice: 0,
      description: '',
      downloadUrl: '',
      thumbnail: '',
      mainImage: '',
      screenshots: '',
      demoVideo: '',
      features: '',
      tags: '',
      status: 'published',
      ...(defaultValues || {}),
    }),
    [defaultValues],
  )

  const { register, handleSubmit, control, reset, setValue, watch } = useForm({ defaultValues: defaults })

  useEffect(() => {
    reset(defaults)
  }, [defaults, reset])

  const watchTitle = watch('title')
  const watchSlug = watch('slug')
  const watchThumbnail = watch('thumbnail')
  const watchMainImage = watch('mainImage')

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !isEditing && !watchSlug) {
      const generatedSlug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setValue('slug', generatedSlug)
    }
  }, [watchTitle, isEditing, watchSlug, setValue])

  const handleMediaSelect = (url) => {
    if (activeMediaTarget) {
      setValue(activeMediaTarget, url)
      setActiveMediaTarget(null)
    }
  }

  const handleDirectUpload = async (e, fieldName) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingField(fieldName)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await request('/api/uploads', {
        method: 'POST',
        body: formData,
      })
      if (res.data?.url) {
        setValue(fieldName, res.data.url)
      }
    } catch (err) {
      alert(`Upload error: ${err.message}`)
    } finally {
      setUploadingField(null)
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-[#0b0717]/90 px-4 py-3 text-xs text-white outline-none transition-all placeholder:text-text-muted/60 focus:border-primary/50 focus:bg-white/[0.06]'
  const labelClass = 'mb-1.5 block text-xs font-semibold text-text-muted/90'

  return (
    <div className="space-y-6 text-xs max-w-5xl mx-auto">
      {/* Product Title Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0e081f]/90 p-5 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {isEditing ? 'Edit Product Asset' : 'New Product'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Main Product Info Card (Matches Screenshot 3/5) */}
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl space-y-4 backdrop-blur-xl">
          {/* Product Name & Slug */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Product Name *</label>
              <input
                {...register('title', { required: true })}
                className={inputClass}
                placeholder="e.g. SFX Pack for Editors"
              />
            </div>

            <div>
              <label className={labelClass}>Slug *</label>
              <input
                {...register('slug', { required: true })}
                className={`${inputClass} font-mono text-emerald-400`}
                placeholder="sfx-pack-for-editors"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <input
              {...register('category')}
              className={inputClass}
              placeholder="e.g., LUT Pack, Instagram Reels, 3D Lyrics"
            />
          </div>

          {/* Price & Sale Price */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Price (₹)</label>
              <input
                type="number"
                step="1"
                {...register('price')}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div>
              <label className={labelClass}>Sale Price (₹)</label>
              <input
                type="number"
                step="1"
                {...register('discountPrice')}
                className={inputClass}
                placeholder="0"
              />
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
                  className={`${inputClass} leading-relaxed`}
                  rows={5}
                  placeholder="Detailed description of the product pack..."
                />
              )}
            />
          </div>
        </div>

        {/* Private Paid Download Card (Matches Screenshot 3/5) */}
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl space-y-3 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Private Paid Download</h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Use this for ZIP files, project files, LUT packs, templates, and paid course materials. Customers can access this only after successful payment.
            </p>
          </div>

          <div>
            <label className={labelClass}>Legacy Download File URL</label>
            <input
              {...register('downloadUrl')}
              className={inputClass}
              placeholder="https://example.com/file.zip"
            />
          </div>

          <div className="pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all">
              <FiUploadCloud />
              <span>{uploadingField === 'downloadUrl' ? 'Uploading ZIP...' : 'Upload Private File'}</span>
              <input
                type="file"
                className="hidden"
                accept=".zip,.rar,.7z,.pdf,.mp4"
                onChange={(e) => handleDirectUpload(e, 'downloadUrl')}
              />
            </label>
          </div>
        </div>

        {/* Thumbnail Image Card (Matches Screenshot 3/5) */}
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl space-y-3 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Thumbnail Image</h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Recommended Thumbnail Image Size: 1080 × 1080 px. Ratio: 1:1 square. Used only for Assets product cards.
            </p>
          </div>

          <div>
            <label className={labelClass}>Thumbnail Image URL</label>
            <input
              {...register('thumbnail')}
              className={inputClass}
              placeholder="https://assets.iconeditz.com/products/..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all">
              <FiUploadCloud />
              <span>{uploadingField === 'thumbnail' ? 'Uploading Image...' : 'Upload Image'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleDirectUpload(e, 'thumbnail')}
              />
            </label>

            <button
              type="button"
              onClick={() => setActiveMediaTarget('thumbnail')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <FiFolder />
              <span>Select from Media Library</span>
            </button>
          </div>

          {watchThumbnail && (
            <div className="mt-3 h-24 w-36 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src={watchThumbnail} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Main Product Image Card (Matches Screenshot 3/5) */}
        <div className="rounded-2xl border border-white/10 bg-[#0e081f]/90 p-6 shadow-xl space-y-3 backdrop-blur-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Main Product Image</h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              Used on product detail page hero. Recommended size: 1200 × 900 px or 1600 × 1200 px. For wide product posters use 1920 × 1080 px.
            </p>
          </div>

          <div>
            <label className={labelClass}>Main Product Image URL</label>
            <input
              {...register('mainImage')}
              className={inputClass}
              placeholder="https://assets.iconeditz.com/products/..."
            />
            <span className="mt-1 block text-[10px] text-text-muted/70">Accepted formats: JPG, PNG, WEBP</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all">
              <FiUploadCloud />
              <span>{uploadingField === 'mainImage' ? 'Uploading Image...' : 'Upload Image'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleDirectUpload(e, 'mainImage')}
              />
            </label>

            <button
              type="button"
              onClick={() => setActiveMediaTarget('mainImage')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <FiFolder />
              <span>Select from Media Library</span>
            </button>
          </div>

          {watchMainImage && (
            <div className="mt-3 h-28 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src={watchMainImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* Form Action Buttons */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#8c46ff] px-8 py-3 text-xs font-bold text-white shadow-xl shadow-purple-600/30 hover:bg-[#7b35f0] hover:scale-[1.01] transition-all"
          >
            <FiSave className="text-base" />
            <span>Save Product Asset</span>
          </button>
        </div>
      </form>

      {/* Reusable Media Library Modal */}
      <MediaPickerModal
        isOpen={Boolean(activeMediaTarget)}
        onClose={() => setActiveMediaTarget(null)}
        onSelect={handleMediaSelect}
      />
    </div>
  )
}
