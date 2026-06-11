import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { isSupabaseConfigured, signIn, signOut, supabase } from '../utils/supabase'

const LOCAL_ADMIN_KEY = 'icon-editz.local-admin'

const adminEmailList = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const AuthContext = createContext({
  user: null,
  loading: true,
  isAdmin: false,
  isConfigured: false,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      try {
        const storedAdmin = window.localStorage.getItem(LOCAL_ADMIN_KEY)
        setUser(storedAdmin ? JSON.parse(storedAdmin) : null)
      } catch {
        setUser(null)
      }
      setLoading(false)
      return undefined
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setUser(data.session?.user || null)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(() => {
    const email = user?.email?.toLowerCase()
    const isLocalAdmin = Boolean(user?.isLocalAdmin)
    const isAdmin = Boolean(user && (isLocalAdmin || !adminEmailList.length || adminEmailList.includes(email)))

    return {
      user,
      loading,
      isAdmin,
      isConfigured: isSupabaseConfigured,
      login: async (emailAddress, password) => {
        if (!isSupabaseConfigured) {
          if (!emailAddress || !password) throw new Error('Enter an email and password to open local admin.')

          const localUser = {
            id: 'local-admin',
            email: emailAddress,
            isLocalAdmin: true,
          }

          window.localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(localUser))
          setUser(localUser)
          return localUser
        }

        const { data, error } = await signIn(emailAddress, password)
        if (error) throw error

        const loginEmail = data.user?.email?.toLowerCase()
        if (adminEmailList.length && !adminEmailList.includes(loginEmail)) {
          await signOut()
          throw new Error('This account is not authorized for admin access.')
        }

        return data.user
      },
      logout: async () => {
        if (isSupabaseConfigured) await signOut()
        window.localStorage.removeItem(LOCAL_ADMIN_KEY)
        setUser(null)
      },
    }
  }, [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
