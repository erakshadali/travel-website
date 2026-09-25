import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DestinationCard from '../components/ui/DestinationCard'
import FilterGroup from '../components/ui/FilterGroup'
import PageHero from '../components/ui/PageHero'
import { budgets, destinations, regions, tripTypes } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Destinations() {
  useDocumentTitle('Destinations')
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [region, setRegion] = useState('All')
  const [budget, setBudget] = useState(budgets[0].label)
  const [type, setType] = useState(params.get('type') ?? 'All')
  const [showFilters, setShowFilters] = useState(false)

  const results = useMemo(() => {
    const b = budgets.find((x) => x.label === budget)
    const q = query.trim().toLowerCase()
    return destinations.filter(
      (d) =>
        (region === 'All' || d.region === region) &&
        (type === 'All' || d.types.includes(type)) &&
        d.price >= b.min &&
        d.price < b.max &&
        (!q || `${d.name} ${d.country}`.toLowerCase().includes(q)),
    )
  }, [query, region, budget, type])

  const reset = () => {
    setQuery('')
    setRegion('All')
    setBudget(budgets[0].label)
    setType('All')
  }
  const activeCount = [region !== 'All', budget !== budgets[0].label, type !== 'All', !!query].filter(Boolean).length

  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={<>The world, <span className="text-champagne italic">curated.</span></>}
        subtitle="Hand-picked destinations for honeymooners, families, adventurers and connoisseurs of luxury."
        image={images.heroes.destinations}
      />

      <section className="container-lux py-12">
        <div className="glass rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold" aria-hidden />
              <label htmlFor="dest-search" className="sr-only">Search destinations</label>
              <input id="dest-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search destinations or countries…" className="input-lux pl-11" />
            </div>
            <button onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} aria-controls="dest-filters" className="btn-outline lg:hidden">
              <SlidersHorizontal size={16} aria-hidden /> Filters {activeCount > 0 && `(${activeCount})`}
            </button>
          </div>
          <div id="dest-filters" className={`${showFilters ? 'grid' : 'hidden'} mt-6 gap-6 lg:grid lg:grid-cols-3`}>
            <FilterGroup label="Region" options={regions} value={region} onChange={setRegion} />
            <FilterGroup label="Budget (from, per person)" options={budgets} value={budget} onChange={setBudget} />
            <FilterGroup label="Trip type" options={tripTypes} value={type} onChange={setType} />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted" aria-live="polite">
            Showing <span className="text-gold-light">{results.length}</span> of {destinations.length} destinations
          </p>
          {activeCount > 0 && (
            <button onClick={reset} className="flex items-center gap-1 text-sm text-gold-light hover:underline">
              <X size={14} aria-hidden /> Clear filters
            </button>
          )}
        </div>

        <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((d) => (
              <motion.div key={d.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <DestinationCard d={d} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {results.length === 0 && (
          <div className="glass mt-6 rounded-3xl p-12 text-center">
            <h2 className="text-3xl">No destinations match those filters</h2>
            <p className="mt-2 text-muted">Try widening your budget or choosing a different trip type.</p>
            <button onClick={reset} className="btn-gold mt-6">Reset filters</button>
          </div>
        )}
      </section>
    </>
  )
}
