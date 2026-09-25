import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// 3D tilt on mouse move, with a gold glare that follows the cursor.
export default function TiltCard({ children, className = '', max = 4 }) {
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 90, damping: 24 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 90, damping: 24 })
  const glare = useTransform(
    [x, y],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx * 100}% ${gy * 100}%, rgba(245,217,139,0.2), transparent 55%)`,
  )

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width)
    y.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className={`relative h-full ${className}`}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  )
}
