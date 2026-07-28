// Compatibility facade. Despite its historical filename, this module makes REST calls only.
// No Supabase SDK/key is shipped to the browser.
import { request } from './api'

export const isSupabaseConfigured = () => Boolean(import.meta.env.VITE_API_URL)
// Authentication is delegated to the API; kept as adapters while the existing UI migrates.
export const supabase = null
export const getSession = async () => ({ data: { session: null }, error: null })
export const signIn = async (email, password) => { const result = await request('/api/auth', { method: 'POST', body: { action: 'login', email, password }, token: null }); localStorage.setItem('token', result.token); return { data: { user: result.user, session: { access_token: result.token } }, error: null } }
export const signOut = async () => { try { await request('/api/auth', { method: 'POST', body: { action: 'logout' } }) } finally { localStorage.removeItem('token') }; return { error: null } }
export const sendPasswordResetEmail = async email => { await request('/api/auth/password/reset', { method: 'POST', body: { email }, token: null }); return { error: null } }
export const updateUserPassword = async () => ({ error: new Error('Password updates must be completed through the account recovery flow.') })
export const signInWithGoogle = async () => ({ data: null, error: new Error('Google OAuth must be configured as a backend callback.') })
export const getProducts = async () => { try { const data = await request('/api/products', { token: null }); const products = Array.isArray(data) ? data : []; return { data: products, products, count: products.length, error: null } } catch (e) { console.error(e); return { data: [], products: [], count: 0, error: e } } }
export const upsertProduct = async product => ({ data: await request(product.id ? `/api/products?id=${encodeURIComponent(product.id)}` : '/api/products', { method: product.id ? 'PUT' : 'POST', body: product }), error: null })
export const deleteProduct = async id => ({ data: await request(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' }), error: null })
export const toggleProductPublish = async (id, published) => ({ data: await request(`/api/products?id=${encodeURIComponent(id)}`, { method: 'PUT', body: { published } }), error: null })
export const getDashboardSummary = async () => { try { const summary = await request('/api/dashboard'); return { data: { totalProducts: summary.products ?? 0, totalCustomers: 0, totalSales: 0 }, error: null } } catch (e) { console.error(e); return { data: { totalProducts: 0, totalCustomers: 0, totalSales: 0 }, error: e } } }
export const getRecentProducts = async () => { try { const dashboard = await request('/api/dashboard'); return { data: Array.isArray(dashboard.recentProducts) ? dashboard.recentProducts : [], error: null } } catch (e) { console.error(e); return { data: [], error: e } } }
export const getOrders = async () => ({ data: await request('/api/orders'), error: null })
export const getUsers = async () => ({ data: [], error: null })
export const uploadStorageFile = async (file, folder = 'uploads') => { const form = new FormData(); form.append('file', file); form.append('folder', folder); return (await request('/api/uploads', { method: 'POST', body: form })).url }
export const createSignedDownloadUrl = async (_bucket, path) => path
export const getUserOrders = async () => request('/api/orders')
export const getUserDownloads = async () => []
export const getUserWishlist = async () => []
export const updateUserProfile = async () => ({})
export const resendVerificationEmail = email => request('/api/auth/password/reset', { method: 'POST', body: { email }, token: null })
