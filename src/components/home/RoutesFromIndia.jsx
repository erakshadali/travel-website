import { routesFromIndia } from '../../data/data'
import Reveal from '../ui/Reveal'

// Decorative orbit-lines mark, echoing the logo mark's globe motif.
function OrbitMark() {
  return (
    <svg width="220" height="220" viewBox="0 0 140 140" aria-hidden className="mx-auto">
      <circle cx="70" cy="70" r="66" fill="none" stroke="#C9A96E" strokeWidth="0.75" />
      <ellipse cx="70" cy="70" rx="28" ry="66" fill="none" stroke="#C9A96E" strokeWidth="0.5" opacity="0.55" />
      <ellipse cx="70" cy="70" rx="66" ry="28" fill="none" stroke="#C9A96E" strokeWidth="0.5" opacity="0.55" />
      <line x1="4" y1="70" x2="136" y2="70" stroke="#C9A96E" strokeWidth="0.5" opacity="0.55" />
    </svg>
  )
}

export default function RoutesFromIndia() {
  return (
    <section className="bg-ink py-16 sm:py-24 lg:py-28">
      <div className="container-lux grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <p className="text-[11px] tracking-[0.3em] text-gold-light uppercase sm:text-xs sm:tracking-[0.35em]">Fly With Confidence</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-white sm:text-5xl">Our Routes from Delhi</h2>
          <div className="mt-4 h-px w-10 bg-gold" />
          <div className="mt-8 flex flex-col sm:mt-10">
            {routesFromIndia.map((r) => (
              <div key={r.to} className="flex items-center justify-between border-t border-white/15 py-4 sm:py-5">
                <p className="text-[15px] text-white sm:text-lg">
                  {r.from} → {r.to}
                </p>
                <p className="text-xs tracking-[0.05em] text-gold sm:text-sm">{r.duration}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1} direction="none" className="hidden lg:block">
          <OrbitMark />
        </Reveal>
      </div>
    </section>
  )
}
