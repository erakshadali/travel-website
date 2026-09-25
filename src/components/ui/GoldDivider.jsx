// Thin champagne rule with a small diamond at its centre, used between sections.
export default function GoldDivider() {
  return (
    <div className="container-lux" aria-hidden>
      <div className="relative">
        <div className="divider-gold" />
        <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-gold/60 bg-ink" />
      </div>
    </div>
  )
}
