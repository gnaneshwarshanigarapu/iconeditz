import { z } from 'zod';
import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authorizeAdmin } from './lib/auth.js';
import { withApi } from './lib/handler.js'

const tables = {
    features: 'hire_us_features',
    services: 'hire_us_services',
    gallery: 'hire_us_gallery_items',
    faq: 'hire_us_faq_items'
};

export default withApi(['GET', 'PUT', 'POST'], async (req, res) => {
    if (req.method === 'POST') {
        // This is for the contact form, which doesn't have a 'section'
        const { name, email, subject, message } = req.body || {};

        if (name && email && subject && message) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
                return res.status(400).json({ message: 'Please provide a valid email address.' });
            }
            // In a real app, you'd save this to the DB or send an email.
            // For now, just returning success as per original contact.js
            return res.status(200).json({
                message: 'Thanks for reaching out. We will get back to you soon.',
                success: true,
            });
        }
    }

    const section = req.query.section || req.body?.section;
    if (!['homepage', 'hire-us', 'settings'].includes(section)) {
        throw Object.assign(new Error('Valid CMS section is required'), { status: 400 });
    }

    if (req.method === 'GET') {
        if (section === 'homepage') {
            const { data, error } = await supabaseAdmin.from('homepage_content').select('*');
            if (error) throw error;
            return res.json({ data: data ?? [] });
        }
        if (section === 'settings') {
            authorizeAdmin(req);
            const { data, error } = await supabaseAdmin.from('settings').select('*');
            if (error) throw error;
            return res.json({ data: data ?? [] });
        }
        const [content, ...lists] = await Promise.all([
            supabaseAdmin.from('hire_us_content').select('section,content'),
            ...Object.values(tables).map(t => supabaseAdmin.from(t).select('*').order('sort_order'))
        ]);
        const error = [content, ...lists].map(x => x.error).find(Boolean);
        if (error) throw error;
        return res.json({
            data: {
                sections: content.data ?? [],
                features: lists[0].data ?? [],
                services: lists[1].data ?? [],
                gallery: lists[2].data ?? [],
                faq: lists[3].data ?? []
            }
        });
    }

    // All methods below are admin-only
    authorizeAdmin(req);

    if (req.method === 'PUT') {
        if (section === 'homepage') {
            const body = z.object({ content: z.record(z.any()), contentSection: z.string() }).parse(req.body);
            const { data, error } = await supabaseAdmin.from('homepage_content').upsert({ section: body.contentSection, content: body.content, updated_at: new Date().toISOString() }).select().single();
            if (error) throw error;
            return res.json({ data });
        }
        if (section === 'settings') {
            const body = z.object({ key: z.string().min(1), value: z.unknown() }).parse(req.body);
            const { data, error } = await supabaseAdmin.from('settings').upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() }).select().single();
            if (error) throw error;
            return res.json({ data });
        }
        
        // hire-us section
        const body = z.object({
            sections: z.array(z.object({ section: z.string(), content: z.record(z.any()) })),
            features: z.array(z.any()),
            services: z.array(z.any()),
            gallery: z.array(z.any()),
            faq: z.array(z.any()),
            published: z.boolean().optional()
        }).parse(req.body);
        
        const ops = [
            supabaseAdmin.from('hire_us_content').upsert(body.sections.map(x => ({ ...x, published_at: body.published ? new Date().toISOString() : null, updated_at: new Date().toISOString() })))
        ];

        for (const [key, table] of Object.entries(tables)) {
            const rows = body[key].map((x, i) => ({ ...x, sort_order: i, published: !!body.published }));
            const { data: old, error } = await supabaseAdmin.from(table).select('id');
            if (error) throw error;
            const keep = new Set(rows.filter(x => typeof x.id === 'number').map(x => x.id));
            const remove = (old ?? []).filter(x => !keep.has(x.id)).map(x => x.id);
            if (remove.length) ops.push(supabaseAdmin.from(table).delete().in('id', remove));
            if (rows.length) ops.push(supabaseAdmin.from(table).upsert(rows));
        }

        const results = await Promise.all(ops);
        const errorResult = results.map(x => x.error).find(Boolean);
        if (errorResult) throw errorResult;
        
        return res.json({ ok: true });
    }

    // If we reach here, method is not handled for the given section
    res.status(405).json({ message: 'Method Not Allowed' });
});
