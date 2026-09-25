import { Check, Send } from 'lucide-react'
import { useId, useState } from 'react'
import { subscribeNewsletter } from '../../services/api'

export default function Newsletter() {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | invalid | failed
  const [failure, setFailure] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setStatus('invalid')
    setStatus('loading')
    try {
      await subscribeNewsletter(email)
      setStatus('done')
      setEmail('')
    } catch (err) {
      setFailure(err.message)
      setStatus('failed')
    }
  }
  const hasError = status === 'invalid' || status === 'failed'

  if (status === 'done') {
    return (
      <p role="status" className="flex items-center gap-2 text-gold-light">
        <Check size={18} aria-hidden /> You're on the list. Exclusive offers are on their way.
      </p>
    )
  }

  return (
    <form data-fab-avoid onSubmit={onSubmit} noValidate className="@container w-full">
      {/* side by side only when the form itself is wide enough (the footer column is narrow) */}
      <div className="flex w-full flex-col gap-2 @sm:flex-row">
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setStatus('idle')
          }}
          placeholder="Your email address"
          className="input-lux rounded-full px-5"
          aria-invalid={status === 'invalid'}
          aria-describedby={hasError ? `${id}-err` : undefined}
        />
        <button type="submit" disabled={status === 'loading'} className="btn-gold shrink-0">
          {status === 'loading' ? (
            'Joining…'
          ) : (
            <>
              Subscribe <Send size={15} aria-hidden />
            </>
          )}
        </button>
      </div>
      {hasError && (
        <p id={`${id}-err`} role="alert" className="mt-2 text-sm text-red-300">
          {status === 'invalid' ? 'Please enter a valid email address.' : failure}
        </p>
      )}
    </form>
  )
}
