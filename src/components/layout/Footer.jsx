import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { destinations, navLinks, site } from '../../data/data'
import Logo from '../ui/Logo'
import Newsletter from '../ui/Newsletter'
import SocialIcons from '../ui/SocialIcons'

export default function Footer() {
  return (
    <footer data-fab-avoid className="relative mt-16 sm:mt-24 border-t border-gold/20 bg-ink-2">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="container-lux grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Crafting extraordinary journeys since 2011. Luxury holidays, honeymoons, family escapes and visa services, all tailored to you.
          </p>
          <SocialIcons className="mt-6" />
        </div>

        <div>
          <h3 className="mb-5 text-lg text-gold-light">Quick Links</h3>
          <ul className="grid grid-cols-2 text-sm lg:grid-cols-1 lg:gap-y-1">
            {[...navLinks, { to: '/booking', label: 'Booking' }].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="inline-flex min-h-11 items-center text-muted transition hover:text-gold-light lg:min-h-8">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-lg text-gold-light">Contact</h3>
          <ul className="space-y-4 text-sm text-muted">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden />
              {site.address}
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-3 break-all hover:text-gold-light">
                <Phone size={18} className="shrink-0 text-gold" aria-hidden /> {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-3 break-all hover:text-gold-light">
                <Mail size={18} className="shrink-0 text-gold" aria-hidden /> {site.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock size={18} className="shrink-0 text-gold" aria-hidden /> {site.hours}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-lg text-gold-light">Travel Insider</h3>
          <p className="mb-4 text-sm text-muted">Private offers and new destinations, straight to your inbox.</p>
          <Newsletter />
          <p className="mt-6 mb-3 text-xs tracking-widest text-muted uppercase">Top destinations</p>
          <div className="flex flex-wrap gap-2">
            {destinations.slice(0, 6).map((d) => (
              <Link key={d.id} to={`/packages?destination=${d.id}`} className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-xs text-muted transition pointer-fine:min-h-0 pointer-fine:px-3 pointer-fine:py-1 hover:border-gold/50 hover:text-gold-light">
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Crafted with care for the discerning traveller.</p>
        </div>
      </div>
    </footer>
  )
}
