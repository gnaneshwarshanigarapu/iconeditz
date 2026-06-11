import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../hooks/useAuth'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const verifySession = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
      if (error || !data?.session) {
        setError('Unable to validate password reset link. Please try again from the email received.')
        setStatus('error')
        return
      }
      setStatus('ready')
    }

    verifySession()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(password)
      setMessage('Password updated successfully. Redirecting to login…')
      setTimeout(() => navigate('/auth/login'), 1800)
    } catch (err) {
      setError(err.message || 'Unable to reset your password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg rounded-[2rem] border border-primary/10 bg-surface/95 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Reset password</p>
          <h1 className="mt-4 text-3xl font-bold">Set a new password</h1>
          <p className="mt-2 text-text-muted">Update your password using the link from your inbox.</p>
        </div>

        {status === 'loading' ? (
          <div className="rounded-3xl border border-primary/10 bg-background/90 p-6 text-center text-text-muted">
            Validating your password reset link…
          </div>
        ) : status === 'error' ? (
          <div className="rounded-3xl border border-red-300/40 bg-red-500/10 p-6 text-center text-red-600">
            {error}
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm text-text-muted">
              New password
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
                placeholder="Enter new password"
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
                placeholder="Confirm new password"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {message && <p className="text-sm text-emerald-500">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-purple px-6 py-3 text-base font-semibold text-white transition hover:shadow-glow-purple-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
