import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// Animated progress bar + step labels for multi-step forms.
export default function StepProgress({ steps, current }) {
  const pct = (current / (steps.length - 1)) * 100
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Step <span className="text-gold-light">{current + 1}</span> of {steps.length}
        </span>
        <span className="text-gold-light">{steps[current]}</span>
      </div>
      <div
        className="relative mt-3 h-px overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-label="Form progress"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-champagne"
          initial={false}
          animate={{ width: `${Math.max(pct, 4)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <ol className="mt-4 hidden justify-between sm:flex">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 text-xs ${i <= current ? 'text-gold-light' : 'text-muted'}`}>
            <span
              className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] transition ${
                i < current ? 'border-gold bg-gold text-ink' : i === current ? 'border-gold text-gold-light' : 'border-white/20'
              }`}
            >
              {i < current ? <Check size={12} aria-hidden /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}
