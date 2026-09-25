import { AnimatePresence, motion } from 'framer-motion'
import { Clock, MapPin, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Lightbox from '../components/ui/Lightbox'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { experiences, galleryImages, whatsappLink } from '../data/data'
import useDocumentTitle from '../hooks/useDocumentTitle'

const SLIDE_MS = 5000

// Cinematic, video-style banner: cross-fading Ken Burns slides with story-style progress bars.
function CinematicHero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % experiences.length), SLIDE_MS)
    return () => clearTimeout(t)
  }, [i])
  const e = experiences[i]

  return (
    <section className="relative h-[92vh] min-h-[560px] overflow-hidden" aria-roledescription="carousel" aria-label="Featured experiences">
      <AnimatePresence>
        <motion.div key={e.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <img src={e.image.replace('w=1200', 'w=1920')} alt="" aria-hidden className="animate-kenburns h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
      <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0px,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_3px)] opacity-40" />

      <div className="container-lux relative flex h-full flex-col justify-end pb-16">
        <div className="mb-5 flex max-w-md gap-2">
          {experiences.map((x, k) => (
            <button key={x.id} onClick={() => setI(k)} aria-label={`Show ${x.title}`} aria-current={k === i} className="flex h-11 flex-1 items-center">
              <span className="block h-1 w-full overflow-hidden rounded-full bg-white/20">
                {k === i && <motion.span key={i} className="block h-full bg-champagne" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }} />}
                {k < i && <span className="block h-full w-full bg-gold/70" />}
              </span>
            </button>
          ))}
        </div>
        <p className="eyebrow">Experiences</p>
        <AnimatePresence mode="wait">
          <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} aria-live="polite">
            <h1 className="mt-4 text-5xl leading-[1.05] sm:text-7xl">{e.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-ivory/80">{e.text}</p>
            <p className="mt-4 flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gold" aria-hidden /> {e.location}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-gold" aria-hidden /> {e.duration}</span>
            </p>
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#experience-list" className="btn-gold">Discover experiences</a>
          <Link to="/planner" className="btn-outline">Plan a trip</Link>
        </div>
      </div>
    </section>
  )
}

export default function Experiences() {
  useDocumentTitle('Experiences')
  const [open, setOpen] = useState(null)

  return (
    <>
      <CinematicHero />

      <section id="experience-list" className="container-lux scroll-mt-24 py-20 md:py-36">
        <SectionHeading eyebrow="Curated Moments" title="Experiences worth the journey" subtitle="Add any of these to your package, or book them on their own." />
        <div className="space-y-20">
          {experiences.map((e, i) => (
            <div key={e.id} className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <Reveal direction={i % 2 ? 'left' : 'right'} className="group relative overflow-hidden rounded-[2rem] border border-gold/20">
                <img src={e.image} alt={`${e.title} in ${e.location}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-1000 group-hover:scale-105" />
                <span className="absolute top-5 left-5 rounded-full glass px-4 py-1.5 text-xs text-gold-light">0{i + 1}</span>
              </Reveal>
              <Reveal direction={i % 2 ? 'right' : 'left'} delay={0.1}>
                <p className="flex items-center gap-2 text-xs tracking-[0.25em] text-gold uppercase"><MapPin size={12} aria-hidden /> {e.location}</p>
                <h3 className="mt-3 text-4xl sm:text-5xl">{e.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-muted">{e.text}</p>
                <div className="mt-6 flex items-center gap-8">
                  <div>
                    <p className="text-xs tracking-widest text-muted uppercase">Duration</p>
                    <p className="mt-1">{e.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest text-muted uppercase">From</p>
                    <p className="mt-1 font-serif text-3xl text-champagne">${e.price}</p>
                  </div>
                </div>
                <a href={whatsappLink(`Hello! I'd like to book the ${e.title} experience (${e.location}).`)} target="_blank" rel="noopener noreferrer" className="btn-gold mt-8">
                  <MessageCircle size={16} aria-hidden /> Reserve this experience
                </a>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="container-lux py-12">
        <SectionHeading eyebrow="Gallery" title="Through our travellers' eyes" />
        <ul className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {galleryImages.map((g, i) => (
            <li key={g.src} className="mb-4 break-inside-avoid">
              <Reveal delay={(i % 4) * 0.08}>
                <button onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-2xl border border-gold/15" aria-label={`View photo: ${g.alt}`}>
                  <img
                    src={g.src.replace('w=900', `w=600&h=${[750, 450, 600, 800][i % 4]}`)}
                    alt={g.alt}
                    loading="lazy"
                    className="w-full object-cover transition duration-1000 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/80 to-transparent p-4 text-left text-sm opacity-0 transition group-hover:opacity-100">
                    {g.alt}
                  </span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <Lightbox images={galleryImages} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </>
  )
}
