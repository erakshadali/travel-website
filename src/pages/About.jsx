import { Eye, Gem, HeartHandshake, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import Counter from '../components/ui/Counter'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { stats, team } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'

const values = [
  { icon: Target, title: 'Our Mission', text: 'To make world-class travel effortless, turning every trip into a story our guests tell for a lifetime.' },
  { icon: Eye, title: 'Our Vision', text: "To be the region's most trusted name in luxury travel, known for warmth, precision and imagination." },
  { icon: Gem, title: 'Our Promise', text: 'Transparent pricing, handpicked partners and a real human with you at every step of the journey.' },
]

const milestones = [
  ['2011', 'Founded in Dubai with a small team and a big dream.'],
  ['2015', 'Launched visa services across 40+ countries.'],
  ['2019', 'Named a preferred partner by leading luxury resorts.'],
  ['2024', '10,000th happy traveller, with 60+ destinations now served.'],
]

export default function About() {
  useDocumentTitle('About Us')
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={<>A family passion, <span className="text-champagne italic">a world of journeys.</span></>}
        subtitle="For fifteen years, Fatima Tours and Travels has turned travel dreams into effortless, golden memories."
        image={images.heroes.about}
      />

      <section className="container-lux grid items-center gap-12 py-20 md:py-36 lg:grid-cols-2">
        <Reveal direction="right" className="relative">
          <img src={images.heroes.aboutStory} alt="Camels resting before the Dubai skyline" loading="lazy" className="aspect-[4/5] w-full rounded-[2rem] border border-gold/20 object-cover" />
          <div className="glass absolute right-4 -bottom-6 rounded-3xl p-5 sm:-right-8 sm:p-6">
            <p className="font-serif text-5xl text-champagne"><Counter value={15} /></p>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">Years of excellence</p>
          </div>
        </Reveal>
        <Reveal direction="left">
          <p className="eyebrow">Our Story</p>
          <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Born from a love of the journey itself</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            <p>
              Fatima Tours and Travels began in 2011 with a simple belief: that travel should feel as extraordinary as the destination. What started as a small desk arranging visas and flights for friends and family has grown into a full-service luxury travel house.
            </p>
            <p>
              Today our specialists design honeymoons in the Maldives, family adventures in Thailand, alpine journeys through Switzerland and much more, each one crafted with the same personal attention we gave our very first traveller.
            </p>
          </div>
          <ol className="mt-8 space-y-4 border-l border-gold/30 pl-6">
            {milestones.map(([y, t]) => (
              <li key={y}>
                <span className="font-serif text-xl text-gold-light">{y}</span>
                <p className="text-sm text-muted">{t}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section className="container-lux py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1} className="glass rounded-3xl p-8">
              <v.icon size={32} className="text-gold-light" aria-hidden />
              <h3 className="mt-5 text-3xl">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{v.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-white/5 bg-ink-2 p-6 text-center">
              <p className="font-serif text-4xl text-champagne"><Counter value={s.value} suffix={s.suffix} /></p>
              <p className="mt-1 text-xs tracking-[0.2em] text-muted uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-lux py-20 md:py-36">
        <SectionHeading eyebrow="Our Team" title="The people behind your journey" subtitle="Seasoned travellers, visa experts and concierge specialists, all dedicated to you." />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.1} className="group">
              <div className="relative overflow-hidden rounded-3xl border border-gold/20">
                <img src={m.image} alt={`${m.name}, ${m.role}`} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <p className="font-serif text-2xl">{m.name}</p>
                  <p className="text-xs tracking-[0.15em] text-gold uppercase">{m.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-lux">
        <Reveal className="glass flex flex-col items-center gap-6 rounded-[2rem] p-10 text-center sm:p-14">
          <HeartHandshake size={40} className="text-gold-light" aria-hidden />
          <h2 className="max-w-2xl text-4xl sm:text-5xl">Let's plan something unforgettable, together.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/planner" className="btn-gold">Start planning</Link>
            <Link to="/contact" className="btn-outline">Talk to us</Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
