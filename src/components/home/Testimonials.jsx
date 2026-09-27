import { Star } from 'lucide-react'
import { testimonials } from '../../data/data'
import Reveal from '../ui/Reveal'

export default function Testimonials() {
  return (
    <section className="bg-paper py-16 sm:py-24 lg:py-28" aria-label="Customer testimonials">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Testimonials</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Loved by travellers</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} className="border border-hairline bg-linen p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt="" loading="lazy" className="h-11 w-11 rounded-full border border-gold-dark/30 object-cover" />
                <div>
                  <p className="font-serif text-lg text-charcoal">{t.name}</p>
                  <p className="text-[10px] tracking-[0.1em] text-stone uppercase">{t.trip}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-0.5 text-gold-dark" aria-label={`Rated ${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} size={14} fill="currentColor" aria-hidden />
                ))}
              </div>
              <p className="mt-3.5 font-serif text-[17px] leading-relaxed text-charcoal italic">&ldquo;{t.text}&rdquo;</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
