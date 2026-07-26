import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or publishable key is missing. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const getSession = () => supabase.auth.getSession()
export const isSupabaseConfigured = () => supabaseUrl && supabaseKey
export const sendPasswordResetEmail = (email) => supabase.auth.resetPasswordForEmail(email)
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
export const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' })
export const signOut = () => supabase.auth.signOut()
export const updateUserPassword = (password) => supabase.auth.updateUser({ password })

// Product-related functions
export const getProducts = () => supabase.from('products').select('*')
export const upsertProduct = (product) => supabase.from('products').upsert(product)
export const deleteProduct = (id) => supabase.from('products').delete().eq('id', id)
export const toggleProductPublish = (id, published) => supabase.from('products').update({ published }).eq('id', id)
export const getDashboardSummary = async () => {
    const { data: products, error: productsError } = await supabase.from('products').select('id, published');
    if (productsError) throw productsError;

    const totalProducts = products.length;
    const publishedProducts = products.filter(p => p.published).length;
    const unpublishedProducts = totalProducts - publishedProducts;

    return { totalProducts, publishedProducts, unpublishedProducts };
}
export const getRecentProducts = () => supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5)
