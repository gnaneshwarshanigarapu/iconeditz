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
    thumbnail: p.thumbnail || p.thumbnail_path || '/assets/images/og-icon-editz.png',
    discountPrice: p.discount_price ?? p.discountPrice ?? p.price,
  }))
  return res.json({ data: mapped, products: mapped })
}

// Public URLs use a stable slug or UUID.
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

  // Query all fields safely without selecting non-existent column names
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
  if (!isAdmin && data.published === false && data.status === 'draft') {
    return res.status(404).json({ success: false, code: 'PRODUCT_DRAFT', error: 'Product is not published' })
  }

  const thumbnail = data.thumbnail || data.thumbnail_path || '/assets/images/og-icon-editz.png'
  const discountPrice = data.discount_price ?? data.discountPrice ?? data.price
  const mainImage = data.main_image || data.mainImage || thumbnail

  return res.json({
    success: true,
    data: {
      ...data,
      thumbnail,
      discountPrice,
      mainImage,
      adminPreview: isAdmin,
    },
    product: {
      ...data,
      thumbnail,
      discountPrice,
      mainImage,
      adminPreview: isAdmin,
    },
  })
}

async function handleAdminProductActions(req, res) {
  await authorizeAdmin(req)

  const body = req.method !== 'DELETE' ? productSchema.parse(req.body) : {}
  const id = req.query.id || body.id

  switch (req.method) {
    case 'POST': {
      const payload = { ...body, slug: await uniqueSlug(body.slug || body.title) }
      const { data, error } = await supabaseAdmin.from('products').insert(payload).select().single()
      if (error) throw error
      return res.status(201).json({ data })
    }
    case 'PUT': {
      if (!id) throw Object.assign(new Error('Product ID is required for updates'), { status: 400 })
      const payload = { ...body }
      if (body.slug || body.title) payload.slug = await uniqueSlug(body.slug || body.title, id)
      const { data, error } = await supabaseAdmin.from('products').update(payload).eq('id', id).select().single()
      if (error) throw error
      return res.json({ data })
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
