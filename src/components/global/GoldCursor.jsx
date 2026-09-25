import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import useMediaQuery from '../../hooks/useMediaQuery'

// Gold dot + trailing ring. Desktop (fine pointer) only; the native cursor stays visible.
export default function GoldCursor() {
  const enabled = useMediaQuery('(pointer: fine) and (prefers-reduced-motion: no-preference)')
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 250, damping: 25, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 250, damping: 25, mass: 0.5 })
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
      setHovering(!!e.target.closest?.('a, button, [role="button"], input, select, textarea, label'))
    }
    const leave = () => setVisible(false)
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-gold-light"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="absolute rounded-full border border-gold/70"
        style={{ x: rx, y: ry, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 54 : 32,
          height: hovering ? 54 : 32,
          backgroundColor: hovering ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0)',
        }}
        transition={{ duration: 0.25 }}
      />
    </div>
  )
}
