import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getSession, isSupabaseConfigured, signIn, signOut, supabase, supabaseConfigError, sendPasswordResetEmail, updateUserPassword, signInWithGoogle } from '../utils/supabase'

const AuthContext = createContext(null)
const toUser = async (user) => {
  if (!user) return null
  const metadataRole = user.app_metadata?.role || user.user_metadata?.role
  if (metadataRole) return { ...user, role: metadataRole }
  const { data } = await supabase.from('admins').select('id').eq('user_id', user.id).eq('status', 'active').is('deleted_at', null).maybeSingle()
  return { ...user, role: data ? 'admin' : 'customer' }
}
const isAdminUser = (user) => user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) { setLoading(false); return undefined }
    let mounted = true
    getSession().then(async ({ data, error }) => { if (error) console.error(error); const nextUser = await toUser(data.session?.user); if (mounted) { setUser(nextUser); setLoading(false) } }).catch((error) => { console.error(error); if (mounted) setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => { const nextUser = await toUser(session?.user); if (mounted) { setUser(nextUser); setLoading(false) } })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({
    user, loading, isAdmin: isAdminUser(user), role: user?.role || 'customer', isConfigured: isSupabaseConfigured(), configError: supabaseConfigError,
    login: async (email, password) => {
      const { data, error } = await signIn(email.trim().toLowerCase(), password)
      if (error) throw error
      if (!data.user?.email_confirmed_at) { await signOut(); throw new Error('Please confirm your email.') }
      if (!isAdminUser(data.user)) { await signOut(); throw new Error('This account is not authorized for admin access.') }
      setUser(await toUser(data.user))
      return data.user
    },
    logout: async () => { const { error } = await signOut(); if (error) throw error; setUser(null) },
    requestPasswordReset: async (email) => { const { error } = await sendPasswordResetEmail(email); if (error) throw error },
    resetPassword: async (password) => { const { error } = await updateUserPassword(password); if (error) throw error },
    loginWithGoogle: async () => { const { data, error } = await signInWithGoogle(); if (error) throw error; return data },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context }
