import { Check } from 'lucide-react'
import { useRef, useState } from 'react'
import { adminApi } from './api'
import { fmtUtc } from './format'
import { AIRPORTS, POPULAR_ZONES, isListedZone, localToUtc, zoneRegions } from './timezones'
import { Field, Notice } from './ui'

const emptyLeg = { city: '', airport: '', localDateTime: '', timezone: '' }
const LEG_FIELDS = ['city', 'airport', 'localDateTime', 'timezone']

function TimezoneSelect({ id, value, onChange, invalid }) {
  return (
    <select id={id} className="input-lux cursor-pointer" value={value} onChange={onChange} aria-invalid={invalid} aria-describedby={invalid ? `${id}-err` : undefined}>
      <option value="" className="bg-ink-2">Select a timezone...</option>
      {value && !isListedZone(value) && <option value={value} className="bg-ink-2">{value}</option>}
      <optgroup label="Popular">
        {POPULAR_ZONES.map(([zone, label]) => (
          <option key={zone} value={zone} className="bg-ink-2">{label} ({zone})</option>
        ))}
      </optgroup>
      {zoneRegions().map(([region, zones]) => (
        <optgroup key={region} label={region}>
          {zones.map((zone) => <option key={zone} value={zone} className="bg-ink-2">{zone.replaceAll('_', ' ')}</option>)}
        </optgroup>
      ))}
    </select>
  )
}

function LegFields({ leg, title, form, errors, onField, onAirport }) {
  const value = form[leg]
  const utc = localToUtc(value.localDateTime, value.timezone)
  const err = (key) => errors[`${leg}.${key}`]
  const id = (key) => `fl-${leg}-${key}`
  return (
    <fieldset className="grid min-w-0 gap-4 rounded-2xl border border-white/10 p-5 sm:grid-cols-2">
      <legend className="px-2 font-serif text-xl">{title}</legend>
      <Field id={id('airport')} label="Airport" error={err('airport')} hint="Type the code (e.g. DXB) to fill in the city and timezone">
        <input id={id('airport')} className="input-lux uppercase" value={value.airport} onChange={onAirport(leg)} placeholder="DXB" autoComplete="off" aria-invalid={!!err('airport')} aria-describedby={err('airport') ? `${id('airport')}-err` : undefined} />
      </Field>
      <Field id={id('city')} label="City" error={err('city')}>
        <input id={id('city')} className="input-lux" value={value.city} onChange={onField(leg, 'city')} autoComplete="off" aria-invalid={!!err('city')} aria-describedby={err('city') ? `${id('city')}-err` : undefined} />
      </Field>
      <Field id={id('localDateTime')} label="Local date and time" error={err('localDateTime')} hint="As printed on the ticket, in that airport's local time">
        <input id={id('localDateTime')} type="datetime-local" className="input-lux" value={value.localDateTime} onChange={onField(leg, 'localDateTime')} aria-invalid={!!err('localDateTime')} aria-describedby={err('localDateTime') ? `${id('localDateTime')}-err` : undefined} />
      </Field>
      <Field id={id('timezone')} label="Timezone" error={err('timezone')}>
        <TimezoneSelect id={id('timezone')} value={value.timezone} onChange={onField(leg, 'timezone')} invalid={!!err('timezone')} />
      </Field>
      {utc && <p className="text-sm text-muted sm:col-span-2" data-testid={`${leg}-utc`}>= {fmtUtc(utc.toISOString())}</p>}
    </fieldset>
  )
}

