import { motion } from 'framer-motion'

// Full-screen intro with an animated gold logo stroke.
export default function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
      role="status"
      aria-label="Loading Premium Tours and Travels"
    >
      <svg width="120" height="120" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="loader-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C9A96E" />
            <stop offset="1" stopColor="#E6D3A3" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="32" cy="32" r="29" fill="none" stroke="url(#loader-g)" strokeWidth="1.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="32" cy="32" rx="12" ry="29" fill="none" stroke="url(#loader-g)" strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.6 }} transition={{ duration: 1.3, delay: 0.2 }}
        />
        <motion.text
          x="32" y="42" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="30" fontWeight="700" fill="url(#loader-g)"
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
          style={{ transformOrigin: 'center' }}
        >
          P
        </motion.text>
      </svg>
      <motion.p
        initial={{ opacity: 0, letterSpacing: '0.1em' }}
        animate={{ opacity: 1, letterSpacing: '0.45em' }}
        transition={{ delay: 0.5, duration: 1.1 }}
        className="mt-6 font-serif text-2xl text-ivory uppercase"
      >
        Premium
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-2 text-[10px] tracking-[0.5em] text-gold uppercase"
      >
        Tours &amp; Travels
      </motion.p>
      <div className="mt-8 h-px w-40 overflow-hidden bg-white/10">
        <motion.div className="h-full bg-champagne" initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
      </div>
    </motion.div>
  )
}
