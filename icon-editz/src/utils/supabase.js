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

const PRODUCT_COLUMNS = `
    id,
    title,
    slug,
    category,
    thumbnail_path,
    demo_video,
    description,
    features,
    tags,
    price,
    discount_price,
    zip_path,
    screenshots,
    google_drive_link,
    onedrive_link,
    dropbox_link,
    published,
    created_at,
    updated_at
`;

export const getProducts = async () => {
    try {
        const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return { data: null, error };
    }
};

export const upsertProduct = async (product) => {
    try {
        const { data, error } = await supabase.from('products').upsert(product).select(PRODUCT_COLUMNS);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error upserting product:', error.message);
        return { data: null, error };
    }
};

export const deleteProduct = async (id) => {
    try {
        const { data, error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error deleting product:', error.message);
        return { data: null, error };
    }
};

export const toggleProductPublish = async (id, published) => {
    try {
        const { data, error } = await supabase.from('products').update({ published }).eq('id', id).select('id, published');
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error toggling product publish state:', error.message);
        return { data: null, error };
    }
};

export const getDashboardSummary = async () => {
    try {
        const { data: products, error: productsError } = await supabase.from('products').select('id, published');
        if (productsError) throw productsError;

        const totalProducts = products.length;
        const publishedProducts = products.filter(p => p.published).length;
        const unpublishedProducts = totalProducts - publishedProducts;

        // In a real app, you might also fetch order and user counts.
        // const { count: totalOrders, error: ordersError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        // if(ordersError) throw ordersError;

        return { data: { totalProducts, publishedProducts, unpublishedProducts }, error: null };
    } catch (error) {
        console.error('Error fetching dashboard summary:', error.message);
        return { data: null, error };
    }
};

export const getRecentProducts = async () => {
    try {
        const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).order('created_at', { ascending: false }).limit(5);
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching recent products:', error.message);
        return { data: null, error };
    }
};
