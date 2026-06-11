import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify.')
  }
  return supabase
}

const assertOk = ({ data, error }) => {
  if (error) throw error
  return data
}

export const productRowToProduct = (row) => ({
  id: row.id,
  title: row.title || '',
  category: row.category || 'Uncategorized',
  thumbnail: row.thumbnail || '',
  screenshots: row.screenshots || [],
  demoVideo: row.demo_video || '',
  description: row.description || '',
  features: row.features || [],
  price: Number(row.price) || 0,
  discountPrice: row.discount_price === null ? null : Number(row.discount_price) || null,
  tags: row.tags || [],
  published: Boolean(row.published),
  createdAt: row.created_at,
})

export const productToRow = (product) => ({
  title: product.title || 'Untitled Product',
  category: product.category || 'Uncategorized',
  thumbnail: product.thumbnail || '',
  screenshots: product.screenshots || [],
  demo_video: product.demoVideo || '',
  description: product.description || '',
  features: product.features || [],
  price: Number(product.price) || 0,
  discount_price: product.discountPrice ? Number(product.discountPrice) : null,
  tags: product.tags || [],
  published: Boolean(product.published),
})

export const signIn = async (email, password) => {
  const client = requireSupabase()
  return client.auth.signInWithPassword({ email, password })
}

export const signOut = async () => {
  const client = requireSupabase()
  return client.auth.signOut()
}

export const getCurrentUser = async () => {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error) return null
  return data.user
}

export const getProducts = async ({ publishedOnly = false } = {}) => {
  const client = requireSupabase()
  let query = client.from('products').select('*').order('created_at', { ascending: false })

  if (publishedOnly) query = query.eq('published', true)

  const data = assertOk(await query)
  return data.map(productRowToProduct)
}

export const upsertProduct = async (product) => {
  const client = requireSupabase()
  const payload = {
    ...productToRow(product),
    ...(product.id ? { id: product.id } : {}),
    updated_at: new Date().toISOString(),
  }

  const data = assertOk(await client.from('products').upsert(payload).select('*').single())
  return productRowToProduct(data)
}

export const deleteProduct = async (id) => {
  const client = requireSupabase()
  assertOk(await client.from('products').delete().eq('id', id))
  return id
}

export const toggleProductPublish = async (id, published) => {
  const client = requireSupabase()
  const data = assertOk(
    await client
      .from('products')
      .update({ published, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single(),
  )
  return productRowToProduct(data)
}

export const getOrders = async () => {
  const client = requireSupabase()
  const data = assertOk(await client.from('orders').select('*').order('created_at', { ascending: false }))
  return data
}

export const getUsers = async () => {
  const client = requireSupabase()
  const data = assertOk(await client.from('profiles').select('*').order('created_at', { ascending: false }))
  return data
}

export const uploadStorageFile = async (bucket, path, file) => {
  const client = requireSupabase()
  const data = assertOk(await client.storage.from(bucket).upload(path, file, { upsert: true }))
  return data
}

export const createSignedDownloadUrl = async (bucket, path, expiresIn = 3600) => {
  const client = requireSupabase()
  const data = assertOk(await client.storage.from(bucket).createSignedUrl(path, expiresIn))
  return data.signedUrl
}

export const getDashboardStats = async () => {
  const [products, orders, users] = await Promise.all([getProducts(), getOrders(), getUsers()])
  const totalSales = orders.reduce((sum, order) => sum + Number(order.total ?? order.amount ?? 0), 0)

  return {
    totalProducts: products.length,
    totalCustomers: users.length,
    totalSales,
    monthlyRevenue: totalSales,
    recentOrders: orders.slice(0, 5),
  }
}

export const signInWithGoogle = async () => {
  const client = requireSupabase()
  return client.auth.signInWithOAuth({ provider: 'google' })
}

export const signUp = async (email, password, options = {}) => {
  const client = requireSupabase()
  return client.auth.signUp({ email, password, options })
}

export const resendVerificationEmail = async (email) => {
  const client = requireSupabase()
  return client.auth.resend({ type: 'signup', email })
}

export const sendPasswordResetEmail = async (email) => {
  const client = requireSupabase()
  return client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
}

export const updateUserPassword = async (password) => {
  const client = requireSupabase()
  return client.auth.updateUser({ password })
}

export const getUserOrders = async () => []
export const getUserDownloads = async () => []
export const getUserWishlist = async () => []
export const updateUserProfile = async () => ({ data: null, error: null })
