import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

// Accessible image viewer: Esc closes, arrow keys navigate.
export default function Lightbox({ images, index, onClose, onChange }) {
  const open = index !== null && index !== undefined
  const closeRef = useRef(null)

  const prev = useCallback(
    () => onChange((index - 1 + images.length) % images.length),
    [index, images.length, onChange],
  )
  const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, prev, next])

  const navBtn =
    'absolute grid h-11 w-11 place-items-center rounded-full glass text-gold-light transition hover:bg-gold/20'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button ref={closeRef} onClick={onClose} aria-label="Close" className={`${navBtn} top-5 right-5`}>
            <X size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Previous image"
            className={`${navBtn} left-3 sm:left-6`}
          >
            <ChevronLeft size={22} />
          </button>
          <motion.figure
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 max-w-[min(64rem,100%)] px-12 sm:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[index].src.replace(/w=\d+/, 'w=1800')}
              alt={images[index].alt}
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-2xl border border-gold/30 object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-muted">
              {images[index].alt} · {index + 1} / {images.length}
            </figcaption>
          </motion.figure>
          <button
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Next image"
            className={`${navBtn} right-3 sm:right-6`}
          >
            <ChevronRight size={22} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
