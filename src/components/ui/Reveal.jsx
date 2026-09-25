import { motion } from 'framer-motion'
import useMediaQuery from '../../hooks/useMediaQuery'

const offsets = { up: [0, 24], down: [0, -24], left: [24, 0], right: [-24, 0], none: [0, 0] }

export default function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  // Sideways entrances push full-width blocks past the screen edge (horizontal scroll) on
  // narrow screens, so below desktop every reveal rises vertically instead.
  const wide = useMediaQuery('(min-width: 1024px)')
  const [x, y] = wide || direction === 'down' || direction === 'none' ? offsets[direction] : offsets.up
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
