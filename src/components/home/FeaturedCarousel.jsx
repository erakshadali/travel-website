import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { destinations } from '../../data/data'
import DestinationCard from '../ui/DestinationCard'
import SectionHeading from '../ui/SectionHeading'

export default function FeaturedCarousel() {
  const track = useRef(null)
  const scroll = (dir) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section className="py-20 md:py-36" aria-labelledby="featured-heading">
      <div className="container-lux">
        {/* heading + arrows share one row; tight gap to the cards on mobile */}
        <div className="mb-6 flex items-end justify-between gap-4 md:mb-12">
          <div id="featured-heading">
            <SectionHeading align="left" spacing="mb-0" eyebrow="Featured Destinations" title="Where will gold take you?" />
          </div>
          <div className="flex shrink-0 gap-2 sm:gap-3">
            <button onClick={() => scroll(-1)} aria-label="Previous destinations" className="grid h-11 w-11 place-items-center rounded-full glass text-gold-light transition-colors duration-500 hover:bg-gold hover:text-ink sm:h-12 sm:w-12">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => scroll(1)} aria-label="Next destinations" className="grid h-11 w-11 place-items-center rounded-full glass text-gold-light transition-colors duration-500 hover:bg-gold hover:text-ink sm:h-12 sm:w-12">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-6 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        tabIndex={0}
        aria-label="Featured destinations carousel"
      >
        {destinations.map((d) => (
          <div key={d.id} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[23%]">
            <DestinationCard d={d} />
          </div>
        ))}
      </div>
      <div className="container-lux mt-6 text-center">
        <Link to="/destinations" className="btn-outline">View all destinations</Link>
      </div>
    </section>
  )
}
