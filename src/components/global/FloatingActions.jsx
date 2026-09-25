import { useEffect, useState } from 'react'
import ScrollToTop from './ScrollToTop'
import WhatsAppButton from './WhatsAppButton'

// Bottom-right stack: scroll-to-top sits above WhatsApp with a consistent gap.
// The wrapper ignores pointer events so it never blocks the page beneath it.
//
// On phones the stack slides away when it would cover something important:
//  - while scrolling down (it returns on scroll-up or after a short pause)
//  - while any element marked [data-fab-avoid] (form actions, footer) sits in the bottom-right corner
//  - while a form field is focused (on-screen keyboard open)
export default function FloatingActions() {
  const [scrollTucked, setScrollTucked] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 639px)')
    let lastY = window.scrollY
    let idle
    let frame

    const checkBlocked = () => {
      frame = null
      if (!mobile.matches) return setBlocked(false)
      const vw = window.innerWidth
      const vh = window.innerHeight
      // the stack occupies roughly the right-most 80px and bottom 150px of the screen
      const hit = [...document.querySelectorAll('[data-fab-avoid]')].some((el) => {
        const r = el.getBoundingClientRect()
        return r.bottom > vh - 150 && r.top < vh && r.right > vw - 80
      })
      setBlocked(hit)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(checkBlocked) }

    const onScroll = () => {
      const y = window.scrollY
      if (mobile.matches) {
        if (y > lastY + 6 && y > 200) setScrollTucked(true)
        else if (y < lastY - 6) setScrollTucked(false)
        clearTimeout(idle)
        idle = setTimeout(() => setScrollTucked(false), 1200)
      } else {
        setScrollTucked(false)
      }
      lastY = y
      schedule()
    }
    const isField = (t) => t instanceof HTMLElement && t.matches('input, select, textarea')
    const onFocusIn = (e) => mobile.matches && isField(e.target) && setTyping(true)
    const onFocusOut = (e) => isField(e.target) && setTyping(false)

    // form steps change without scrolling, so also re-check when the DOM changes
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', schedule)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    schedule()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      observer.disconnect()
      clearTimeout(idle)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const tucked = scrollTucked || blocked || typing

  return (
    <div
      aria-hidden={tucked || undefined}
      className={`pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3 transition-all duration-500 ease-out sm:right-6 sm:bottom-6 ${
        tucked ? 'invisible translate-x-24 opacity-0' : 'visible translate-x-0 opacity-100'
      }`}
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ScrollToTop />
      <WhatsAppButton />
    </div>
  )
}
