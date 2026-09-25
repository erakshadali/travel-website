import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, MapPin, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FilterGroup from '../components/ui/FilterGroup'
import PackageCard from '../components/ui/PackageCard'
import PageHero from '../components/ui/PageHero'
import { destinations, packages, tripTypes } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'

const sorts = {
  popular: { label: 'Most popular', fn: (a, b) => b.rating - a.rating },
  priceAsc: { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  priceDesc: { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  duration: { label: 'Duration', fn: (a, b) => a.days - b.days },
}

export default function Packages() {
  useDocumentTitle('Packages')
  const [params, setParams] = useSearchParams()
  const destination = params.get('destination') ?? ''
  const date = params.get('date')
  const travellers = params.get('travellers')
  const from = params.get('from')
  const [type, setType] = useState('All')
  const [sort, setSort] = useState('popular')

  const dest = destinations.find((d) => d.id === destination)

  const setDestination = (value) => {
    const next = new URLSearchParams(params)
    if (value) next.set('destination', value)
    else next.delete('destination')
    setParams(next, { replace: true })
  }

  const results = useMemo(
    () =>
      packages
        .filter((p) => (!destination || p.destination === destination) && (type === 'All' || p.type === type))
        .sort(sorts[sort].fn),
    [destination, type, sort],
  )

  // Carry search context (date, travellers) through to the detail/booking pages
  const carry = new URLSearchParams()
  if (date) carry.set('date', date)
  if (travellers) carry.set('travellers', travellers)

  return (
    <>
      <PageHero
        eyebrow="Packages"
        title={dest ? <>Journeys to <span className="text-champagne italic">{dest.name}</span></> : <>Signature <span className="text-champagne italic">packages</span></>}
        subtitle="Flights, handpicked hotels, visas, meals and private transfers, beautifully bundled."
        image={dest ? dest.image.replace('w=1200', 'w=1920') : images.heroes.packages}
      />

      <section className="container-lux py-12">
        {(date || travellers || from) && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4 text-sm">
            <span className="text-gold-light">Your search:</span>
            {from && <span className="flex items-center gap-1.5 text-ivory/80"><MapPin size={14} aria-hidden /> From {from}</span>}
            {date && <span className="flex items-center gap-1.5 text-ivory/80"><Calendar size={14} aria-hidden /> {new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>}
            {travellers && <span className="flex items-center gap-1.5 text-ivory/80"><Users size={14} aria-hidden /> {travellers} traveller{travellers === '1' ? '' : 's'}</span>}
          </div>
        )}

        <div className="glass grid gap-6 rounded-3xl p-5 sm:p-6 lg:grid-cols-[1fr_2fr_1fr] lg:items-end">
          <div>
            <label htmlFor="pk-dest" className="label-lux">Destination</label>
            <select id="pk-dest" value={destination} onChange={(e) => setDestination(e.target.value)} className="input-lux cursor-pointer">
              <option value="" className="bg-ink-2">All destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id} className="bg-ink-2">{d.name}</option>
              ))}
            </select>
          </div>
          <FilterGroup label="Trip type" options={tripTypes} value={type} onChange={setType} />
          <div>
            <label htmlFor="pk-sort" className="label-lux">Sort by</label>
            <select id="pk-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="input-lux cursor-pointer">
              {Object.entries(sorts).map(([k, s]) => (
                <option key={k} value={k} className="bg-ink-2">{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted" aria-live="polite">
            <span className="text-gold-light">{results.length}</span> package{results.length === 1 ? '' : 's'} found
          </p>
          {(destination || type !== 'All') && (
            <button onClick={() => { setDestination(''); setType('All') }} className="flex items-center gap-1 text-sm text-gold-light hover:underline">
              <X size={14} aria-hidden /> Clear filters
            </button>
          )}
        </div>

        <motion.div layout className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <PackageCard p={p} search={carry.toString()} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {results.length === 0 && (
          <div className="glass mt-6 rounded-3xl p-12 text-center">
            <h2 className="text-3xl">
              {dest ? `We'll tailor a ${dest.name} journey for you` : 'No packages match those filters'}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Every trip we craft is bespoke. Tell us your dates and wishes and our travel designers will build the perfect itinerary.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={`/planner${dest ? `?destination=${dest.id}` : ''}`} className="btn-gold">Plan a custom trip</Link>
              <button onClick={() => { setDestination(''); setType('All') }} className="btn-outline">See all packages</button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
