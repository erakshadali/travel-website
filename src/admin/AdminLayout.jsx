import { Inbox, LogOut, Mail, Plane, Users } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LogoMark } from '../components/ui/Logo'
import { useAdminAuth } from './auth'

const NAV = [
  { to: '/admin', label: 'Bookings', icon: Plane, end: true },
  { to: '/admin/trip-plans', label: 'Trip plans', icon: Inbox },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Users },
]

const linkClass = ({ isActive }) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-500 ${
    isActive ? 'bg-gold/12 text-gold-light' : 'text-muted hover:text-ivory'
  }`

export default function AdminLayout({ children }) {
  const { logout } = useAdminAuth()
  const { pathname } = useLocation()

  // The public site scrolls to the top on every page change; do the same here.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur">
        <div className="container-lux flex items-center justify-between gap-4 py-2">
          <Link to="/admin" className="flex min-h-11 items-center gap-3" aria-label="Fatima admin, bookings">
            <LogoMark size={34} />
            <span className="leading-none">
              <span className="block font-serif text-xl tracking-wide text-ivory">Fatima</span>
              <span className="block text-[10px] tracking-[0.3em] text-gold uppercase">Admin</span>
            </span>
          </Link>

          <nav aria-label="Admin" className="hidden items-center gap-1 md:flex">
            {NAV.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <button type="button" onClick={logout} className="btn-outline btn-sm" aria-label="Log out">
            <LogOut size={15} aria-hidden /> <span className="hidden sm:inline">Log out</span>
          </button>
        </div>

        {/* Phones: the same links as a swipeable strip under the header */}
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-white/10 px-3 md:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={15} aria-hidden /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main id="main" className="container-lux py-8 sm:py-12">
        {children}
      </main>
    </div>
  )
}
