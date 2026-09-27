import { MessageCircle, PlaneTakeoff, Wand2 } from 'lucide-react'
import Reveal from '../ui/Reveal'

const steps = [
  { n: '01', icon: MessageCircle, title: 'Tell us your dream' },
  { n: '02', icon: Wand2, title: 'We design your journey' },
  { n: '03', icon: PlaneTakeoff, title: 'You simply travel' },
]

export default function HowItWorks() {
  return (
    <section className="bg-paper py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] tracking-[0.3em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.35em]">How It Works</p>
          <h2 className="mt-3 font-serif text-[2rem] font-medium text-charcoal sm:text-5xl">Three simple steps</h2>
          <div className="mx-auto mt-4 h-px w-10 bg-gold-dark" />
        </Reveal>

        <div className="mt-10 flex flex-col gap-8 text-left sm:mt-14 sm:grid sm:grid-cols-3 sm:gap-10 sm:text-center">
          {steps.map(({ n, icon: Icon, title }, i) => (
            <Reveal key={n} delay={i * 0.1} className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-0">
              <Icon size={28} className="mt-0.5 shrink-0 text-gold-dark sm:mt-0 sm:mb-4" aria-hidden />
              <div>
                <p className="font-serif text-sm text-gold-dark">{n}</p>
                <h3 className="mt-1 font-serif text-xl font-medium text-charcoal sm:text-2xl">{title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
