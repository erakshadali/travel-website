import { Headphones, MapPin, Send, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  { label: 'Plan a Trip', to: '/planner', icon: Send },
  { label: 'Popular Packages', to: '/packages', icon: Tag },
  { label: 'Explore Destinations', to: '/destinations', icon: MapPin },
  { label: 'Talk to an Expert', to: '/contact', icon: Headphones },
]

// Divider widths per cell: 2x2 on phones, a single row from lg up.
const cellBorder = ['border-r border-b lg:border-b-0', 'border-b lg:border-b-0 lg:border-r', 'border-r', '']

// A full-width, full-bleed bg-paper band pulled up to overlap the hero's bottom edge (the
// negative margin is on this outer element, not just the centered card, so the body's dark
// background never shows through in the overlap gutters on very wide screens).
export default function QuickActions() {
  return (
    <div className="relative z-10 -mt-12 bg-paper sm:-mt-14 lg:-mt-16">
      <div className="container-lux">
        <div className="grid grid-cols-2 border border-hairline shadow-[0_20px_40px_-14px_rgba(0,0,0,0.18)] lg:grid-cols-4">
          {actions.map(({ label, to, icon: Icon }, i) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-2.5 border-hairline px-3 py-6 text-center transition hover:bg-linen sm:py-8 lg:py-9 ${cellBorder[i]}`}
            >
              <Icon size={22} className="text-gold-dark" aria-hidden />
              <span className="text-[13px] font-medium text-charcoal sm:text-sm">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
