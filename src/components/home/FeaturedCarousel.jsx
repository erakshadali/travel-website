import { Link } from 'react-router-dom'
import { destinations } from '../../data/data'
import Reveal from '../ui/Reveal'

export default function FeaturedCarousel() {
  return (
    <section className="bg-paper py-16 sm:py-24 lg:py-28" aria-labelledby="featured-heading">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Featured Destinations</p>
          <h2 id="featured-heading" className="mt-3 font-serif text-4xl font-medium text-charcoal sm:text-5xl">
            Where next?
          </h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {destinations.map((d, i) => (
            <Reveal key={d.id} delay={(i % 3) * 0.08} className="border border-hairline bg-paper">
              <Link to={`/packages?destination=${d.id}`} className="group block">
                <div className="overflow-hidden">
                  <img
                    src={d.image.replace('w=1200', 'w=800')}
                    alt={`${d.name}, ${d.country}`}
                    loading="lazy"
                    className="h-56 w-full object-cover transition duration-700 group-hover:scale-105 lg:h-72"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-[10.5px] tracking-[0.25em] text-stone uppercase">{d.country}</p>
                  <h3 className="mt-2 font-serif text-2xl font-medium text-charcoal sm:text-[28px]">{d.name}</h3>
                  <div className="mt-3 h-px w-6 bg-gold-dark" />
                  <span className="mt-4 inline-flex items-center gap-1.5 border border-hairline bg-linen px-2.5 py-1 text-[10px] tracking-[0.15em] text-stone uppercase">
                    <span aria-hidden className="h-1 w-1 rounded-full bg-gold-dark" /> Best Time: {d.bestTime}
                  </span>
                  <p className="mt-3 text-sm font-medium text-charcoal">
                    Packages from <span className="font-serif text-lg text-gold-dark">${d.price.toLocaleString()}</span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center sm:mt-14">
          <Link to="/destinations" className="link-sweep-lt text-[12px] tracking-[0.2em] text-gold-dark uppercase">
            View all destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
