import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { testimonials } from '../../data/data'
import SectionHeading from '../ui/SectionHeading'

export default function Testimonials() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const t = testimonials[i]
  const go = (d) => setI((v) => (v + d + testimonials.length) % testimonials.length)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setI((v) => (v + 1) % testimonials.length), 6000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section className="py-20 md:py-36" aria-roledescription="carousel" aria-label="Customer testimonials">
      <div className="container-lux">
        <SectionHeading eyebrow="Testimonials" title="Words from our travellers" />
        <div
          className="glass relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-8 sm:p-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Quote size={80} className="absolute top-6 right-8 text-gold/10" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              aria-live="polite"
            >
              <div className="flex gap-1 text-gold-light" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} size={18} fill="currentColor" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-6 font-serif text-2xl leading-snug text-ivory italic sm:text-3xl">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <img src={t.avatar} alt="" loading="lazy" className="h-14 w-14 rounded-full border-2 border-gold/50 object-cover" />
                <div>
                  <p className="font-normal">{t.name}</p>
                  <p className="text-sm text-gold">{t.trip}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-2">
              {testimonials.map((_, k) => (
                <button
                  key={k}
                  onClick={() => setI(k)}
                  aria-label={`Show testimonial ${k + 1}`}
                  aria-current={k === i}
                  className="group/dot grid h-11 place-items-center"
                >
                  <span className={`block h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-10 bg-gold' : 'w-4 bg-white/20 group-hover/dot:bg-white/40'}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous testimonial" className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold-light transition hover:bg-gold hover:text-ink">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => go(1)} aria-label="Next testimonial" className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold-light transition hover:bg-gold hover:text-ink">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
