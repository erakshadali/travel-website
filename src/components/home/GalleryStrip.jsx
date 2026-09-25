import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { galleryImages } from '../../data/data'
import Lightbox from '../ui/Lightbox'
import SectionHeading from '../ui/SectionHeading'

// Two rows that drift in opposite directions as you scroll.
export default function GalleryStrip() {
  const ref = useRef(null)
  const [open, setOpen] = useState(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const x2 = useTransform(scrollYProgress, [0, 1], ['-25%', '0%'])
  const half = Math.ceil(galleryImages.length / 2)
  const rows = [
    { x: x1, items: galleryImages.slice(0, half), offset: 0 },
    { x: x2, items: galleryImages.slice(half), offset: half },
  ]

  return (
    <section ref={ref} className="overflow-hidden py-20 md:py-36">
      <div className="container-lux">
        <SectionHeading eyebrow="Gallery" title="Moments from the road" />
      </div>
      <div className="space-y-4">
        {rows.map((row, r) => (
          <motion.ul key={r} style={{ x: row.x }} className="flex w-max gap-4">
            {[...row.items, ...row.items].map((g, k) => {
              const idx = row.offset + (k % row.items.length)
              return (
                <li key={k} className="h-48 w-72 shrink-0 overflow-hidden rounded-2xl border border-gold/15 sm:h-60 sm:w-96">
                  <button onClick={() => setOpen(idx)} className="group h-full w-full" aria-label={`View photo: ${g.alt}`} tabIndex={k >= row.items.length ? -1 : 0}>
                    <img src={g.src} alt={g.alt} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
                  </button>
                </li>
              )
            })}
          </motion.ul>
        ))}
      </div>
      <Lightbox images={galleryImages} index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  )
}
