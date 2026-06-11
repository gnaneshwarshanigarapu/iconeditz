import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAdmin, isConfigured, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 text-text">
      <div className="w-full max-w-xl rounded-[2rem] border border-primary/10 bg-surface/95 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Admin Portal</p>
          <h1 className="mt-4 text-3xl font-bold">Sign in to Icon Editz Admin</h1>
          <p className="mt-2 text-text-muted">
            {isConfigured
              ? 'Use your Supabase administrator account to manage products, orders, and analytics.'
              : 'Use local mock admin mode while Supabase is not connected yet.'}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
            Supabase is not configured yet, so this uses local mock admin access. Enter any email and password.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-primary/20 bg-background/80 px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-primary/20 bg-background/80 px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : isConfigured ? 'Sign In' : 'Open Mock Admin'}
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-primary/10 bg-background/90 p-4 text-sm text-text-muted">
          <p className="font-medium">{isConfigured ? 'Admin access requirements' : 'Local admin mode'}</p>
          <p className="mt-2">
            {isConfigured ? (
              <>
                This admin interface is protected by Supabase Auth and only allows email addresses listed in{' '}
                <code className="rounded bg-surface px-1 py-0.5">VITE_ADMIN_EMAILS</code>.
              </>
            ) : (
              'Products are stored in this browser with localStorage until Supabase is added.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
