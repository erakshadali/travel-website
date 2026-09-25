import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Compass, Landmark, Minus, Mountain, Plus, Send, ShoppingBag, UtensilsCrossed, Waves,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '../components/ui/PageHero'
import StepProgress from '../components/ui/StepProgress'
import { destinations, planner, whatsappLink } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { submitTripPlan } from '../services/api'

const STEPS = ['Destination', 'Dates', 'Travellers', 'Budget', 'Interests', 'Hotel']
const interestIcons = { Beach: Waves, Culture: Landmark, Adventure: Mountain, Shopping: ShoppingBag, Food: UtensilsCrossed }
const today = () => new Date().toISOString().split('T')[0]

function Counter({ label, note, value, onChange, min = 0 }) {
  return (
    <div className="glass flex items-center justify-between rounded-2xl p-5">
      <div>
        <p className="font-normal">{label}</p>
        <p className="text-xs text-muted">{note}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`} className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold-light transition hover:bg-gold hover:text-ink disabled:opacity-30">
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-serif text-2xl" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))} aria-label={`More ${label.toLowerCase()}`} className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 text-gold-light transition hover:bg-gold hover:text-ink">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

function Choice({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-5 text-left transition-colors duration-500 ease-out ${
        active ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-gold/40 hover:bg-white/5'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default function TripPlanner() {
  useDocumentTitle('Trip Planner')
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [status, setStatus] = useState('editing') // editing | review | sending | sent
  const [error, setError] = useState('')
  const [plan, setPlan] = useState({
    destination: params.get('destination') ?? '',
    start: '',
    end: '',
    flexible: false,
    adults: 2,
    children: 0,
    budget: '',
    interests: [],
    hotel: '',
    name: '',
    email: '',
    phone: '',
  })
  const [contactErrors, setContactErrors] = useState({})
  const set = (k, v) => {
    setPlan((p) => ({ ...p, [k]: v }))
    setError('')
  }
  const setContact = (k) => (e) => {
    set(k, e.target.value)
    setContactErrors((er) => ({ ...er, [k]: undefined }))
  }
  const dest = destinations.find((d) => d.id === plan.destination)

  const validate = () => {
    if (step === 0 && !plan.destination) return 'Choose a destination to continue.'
    if (step === 1 && !plan.flexible && (!plan.start || !plan.end)) return 'Select your travel dates, or mark them as flexible.'
    if (step === 1 && !plan.flexible && plan.end < plan.start) return 'Return date must be after departure.'
    if (step === 3 && !plan.budget) return 'Select a budget range.'
    if (step === 4 && plan.interests.length === 0) return 'Pick at least one interest.'
    if (step === 5 && !plan.hotel) return 'Choose a hotel preference.'
    return ''
  }

  const next = () => {
    const err = validate()
    if (err) return setError(err)
    setDir(1)
    if (step === STEPS.length - 1) setStatus('review')
    else setStep((s) => s + 1)
  }
  const back = () => {
    setDir(-1)
    setError('')
    if (status === 'review') setStatus('editing')
    else setStep((s) => Math.max(0, s - 1))
  }

  const nights = plan.start && plan.end ? Math.round((new Date(plan.end) - new Date(plan.start)) / 86400000) : null
  const hotel = planner.hotels.find((h) => h.id === plan.hotel)
  const summaryText = [
    `Trip plan: ${dest?.name}`,
    plan.flexible ? 'Dates: flexible' : `Dates: ${plan.start} to ${plan.end} (${nights} nights)`,
    `Travellers: ${plan.adults} adult(s), ${plan.children} child(ren)`,
    `Budget: ${plan.budget} per person`,
    `Interests: ${plan.interests.join(', ')}`,
    `Hotel: ${hotel?.label}`,
  ].join('\n')

  const send = async () => {
    const er = {}
    if (plan.name.trim().length < 2) er.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(plan.email)) er.email = 'Please enter a valid email.'
    setContactErrors(er)
    if (Object.keys(er).length) return
    setStatus('sending')
    setError('')
    try {
      await submitTripPlan({
        name: plan.name,
        email: plan.email,
        phone: plan.phone,
        destination: dest.name,
        flexibleDates: plan.flexible,
        startDate: plan.flexible ? undefined : plan.start,
        endDate: plan.flexible ? undefined : plan.end,
        travellers: { adults: plan.adults, children: plan.children },
        budget: plan.budget,
        interests: plan.interests,
        hotel: hotel.label,
      })
      setStatus('sent')
    } catch (err) {
      setError(err.message)
      setStatus('review')
    }
  }

  const variants = {
    enter: (d) => ({ opacity: 0, x: d * 16 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d * -16 }),
  }

  return (
    <>
      <PageHero
        eyebrow="Trip Planner"
        title={<>Design your <span className="text-champagne italic">dream journey</span></>}
        subtitle="Six quick steps. Our travel designers will send a tailored itinerary within 24 hours."
        image={images.heroes.planner}
      />

      <section className="container-lux max-w-4xl py-12">
        <div className="glass rounded-[2rem] p-6 sm:p-10">
          {status !== 'sent' && <StepProgress steps={STEPS} current={status === 'editing' ? step : STEPS.length - 1} />}

          <AnimatePresence mode="wait" custom={dir}>
            {status === 'editing' && (
              <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                {step === 0 && (
                  <>
                    <h2 className="text-3xl">Where would you like to go?</h2>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {destinations.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => set('destination', d.id)}
                          aria-pressed={plan.destination === d.id}
                          className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${plan.destination === d.id ? 'border-gold' : 'border-transparent'}`}
                        >
                          <img src={d.image.replace('w=1200', 'w=500')} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          <span className="absolute inset-0 bg-gradient-to-t from-ink/90 to-ink/10" />
                          <span className="absolute bottom-3 left-3 font-serif text-xl">{d.name}</span>
                          {plan.destination === d.id && <CheckCircle2 className="absolute top-3 right-3 text-gold-light" size={22} aria-hidden />}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2 className="text-3xl">When are you travelling?</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="tp-start" className="label-lux">Departure</label>
                        <input id="tp-start" type="date" min={today()} value={plan.start} onChange={(e) => set('start', e.target.value)} disabled={plan.flexible} className="input-lux disabled:opacity-40" />
                      </div>
                      <div>
                        <label htmlFor="tp-end" className="label-lux">Return</label>
                        <input id="tp-end" type="date" min={plan.start || today()} value={plan.end} onChange={(e) => set('end', e.target.value)} disabled={plan.flexible} className="input-lux disabled:opacity-40" />
                      </div>
                    </div>
                    <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ivory/80">
                      <input type="checkbox" checked={plan.flexible} onChange={(e) => set('flexible', e.target.checked)} className="h-5 w-5 accent-[#C9A96E]" />
                      My dates are flexible
                    </label>
                    {nights > 0 && !plan.flexible && <p className="mt-4 text-sm text-gold-light">{nights} nights of bliss ✦</p>}
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-3xl">Who's travelling?</h2>
                    <div className="mt-6 space-y-3">
                      <Counter label="Adults" note="Age 12+" value={plan.adults} min={1} onChange={(v) => set('adults', v)} />
                      <Counter label="Children" note="Age 2–11" value={plan.children} onChange={(v) => set('children', v)} />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-3xl">What's your budget per person?</h2>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {planner.budgets.map((b) => (
                        <Choice key={b} active={plan.budget === b} onClick={() => set('budget', b)}>
                          <span className="font-serif text-2xl">{b}</span>
                        </Choice>
                      ))}
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <h2 className="text-3xl">What do you love?</h2>
                    <p className="mt-1 text-sm text-muted">Choose as many as you like.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {planner.interests.map((it) => {
                        const Icon = interestIcons[it]
                        const active = plan.interests.includes(it)
                        return (
                          <Choice
                            key={it}
                            active={active}
                            className="text-center"
                            onClick={() => set('interests', active ? plan.interests.filter((x) => x !== it) : [...plan.interests, it])}
                          >
                            <Icon size={28} className={`mx-auto ${active ? 'text-gold-light' : 'text-muted'}`} aria-hidden />
                            <span className="mt-3 block text-sm">{it}</span>
                          </Choice>
                        )
                      })}
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <h2 className="text-3xl">Where would you like to stay?</h2>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {planner.hotels.map((h) => (
                        <Choice key={h.id} active={plan.hotel === h.id} onClick={() => set('hotel', h.id)}>
                          <span className="font-serif text-2xl">{h.label}</span>
                          <span className="mt-1 block text-sm text-muted">{h.note}</span>
                        </Choice>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {(status === 'review' || status === 'sending') && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="text-3xl">Your journey, at a glance</h2>
                <div className="mt-6 overflow-hidden rounded-3xl border border-gold/30">
                  <div className="relative h-48">
                    <img src={dest?.image} alt={dest?.name} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                    <p className="absolute bottom-4 left-6 font-serif text-4xl">{dest?.name}</p>
                  </div>
                  <dl className="grid gap-px bg-white/5 sm:grid-cols-2">
                    {[
                      ['Dates', plan.flexible ? 'Flexible' : `${new Date(plan.start).toLocaleDateString()} → ${new Date(plan.end).toLocaleDateString()} · ${nights} nights`],
                      ['Travellers', `${plan.adults} adult${plan.adults > 1 ? 's' : ''}${plan.children ? `, ${plan.children} child${plan.children > 1 ? 'ren' : ''}` : ''}`],
                      ['Budget', `${plan.budget} per person`],
                      ['Hotel', hotel?.label],
                      ['Interests', plan.interests.join(' · ')],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-ink-2 p-5">
                        <dt className="text-xs tracking-[0.2em] text-muted uppercase">{k}</dt>
                        <dd className="mt-1">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <h3 className="mt-10 font-serif text-2xl">How can we reach you?</h3>
                <p className="mt-1 text-sm text-muted">Your travel designer will send the itinerary here.</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tp-name" className="label-lux">Name</label>
                    <input id="tp-name" className="input-lux" autoComplete="name" value={plan.name} onChange={setContact('name')} disabled={status === 'sending'} aria-invalid={!!contactErrors.name} aria-describedby={contactErrors.name ? 'tp-name-err' : undefined} />
                    {contactErrors.name && <p id="tp-name-err" className="mt-1.5 text-xs text-red-300">{contactErrors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="tp-email" className="label-lux">Email</label>
                    <input id="tp-email" type="email" className="input-lux" autoComplete="email" value={plan.email} onChange={setContact('email')} disabled={status === 'sending'} aria-invalid={!!contactErrors.email} aria-describedby={contactErrors.email ? 'tp-email-err' : undefined} />
                    {contactErrors.email && <p id="tp-email-err" className="mt-1.5 text-xs text-red-300">{contactErrors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="tp-phone" className="label-lux">Phone (optional)</label>
                    <input id="tp-phone" type="tel" className="input-lux" autoComplete="tel" placeholder="+971 50 123 4567" value={plan.phone} onChange={setContact('phone')} disabled={status === 'sending'} />
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'sent' && (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center" role="status">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-champagne text-ink">
                  <Compass size={36} aria-hidden />
                </motion.div>
                <h2 className="mt-6 text-4xl">Your plan is on its way</h2>
                <p className="mx-auto mt-3 max-w-md text-muted">A travel designer will contact you within 24 hours with a tailored {dest?.name} itinerary. Want to talk now?</p>
                <div data-fab-avoid className="mt-8 flex flex-wrap justify-center gap-3">
                  <a href={whatsappLink(summaryText)} target="_blank" rel="noopener noreferrer" className="btn-gold">Continue on WhatsApp</a>
                  <Link to={`/packages?destination=${plan.destination}`} className="btn-outline">Browse {dest?.name} packages</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p role="alert" className="mt-6 text-sm text-red-300">{error}</p>}

          {status !== 'sent' && (
            <div data-fab-avoid className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={back} disabled={step === 0 && status === 'editing'} className="btn-outline w-full disabled:hidden sm:w-auto sm:disabled:inline-flex sm:disabled:invisible">
                <ArrowLeft size={16} aria-hidden /> Back
              </button>
              {status === 'editing' ? (
                <button type="button" onClick={next} className="btn-gold w-full sm:w-auto">
                  {step === STEPS.length - 1 ? 'Review plan' : 'Continue'} <ArrowRight size={16} aria-hidden />
                </button>
              ) : (
                <button type="button" onClick={send} disabled={status === 'sending'} className="btn-gold w-full sm:w-auto">
                  {status === 'sending' ? 'Sending…' : <>Send My Plan <Send size={16} aria-hidden /></>}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
