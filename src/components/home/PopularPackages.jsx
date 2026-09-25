import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { packages } from '../../data/data'
import PackageCard from '../ui/PackageCard'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

export default function PopularPackages() {
  const popular = [...packages].sort((a, b) => b.rating - a.rating).slice(0, 3)
  return (
    <section className="py-20 md:py-36">
      <div className="container-lux">
        <SectionHeading
          eyebrow="Popular Packages"
          title="Signature journeys"
          subtitle="All-inclusive itineraries, perfected over years and loved by thousands of travellers."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popular.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.12}>
              <PackageCard p={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/packages" className="btn-gold">
            Explore all packages <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
