import { supabaseAdmin } from './lib/supabaseAdmin.js';
import { authorizeAdmin } from './lib/auth.js';
import { withApi } from './lib/handler.js';
import { getIpAddress } from './lib/ip.js';
import crypto from 'crypto';

const hash = (value) => value ? crypto.createHash('sha256').update(String(value).toLowerCase()).digest('hex') : undefined;

async function getDashboardData(req, res) {
    authorizeAdmin(req);
    const [
        { count: products, error: p },
        { count: orders, error: o },
        { data: recentProducts, error: r }
    ] = await Promise.all([
        supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    if (p || o || r) throw p || o || r;

    res.json({ data: { products, orders, recentProducts } });
}

async function handleCapi(req, res) {
    // SECURITY: Add rate limiting here to prevent abuse (see section 8)
    const { eventName, eventData, fbp, fbc, externalId, email, phone } = req.body;
    const ipAddress = getIpAddress(req);
    const userAgent = req.headers['user-agent'];

    const event = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
            client_ip_address: ipAddress,
            client_user_agent: userAgent,
            fbp,
            fbc,
            external_id: externalId,
            em: hash(email),
            ph: hash(phone),
        },
        custom_data: eventData,
        event_source_url: req.headers.referer,
        action_source: 'website',
    };

    // Here you would send the event to the Meta Conversions API
    // using the graph.facebook.com endpoint and your access token.
    // For now, we will just log the event.
    console.log('Meta CAPI Event:', event);

    res.json({ success: true });
}

export default withApi({
    GET: getDashboardData,
    POST: handleCapi,
});
