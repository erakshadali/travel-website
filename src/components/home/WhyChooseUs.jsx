import { Award, Headphones, ShieldCheck, Wallet } from 'lucide-react'
import { stats, whyUs } from '../../data/data'
import Counter from '../ui/Counter'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const icons = { Award, Headphones, ShieldCheck, Wallet }

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 md:py-36">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.08),transparent_65%)]" />
      <div className="container-lux relative">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Fifteen years of flawless journeys"
          subtitle="We handle every detail, from visas to villas, so all that's left for you is the wonder."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="glass rounded-3xl p-6 text-center sm:p-8">
              <p className="font-serif text-4xl text-champagne sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-xs tracking-[0.2em] text-muted uppercase sm:text-sm">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w, i) => {
            const Icon = icons[w.icon]
            return (
              <Reveal key={w.title} delay={i * 0.1} className="group rounded-3xl border border-white/5 bg-ink-2 p-7 transition duration-500 hover:border-gold/40">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-light transition group-hover:bg-gold group-hover:text-ink">
                  <Icon size={24} aria-hidden />
                </span>
                <h3 className="mt-6 text-2xl">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{w.text}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
