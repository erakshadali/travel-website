import { Compass, FileCheck, Hotel, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'

const services = [
  { label: 'Flights', to: '/booking', icon: Plane },
  { label: 'Hotels', to: '/booking', icon: Hotel },
  { label: 'Visa Assistance', to: '/contact', icon: FileCheck },
  { label: 'Holiday Packages', to: '/packages', icon: Compass },
]

const cellBorder = ['border-r border-b lg:border-b-0', 'border-b lg:border-b-0 lg:border-r', 'border-r', '']

export default function ServicesRow() {
  return (
    <div className="border-y border-hairline bg-linen">
      <div className="container-lux grid grid-cols-2 lg:grid-cols-4">
        {services.map(({ label, to, icon: Icon }, i) => (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center gap-3.5 border-hairline py-9 text-center transition hover:bg-paper sm:py-11 lg:py-11 ${cellBorder[i]}`}
          >
            <Icon size={24} className="text-gold-dark" aria-hidden />
            <span className="text-sm text-charcoal underline decoration-hairline underline-offset-4">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
