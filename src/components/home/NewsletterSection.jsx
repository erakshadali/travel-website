import { images } from '../../data/images'
import Newsletter from '../ui/Newsletter'
import Reveal from '../ui/Reveal'

export default function NewsletterSection() {
  return (
    <section className="py-12">
      <div className="container-lux">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] border border-gold/30">
          <img src={images.heroes.newsletter} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
          <div className="relative max-w-xl p-8 sm:p-14">
            <p className="eyebrow">The Gold List</p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">
              Private offers, <span className="text-champagne italic">before anyone else.</span>
            </h2>
            <p className="mt-4 text-muted">Join 20,000+ travellers receiving curated escapes and members-only rates. No spam, ever.</p>
            <div className="mt-8">
              <Newsletter />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
