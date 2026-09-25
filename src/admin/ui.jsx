import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, LoaderCircle, RefreshCw } from 'lucide-react'
import { STATUS_STYLES } from './statuses'

export function StatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] leading-none font-normal tracking-wide whitespace-nowrap ${STATUS_STYLES[status] ?? STATUS_STYLES.Received} ${className}`}>
      {status}
    </span>
  )
}

export function PageHeader({ eyebrow, title, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  )
}

// role="alert" makes screen readers announce it as soon as it appears.
export function Notice({ kind = 'error', children }) {
  const Icon = kind === 'error' ? CircleAlert : CircleCheck
  const tone = kind === 'error' ? 'border-red-300/30 bg-red-300/5 text-red-300' : 'border-emerald-300/30 bg-emerald-300/5 text-emerald-300'
  return (
    <p role={kind === 'error' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${tone}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <LoaderCircle size={20} className="animate-spin text-gold" aria-hidden />
      <span className="text-sm">{label}...</span>
    </div>
  )
}

// One place for the loading / error / empty states of every list.
export function ListState({ loading, error, empty, emptyText, onRetry, children }) {
  if (error) {
    return (
      <div className="space-y-4">
        <Notice>{error.message}</Notice>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-outline btn-sm">
            <RefreshCw size={14} aria-hidden /> Try again
          </button>
        )}
      </div>
    )
  }
  if (loading && !children) return <Spinner />
  if (empty) return <p className="glass rounded-3xl p-10 text-center text-muted">{emptyText}</p>
  return children
}

export function Pagination({ data, onPage, noun = 'results' }) {
  if (!data) return null
  const { page, pages, total } = data
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      <button type="button" className="btn-outline btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft size={14} aria-hidden /> <span className="hidden sm:inline">Previous</span>
      </button>
      <p className="text-center text-sm text-muted" aria-live="polite">
        Page {page} of {Math.max(pages, 1)} · {total} {noun}
      </p>
      <button type="button" className="btn-outline btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <span className="hidden sm:inline">Next</span> <ChevronRight size={14} aria-hidden />
      </button>
    </nav>
  )
}

export function Field({ id, label, error, hint, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="label-lux">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

// A titled glass card used for every section on the detail page.
export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`glass min-w-0 rounded-3xl p-6 sm:p-8 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-2xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// Label / value pairs. Long values (emails) wrap instead of widening the page.
export function DetailList({ items, columns = 'sm:grid-cols-2' }) {
  return (
    <dl className={`grid gap-x-8 gap-y-4 ${columns}`}>
      {items
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="label-lux !mb-1">{label}</dt>
            <dd className="text-sm break-words text-ivory">{value}</dd>
          </div>
        ))}
    </dl>
  )
}