export default function FlightForm({ bookingId, flight, destination, onSaved, onCancel }) {
  const [form, setForm] = useState(() =>
    flight
      ? {
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          pnr: flight.pnr,
          departure: Object.fromEntries(LEG_FIELDS.map((k) => [k, flight.departure[k]])),
          arrival: Object.fromEntries(LEG_FIELDS.map((k) => [k, flight.arrival[k]])),
        }
      : { airline: '', flightNumber: '', pnr: '', departure: { ...emptyLeg }, arrival: { ...emptyLeg, city: destination ?? '' } },
  )
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  // City / timezone the admin typed themselves are never overwritten by an airport-code lookup.
  const manual = useRef(new Set())

  const clearError = (path) => setErrors((e) => ({ ...e, [path]: undefined }))

  const onTop = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    clearError(key)
  }
  const onField = (leg, key) => (e) => {
    const { value } = e.target
    if (key === 'city' || key === 'timezone') manual.current.add(`${leg}.${key}`)
    setForm((f) => ({ ...f, [leg]: { ...f[leg], [key]: value } }))
    clearError(`${leg}.${key}`)
  }
  const onAirport = (leg) => (e) => {
    const { value } = e.target
    const hit = AIRPORTS[value.trim().toUpperCase()]
    setForm((f) => ({
      ...f,
      [leg]: {
        ...f[leg],
        airport: value,
        ...(hit && !manual.current.has(`${leg}.city`) && { city: hit.city }),
        ...(hit && !manual.current.has(`${leg}.timezone`) && { timezone: hit.zone }),
      },
    }))
    clearError(`${leg}.airport`)
  }

  const validate = () => {
    const next = {}
    const need = (path, value, message) => !String(value).trim() && (next[path] = message)
    need('airline', form.airline, 'Enter the airline.')
    need('flightNumber', form.flightNumber, 'Enter the flight number, e.g. EK 511.')
    need('pnr', form.pnr, 'Enter the booking reference (PNR).')
    for (const leg of ['departure', 'arrival']) {
      need(`${leg}.airport`, form[leg].airport, 'Enter the airport.')
      need(`${leg}.city`, form[leg].city, 'Enter the city.')
      need(`${leg}.localDateTime`, form[leg].localDateTime, 'Enter the date and time.')
      need(`${leg}.timezone`, form[leg].timezone, 'Choose the timezone.')
    }
    const dep = localToUtc(form.departure.localDateTime, form.departure.timezone)
    const arr = localToUtc(form.arrival.localDateTime, form.arrival.timezone)
    if (dep && arr && arr <= dep) next['arrival.localDateTime'] = 'Arrival must be after departure (compared in UTC).'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validate()) return
    setBusy(true)
    try {
      const leg = (l) => Object.fromEntries(LEG_FIELDS.map((k) => [k, form[l][k]]))
      await adminApi.saveFlight(bookingId, {
        airline: form.airline,
        flightNumber: form.flightNumber,
        pnr: form.pnr,
        departure: leg('departure'),
        arrival: leg('arrival'),
      })
      onSaved()
    } catch (err) {
      // Show each server complaint next to its field; anything unattributed goes in the banner.
      const byPath = Object.fromEntries((err.details ?? []).filter((d) => d.path).map((d) => [d.path, d.message]))
      setErrors(byPath)
      setFormError(Object.keys(byPath).length ? 'Please fix the highlighted fields.' : err.message)
      setBusy(false)
    }
  }

  const top = (key, label, props = {}) => (
    <Field id={`fl-${key}`} label={label} error={errors[key]}>
      <input id={`fl-${key}`} className="input-lux" value={form[key]} onChange={onTop(key)} autoComplete="off" aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `fl-${key}-err` : undefined} {...props} />
    </Field>
  )

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {formError && <Notice>{formError}</Notice>}
      <div className="grid gap-4 sm:grid-cols-3">
        {top('airline', 'Airline', { placeholder: 'Emirates' })}
        {top('flightNumber', 'Flight number', { placeholder: 'EK 511', className: 'input-lux uppercase' })}
        {top('pnr', 'PNR', { placeholder: 'ABC123', className: 'input-lux uppercase', maxLength: 8 })}
      </div>
      <LegFields leg="departure" title="Departure" form={form} errors={errors} onField={onField} onAirport={onAirport} />
      <LegFields leg="arrival" title="Arrival" form={form} errors={errors} onField={onField} onAirport={onAirport} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={busy} className="btn-outline">Cancel</button>
        <button type="submit" disabled={busy} className="btn-gold">
          {busy ? 'Saving...' : <>Save flight details <Check size={16} aria-hidden /></>}
        </button>
      </div>
    </form>
  )
}
