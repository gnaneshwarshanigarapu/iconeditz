import { z } from 'zod';
import { supabaseAdmin } from '../server/lib/supabaseAdmin.js';
import { authorizeAdmin } from '../server/lib/auth.js';
import { withApi } from '../server/lib/handler.js'

const HIRE_PAGE = 'Hire From Us'
const hireSection = (section, content, published) => ({ page: HIRE_PAGE, section_key: section, content, status: published ? 'published' : 'draft' })

export default withApi(['GET', 'PUT', 'POST'], async (req, res) => {
    const section = req.query.section || req.query.page || req.body?.section;
    if (req.method === 'POST') {
        // SECURITY: Add rate limiting here to prevent abuse (see section 8)
        const schema = z.object({
            name: z.string().min(1, { message: 'Name is required' }),
            email: z.string().email({ message: 'Please provide a valid email address' }),
            subject: z.string().min(1, { message: 'Subject is required' }),
            message: z.string().min(1, { message: 'Message is required' }),
        });

        const parseResult = schema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                message: parseResult.error.errors[0].message,
                success: false,
            });
        }
        
        const { name, email, subject, message } = parseResult.data;

        // In a real app, you'd save this to the DB or send an email.
        // For now, just returning success as per original contact.js
        return res.status(200).json({
            message: 'Thanks for reaching out. We will get back to you soon.',
            success: true,
        });
    }

    if (req.method === 'GET') {
        if (req.query.page) {
            const { data, error } = await supabaseAdmin
                .from('page_content')
                .select('id,page,section,content,updated_at,status,sort_order')
                .eq('page', req.query.page)
                .eq('status', 'published')
                .is('deleted_at', null)
                .order('sort_order');
            if (error) throw error;
            const response = { success: true, data: data ?? [] };
            return res.json(response);
        }
        if (section === 'homepage') {
            const { data, error } = await supabaseAdmin.from('page_content').select('id,section,content,updated_at,status,sort_order').eq('page', 'Homepage').eq('status', 'published').is('deleted_at', null).order('sort_order');
            if (error) throw error;
            const response = { success: true, data: data ?? [] };
            return res.json(response);
        }
        if (section === 'settings') {
            const { data, error } = await supabaseAdmin.from('settings').select('key,value').eq('key', 'analytics').is('deleted_at', null);
            if (error) throw error;
            
            const settings = data.reduce((acc, { key, value }) => {
              acc[key] = value;
              return acc;
            }, {});
          
            const response = { success: true, data: settings };
            return res.json(response);
        }
        if (section === 'footer' || section === 'cta') {
            const table = section === 'footer' ? 'footer_content' : 'cta_content';
            const { data, error } = await supabaseAdmin.from(table).select('content').eq('id', true).eq('status', 'published').is('deleted_at', null).maybeSingle();
            if (error) throw error;
            const response = { success: true, data: data?.content ?? {} };
            return res.json(response);
        }
        if (section === 'legal') {
            const slug = req.query.slug;
            if (!slug) return res.status(400).json({ success: false, error: 'Legal page slug is required' });
            const { data, error } = await supabaseAdmin.from('legal_pages').select('title,content,seo_title,seo_description,updated_at,slug').eq('slug', slug).eq('published', true).eq('status', 'published').is('deleted_at', null).maybeSingle();
            if (error) throw error;
            const response = { success: true, data: data ?? {} };
            return res.json(response);
        }
        if (section !== 'hire-us') return res.status(400).json({ success: false, error: 'Valid CMS section or page is required' });
        const content = await supabaseAdmin.from('website_sections').select('section_key,content,status').eq('page', HIRE_PAGE).is('deleted_at', null).order('sort_order')
        const error = content.error;
        if (error) throw error;
        const response = {
            success: true,
            data: {
                sections: (content.data ?? []).filter((row) => !['features', 'services', 'gallery', 'faq'].includes(row.section_key)).map((row) => ({ section: row.section_key, content: row.content })),
                features: content.data?.find((row) => row.section_key === 'features')?.content?.items ?? [],
                services: content.data?.find((row) => row.section_key === 'services')?.content?.items ?? [],
                gallery: content.data?.find((row) => row.section_key === 'gallery')?.content?.items ?? [],
                faq: content.data?.find((row) => row.section_key === 'faq')?.content?.items ?? []
            },
        };
        return res.json(response);
    }

    // All methods below are admin-only
    await authorizeAdmin(req);

    if (req.method === 'PUT') {
        if (section === 'homepage') {
            const body = z.object({ content: z.record(z.any()), contentSection: z.string() }).parse(req.body);
            const { data, error } = await supabaseAdmin.from('page_content').upsert({ page: 'Homepage', section: body.contentSection, content: body.content, status: 'published' }, { onConflict: 'page,section' }).select().single();
            if (error) throw error;
            return res.json({ data });
        }
        if (section === 'settings') {
            const { settings } = req.body;
  
            const updates = Object.entries(settings).map(([key, value]) =>
              supabaseAdmin.from('settings').update({ value }).eq('key', key)
            );
          
            const results = await Promise.all(updates);
            const error = results.find(r => r.error);
        
            if (error) throw error;
          
            return res.json({ success: true });
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
        
        const rows = [...body.sections.map((row) => hireSection(row.section, row.content, body.published)), ...['features', 'services', 'gallery', 'faq'].map((key) => hireSection(key, { items: body[key] }, body.published))]
        const { error: errorResult } = await supabaseAdmin.from('website_sections').upsert(rows, { onConflict: 'page,section_key' })
        if (errorResult) throw errorResult;
        
        return res.json({ ok: true });
    }

    // If we reach here, method is not handled for the given section
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
});
