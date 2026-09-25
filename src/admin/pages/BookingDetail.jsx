import { ArrowLeft, Check, Mail, MessageCircle, Pencil, Plane, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { adminApi } from '../api'
import FlightForm from '../FlightForm'
import { fmtDateTime, fmtDay, fmtLocal, fmtMoney, fmtUtc, travellersText, whatsappUrl } from '../format'
import { useFetch } from '../hooks'
import { STATUSES } from '../statuses'
import { Card, DetailList, Field, ListState, Notice, StatusBadge } from '../ui'

const link = 'inline-flex min-h-11 items-center gap-2 text-gold-light underline-offset-4 hover:underline'

function ClientCard({ b }) {
  return (
    <Card title="Client">
      <DetailList
        items={[
          ['Name', b.clientName],
          ['Name on passport', b.passportName],
          ['Email', <a key="e" href={`mailto:${b.email}`} className={link}><Mail size={15} aria-hidden /> {b.email}</a>],
          ['WhatsApp', <a key="w" href={whatsappUrl(b.whatsappNumber)} target="_blank" rel="noopener noreferrer" className={link}><MessageCircle size={15} aria-hidden /> {b.whatsappNumber}</a>],
          ['WhatsApp consent', b.whatsappConsent ? `Yes, given ${b.whatsappConsentAt ? fmtDateTime(b.whatsappConsentAt) : ''}`.trim() : 'No'],
          ['Opted out of messages', b.optedOut ? <span key="o" className="text-red-300">Yes</span> : 'No'],
          ['Booked on', fmtDateTime(b.createdAt)],
        ]}
      />
    </Card>
  )
}

function TripCard({ b }) {
  return (
    <Card title="Trip">
      <DetailList
        items={[
          ['Package', b.packageName],
          ['Destination', b.destination],
          ['Travel date', fmtDay(b.travelDate)],
          ['Travellers', travellersText(b.travellers)],
          ['Room', b.roomType[0].toUpperCase() + b.roomType.slice(1)],
          ['Celebrating', b.occasion],
          ['Travel insurance', b.insurance ? 'Yes' : 'No'],
          ['Estimated total', fmtMoney(b.estimatedTotal, b.currency)],
        ]}
      />
      {b.specialRequests && (
        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="label-lux !mb-1">Special requests</p>
          <p className="text-sm break-words whitespace-pre-wrap">{b.specialRequests}</p>
        </div>
      )}
    </Card>
  )
}

function Leg({ title, leg }) {
  return (
    <div className="min-w-0" data-testid={`${title.toLowerCase()}-leg`}>
      <p className="label-lux !mb-1">{title}</p>
      <p className="font-serif text-3xl">{leg.airport}</p>
      <p className="text-sm text-muted">{leg.city}</p>
      <p className="mt-2 text-sm">{fmtLocal(leg.localDateTime)}</p>
      <p className="text-sm text-muted">{leg.timezone}</p>
      <p className="text-sm text-muted">{fmtUtc(leg.at)}</p>
    </div>
  )
}

function FlightCard({ booking, onChanged }) {
  const { flight } = booking
  const [editing, setEditing] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const saved = () => {
    setEditing(false)
    onChanged()
  }
  const remove = async () => {
    setBusy(true)
    setError('')
    try {
      await adminApi.deleteFlight(booking.id)
      setConfirmingRemove(false)
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  let action = null
  if (!editing && !flight) {
    action = <button type="button" className="btn-gold btn-sm" onClick={() => setEditing(true)}><Plane size={14} aria-hidden /> Add flight details</button>
  } else if (!editing && flight) {
    action = <button type="button" className="btn-outline btn-sm" onClick={() => setEditing(true)}><Pencil size={14} aria-hidden /> Edit</button>
  }

  return (
    <Card title="Flight" action={action}>
      {editing ? (
        <FlightForm bookingId={booking.id} flight={flight} destination={booking.destination} onSaved={saved} onCancel={() => setEditing(false)} />
      ) : !flight ? (
        <p className="text-sm text-muted">No flight details yet. Add them once the ticket has been booked.</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="font-serif text-2xl lining-nums">{flight.flightNumber} <span className="text-base text-muted">· {flight.airline}</span></p>
            <p className="text-sm text-muted">PNR <span className="font-mono text-gold-light">{flight.pnr}</span></p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Leg title="Departure" leg={flight.departure} />
            <Leg title="Arrival" leg={flight.arrival} />
          </div>
          {error && <Notice>{error}</Notice>}
          {confirmingRemove ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-300/30 p-4">
              <p className="text-sm text-red-300">Remove these flight details?</p>
              <button type="button" className="btn-outline btn-sm" onClick={remove} disabled={busy}>{busy ? 'Removing...' : 'Yes, remove'}</button>
              <button type="button" className="btn-outline btn-sm" onClick={() => setConfirmingRemove(false)} disabled={busy}>Keep</button>
            </div>
          ) : (
            <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-red-300" onClick={() => setConfirmingRemove(true)}>
              <Trash2 size={14} aria-hidden /> Remove flight details
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

function StatusCard({ booking, onChanged }) {
  const [status, setStatus] = useState(booking.status)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  // After a reload the server's status is the truth.
  useEffect(() => {
    setStatus(booking.status)
  }, [booking.status])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setDone('')
    try {
      await adminApi.setStatus(booking.id, status, note.trim() || undefined)
      setNote('')
      setDone(`Status changed to ${status}.`)
      onChanged()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Status">
      <form onSubmit={submit} className="space-y-4">
        <Field id="st-status" label="Change status to">
          <select id="st-status" className="input-lux cursor-pointer" value={status} onChange={(e) => { setStatus(e.target.value); setDone(''); setError('') }}>
            {STATUSES.map((s) => <option key={s} value={s} className="bg-ink-2">{s}{s === booking.status ? ' (current)' : ''}</option>)}
          </select>
        </Field>
        <Field id="st-note" label="Note (optional)" hint="Kept in the history below, e.g. 'Ticket booked with Emirates'.">
          <textarea id="st-note" rows={3} maxLength={500} className="input-lux resize-none" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        {error && <Notice>{error}</Notice>}
        {done && <Notice kind="success">{done}</Notice>}
        <button type="submit" disabled={busy || status === booking.status} className="btn-gold w-full sm:w-auto">
          {busy ? 'Updating...' : <>Update status <Check size={16} aria-hidden /></>}
        </button>
      </form>
    </Card>
  )
}

function Timeline({ history }) {
  return (
    <Card title="History">
      <ol className="relative space-y-6 border-l border-white/10 pl-6">
        {[...history].reverse().map((h, i) => (
          <li key={`${h.changedAt}-${i}`} className="relative" data-testid="history-entry">
            <span className={`absolute top-1.5 -left-[30px] h-2.5 w-2.5 rounded-full bg-champagne ${i === 0 ? 'ring-4 ring-gold/20' : 'opacity-60'}`} aria-hidden />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusBadge status={h.status} />
              <time dateTime={h.changedAt} className="text-sm text-muted">{fmtDateTime(h.changedAt)}</time>
            </div>
            {h.note && <p className="mt-2 text-sm break-words whitespace-pre-wrap text-ivory/85">{h.note}</p>}
          </li>
        ))}
      </ol>
    </Card>
  )
}

export default function BookingDetail() {
  const { id } = useParams()
  const { state } = useLocation()
  const { data: booking, error, loading, reload } = useFetch(() => adminApi.booking(id), [id])
  useDocumentTitle(booking ? `Admin ${booking.reference}` : 'Admin booking')
  const back = `/admin${state?.list ?? ''}` // return to the same filters the list had

  return (
    <div className="space-y-8">
      <Link to={back} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-gold-light">
        <ArrowLeft size={15} aria-hidden /> All bookings
      </Link>

      <ListState loading={loading} error={error && !booking ? error : null} onRetry={reload}>
        {booking && (
          <>
            {error && <Notice>{error.message}</Notice>}
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-gold-light" data-testid="booking-reference">{booking.reference}</p>
                <h1 className="mt-1 text-4xl break-words sm:text-5xl">{booking.clientName}</h1>
                <p className="mt-1 text-muted">{booking.packageName} · {fmtDay(booking.travelDate)}</p>
              </div>
              <StatusBadge status={booking.status} className="self-start sm:self-auto" />
            </header>

            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start">
              <div className="lg:col-start-2 lg:row-start-1">
                <StatusCard booking={booking} onChanged={reload} />
              </div>
              <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
                <ClientCard b={booking} />
                <TripCard b={booking} />
                <FlightCard booking={booking} onChanged={reload} />
              </div>
              <div className="lg:col-start-2 lg:row-start-2">
                <Timeline history={booking.statusHistory} />
              </div>
            </div>
          </>
        )}
      </ListState>
    </div>
  )
}
