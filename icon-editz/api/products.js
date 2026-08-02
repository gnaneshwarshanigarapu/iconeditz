import { z } from 'zod';
import { supabaseAdmin } from '../server/lib/supabaseAdmin.js';
import { authorizeAdmin, tryAuthenticate } from '../server/lib/auth.js';
import { withApi } from '../server/lib/handler.js';

const productSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().min(1).optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().nonnegative().optional(),
    published: z.boolean().optional(),
}).passthrough();

async function handleGetProducts(req, res) {
        const productId = req.query.id;
        if (productId) return handleGetProduct(req, res, productId);
        const user = await tryAuthenticate(req);
        let query = supabaseAdmin.from('products').select('*').order('created_at', { ascending: false });

        if (user?.role !== 'admin') {
            query = query.eq('published', true);
        }

        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }

        const { data, error } = await query;
        if (error) throw error;
        return res.json({ data: data ?? [] });
}

// The detail endpoint fetches publication state as well, so the UI can give a
// useful unpublished message rather than mistaking the record for missing.
export async function handleGetProduct(req, res, requestedId = req.query.id) {
    const productId = requestedId;
    console.log('Requested product:', productId);
    if (!productId) return res.status(400).json({ success: false, error: 'Product ID is required' });

    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', productId).maybeSingle();
    console.log('Supabase result:', data);
    console.log('Supabase error:', error);
    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }
    if (!data) return res.status(404).json({ success: false, error: 'Product not found' });
    return res.json({ success: true, data });
}

async function handleAdminProductActions(req, res) {
    // All methods here are admin-only
    await authorizeAdmin(req);

    const body = req.method !== 'DELETE' ? productSchema.parse(req.body) : {};
    const id = req.query.id || body.id;

    switch (req.method) {
        case 'POST': {
            const { data, error } = await supabaseAdmin.from('products').insert(body).select().single();
            if (error) throw error;
            return res.status(201).json({ data });
        }
        case 'PUT': {
            if (!id) throw Object.assign(new Error('Product ID is required for updates'), { status: 400 });
            const { data, error } = await supabaseAdmin.from('products').update(body).eq('id', id).select().single();
            if (error) throw error;
            return res.json({ data });
        }
        case 'DELETE': {
            if (!id) throw Object.assign(new Error('Product ID is required for deletion'), { status: 400 });
            const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
            if (error) throw error;
            return res.json({ success: true });
        }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }
}

export default withApi({
    GET: handleGetProducts,
    POST: handleAdminProductActions,
    PUT: handleAdminProductActions,
    DELETE: handleAdminProductActions,
});
