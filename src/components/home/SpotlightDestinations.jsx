import { Link } from 'react-router-dom'
import { homeSpotlights } from '../../data/data'
import Reveal from '../ui/Reveal'

export default function SpotlightDestinations() {
  return (
    <section className="bg-linen py-16 sm:py-24 lg:py-28">
      <div className="container-lux grid gap-7 sm:grid-cols-2">
        {homeSpotlights.map((sp, i) => (
          <Reveal key={sp.destination} delay={i * 0.1} className="border border-hairline bg-paper">
            <Link to={`/packages?destination=${sp.destination}`} className="group block">
              <div className="p-7 pb-0 sm:p-9 sm:pb-0">
                <p className="text-[11px] tracking-[0.25em] text-stone uppercase">{sp.eyebrow}</p>
                <h3 className="mt-2 font-serif text-[28px] font-medium text-charcoal sm:text-4xl">{sp.title}</h3>
                <div className="mt-3.5 h-px w-7 bg-gold-dark" />
                <span className="link-sweep-lt mt-3 inline-block text-sm tracking-[0.05em] text-gold-dark uppercase">Learn more</span>
              </div>
              <div className="mt-5 overflow-hidden sm:mt-7">
                <img
                  src={sp.image}
                  alt={sp.title}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-80"
                />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
