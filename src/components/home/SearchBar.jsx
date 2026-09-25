import { Calendar, MapPin, PlaneTakeoff, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { destinations } from '../../data/data'

const today = () => new Date().toISOString().split('T')[0]

export default function SearchBar() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: '', to: '', date: '', travellers: 2 })
  const [error, setError] = useState('')

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setError('')
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.to) return setError('Please choose a destination.')
    const params = new URLSearchParams({ destination: form.to, travellers: String(form.travellers) })
    if (form.from) params.set('from', form.from)
    if (form.date) params.set('date', form.date)
    navigate(`/packages?${params}`)
  }

  const field = 'flex flex-1 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-white/5 focus-within:bg-white/5 lg:py-3'
  const input = '-my-[13px] w-full bg-transparent py-[13px] text-sm text-ivory outline-none placeholder:text-muted/70'

  return (
    <>
    <form onSubmit={onSubmit} className="glass mx-auto flex max-w-5xl flex-col gap-0.5 rounded-3xl p-2 lg:flex-row lg:items-center lg:rounded-full" aria-label="Search trips">
      <div className={field}>
        <PlaneTakeoff size={18} className="shrink-0 text-gold" aria-hidden />
        <div className="w-full">
          <label htmlFor="sb-from" className="block text-[10px] tracking-[0.2em] text-muted uppercase">From</label>
          <input id="sb-from" className={input} placeholder="Your city" value={form.from} onChange={set('from')} autoComplete="address-level2" />
        </div>
      </div>
      <div className="hidden h-8 w-px bg-white/10 lg:block" />
      <div className={field}>
        <MapPin size={18} className="shrink-0 text-gold" aria-hidden />
        <div className="w-full">
          <label htmlFor="sb-to" className="block text-[10px] tracking-[0.2em] text-muted uppercase">To</label>
          <select id="sb-to" className={`${input} cursor-pointer bg-ink-2 lg:bg-transparent`} value={form.to} onChange={set('to')} aria-invalid={!!error}>
            <option value="">Where to?</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="bg-ink-2">{d.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="hidden h-8 w-px bg-white/10 lg:block" />
      <div className={field}>
        <Calendar size={18} className="shrink-0 text-gold" aria-hidden />
        <div className="w-full">
          <label htmlFor="sb-date" className="block text-[10px] tracking-[0.2em] text-muted uppercase">Date</label>
          {/* Native date inputs can't show a placeholder, so overlay one until a date is picked */}
          <div className="relative">
            <input
              id="sb-date"
              type="date"
              min={today()}
              className={`peer ${input.replace('text-ivory', form.date ? 'text-ivory' : 'text-transparent focus:text-ivory')}`}
              value={form.date}
              onChange={set('date')}
            />
            {!form.date && (
              <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-muted/70 peer-focus:opacity-0">
                Select date
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="hidden h-8 w-px bg-white/10 lg:block" />
      <div className={field}>
        <Users size={18} className="shrink-0 text-gold" aria-hidden />
        <div className="w-full">
          <label htmlFor="sb-trav" className="block text-[10px] tracking-[0.2em] text-muted uppercase">Travellers</label>
          <input id="sb-trav" type="number" min={1} max={20} className={input} value={form.travellers} onChange={set('travellers')} />
        </div>
      </div>
      <button data-fab-avoid type="submit" className="btn-gold mt-1 !rounded-2xl lg:mt-0 lg:!rounded-full lg:!px-8 lg:!py-4">
        <Search size={16} aria-hidden /> Search
      </button>
    </form>
    {error && (
      <p role="alert" className="mt-3 text-center text-sm text-red-300">
        {error}
      </p>
    )}
    </>
  )
}
