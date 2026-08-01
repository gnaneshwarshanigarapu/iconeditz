import { supabaseAdmin } from './supabaseAdmin.js'

/**
 * Verifies the JWT from the Authorization header.
 * Throws a 401 error if the token is missing, invalid, or expired.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object} The decoded JWT payload.
 */
export const authenticate = async (req) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        throw Object.assign(new Error('Authentication required'), { status: 401 });
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) throw Object.assign(new Error('Invalid or expired Supabase session'), { status: 401 })
    const metadataRole = user.app_metadata?.role || user.user_metadata?.role
    const { data: admin } = metadataRole === 'admin' ? { data: null } : await supabaseAdmin.from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
    return { sub: user.id, email: user.email, role: metadataRole || (admin ? 'admin' : 'customer') }
};

/**
 * Tries to verify the JWT from the Authorization header.
 * Returns null if the token is missing or invalid, instead of throwing.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object|null} The decoded JWT payload or null.
 */
export const tryAuthenticate = async (req) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        return null;
    }
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) return null
    const metadataRole = user.app_metadata?.role || user.user_metadata?.role
    const { data: admin } = metadataRole === 'admin' ? { data: null } : await supabaseAdmin.from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
    return { sub: user.id, email: user.email, role: metadataRole || (admin ? 'admin' : 'customer') }
};

/**
 * Authenticates a user and checks if they have the 'admin' role.
 * Throws a 401 or 403 error if authentication or authorization fails.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object} The decoded JWT payload of the admin user.
 */
export const authorizeAdmin = async (req) => {
    const user = await authenticate(req);
    if (user.role !== 'admin') {
        throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    return user;
};

/**
 * Issues a new JWT for a given user object.
 * @param {object} user The user object from Supabase.
 * @returns {string} The signed JWT.
 */
