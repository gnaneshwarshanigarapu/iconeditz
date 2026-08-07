import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabaseAdmin.js'
import { authorizeAdmin, tryAuthenticate } from '../lib/auth.js'
import { withApi } from '../lib/handler.js'

const productSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().min(1).optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().nonnegative().optional(),
    published: z.boolean().optional(),
  })
  .passthrough()

const slugify = (value) =>
  String(value || 'product')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'product'

async function uniqueSlug(value, excludeId) {
  const base = slugify(value)
  let candidate = base
  let suffix = 2
  while (true) {
    let query = supabaseAdmin.from('products').select('id').eq('slug', candidate).maybeSingle()
    const { data, error } = await query
    if (error) throw error
    if (!data || data.id === excludeId) return candidate
    candidate = `${base}-${suffix++}`
  }
}

/**
 * Sanitizes input body to only include valid PostgreSQL columns for public.products table.
 * Prevents PGRST204 errors caused by non-existent columns (e.g., discountPrice, mainImage).
 */
function sanitizeProductPayload(body) {
  const payload = {}

  if (body.title !== undefined) payload.title = String(body.title).trim()
  if (body.category !== undefined) payload.category = String(body.category).trim()
  if (body.description !== undefined) payload.description = body.description ? String(body.description) : null

  // Prices
  if (body.price !== undefined) payload.price = Number(body.price || 0)
  if (body.discountPrice !== undefined || body.discount_price !== undefined) {
    const val = body.discountPrice ?? body.discount_price
    payload.discount_price = val !== '' && val !== null && val !== undefined ? Number(val) : null
  }

  // Media & Download URLs
  if (body.thumbnail !== undefined || body.thumbnail_path !== undefined) {
    const thumb = body.thumbnail ?? body.thumbnail_path
    payload.thumbnail_path = thumb ? String(thumb).trim() : null
  }
  if (body.downloadUrl !== undefined || body.zip_path !== undefined) {
    const zip = body.downloadUrl ?? body.zip_path
    payload.zip_path = zip ? String(zip).trim() : null
  }
  if (body.download_key !== undefined || body.downloadKey !== undefined || body.r2_object_key !== undefined) {
    const key = body.download_key ?? body.downloadKey ?? body.r2_object_key
    payload.download_key = key ? String(key).trim() : null
  }
  if (body.download_filename !== undefined || body.downloadFilename !== undefined || body.original_filename !== undefined) {
    const name = body.download_filename ?? body.downloadFilename ?? body.original_filename
    payload.download_filename = name ? String(name).trim() : null
  }
  if (body.storage_provider !== undefined || body.storageProvider !== undefined) {
    const prov = body.storage_provider ?? body.storageProvider
    payload.storage_provider = prov ? String(prov).trim() : 'r2'
  } else if (payload.download_key) {
    payload.storage_provider = 'r2'
  }
  if (body.download_type !== undefined || body.downloadType !== undefined) {
    const dt = body.download_type ?? body.downloadType
    payload.download_type = dt ? String(dt).trim() : 'r2'
  } else if (payload.download_key) {
    payload.download_type = 'r2'
  }
  if (body.file_size !== undefined || body.fileSize !== undefined) {
    const sz = body.file_size ?? body.fileSize
    payload.file_size = sz ? Number(sz) : null
  }
  if (body.content_type !== undefined || body.contentType !== undefined) {
    const ct = body.content_type ?? body.contentType
    payload.content_type = ct ? String(ct).trim() : null
  }
  if (body.demoVideo !== undefined || body.demo_video !== undefined) {
    const vid = body.demoVideo ?? body.demo_video
    payload.demo_video = vid ? String(vid).trim() : null
  }

  // Arrays / JSON
  if (body.features !== undefined) {
    payload.features = Array.isArray(body.features)
      ? body.features
      : String(body.features || '').split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (body.screenshots !== undefined) {
    payload.screenshots = Array.isArray(body.screenshots)
      ? body.screenshots
      : String(body.screenshots || '').split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (body.tags !== undefined) {
    payload.tags = Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || '').split(',').map((s) => s.trim()).filter(Boolean)
  }

  // Status & Published flag
  if (body.status !== undefined) payload.status = String(body.status)
  if (body.published !== undefined) payload.published = Boolean(body.published)
  else if (body.status !== undefined) payload.published = body.status === 'published'

  payload.updated_at = new Date().toISOString()
  return payload
}

async function handleGetProducts(req, res) {
  const productId = req.query.id
  if (productId) return handleGetProduct(req, res, productId)
  const user = await tryAuthenticate(req)
  let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false })

  if (user?.role !== 'admin') {
    query = query.or('published.eq.true,status.eq.published')
  }

  if (req.query.category) {
    query = query.eq('category', req.query.category)
  }

  const { data, error } = await query
  if (error) throw error
  const mapped = (data || []).map((p) => ({
    ...p,
    thumbnail: p.thumbnail_path || p.thumbnail || '/assets/images/og-icon-editz.png',
    discountPrice: p.discount_price ?? p.discountPrice ?? p.price,
    downloadUrl: p.zip_path || p.downloadUrl || '',
    downloadKey: p.download_key || p.r2_object_key || null,
    downloadFilename: p.download_filename || null,
    demoVideo: p.demo_video || p.demoVideo || '',
  }))
  return res.json({ data: mapped, products: mapped })
}

