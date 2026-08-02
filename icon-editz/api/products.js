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

// Store detail URLs are UUID-based. Publication state is selected so this
// service-role query can apply the same visibility rules as public RLS.
export async function handleGetProduct(req, res, requestedId = req.query.id) {
    const productId = typeof requestedId === 'string' ? requestedId : '';
    const isAdmin = (await tryAuthenticate(req))?.role === 'admin';
    if (!productId) return res.status(400).json({ success: false, code: 'INVALID_UUID', error: 'Product ID is required' });

    // Store URLs are UUID-based (/store/:productId), not slug-based. Do not
    // fall back to slug here: mixing identifiers can return the wrong product.
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(productId)) {
        return res.status(400).json({ success: false, code: 'INVALID_UUID', error: 'Invalid product ID' });
    }

    // These are all product-detail fields that exist in the products schema.
    // `thumbnail_path` is the database column; it is also exposed as
    // `thumbnail` below for the client-facing product shape.
    const select = 'id,title,description,price,discount_price,thumbnail_path,demo_video,category,published,status,deleted_at,features,tags,screenshots';
    const { data, error } = await supabaseAdmin.from('products').select(select).eq('id', productId).maybeSingle();
    if (error) {
        return res.status(500).json({ success: false, error: error.message, details: error });
    }
    if (!data) return res.status(404).json({ success: false, code: 'PRODUCT_NOT_FOUND', error: 'Product not found' });
    if (data.deleted_at) return res.status(404).json({ success: false, code: 'PRODUCT_DELETED', error: 'Product has been deleted' });
    if (!isAdmin && (data.published !== true || data.status !== 'published')) {
        return res.status(404).json({ success: false, code: 'PRODUCT_DRAFT', error: 'Product is not published' });
    }
    return res.json({ success: true, product: { ...data, thumbnail: data.thumbnail_path, adminPreview: isAdmin } });
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
