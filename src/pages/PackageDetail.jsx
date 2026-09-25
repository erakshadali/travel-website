import { motion } from 'framer-motion'
import { ArrowLeft, Check, Clock, MapPin, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { inclusionIcons } from '../components/ui/PackageCard'
import Lightbox from '../components/ui/Lightbox'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import Stars from '../components/ui/Stars'
import { destinations, inclusionLabels, packages, whatsappLink } from '../data/data'
import useDocumentTitle from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function PackageDetail() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const p = packages.find((x) => x.id === id)
  const [openDay, setOpenDay] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  useDocumentTitle(p?.title ?? 'Package not found')

  if (!p) return <NotFound />

  const dest = destinations.find((d) => d.id === p.destination)
  const images = p.gallery.map((src, i) => ({ src, alt: `${p.title}, photo ${i + 1}` }))
  const booking = new URLSearchParams(params)
  booking.set('package', p.id)

  return (
    <>
      <PageHero
        eyebrow={dest?.country}
        title={p.title}
        subtitle={p.summary}
        image={p.image.replace('w=1200', 'w=1920')}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 rounded-full glass px-4 py-2"><Clock size={14} className="text-gold" aria-hidden /> {p.days} Days / {p.nights} Nights</span>
          <span className="flex items-center gap-1.5 rounded-full glass px-4 py-2"><MapPin size={14} className="text-gold" aria-hidden /> {dest?.name}</span>
          <span className="rounded-full glass px-4 py-2"><Stars rating={p.rating} /></span>
        </div>
      </PageHero>

      <div className="container-lux pt-8">
        <Link to="/packages" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-gold-light">
          <ArrowLeft size={16} aria-hidden /> All packages
        </Link>
      </div>

      <div className="container-lux grid gap-10 py-10 lg:grid-cols-[1fr_380px] [&>*]:min-w-0">
        <div className="space-y-16">
          {/* Gallery */}
          <Reveal>
            <h2 className="mb-6 text-3xl">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((im, i) => (
                <button
                  key={im.src}
                  onClick={() => setLightbox(i)}
                  className={`group overflow-hidden rounded-2xl border border-gold/15 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                  aria-label={`Open ${im.alt}`}
                >
                  <img src={im.src.replace('w=1200', i === 0 ? 'w=1000' : 'w=500')} alt={im.alt} loading="lazy" className="aspect-square h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
                </button>
              ))}
            </div>
          </Reveal>

          {/* Inclusions */}
          <Reveal>
            <h2 className="mb-6 text-3xl">Package highlights</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {Object.keys(inclusionLabels).map((k) => {
                const Icon = inclusionIcons[k]
                const has = p.inclusions.includes(k)
                return (
                  <li key={k} className={`rounded-2xl border p-4 text-center ${has ? 'border-gold/40 bg-gold/5' : 'border-white/5 opacity-40'}`}>
                    <Icon size={22} className={`mx-auto ${has ? 'text-gold-light' : 'text-muted'}`} aria-hidden />
                    <p className="mt-2 text-sm">{inclusionLabels[k]}</p>
                    <p className="text-[10px] tracking-widest text-muted uppercase">{has ? 'Included' : 'Not included'}</p>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          {/* Itinerary */}
          <Reveal>
            <h2 className="mb-6 text-3xl">Day-by-day itinerary</h2>
            <ol className="relative space-y-3 border-l border-gold/30 pl-8">
              {p.itinerary.map((d, i) => {
                const open = openDay === i
                return (
                  <li key={d.title} className="relative">
                    <span className={`absolute top-4 -left-[41px] grid h-5 w-5 place-items-center rounded-full border-2 ${open ? 'border-gold bg-gold' : 'border-gold/50 bg-ink'}`} aria-hidden />
                    <div className="glass overflow-hidden rounded-2xl">
                      <button
                        onClick={() => setOpenDay(open ? -1 : i)}
                        aria-expanded={open}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      >
                        <span>
                          <span className="text-xs tracking-[0.25em] text-gold uppercase">Day {i + 1}</span>
                          <span className="block font-serif text-xl">{d.title}</span>
                        </span>
                        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-2xl text-gold-light" aria-hidden>+</motion.span>
                      </button>
                      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{d.text}</p>
                      </motion.div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </Reveal>

          {/* Included / excluded */}
          <Reveal className="grid gap-6 sm:grid-cols-2">
            <div className="glass rounded-3xl p-6">
              <h3 className="mb-4 text-2xl text-gold-light">What's included</h3>
              <ul className="space-y-3 text-sm">
                {p.included.map((x) => (
                  <li key={x} className="flex gap-3"><Check size={18} className="shrink-0 text-gold" aria-hidden /> {x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/5 bg-ink-2 p-6">
              <h3 className="mb-4 text-2xl text-ivory/80">Not included</h3>
              <ul className="space-y-3 text-sm text-muted">
                {p.excluded.map((x) => (
                  <li key={x} className="flex gap-3"><X size={18} className="shrink-0 text-red-300/70" aria-hidden /> {x}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Sticky booking card */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-3xl p-7">
            <p className="text-sm text-muted">Starting from</p>
            <p className="font-serif text-5xl text-champagne">${p.price.toLocaleString()}</p>
            <p className="text-xs text-muted">per person, twin sharing</p>
            <div className="my-6 h-px bg-white/10" />
            <ul className="space-y-2 text-sm text-ivory/80">
              <li className="flex justify-between"><span>Duration</span><span>{p.days}D / {p.nights}N</span></li>
              <li className="flex justify-between"><span>Trip type</span><span>{p.type}</span></li>
              <li className="flex justify-between"><span>Destination</span><span>{dest?.name}</span></li>
            </ul>
            <Link data-fab-avoid to={`/booking?${booking}`} className="btn-gold mt-7 w-full">Book This Package</Link>
            <a
              href={whatsappLink(`Hello! I'm interested in the "${p.title}" package. Could you share availability?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-3 w-full"
            >
              <MessageCircle size={16} aria-hidden /> Ask on WhatsApp
            </a>
            <p className="mt-5 text-center text-xs text-muted">Free cancellation up to 30 days before departure</p>
          </div>
        </aside>
      </div>

      <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} onChange={setLightbox} />
    </>
  )
}
