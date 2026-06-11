import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign in failed. Try again later.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg rounded-[2rem] border border-primary/10 bg-surface/95 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">User login</p>
          <h1 className="mt-4 text-3xl font-bold">Access your account</h1>
          <p className="mt-2 text-text-muted">Sign in to view purchases, downloads, and account settings.</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-3xl border border-primary/15 bg-background/90 px-4 py-3 text-sm font-semibold text-text transition hover:border-primary"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-sm text-text-muted">
          <span className="h-px flex-1 bg-primary/20" />
          Or sign in with email
          <span className="h-px flex-1 bg-primary/20" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm text-text-muted">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </label>

          <label className="space-y-2 text-sm text-text-muted">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:justify-between">
          <Link to="/auth/forgot-password" className="text-primary hover:text-primary/80">
            Forgot password?
          </Link>
          <Link to="/auth/register" className="text-primary hover:text-primary/80">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
