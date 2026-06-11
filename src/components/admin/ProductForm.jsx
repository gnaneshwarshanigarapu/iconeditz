import React, { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'

export default function ProductForm({ defaultValues, onSubmit }) {
  const defaults = useMemo(
    () => ({
      title: '',
      category: '',
      thumbnail: '',
      screenshots: '',
      demoVideo: '',
      description: '',
      features: '',
      price: '',
      discountPrice: '',
      tags: '',
      status: 'draft',
      ...(defaultValues || {}),
    }),
    [defaultValues],
  )

  const { register, handleSubmit, control, reset } = useForm({ defaultValues: defaults })

  useEffect(() => reset(defaults), [defaults, reset])

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-[#0b0717]/70 px-3 py-2.5 text-white outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20'
  const labelClass = 'mb-2 block text-sm font-semibold text-text-muted'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>Title</label>
        <input {...register('title')} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <input {...register('category')} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Price</label>
          <input type="number" step="0.01" {...register('price')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Discount Price</label>
          <input type="number" step="0.01" {...register('discountPrice')} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Thumbnail URL</label>
        <input {...register('thumbnail')} className={inputClass} placeholder="/assets/images/product.jpg" />
      </div>

      <div>
        <label className={labelClass}>Screenshots (comma-separated URLs)</label>
        <input {...register('screenshots')} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Demo Video URL</label>
        <input {...register('demoVideo')} className={inputClass} placeholder="/videos/demo.mp4" />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea {...field} className={inputClass} rows={6} />
          )}
        />
      </div>

      <div>
        <label className={labelClass}>Features (comma-separated)</label>
        <input {...register('features')} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input {...register('tags')} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Status</label>
        <select {...register('status')} className={inputClass}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <button type="submit" className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary-hover">Save Product</button>
      </div>
    </form>
  )
}
