import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigError = !supabaseUrl
  ? 'Missing VITE_SUPABASE_URL. Add it to your environment and restart the dev server.'
  : !supabaseAnonKey
    ? 'Missing VITE_SUPABASE_ANON_KEY. Add it to your environment and restart the dev server.'
    : null

export const isSupabaseConfigured = () => !supabaseConfigError
export const supabase = supabaseConfigError ? null : createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})

const requireClient = () => {
  if (!supabase) throw new Error(supabaseConfigError)
  return supabase
}

export const getSession = () => requireClient().auth.getSession()
export const signIn = (email, password) => requireClient().auth.signInWithPassword({ email, password })
export const signOut = () => requireClient().auth.signOut()
export const sendPasswordResetEmail = (email) => requireClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
export const updateUserPassword = (password) => requireClient().auth.updateUser({ password })
export const signInWithGoogle = () => requireClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })

export const getProducts = async () => {
  const { data, error, count } = await requireClient().from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (error) throw error
  const products = (data || []).map(toProduct)
  return { data: products, products, count: count || 0, error: null }
}
export const upsertProduct = async (product) => {
  const payload = toProductRecord(product)
  const query = product.id ? requireClient().from('products').update(payload).eq('id', product.id) : requireClient().from('products').insert(payload)
  const { data, error } = await query.select().single(); if (error) throw error; return { data: toProduct(data), error: null }
}
export const deleteProduct = async (id) => { const { error } = await requireClient().from('products').delete().eq('id', id); if (error) throw error; return { data: null, error: null } }
export const toggleProductPublish = async (id, published) => { const { data, error } = await requireClient().from('products').update({ published }).eq('id', id).select().single(); if (error) throw error; return { data, error: null } }
export const getDashboardSummary = async () => {
  const client = requireClient()
  const [{ count: totalProducts, error: productError }, { count: publishedProducts, error: publishedError }, { data: orders, error: ordersError }] = await Promise.all([
    client.from('products').select('*', { count: 'exact', head: true }),
    client.from('products').select('*', { count: 'exact', head: true }).eq('published', true),
    client.from('orders').select('amount'),
  ])
  if (productError || publishedError || ordersError) throw productError || publishedError || ordersError
  const totalSales = (orders || []).reduce((sum, order) => sum + Number(order.amount || 0), 0)
  return { data: { totalProducts: totalProducts || 0, publishedProducts: publishedProducts || 0, totalCustomers: 0, totalSales }, error: null }
}
export const getRecentProducts = async () => { const { data, error } = await requireClient().from('products').select('*').order('created_at', { ascending: false }).limit(6); if (error) throw error; return { data: (data || []).map(toProduct), error: null } }
export const getOrders = async () => { const { data, error } = await requireClient().from('orders').select('*'); if (error) throw error; return { data: data || [], error } }
export const getUsers = async () => ({ data: [], error: null })
export const uploadStorageFile = async (file, folder = 'uploads') => { const path = `${folder}/${crypto.randomUUID()}-${file.name}`; const { error } = await requireClient().storage.from(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET).upload(path, file); if (error) throw error; return path }
export const createSignedDownloadUrl = async (bucket, path) => { const { data, error } = await requireClient().storage.from(bucket).createSignedUrl(path, 3600); if (error) throw error; return data.signedUrl }
export const getUserOrders = getOrders
export const getUserDownloads = async () => []
export const getUserWishlist = async () => []
export const updateUserProfile = async (profile) => { const { data: { user } } = await requireClient().auth.getUser(); const { data, error } = await requireClient().from('profiles').upsert({ id: user.id, ...profile }).select().single(); if (error) throw error; return data }
export const resendVerificationEmail = (email) => requireClient().auth.resend({ type: 'signup', email })

function toProduct(record) {
  return { ...record, thumbnail: record.thumbnail_path, image: record.thumbnail_path, demoVideo: record.demo_video, discountPrice: record.discount_price, published: Boolean(record.published), status: record.published ? 'published' : 'draft' }
}

function toProductRecord(product) {
  const slugBase = String(product.slug || product.title || 'product').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return { title: product.title, slug: product.slug || `${slugBase}-${product.id || crypto.randomUUID().slice(0, 8)}`, category: product.category || null, thumbnail_path: product.thumbnail || product.image || null, demo_video: product.demoVideo || null, description: product.description || null, features: product.features || [], tags: product.tags || [], price: Number(product.price || 0), discount_price: product.discountPrice == null || product.discountPrice === '' ? null : Number(product.discountPrice), screenshots: product.screenshots || [], published: product.published ?? product.status === 'published' }
}
