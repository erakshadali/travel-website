import { Award, Headphones, ShieldCheck, Wallet } from 'lucide-react'
import { stats, whyUs } from '../../data/data'
import Counter from '../ui/Counter'
import Reveal from '../ui/Reveal'

const icons = { Award, Headphones, ShieldCheck, Wallet }

export default function WhyChooseUs() {
  return (
    <section className="bg-paper py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">Why Choose Us</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Fifteen years of flawless journeys</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-stone sm:text-base">
            We handle every detail, from visas to villas, so all that's left for you is the wonder.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="border border-hairline bg-linen p-5 text-center sm:p-8">
              <p className="font-serif text-3xl font-medium text-gold-dark sm:text-[42px]">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[10px] tracking-[0.15em] text-stone uppercase sm:text-[11px] sm:tracking-[0.2em]">{s.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w, i) => {
            const Icon = icons[w.icon]
            return (
              <Reveal key={w.title} delay={i * 0.1} className="border border-hairline bg-paper p-7 sm:p-8">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-gold-dark/30 bg-linen text-gold-dark">
                  <Icon size={24} aria-hidden />
                </span>
                <h3 className="mt-5 font-serif text-xl font-medium text-charcoal sm:text-[22px]">{w.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-stone">{w.text}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
