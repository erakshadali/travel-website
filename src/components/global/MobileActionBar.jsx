import { Calendar, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { whatsappLink } from '../../data/data'

// Phone-only bar fixed to the bottom: WhatsApp + Book Now.
// Hidden on form pages and while a field is focused (on-screen keyboard).
const HIDE_ON = ['/booking', '/planner', '/contact']

export default function MobileActionBar() {
  const { pathname } = useLocation()
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const isField = (t) => t instanceof HTMLElement && t.matches('input, select, textarea')
    const onIn = (e) => isField(e.target) && setTyping(true)
    const onOut = (e) => isField(e.target) && setTyping(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  if (HIDE_ON.includes(pathname) || typing) return null

  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-[60] flex gap-3 border-t border-gold/20 bg-ink px-4 pt-3 sm:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-outline flex-1 justify-center whitespace-nowrap !px-3">
        <MessageCircle size={16} aria-hidden /> WhatsApp
      </a>
      <Link to="/booking" className="btn-gold flex-1 justify-center whitespace-nowrap !px-3">
        <Calendar size={16} aria-hidden /> Book Now
      </Link>
    </nav>
  )
}
