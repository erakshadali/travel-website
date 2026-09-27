import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { images } from '../../data/images'

const fade = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
})

// Full-bleed photo hero. The fixed Navbar is opaque (bg-paper/95), so the photo
// is free to run edge-to-edge behind it without hurting the navbar's own legibility.
export default function Hero() {
  return (
    <section className="relative h-[560px] overflow-hidden sm:h-[620px] lg:h-[680px]">
      <img
        src={images.heroes.home}
        alt="Dubai's skyline reflected in the water at sunset"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/10 sm:bg-gradient-to-r sm:from-ink/92 sm:via-ink/55 sm:to-transparent"
      />
      <div className="container-lux relative flex h-full items-end pb-10 sm:items-center sm:pb-0">
        <div className="max-w-xl">
          <motion.p {...fade(0.1)} className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/85 uppercase sm:mb-5 sm:text-xs sm:tracking-[0.35em]">
            <Sparkles size={14} aria-hidden /> Luxury Travel Since 2011
          </motion.p>
          <motion.h1 {...fade(0.2)} className="font-serif text-[2.5rem] leading-[1.08] text-white sm:text-6xl lg:text-[4.5rem]">
            Journeys crafted <br className="hidden sm:block" />
            <span className="text-champagne italic">in gold.</span>
          </motion.h1>
          <motion.p {...fade(0.3)} className="mt-4 text-sm leading-relaxed text-white/85 sm:mt-6 sm:max-w-md sm:text-[17px]">
            From the dunes of Dubai to the lagoons of the Maldives, Fatima Tours and Travels designs bespoke escapes for travellers who expect the extraordinary.
          </motion.p>
          <motion.div {...fade(0.4)} className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-4">
            <Link to="/planner" className="btn-lt">
              Plan Your Journey <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/booking" className="btn-lt-ghost">
              Book Now
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
