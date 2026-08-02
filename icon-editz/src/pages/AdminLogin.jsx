import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@iconeditz.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { isAdmin, isConfigured, configError, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAdmin, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await login(email, password)
      setSuccess('Login successful.')
      window.setTimeout(() => navigate('/admin/dashboard', { replace: true }), 450)
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
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
            Use your administrator account to manage products, orders, and analytics.
          </p>
        </div>

        {!isConfigured && <p className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{configError}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-muted">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-primary/20 bg-background/80 px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="admin@iconeditz.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-text-muted">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-primary/20 bg-background/80 px-4 py-3 pr-12 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-text focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          {success && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{success}</p>}

          <button
            type="submit"
            disabled={loading || !isConfigured}
            className="w-full rounded-2xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
