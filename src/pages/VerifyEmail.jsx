import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, resendVerificationEmail } from '../utils/supabase'

export default function VerifyEmail() {
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifying your email address...')
  const [resendEmail, setResendEmail] = useState('')
  const [resendStatus, setResendStatus] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) {
          setStatus('error')
          setMessage('Verification failed. Please try the link again or request a new verification email.')
          return
        }

        if (!data?.session) {
          setStatus('success')
          setMessage('A verification email has been sent. Please open the email and click the link to activate your account.')
          return
        }

        setStatus('success')
        setMessage('Your email was verified successfully. You can now sign in.')
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred while verifying your email.')
      }
    }

    verifyEmail()
  }, [])

  const handleResend = async () => {
    setResendStatus('')
    setResendLoading(true)
    try {
      await resendVerificationEmail(resendEmail)
      setResendStatus('A new verification email was sent if the address is registered. Check your inbox and spam folder.')
      setShowModal(true)
    } catch (error) {
      setResendStatus(error.message || 'Unable to resend verification email. Please try again later.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-xl rounded-[2rem] border border-primary/10 bg-surface/95 p-10 shadow-2xl backdrop-blur-xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Email verification</p>
        <h1 className="mt-4 text-3xl font-bold">{status === 'success' ? 'Verified' : status === 'error' ? 'Verification error' : 'Verifying...'}</h1>
        <p className="mt-4 text-text-muted">{message}</p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/auth/login"
            className="rounded-3xl bg-gradient-purple px-6 py-3 text-sm font-semibold text-white transition hover:shadow-glow-purple-lg"
          >
            Sign in
          </Link>
          <Link
            to="/auth/forgot-password"
            className="rounded-3xl border border-primary/10 bg-background/90 px-6 py-3 text-sm text-text-muted transition hover:border-primary"
          >
            Forgot password
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-primary/10 bg-background/90 p-6 text-left">
          <p className="text-sm text-text-muted">Did not receive the verification email? Resend it here.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-3xl border border-primary/10 bg-background/80 px-4 py-3 text-text outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
              className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendLoading ? 'Sending…' : 'Resend email'}
            </button>
          </div>
          {resendStatus && <p className="mt-4 text-sm text-text-muted">{resendStatus}</p>}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-10">
          <div className="w-full max-w-lg rounded-[2rem] border border-primary/10 bg-surface/95 p-8 shadow-2xl backdrop-blur-xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Email sent</p>
            <h2 className="mt-4 text-3xl font-bold">Verification email resent</h2>
            <p className="mt-4 text-text-muted">If the email exists in our system, a new verification message has been sent. Check your inbox or spam folder.</p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-8 rounded-3xl bg-gradient-purple px-6 py-3 text-sm font-semibold text-white transition hover:shadow-glow-purple-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
