import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { authenticate } from '../lib/auth.js';
import { ensureDefaultAdmin } from '../lib/defaultAdmin.js';
import { withApi } from '../lib/handler.js';

let publicSupabase
const getPublicSupabase = () => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        throw Object.assign(new Error('Supabase public authentication is not configured'), { status: 500 });
    }
    publicSupabase ||= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    return publicSupabase;
};

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

const safeUser = (user) => ({
    id: user.id,
    email: user.email,
    role: user.app_metadata?.role || user.user_metadata?.role || 'customer',
    user_metadata: user.user_metadata || {},
    email_confirmed_at: user.email_confirmed_at
});

async function handleAuth(req, res) {
    if (req.method === 'GET') {
        const user = await authenticate(req);
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(user.sub);
        if (error) throw error;
        return res.json({ user: safeUser(data.user) });
    }

    if (req.method === 'POST') {
        const { action } = req.body;

        if (action === 'bootstrap-admin') {
            await ensureDefaultAdmin();
            return res.json({ success: true });
        }

        if (action === 'logout') {
            await authenticate(req); // Ensure user is logged in to log out
            // In a real scenario, you might want to manage token blacklisting.
            // For this setup, we just acknowledge the client will discard the token.
            return res.json({ success: true, message: 'Logged out' });
        }

        if (action === 'login') {
            const { email, password } = credentialsSchema.parse(req.body);
            const { data, error } = await getPublicSupabase().auth.signInWithPassword({ email, password });
            if (error || !data.user) {
                throw Object.assign(new Error('Invalid email or password'), { status: 401 });
            }
            return res.json({ user: safeUser(data.user) });
        }

        if (action === 'request-password-reset') {
            const { email } = z.object({ email: z.string().email() }).parse(req.body);
            
            // Note: We use the public client here because the user is not authenticated.
            // RLS policies should be in place on the 'users' table if you store public-facing user data.
            const { error } = await getPublicSupabase().auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.BASE_URL}/password-reset`, // URL to your password reset page
            });

            if (error) {
                // Do not leak information about whether the user exists or not.
                // Log the error for debugging, but return a generic success message.
                console.error('Password reset error:', error);
            }

            // Always return a success-like message to prevent user enumeration attacks.
            return res.status(200).json({ message: 'If an account exists for this email, a password reset link has been sent.' });
        }


        throw Object.assign(new Error('Unsupported auth action'), { status: 400 });
    }
}

export default withApi(['GET', 'POST'], handleAuth);
