import Reveal from './Reveal'

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', spacing = 'mb-12' }) {
  const center = align === 'center'
  return (
    <Reveal className={`${spacing} max-w-2xl ${center ? 'mx-auto text-center' : 'text-left'}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="text-4xl leading-tight sm:text-5xl">{title}</h2>
      <div className={`mt-5 h-px w-24 bg-gold ${center ? 'mx-auto' : ''}`} />
      {subtitle && <p className="mt-5 text-base leading-relaxed text-muted">{subtitle}</p>}
    </Reveal>
  )
}
