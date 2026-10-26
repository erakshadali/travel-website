import { ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../../data/money'

// Phone-only card: arch-cropped photo inside a thin gold arch frame, package type badge on the frame.
export default function PackageArchCard({ p, search = '' }) {
  return (
    <article className="relative px-3 pt-5">
      <span className="absolute top-0 left-0 z-10 rounded-full border border-gold/40 bg-ink px-4 py-2 text-sm text-champagne">
        {p.type}
      </span>
      <div className="rounded-t-[999px] rounded-b-[2.5rem] border border-gold/30 p-3">
        <Link
          to={`/packages/${p.id}${search ? `?${search}` : ''}`}
          aria-label={`View details: ${p.title}`}
          className="relative block aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-ink-2"
        >
          <img
            src={p.image.replace('w=1200', 'w=800')}
            alt={p.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink from-5% via-ink/70 via-35% to-ink/0 to-65%" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs tracking-widest text-ivory/80 uppercase">
              <Clock size={12} aria-hidden /> {p.days} Days / {p.nights} Nights
            </p>
            <h3 className="mt-1 text-3xl leading-tight text-ivory">{p.title}</h3>
            <p className="mt-2 text-sm text-ivory/85">
              from <span className="font-serif text-2xl text-champagne">{money(p.price)}</span> per person
            </p>
            <span className="btn-outline btn-sm mt-4">
              View Details <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </Link>
      </div>
    </article>
  )
}
