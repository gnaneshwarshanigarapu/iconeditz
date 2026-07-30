import { z } from 'zod';
import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authorizeAdmin, tryAuthenticate } from './lib/auth.js';
import { withApi } from './lib/handler.js';

const productSchema = z.object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().min(1).optional(),
    slug: z.string().optional(),
    category: z.string().optional(),
    price: z.coerce.number().nonnegative().optional(),
    published: z.boolean().optional(),
}).passthrough();

async function handleGetProducts(req, res) {
    try {
        const user = tryAuthenticate(req);
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

    } catch (error) {
        console.error('Products query failed', error);
        // In production, you might want a more generic error message
        return res.status(500).json({ error: 'An error occurred while fetching products.' });
    }
}

async function handleAdminProductActions(req, res) {
    // All methods here are admin-only
    authorizeAdmin(req);

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
            return res.status(204).end();
        }
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default withApi({
    GET: handleGetProducts,
    POST: handleAdminProductActions,
    PUT: handleAdminProductActions,
    DELETE: handleAdminProductActions,
});
