import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from './SearchBar'

const Globe = lazy(() => import('../three/Globe'))

function GlobeFallback() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="aspect-square w-3/4 animate-pulse rounded-full border border-gold/30 bg-[radial-gradient(circle_at_35%_35%,rgba(201,169,110,0.25),transparent_60%)]" />
    </div>
  )
}

const fade = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 1.9 + delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
})

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden pt-24 pb-14 sm:pt-28 lg:min-h-screen lg:pt-32 lg:pb-16">
      <div className="container-lux relative grid items-center gap-8 lg:grid-cols-2 lg:gap-4">
        {/* Text first on every screen size */}
        <div className="relative z-10">
          <motion.p {...fade(0)} className="eyebrow mb-4 flex items-center gap-2 sm:mb-6">
            <Sparkles size={14} aria-hidden /> Luxury Travel Since 2011
          </motion.p>
          <motion.h1 {...fade(0.1)} className="text-[2.75rem] leading-[1.05] sm:text-6xl xl:text-[5.25rem]">
            Journeys crafted <br className="hidden sm:block" />
            <span className="text-champagne italic">in gold.</span>
          </motion.h1>
          <motion.p {...fade(0.2)} className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
            From the dunes of Dubai to the lagoons of the Maldives, Fatima Tours and Travels designs bespoke escapes for travellers who expect the extraordinary.
          </motion.p>
          <motion.div {...fade(0.3)} className="mt-7 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
            <Link to="/planner" className="btn-gold">
              Plan Your Journey <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/booking" className="btn-outline">
              Book Now
            </Link>
          </motion.div>
        </div>

        {/* Globe: compact below the text on mobile, large on the right on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-6 aspect-square w-full max-w-[300px] sm:max-w-[400px] lg:mb-0 lg:aspect-auto lg:h-[620px] lg:max-w-none"
        >
          <Suspense fallback={<GlobeFallback />}>
            <Globe onSelect={(id) => navigate(`/packages?destination=${id}`)} />
          </Suspense>
          <p className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] whitespace-nowrap text-muted uppercase lg:bottom-2">
            <span className="lg:hidden">Tap a destination</span>
            <span className="hidden lg:inline">Drag to explore · hover a destination</span>
          </p>
        </motion.div>
      </div>

      <motion.div {...fade(0.45)} className="container-lux relative z-10 mt-8 lg:mt-0">
        <SearchBar />
      </motion.div>
    </section>
  )
}
