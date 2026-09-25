import { ArrowRight, Car, Clock, FileCheck, Hotel, Plane, Utensils } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inclusionLabels } from '../../data/data'
import Stars from './Stars'

export const inclusionIcons = { flight: Plane, hotel: Hotel, visa: FileCheck, meals: Utensils, transfers: Car }

export default function PackageCard({ p, search = '' }) {
  return (
    <article className="group glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-500 hover:-translate-y-1 hover:border-gold/50">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={p.image.replace('w=1200', 'w=800')}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-champagne px-3 py-1 text-xs text-ink">
          {p.type}
        </span>
        <span className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-ivory">
          <Clock size={12} aria-hidden /> {p.days} Days / {p.nights} Nights
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl leading-tight">{p.title}</h3>
          <Stars rating={p.rating} />
        </div>
        <p className="mt-2 text-sm text-muted">{p.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Included">
          {p.inclusions.map((k) => {
            const Icon = inclusionIcons[k]
            return (
              <li key={k} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-ivory/80">
                <Icon size={12} className="text-gold" aria-hidden /> {inclusionLabels[k]}
              </li>
            )
          })}
        </ul>
        <div className="mt-auto flex items-end justify-between pt-6">
          <p className="text-xs text-muted">
            per person
            <span className="block font-serif text-3xl text-champagne">
              ${p.price.toLocaleString()}
            </span>
          </p>
          <Link
            to={`/packages/${p.id}${search ? `?${search}` : ''}`}
            className="btn-outline btn-sm"
          >
            View Details <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  )
}
