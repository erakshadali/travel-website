import { Link } from 'react-router-dom'
import { experiences } from '../../data/data'
import Reveal from '../ui/Reveal'

export default function ExperiencesTeaser() {
  return (
    <section className="bg-linen py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Experiences</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Moments beyond the itinerary</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3.5 sm:mt-14 sm:gap-6 lg:grid-cols-4">
          {experiences.map((e, i) => (
            <Reveal key={e.id} delay={(i % 4) * 0.08} className="border border-hairline bg-paper">
              <Link to="/experiences" className="group block">
                <div className="overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    className="h-28 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-44"
                  />
                </div>
                <div className="p-3.5 sm:p-5">
                  <h3 className="font-serif text-base font-medium text-charcoal sm:text-xl">{e.title}</h3>
                  <div className="mt-2 h-px w-5 bg-gold-dark" />
                  <p className="mt-2 text-[9.5px] tracking-[0.1em] text-stone uppercase sm:text-[11px] sm:tracking-[0.05em]">
                    {e.location} · {e.duration}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gold-dark">From ${e.price.toLocaleString()}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
