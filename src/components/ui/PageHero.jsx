import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

// Parallax banner used at the top of inner pages.
export default function PageHero({ eyebrow, title, subtitle, image, children }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.2])

  return (
    <section ref={ref} className="relative flex min-h-[60vh] items-end overflow-hidden pt-32 pb-16">
      <motion.img
        src={image}
        alt=""
        aria-hidden
        style={{ y }}
        className="absolute inset-0 h-[125%] w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink" />
      <motion.div style={{ opacity }} className="container-lux relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="eyebrow mb-4"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 max-w-xl text-lg text-muted"
          >
            {subtitle}
          </motion.p>
        )}
        {children}
      </motion.div>
    </section>
  )
}
