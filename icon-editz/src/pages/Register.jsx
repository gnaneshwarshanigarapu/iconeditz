import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      navigate('/auth/verify-email')
    } catch (err) {
      setError(err.message || 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg rounded-[2rem] border border-primary/10 bg-surface/95 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">User registration</p>
          <h1 className="mt-4 text-3xl font-bold">Create your Icon Editz account</h1>
          <p className="mt-2 text-text-muted">Register now to access downloads, purchases, and order history.</p>
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
              placeholder="Choose a secure password"
            />
          </label>

          <label className="space-y-2 text-sm text-text-muted">
            Confirm password
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
              placeholder="Repeat your password"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Registering…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
