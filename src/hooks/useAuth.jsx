import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getSession,
  isSupabaseConfigured,
  sendPasswordResetEmail,
  signIn,
  signOut,
  supabase,
  supabaseDebugConfig,
} from '../utils/supabase'

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  role: 'customer',
  isConfigured: true,
  login: async () => {},
  logout: async () => {},
  requestPasswordReset: async () => {},
})

const toAuthUser = (authUser) => {
  if (!authUser) return null
  const appRole = authUser.app_metadata?.role
  const userRole = authUser.user_metadata?.role

  return {
    id: authUser.id,
    email: authUser.email,
    role: appRole || userRole || 'customer',
    appRole,
    userRole,
  }
}

const hasAdminRole = (authUser) => Boolean(authUser && (authUser.appRole === 'admin' || authUser.userRole === 'admin'))

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const debugSession = (label, payload) => {
      console.info(`[Admin Auth] ${label}`, {
        supabaseUrl: supabaseDebugConfig.url,
        isConfigured: supabaseDebugConfig.isConfigured,
        hasAnonKey: supabaseDebugConfig.hasAnonKey,
        ...payload,
      })
    }

    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        console.error('[Admin Auth] Supabase is not configured', supabaseDebugConfig)
        if (isMounted) setLoading(false)
        return
      }

      const { data, error } = await getSession()
      debugSession('getSession response', {
        sessionUserEmail: data?.session?.user?.email || null,
        error: error || null,
      })

      if (error) console.error('[Admin Auth] getSession error', error)
      if (isMounted) {
        setUser(toAuthUser(data?.session?.user))
        setLoading(false)
      }
    }

    checkSession()

    if (!supabase) return () => {
      isMounted = false
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      debugSession('auth state changed', {
        event,
        sessionUserEmail: session?.user?.email || null,
      })
      setUser(toAuthUser(session?.user))
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => {
    const isAdmin = hasAdminRole(user)
    const role = isAdmin ? 'admin' : 'customer'

    return {
      user,
      loading,
      isAdmin,
      role,
      isConfigured: isSupabaseConfigured,
      login: async (emailAddress, password) => {
        const submittedEmail = emailAddress.trim().toLowerCase()

        console.groupCollapsed('[Admin Auth] signInWithPassword attempt')
        console.log('Login attempt:', submittedEmail)
        console.info('[Admin Auth] email submitted', submittedEmail)
        console.info('[Admin Auth] current Supabase URL', supabaseDebugConfig.url)
        console.log('Project URL:', supabaseDebugConfig.url)
        console.info('[Admin Auth] environment loaded', {
          isConfigured: supabaseDebugConfig.isConfigured,
          hasAnonKey: supabaseDebugConfig.hasAnonKey,
          anonKeyPrefix: supabaseDebugConfig.anonKeyPrefix,
        })

        try {
          const response = await signIn(submittedEmail, password)
          const { data, error } = response

          console.log('Auth response:', data)
          console.info('[Admin Auth] auth response', {
            user: data?.user
              ? {
                  id: data.user.id,
                  email: data.user.email,
                  appMetadata: data.user.app_metadata,
                  userMetadata: data.user.user_metadata,
                }
              : null,
            session: data?.session
              ? {
                  expiresAt: data.session.expires_at,
                  tokenType: data.session.token_type,
                }
              : null,
          })

          if (error) {
            console.error('Supabase Auth Error:', error)
            console.error('Auth error:', error)
            throw error
          }

          if (!data?.user) {
            const missingUserError = new Error('Supabase did not return a user for this login attempt.')
            console.error('[Admin Auth] auth error', missingUserError)
            throw missingUserError
          }

          const adminUser = toAuthUser(data.user)
          if (!hasAdminRole(adminUser)) {
            await signOut()
            throw new Error('This account is authenticated but is not authorized for admin access. Add role "admin" to the user metadata in Supabase.')
          }

          const {
            data: { session },
          } = await getSession()
          console.log('Session:', session)

          setUser(adminUser)
          return adminUser
        } catch (error) {
          console.error('Auth error:', error)
          console.error('[Admin Auth] auth error', error)
          throw error
        } finally {
          console.groupEnd()
        }
      },
      logout: async () => {
        const { error } = await signOut()
        if (error) {
          console.error('[Admin Auth] signOut error', error)
          throw error
        }
        setUser(null)
      },
      requestPasswordReset: async (emailAddress) => {
        const { error } = await sendPasswordResetEmail(emailAddress)
        if (error) throw error
      }
    }
  }, [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