export async function handleGetProduct(req, res, requestedId = req.query.id) {
  const productId = typeof requestedId === 'string' ? requestedId.trim() : ''
  const isAdmin = (await tryAuthenticate(req))?.role === 'admin'
  if (!productId) {
    return res
      .status(400)
      .json({ success: false, code: 'INVALID_PRODUCT', error: 'Product identifier is required' })
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const lookupColumn = uuidPattern.test(productId) ? 'id' : 'slug'

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq(lookupColumn, productId)
    .maybeSingle()

  if (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
  if (!data) {
    return res.status(404).json({ success: false, code: 'PRODUCT_NOT_FOUND', error: 'Product not found' })
  }
  if (data.deleted_at) {
    return res.status(404).json({ success: false, code: 'PRODUCT_DELETED', error: 'Product has been deleted' })
  }

  const thumbnail = data.thumbnail_path || data.thumbnail || '/assets/images/og-icon-editz.png'
  const discountPrice = data.discount_price ?? data.discountPrice ?? data.price
  const downloadUrl = data.zip_path || data.downloadUrl || ''
  const downloadKey = data.download_key || data.r2_object_key || null
  const downloadFilename = data.download_filename || null
  const demoVideo = data.demo_video || data.demoVideo || ''

  const formatted = {
    ...data,
    thumbnail,
    discountPrice,
    downloadUrl,
    downloadKey,
    downloadFilename,
    demoVideo,
    adminPreview: isAdmin,
  }

  return res.json({
    success: true,
    data: formatted,
    product: formatted,
  })
}

async function handleAdminProductActions(req, res) {
  await authorizeAdmin(req)

  const body = req.method !== 'DELETE' ? productSchema.parse(req.body) : {}
  const id = req.query.id || body.id

  switch (req.method) {
    case 'POST': {
      const sanitized = sanitizeProductPayload(body)
      sanitized.slug = await uniqueSlug(body.slug || body.title)
      sanitized.created_at = new Date().toISOString()

      console.log('[Database Save Product - POST]', {
        title: sanitized.title,
        slug: sanitized.slug,
        download_key: sanitized.download_key,
        download_filename: sanitized.download_filename,
        storage_provider: sanitized.storage_provider,
        price: sanitized.price,
      })

      const { data, error } = await supabaseAdmin.from('products').insert([sanitized]).select().single()
      if (error) throw error

      const formatted = {
        ...data,
        thumbnail: data.thumbnail_path || '/assets/images/og-icon-editz.png',
        discountPrice: data.discount_price ?? data.price,
        downloadKey: data.download_key || null,
      }
      return res.status(201).json({ success: true, data: formatted, product: formatted })
    }
    case 'PUT': {
      if (!id) throw Object.assign(new Error('Product ID is required for updates'), { status: 400 })
      const sanitized = sanitizeProductPayload(body)
      if (body.slug || body.title) {
        sanitized.slug = await uniqueSlug(body.slug || body.title, id)
      }

      console.log('[Database Save Product - PUT]', {
        id,
        title: sanitized.title,
        download_key: sanitized.download_key,
        download_filename: sanitized.download_filename,
        storage_provider: sanitized.storage_provider,
      })

      const { data, error } = await supabaseAdmin.from('products').update(sanitized).eq('id', id).select().single()
      if (error) throw error

      const formatted = {
        ...data,
        thumbnail: data.thumbnail_path || '/assets/images/og-icon-editz.png',
        discountPrice: data.discount_price ?? data.price,
        downloadKey: data.download_key || null,
      }
      return res.json({ success: true, data: formatted, product: formatted })
    }
    case 'DELETE': {
      if (!id) throw Object.assign(new Error('Product ID is required for deletion'), { status: 400 })
      const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
      if (error) throw error
      return res.json({ success: true })
    }
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` })
  }
}

export default withApi({
  GET: handleGetProducts,
  POST: handleAdminProductActions,
  PUT: handleAdminProductActions,
  DELETE: handleAdminProductActions,
})
