import { supabase } from './supabase'

// API routes use Supabase access tokens, never a second browser-managed JWT.
export const getToken = async () => {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
};

export const request = async (endpoint, options = {}) => {
    const { body, token, ...restOptions } = options;
    const authToken = token === null ? null : token || await getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...restOptions.headers,
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const config = {
        ...restOptions,
        headers,
    };

    if (body) {
        // FormData is sent as-is, without Content-Type
        if (body instanceof FormData) {
            delete headers['Content-Type'];
            config.body = body;
        } else {
            config.body = JSON.stringify(body);
        }
    }

    const response = await fetch(endpoint, config);

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ message: 'An unknown API error occurred.' }));
        const error = new Error(errorPayload.error?.message || errorPayload.message || 'An unknown API error occurred.');
        error.code = errorPayload.error?.code;
        error.status = response.status;
        throw error;
    }

    if (response.status === 204) {
        return; // No content
    }

    return response.json();
};

// This is just to satisfy any lingering imports, though the files using it were deleted.
export const api = {};
