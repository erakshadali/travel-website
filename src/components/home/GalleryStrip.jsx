import { galleryImages } from '../../data/data'
import Reveal from '../ui/Reveal'

// A curated 6-photo subset of the full gallery, arranged as a bento grid.
// [image index in galleryImages, caption title, caption subtitle, grid span]
const cells = [
  { i: 0, title: 'Dubai', subtitle: 'Skyline icons & golden dunes', span: 'col-span-2 row-span-2' },
  { i: 1, title: 'Maldives', span: 'col-span-1 row-span-1' },
  { i: 2, title: 'Paris', span: 'col-span-1 row-span-1' },
  { i: 3, title: 'Bali', subtitle: 'Temples & rice terraces', span: 'col-span-2 row-span-1' },
  { i: 4, title: 'Switzerland', span: 'col-span-1 row-span-2' },
  { i: 6, title: 'Santorini', subtitle: 'Whitewashed cliffs at dusk', span: 'col-span-2 row-span-1' },
]

export default function GalleryStrip() {
  return (
    <section className="bg-linen py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Gallery</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Moments worth chasing</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-8 grid grid-cols-3 auto-rows-[110px] gap-1.5 sm:mt-12 sm:auto-rows-[140px] sm:gap-2 lg:auto-rows-[170px]">
          {cells.map(({ i, title, subtitle, span }) => {
            const g = galleryImages[i]
            return (
              <Reveal key={g.alt} className={`group relative overflow-hidden ${span}`}>
                <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                  <p className="font-serif text-base sm:text-xl">{title}</p>
                  {subtitle && <p className="mt-0.5 hidden text-xs text-white/85 sm:block">{subtitle}</p>}
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
