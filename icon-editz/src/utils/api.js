import { supabase } from './supabase'
import { apiRequest } from '../services/api'

// API routes use Supabase access tokens, never a second browser-managed JWT.
export const getToken = async () => {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
};

export const request = apiRequest

// This is just to satisfy any lingering imports, though the files using it were deleted.
export const api = {};
