import { Star } from 'lucide-react'

export default function Stars({ rating, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-1 text-gold-light" aria-label={`Rated ${rating} out of 5`}>
      <Star size={size} fill="currentColor" aria-hidden />
      <span className="text-sm text-ivory">{rating.toFixed(1)}</span>
    </span>
  )
}
