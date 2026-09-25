import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Stars from './Stars'
import TiltCard from './TiltCard'

export default function DestinationCard({ d }) {
  return (
    <TiltCard className="group overflow-hidden rounded-3xl border border-gold/20 bg-ink-2">
      <article className="relative aspect-[4/5] overflow-hidden rounded-3xl">
        <img
          src={d.image.replace('w=1200', 'w=800')}
          alt={`${d.name}, ${d.country}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
        />
        {/* strong scrim at the bottom so text stays readable on bright photos */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink from-5% via-ink/85 via-45% to-ink/0 to-75%" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/60 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-xs text-gold-light backdrop-blur-sm">
          {d.region}
        </span>
        <span className="absolute top-4 right-4 rounded-full border border-gold/40 bg-ink/75 px-3 py-1 backdrop-blur-sm">
          <Stars rating={d.rating} />
        </span>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="flex items-center gap-1.5 text-xs tracking-widest text-ivory/75 uppercase">
            <MapPin size={12} aria-hidden /> {d.country}
          </p>
          <h3 className="mt-1 text-3xl text-ivory">{d.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-ivory/90">{d.blurb}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-ivory/80">
              from{' '}
              <span className="font-serif text-2xl text-gold-light">
                ${d.price.toLocaleString()}
              </span>
            </p>
            <Link
              to={`/packages?destination=${d.id}`}
              className="btn-outline btn-sm relative z-10"
              aria-label={`Explore ${d.name}`}
            >
              Explore <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </TiltCard>
  )
}
