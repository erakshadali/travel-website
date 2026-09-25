import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { adminApi } from '../api'
import { fmtDay, fmtMoney, travellersText } from '../format'
import { useFetch } from '../hooks'
import { STATUSES } from '../statuses'
import { Field, ListState, PageHeader, Pagination, StatusBadge } from '../ui'

const PAGE_SIZE = 15
const SORTS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['travelDate', 'Travel date'],
]

function StatTile({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 min-w-0 rounded-2xl border p-4 text-left transition-colors duration-500 ease-out ${
        active ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/[0.02] hover:border-gold/40'
      }`}
    >
      <span className="block font-serif text-3xl leading-none lining-nums">{count ?? '-'}</span>
      <span className="mt-2 block truncate text-[11px] tracking-[0.15em] text-muted uppercase">{label}</span>
    </button>
  )
}

function BookingRow({ b, list }) {
  return (
    <Link
      to={`/admin/bookings/${b.id}`}
      state={{ list }}
      className="glass block min-w-0 rounded-2xl p-5 transition-colors duration-500 hover:border-gold/50 md:grid md:grid-cols-[8.5rem_minmax(0,1.3fr)_minmax(0,1.3fr)_9rem_8.5rem] md:items-center md:gap-5 md:py-4"
    >
      <div className="flex items-center justify-between gap-3 md:block">
        <p className="font-mono text-sm text-gold-light">{b.reference}</p>
        <StatusBadge status={b.status} className="md:hidden" />
        <p className="hidden text-xs text-muted md:block">Booked {fmtDay(b.createdAt)}</p>
      </div>
      <div className="mt-3 min-w-0 md:mt-0">
        <p className="truncate">{b.clientName}</p>
        <p className="truncate text-sm text-muted">{b.email}</p>
      </div>
      <div className="mt-2 min-w-0 md:mt-0">
        <p className="truncate text-sm">{b.packageName}</p>
        <p className="truncate text-sm text-muted">{b.destination} · {travellersText(b.travellers)}</p>
      </div>
      <div className="mt-2 text-sm md:mt-0">
        <p>{fmtDay(b.travelDate)}</p>
        <p className="text-muted">{fmtMoney(b.estimatedTotal, b.currency)}</p>
      </div>
      <div className="hidden md:block">
        <StatusBadge status={b.status} />
      </div>
    </Link>
  )
}

export default function Dashboard() {
  useDocumentTitle('Admin bookings')
  const [params, setParams] = useSearchParams()
  const { search: listQuery } = useLocation() // the current filters, e.g. "?status=Confirmed"
  const status = params.get('status') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const page = Number(params.get('page')) || 1
  const search = params.get('q') ?? ''

  // Filters live in the URL, so a refresh or the back button keeps them. Changes are applied to the
  // URL as it is right now (not to a copy captured at render time, which a slow click or timer could
  // make out of date and so silently undo another filter). Empty values remove the parameter, and
  // anything but a page change goes back to page 1.
  const update = (patch) => {
    const next = new URLSearchParams(window.location.search)
    if (!('page' in patch)) next.delete('page')
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  // Typing feels instant; the URL (and so the request) follows a moment after the last keystroke.
  // Every keystroke restarts the timer, and it compares against the URL as it is *then*, so retyping
  // the same text right after "Clear filters" still applies.
  const [typed, setTyped] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = typed.trim()
      if ((new URLSearchParams(window.location.search).get('q') ?? '') !== q) update({ q }) // unchanged: keep the page number
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed])

  const stats = useFetch(() => adminApi.stats(), [])
  const list = useFetch(
    () => adminApi.bookings({ status, search, travelFrom: from, travelTo: to, sort, page, limit: PAGE_SIZE }),
    [status, search, from, to, sort, page],
  )

  const filtered = Boolean(status || search || from || to)
  const clear = () => {
    setTyped('')
    setParams({}, { replace: true })
  }
  const rangeInvalid = from && to && to < from

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Admin" title="Bookings" />

      <section aria-label="Bookings by status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <StatTile label="All" count={stats.data?.total} active={!status} onClick={() => update({ status: '' })} />
          {STATUSES.map((s) => (
            <StatTile key={s} label={s} count={stats.data?.byStatus[s]} active={status === s} onClick={() => update({ status: status === s ? '' : s })} />
          ))}
        </div>
        {stats.error && <p className="mt-3 text-sm text-red-300" role="alert">Counts unavailable: {stats.error.message}</p>}
      </section>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="glass grid min-w-0 gap-4 rounded-3xl p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <Field id="f-search" label="Search" className="sm:col-span-2 lg:col-span-1">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="f-search"
              type="search"
              className="input-lux !pl-11"
              placeholder="Name, FT reference, email..."
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          </div>
        </Field>
        <Field id="f-status" label="Status">
          <select id="f-status" className="input-lux cursor-pointer" value={status} onChange={(e) => update({ status: e.target.value })}>
            <option value="" className="bg-ink-2">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s} className="bg-ink-2">{s}</option>)}
          </select>
        </Field>
        <Field id="f-from" label="Travel from" error={rangeInvalid ? 'Must be before the end date' : undefined}>
          <input id="f-from" type="date" className="input-lux" value={from} max={to || undefined} onChange={(e) => update({ from: e.target.value })} />
        </Field>
        <Field id="f-to" label="Travel to">
          <input id="f-to" type="date" className="input-lux" value={to} min={from || undefined} onChange={(e) => update({ to: e.target.value })} />
        </Field>
        <Field id="f-sort" label="Sort">
          <select id="f-sort" className="input-lux cursor-pointer" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
            {SORTS.map(([value, label]) => <option key={value} value={value} className="bg-ink-2">{label}</option>)}
          </select>
        </Field>
        {filtered && (
          <div className="sm:col-span-2 lg:col-span-5">
            <button type="button" onClick={clear} className="btn-outline btn-sm"><X size={14} aria-hidden /> Clear filters</button>
          </div>
        )}
      </form>

      <section aria-label="Bookings" aria-busy={list.loading}>
        <ListState
          loading={list.loading}
          error={list.error}
          onRetry={list.reload}
          empty={list.data && list.data.data.length === 0}
          emptyText={filtered ? 'No bookings match these filters.' : 'No bookings yet. New ones from the website will appear here.'}
        >
          {list.data && (
            <>
              <div className="hidden gap-5 px-5 pb-2 text-[11px] tracking-[0.2em] text-muted uppercase md:grid md:grid-cols-[8.5rem_minmax(0,1.3fr)_minmax(0,1.3fr)_9rem_8.5rem]" aria-hidden>
                <span>Reference</span><span>Client</span><span>Trip</span><span>Travel date</span><span>Status</span>
              </div>
              <ul className={`space-y-3 transition-opacity ${list.loading ? 'opacity-60' : ''}`}>
                {list.data.data.map((b) => <li key={b.id}><BookingRow b={b} list={listQuery} /></li>)}
              </ul>
              <Pagination data={list.data} onPage={(p) => update({ page: p > 1 ? String(p) : '' })} noun="bookings" />
            </>
          )}
        </ListState>
      </section>
    </div>
  )
}
