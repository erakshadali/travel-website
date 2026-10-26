import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { money } from '../../data/money'

// Phone-only card: arch-cropped photo inside a thin gold arch frame, region badge on the frame.
export default function DestinationArchCard({ d }) {
  return (
    <article className="relative px-3 pt-5">
      <span className="absolute top-0 left-0 z-10 rounded-full border border-gold/40 bg-ink px-4 py-2 text-sm text-champagne">
        {d.region}
      </span>
      <div className="rounded-t-[999px] rounded-b-[2.5rem] border border-gold/30 p-3">
        <Link
          to={`/packages?destination=${d.id}`}
          aria-label={`Explore ${d.name}, ${d.country}`}
          className="relative block aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-ink-2"
        >
          <img
            src={d.image.replace('w=1200', 'w=800')}
            alt={`${d.name}, ${d.country}`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink from-5% via-ink/70 via-35% to-ink/0 to-65%" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-center">
            <p className="flex items-center justify-center gap-1.5 text-xs tracking-widest text-ivory/80 uppercase">
              <MapPin size={12} aria-hidden /> {d.country}
            </p>
            <h3 className="mt-1 text-3xl text-ivory">{d.name}</h3>
            <p className="mt-2 text-sm text-ivory/85">
              from <span className="font-serif text-2xl text-champagne">{money(d.price)}</span>
            </p>
            <span className="btn-outline btn-sm mt-4">
              Explore <ArrowRight size={14} aria-hidden />
            </span>
          </div>
        </Link>
      </div>
    </article>
  )
}
