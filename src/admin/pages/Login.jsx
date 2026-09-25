import { LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { LogoMark } from '../../components/ui/Logo'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { isBackendConfigured } from '../api'
import { useAdminAuth } from '../auth'
import { Field, Notice } from '../ui'

export default function Login() {
  useDocumentTitle('Admin sign in')
  const { token, expired, login } = useAdminAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Already signed in (or just did): go where they were headed, or the dashboard.
  const from = location.state?.from
  if (token) return <Navigate to={from ? `${from.pathname}${from.search}` : '/admin'} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return setError('Enter your email and password.')
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main id="main" className="grid min-h-screen place-items-center px-5 py-12">
      <div className="glass w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <LogoMark size={56} />
          <p className="eyebrow mt-6">Admin</p>
          <h1 className="mt-2 text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage bookings and enquiries.</p>
        </div>

        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
          {!isBackendConfigured && <Notice>The backend is not connected. Set VITE_API_URL and restart the site.</Notice>}
          {expired && !error && <Notice>Your session has ended. Please sign in again.</Notice>}
          {error && <Notice>{error}</Notice>}

          <Field id="admin-email" label="Email">
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              className="input-lux"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              autoFocus
            />
          </Field>
          <Field id="admin-password" label="Password">
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="input-lux"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
            />
          </Field>

          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? 'Signing in...' : <>Sign in <LogIn size={16} aria-hidden /></>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm">
          <Link to="/" className="inline-flex min-h-11 items-center text-muted hover:text-gold-light">Back to the website</Link>
        </p>
      </div>
    </main>
  )
}
