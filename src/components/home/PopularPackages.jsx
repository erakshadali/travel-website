import { Link } from 'react-router-dom'
import { packages } from '../../data/data'
import Reveal from '../ui/Reveal'

export default function PopularPackages() {
  const popular = [...packages].sort((a, b) => b.rating - a.rating).slice(0, 3)
  return (
    <section className="bg-linen py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Popular Packages</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Signature journeys</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-10 grid gap-6 sm:mt-14 lg:grid-cols-3 lg:gap-7">
          {popular.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1} className="border border-hairline bg-paper">
              <Link to={`/packages/${p.id}`} className="group block">
                <div className="overflow-hidden">
                  <img
                    src={p.image.replace('w=1200', 'w=800')}
                    alt={p.title}
                    loading="lazy"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-64"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-medium text-charcoal">{p.title}</h3>
                  <div className="mt-3 h-px w-7 bg-gold-dark" />
                  <p className="mt-3.5 text-[11px] tracking-[0.15em] text-stone uppercase">
                    {p.days} Days · {p.nights} Nights · {p.type}
                  </p>
                  <p className="mt-3 font-serif text-lg font-medium text-gold-dark">From ${p.price.toLocaleString()}</p>
                  <span className="link-sweep-lt mt-3.5 inline-block text-[11px] tracking-[0.15em] text-gold-dark uppercase">View Itinerary</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center sm:mt-14">
          <Link to="/packages" className="btn-lt">
            Explore All Packages
          </Link>
        </div>
      </div>
    </section>
  )
}
