import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navLinks, site } from '../../data/data'
import Logo from '../ui/Logo'
import SocialIcons from '../ui/SocialIcons'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    // lock both html and body: some mobile browsers still scroll the page behind the menu with body alone
    document.body.style.overflow = open ? 'hidden' : ''
    document.documentElement.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`fixed inset-x-0 top-0 ${open ? 'z-[75]' : 'z-50'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div
        className={`transition-all duration-700 ease-out ${
          scrolled ? 'border-b border-gold/15 bg-ink/75 py-3 backdrop-blur-md' : 'bg-transparent py-6'
        }`}
      >
        <nav className="container-lux flex items-center justify-between" aria-label="Main">
          <Logo />

          <ul className="hidden items-center gap-1 xl:flex">
            {navLinks.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `relative px-3.5 py-2 text-[14px] font-light tracking-[0.05em] transition-colors duration-500 ${isActive ? 'text-gold-light' : 'text-ivory/75 hover:text-ivory'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-3.5 -bottom-0.5 h-px bg-gold/80"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link to="/booking" className="btn-gold btn-sm hidden sm:inline-flex">
              Book Now
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="grid h-11 w-11 place-items-center rounded-full glass text-gold-light xl:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-y-auto border-gold/20 bg-ink-2 p-6 sm:w-[85%] sm:max-w-sm sm:border-l sm:bg-ink-2/95 sm:backdrop-blur-xl xl:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full glass text-gold-light">
                  <X size={20} />
                </button>
              </div>
              <ul className="mt-10 flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <motion.li key={l.to} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <NavLink
                      to={l.to}
                      end={l.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-4 py-3 font-serif text-2xl font-light transition ${
                          isActive ? 'bg-gold/10 text-gold-light' : 'text-ivory hover:bg-white/5'
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto space-y-5 pt-8">
                <Link to="/booking" className="btn-gold w-full">
                  Book Now
                </Link>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="flex min-h-11 items-center gap-2 text-sm text-muted hover:text-gold-light">
                  <Phone size={16} aria-hidden /> {site.phone}
                </a>
                <SocialIcons />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
