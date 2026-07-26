// Safe Supabase client wrapper: uses real client when env vars present and package installed,
// otherwise falls back to no-op stubs so the portfolio works offline.
export let supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
    onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
  },
  from: () => ({ select: async () => ({ data: [], error: null }) }),
  storage: {
    from: () => ({
      createSignedUrl: async () => ({ data: { signedUrl: null }, error: null }),
      upload: async () => ({ data: null, error: null }),
    }),
  },
};

(async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    const mod = await import('@supabase/supabase-js');
    const client = mod.createClient(url, key);
    supabase = client;
    console.info('Supabase client initialized');
  } catch (e) {
    console.warn('Supabase not available (missing package or failed import). Running with stubs.', e);
  }
})();

export default supabase;
