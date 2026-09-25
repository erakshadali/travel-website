import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Lock, MessageCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import StepProgress from '../components/ui/StepProgress'
import { destinations, packages, whatsappLink } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { submitBooking } from '../services/api'

const STEPS = ['Traveller', 'Trip', 'Requests']
const ROOMS = [
  { id: 'standard', label: 'Standard', surcharge: 0 },
  { id: 'deluxe', label: 'Deluxe', surcharge: 0.15 },
  { id: 'suite', label: 'Suite', surcharge: 0.35 },
]
const OCCASIONS = ['None', 'Honeymoon', 'Anniversary', 'Birthday', 'Family reunion']
const INSURANCE_PP = 45
const CHILD_RATE = 0.7
const TAX_RATE = 0.05
const today = () => new Date().toISOString().split('T')[0]
const money = (n) => `$${Math.round(n).toLocaleString()}`
// These two mirror the server's rules, so mistakes are caught on the step where they were made.
const PASSPORT_NAME = /^\p{L}[\p{L}\p{M}\s'’.-]*$/u
// Country code required, 8-15 digits after the "+" ("00" also works).
const isInternationalNumber = (raw) => /^\+[1-9]\d{7,14}$/.test(raw.replace(/[\s\-().]/g, '').replace(/^00/, '+'))

const initialState = (params) => {
  const pkg = packages.find((p) => p.id === params.get('package'))
  const fromDest = packages.find((p) => p.destination === params.get('destination'))
  return {
    traveller: { fullName: '', email: '', whatsapp: '', passportName: '', whatsappConsent: false },
    trip: {
      packageId: pkg?.id ?? fromDest?.id ?? packages[0].id,
      departure: params.get('date') ?? '',
      adults: Math.max(1, Number(params.get('travellers')) || 2),
      children: 0,
      room: 'standard',
    },
    requests: { occasion: 'None', notes: '', insurance: false },
  }
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label-lux">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default function Booking() {
  useDocumentTitle('Booking')
  const [params] = useSearchParams()
  const [data, setData] = useState(() => initialState(params))
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('editing') // editing | submitting | done
  const [confirmation, setConfirmation] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const update = (section, key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const pkg = packages.find((p) => p.id === data.trip.packageId)
  const dest = destinations.find((d) => d.id === pkg?.destination)

  const price = useMemo(() => {
    const room = ROOMS.find((r) => r.id === data.trip.room)
    const adults = Number(data.trip.adults) || 0
    const children = Number(data.trip.children) || 0
    const base = pkg.price * (1 + room.surcharge)
    const adultTotal = base * adults
    const childTotal = base * CHILD_RATE * children
    const insurance = data.requests.insurance ? INSURANCE_PP * (adults + children) : 0
    const subtotal = adultTotal + childTotal + insurance
    const taxes = subtotal * TAX_RATE
    return { base, adults, children, adultTotal, childTotal, insurance, room, taxes, total: subtotal + taxes }
  }, [pkg, data.trip, data.requests.insurance])

  const validate = () => {
    const e = {}
    if (step === 0) {
      const t = data.traveller
      if (t.fullName.trim().length < 3) e.fullName = 'Please enter your full name.'
      if (!/^\S+@\S+\.\S+$/.test(t.email)) e.email = 'Please enter a valid email.'
      if (!isInternationalNumber(t.whatsapp)) e.whatsapp = 'Include the country code, e.g. +971 50 123 4567.'
      if (t.passportName.trim().length < 3) e.passportName = 'Enter the name exactly as on your passport.'
      else if (!PASSPORT_NAME.test(t.passportName.trim())) e.passportName = 'Use letters only (spaces, hyphens and apostrophes are fine).'
      if (!t.whatsappConsent) e.whatsappConsent = 'Please tick this box to continue.'
    }
    if (step === 1) {
      const adults = Number(data.trip.adults)
      const children = Number(data.trip.children)
      if (!data.trip.departure) e.departure = 'Choose a departure date.'
      else if (data.trip.departure < today()) e.departure = 'Departure must be in the future.'
      if (!Number.isInteger(adults) || adults < 1 || adults > 20) e.adults = 'Enter between 1 and 20 adults.'
      if (!Number.isInteger(children) || children < 0 || children > 20) e.children = 'Enter between 0 and 20 children.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => validate() && setStep((s) => s + 1)
  const back = () => setStep((s) => Math.max(0, s - 1))

  const submit = async (e) => {
    e.preventDefault()
    if (step < STEPS.length - 1) return next()
    setStatus('submitting')
    setSubmitError('')
    const { traveller, trip, requests } = data
    try {
      const res = await submitBooking({
        clientName: traveller.fullName,
        email: traveller.email,
        whatsappNumber: traveller.whatsapp,
        passportName: traveller.passportName,
        packageName: pkg.title,
        destination: dest?.name ?? pkg.title,
        travelDate: trip.departure,
        travellers: { adults: Number(trip.adults), children: Number(trip.children) || 0 },
        roomType: trip.room,
        specialRequests: requests.notes,
        occasion: requests.occasion === 'None' ? '' : requests.occasion,
        insurance: requests.insurance,
        estimatedTotal: Math.round(price.total),
        currency: 'USD',
        whatsappConsent: traveller.whatsappConsent,
      })
      setConfirmation(res.reference)
      setStatus('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message)
      setStatus('editing')
    }
  }

  const errProps = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `bk-${k}-err` : undefined })

  if (status === 'done') {
    return (
      <section className="container-lux grid min-h-screen place-items-center pt-32 pb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-2xl rounded-[2rem] p-8 text-center sm:p-12" role="status">
          <div className="relative mx-auto h-24 w-24">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative grid h-24 w-24 place-items-center rounded-full bg-champagne text-ink">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }} />
              </svg>
            </motion.div>
          </div>
          <h1 className="mt-8 text-4xl sm:text-5xl">Booking request received</h1>
          <p className="mt-3 text-muted">
            Thank you, {data.traveller.fullName.split(' ')[0]}. Your reference is{' '}
            <span className="font-mono text-gold-light">{confirmation}</span>. We'll confirm availability on WhatsApp and email within a few hours.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-ink-2 p-5 text-left text-sm">
            <p className="font-serif text-xl">{pkg.title}</p>
            <p className="mt-1 text-muted">
              {new Date(data.trip.departure).toLocaleDateString(undefined, { dateStyle: 'long' })} · {price.adults} adult(s)
              {price.children > 0 && `, ${price.children} child(ren)`} · {price.room.label} room
            </p>
            <p className="mt-3 text-gold-light">Estimated total: {money(price.total)}</p>
          </div>
          <div data-fab-avoid className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={whatsappLink(`Hello! My booking reference is ${confirmation} for ${pkg.title}.`)} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <MessageCircle size={16} aria-hidden /> Message us on WhatsApp
            </a>
            <Link to="/" className="btn-outline">Back to home</Link>
          </div>
        </motion.div>
      </section>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Booking"
        title={<>Reserve your <span className="text-champagne italic">escape</span></>}
        subtitle="Three simple steps. No payment is taken now; we'll confirm availability first."
        image={images.heroes.booking}
      />

      <section className="container-lux grid gap-8 py-12 lg:grid-cols-[1fr_380px] [&>*]:min-w-0">
        <form onSubmit={submit} noValidate className="glass rounded-[2rem] p-6 sm:p-10">
          <StepProgress steps={STEPS} current={step} />

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              {step === 0 && (
                <fieldset className="grid gap-5 sm:grid-cols-2">
                  <legend className="mb-6 font-serif text-3xl">Traveller details</legend>
                  <Field id="bk-fullName" label="Full name" error={errors.fullName}>
                    <input id="bk-fullName" className="input-lux" autoComplete="name" value={data.traveller.fullName} onChange={update('traveller', 'fullName')} {...errProps('fullName')} />
                  </Field>
                  <Field id="bk-email" label="Email" error={errors.email}>
                    <input id="bk-email" type="email" className="input-lux" autoComplete="email" value={data.traveller.email} onChange={update('traveller', 'email')} {...errProps('email')} />
                  </Field>
                  <Field id="bk-whatsapp" label="WhatsApp number" error={errors.whatsapp}>
                    <input id="bk-whatsapp" type="tel" className="input-lux" autoComplete="tel" placeholder="+971 50 123 4567" value={data.traveller.whatsapp} onChange={update('traveller', 'whatsapp')} {...errProps('whatsapp')} />
                  </Field>
                  <Field id="bk-passportName" label="Name as on passport" error={errors.passportName}>
                    <input id="bk-passportName" className="input-lux uppercase" value={data.traveller.passportName} onChange={update('traveller', 'passportName')} {...errProps('passportName')} />
                  </Field>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm transition hover:border-gold/40">
                      <input
                        id="bk-whatsappConsent"
                        type="checkbox"
                        checked={data.traveller.whatsappConsent}
                        onChange={update('traveller', 'whatsappConsent')}
                        aria-required="true"
                        {...errProps('whatsappConsent')}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[#C9A96E]"
                      />
                      <span>
                        Send me trip updates on WhatsApp
                        <span className="block text-xs text-muted">
                          Booking confirmation, flight and arrival details, and occasional offers after your trip, sent to the number above. You can opt out at any time.
                        </span>
                      </span>
                    </label>
                    {errors.whatsappConsent && <p id="bk-whatsappConsent-err" className="mt-1.5 text-xs text-red-300">{errors.whatsappConsent}</p>}
                  </div>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset className="grid gap-5 sm:grid-cols-2">
                  <legend className="mb-6 font-serif text-3xl">Trip details</legend>
                  <div className="sm:col-span-2">
                    <Field id="bk-package" label="Package">
                      <select id="bk-package" className="input-lux cursor-pointer" value={data.trip.packageId} onChange={update('trip', 'packageId')}>
                        {packages.map((p) => (
                          <option key={p.id} value={p.id} className="bg-ink-2">
                            {p.title} · {p.days}D/{p.nights}N · from ${p.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field id="bk-departure" label="Departure date" error={errors.departure}>
                    <input id="bk-departure" type="date" min={today()} className="input-lux" value={data.trip.departure} onChange={update('trip', 'departure')} {...errProps('departure')} />
                  </Field>
                  <Field id="bk-room" label="Room type">
                    <select id="bk-room" className="input-lux cursor-pointer" value={data.trip.room} onChange={update('trip', 'room')}>
                      {ROOMS.map((r) => (
                        <option key={r.id} value={r.id} className="bg-ink-2">
                          {r.label}{r.surcharge ? ` (+${r.surcharge * 100}%)` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="bk-adults" label="Adults (12+)" error={errors.adults}>
                    <input id="bk-adults" type="number" min={1} max={20} className="input-lux" value={data.trip.adults} onChange={update('trip', 'adults')} {...errProps('adults')} />
                  </Field>
                  <Field id="bk-children" label="Children (2–11)" error={errors.children}>
                    <input id="bk-children" type="number" min={0} max={20} className="input-lux" value={data.trip.children} onChange={update('trip', 'children')} {...errProps('children')} />
                  </Field>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="grid gap-5">
                  <legend className="mb-6 font-serif text-3xl">Special requests</legend>
                  <Field id="bk-occasion" label="Celebrating something?">
                    <select id="bk-occasion" className="input-lux cursor-pointer" value={data.requests.occasion} onChange={update('requests', 'occasion')}>
                      {OCCASIONS.map((o) => <option key={o} className="bg-ink-2">{o}</option>)}
                    </select>
                  </Field>
                  <Field id="bk-notes" label="Requests (dietary, accessibility, room preferences…)">
                    <textarea id="bk-notes" rows={5} maxLength={2000} className="input-lux resize-none" value={data.requests.notes} onChange={update('requests', 'notes')} placeholder="E.g. halal meals, connecting rooms, airport wheelchair assistance" />
                  </Field>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm transition hover:border-gold/40">
                    <input type="checkbox" checked={data.requests.insurance} onChange={update('requests', 'insurance')} className="mt-0.5 h-5 w-5 accent-[#C9A96E]" />
                    <span>
                      Add comprehensive travel insurance <span className="text-gold-light">(+${INSURANCE_PP} per traveller)</span>
                      <span className="block text-xs text-muted">Medical cover, trip cancellation and lost baggage.</span>
                    </span>
                  </label>
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          {submitError && <p role="alert" className="mt-8 rounded-2xl border border-red-300/30 bg-red-300/5 p-4 text-sm text-red-300">{submitError}</p>}

          <div data-fab-avoid className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={back} disabled={step === 0} className="btn-outline w-full disabled:hidden sm:w-auto sm:disabled:inline-flex sm:disabled:invisible">
              <ArrowLeft size={16} aria-hidden /> Back
            </button>
            {/* distinct keys: reusing one <button> element lets the Continue tap turn into a form submit */}
            {step < STEPS.length - 1 ? (
              <button key="next" type="button" onClick={next} className="btn-gold w-full sm:w-auto">
                Continue <ArrowRight size={16} aria-hidden />
              </button>
            ) : (
              <button key="submit" type="submit" disabled={status === 'submitting'} className="btn-gold w-full sm:w-auto">
                {status === 'submitting' ? 'Confirming…' : <>Confirm Booking <Check size={16} aria-hidden /></>}
              </button>
            )}
          </div>
        </form>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Booking summary">
          <div className="glass overflow-hidden rounded-[2rem]">
            <div className="relative h-40">
              <img src={pkg.image.replace('w=1200', 'w=700')} alt={pkg.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-xs tracking-[0.2em] text-gold uppercase">{dest?.name}</p>
                <p className="font-serif text-2xl">{pkg.title}</p>
              </div>
            </div>
            <div className="space-y-3 p-6 text-sm">
              <p className="text-xs tracking-[0.2em] text-muted uppercase">Price breakdown</p>
              <div className="flex justify-between"><span className="text-muted">{price.room.label} room, per person</span><span>{money(price.base)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Adults × {price.adults}</span><span>{money(price.adultTotal)}</span></div>
              {price.children > 0 && (
                <div className="flex justify-between"><span className="text-muted">Children × {price.children} (30% off)</span><span>{money(price.childTotal)}</span></div>
              )}
              {price.insurance > 0 && (
                <div className="flex justify-between"><span className="text-muted">Travel insurance</span><span>{money(price.insurance)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted">Taxes &amp; fees (5%)</span><span>{money(price.taxes)}</span></div>
              <div className="h-px bg-white/10" />
              <div className="flex items-end justify-between">
                <span>Estimated total</span>
                <motion.span key={Math.round(price.total)} initial={{ scale: 1.15, color: '#E6D3A3' }} animate={{ scale: 1, color: '#C9A96E' }} className="font-serif text-3xl">
                  {money(price.total)}
                </motion.span>
              </div>
              <p className="flex items-center gap-2 pt-2 text-xs text-muted"><Lock size={12} aria-hidden /> No payment now · Free cancellation up to 30 days</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
