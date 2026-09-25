import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { useState } from 'react'
import PageHero from '../components/ui/PageHero'
import Reveal from '../components/ui/Reveal'
import SocialIcons from '../components/ui/SocialIcons'
import { site, whatsappLink } from '../data/data'
import { images } from '../data/images'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { submitContact } from '../services/api'

const TOPICS = ['Holiday package', 'Visa assistance', 'Flight tickets', 'Hotel booking', 'Corporate travel', 'Other']
const empty = { name: '', email: '', phone: '', topic: TOPICS[0], message: '' }

export default function Contact() {
  useDocumentTitle('Contact')
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [submitError, setSubmitError] = useState('')

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const er = {}
    if (form.name.trim().length < 2) er.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Please enter a valid email.'
    if (form.message.trim().length < 10) er.message = 'Tell us a little more (10+ characters).'
    setErrors(er)
    if (Object.keys(er).length) return
    setStatus('sending')
    setSubmitError('')
    try {
      await submitContact(form)
      setStatus('sent')
      setForm(empty)
    } catch (err) {
      setSubmitError(err.message) // keep what they typed so they can retry
      setStatus('idle')
    }
  }

  const cards = [
    { icon: Phone, label: 'Call us', value: site.phone, href: `tel:${site.phone.replace(/\s/g, '')}` },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat instantly', href: whatsappLink(), external: true },
    { icon: Mail, label: 'Email', value: site.email, href: `mailto:${site.email}` },
    { icon: Clock, label: 'Office hours', value: site.hours },
  ]

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>We'd love to <span className="text-champagne italic">hear from you.</span></>}
        subtitle="Questions, quotes or a spark of wanderlust? Our travel designers reply within a few hours."
        image={images.heroes.contact}
      />

      <section className="container-lux py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => {
            const Inner = (
              <>
                <c.icon size={22} className="text-gold-light" aria-hidden />
                <p className="mt-4 text-xs tracking-[0.2em] text-muted uppercase">{c.label}</p>
                <p className="mt-1 text-sm break-words sm:text-base">{c.value}</p>
              </>
            )
            return (
              <Reveal key={c.label} delay={i * 0.08}>
                {c.href ? (
                  <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="glass block h-full rounded-3xl p-6 transition hover:-translate-y-1 hover:border-gold/60">
                    {Inner}
                  </a>
                ) : (
                  <div className="glass h-full rounded-3xl p-6">{Inner}</div>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="container-lux grid gap-8 py-12 lg:grid-cols-2 [&>*]:min-w-0">
        <Reveal className="glass rounded-[2rem] p-6 sm:p-10">
          {status === 'sent' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center py-12 text-center" role="status">
              <CheckCircle2 size={64} className="text-gold-light" aria-hidden />
              <h2 className="mt-6 text-4xl">Message sent</h2>
              <p className="mt-3 max-w-sm text-muted">Thank you for reaching out. A member of our team will be in touch shortly.</p>
              <button data-fab-avoid onClick={() => setStatus('idle')} className="btn-outline mt-8">Send another message</button>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
              <h2 className="text-3xl sm:col-span-2">Send us a message</h2>
              <div>
                <label htmlFor="c-name" className="label-lux">Name</label>
                <input id="c-name" className="input-lux" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'c-name-err' : undefined} />
                {errors.name && <p id="c-name-err" className="mt-1.5 text-xs text-red-300">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="c-email" className="label-lux">Email</label>
                <input id="c-email" type="email" className="input-lux" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'c-email-err' : undefined} />
                {errors.email && <p id="c-email-err" className="mt-1.5 text-xs text-red-300">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="c-phone" className="label-lux">Phone (optional)</label>
                <input id="c-phone" type="tel" className="input-lux" autoComplete="tel" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label htmlFor="c-topic" className="label-lux">Topic</label>
                <select id="c-topic" className="input-lux cursor-pointer" value={form.topic} onChange={set('topic')}>
                  {TOPICS.map((t) => <option key={t} className="bg-ink-2">{t}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="c-msg" className="label-lux">Message</label>
                <textarea id="c-msg" rows={5} maxLength={3000} className="input-lux resize-none" value={form.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'c-msg-err' : undefined} />
                {errors.message && <p id="c-msg-err" className="mt-1.5 text-xs text-red-300">{errors.message}</p>}
              </div>
              {submitError && <p role="alert" className="rounded-2xl border border-red-300/30 bg-red-300/5 p-4 text-sm text-red-300 sm:col-span-2">{submitError}</p>}
              <button data-fab-avoid type="submit" disabled={status === 'sending'} className="btn-gold sm:col-span-2 sm:justify-self-start">
                {status === 'sending' ? 'Sending…' : <>Send Message <Send size={16} aria-hidden /></>}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-6">
          <div className="relative min-h-[340px] flex-1 overflow-hidden rounded-[2rem] border border-gold/30">
            <iframe
              title={`Map showing ${site.name} office`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.address)}&output=embed`}
              className="absolute inset-0 h-full w-full [filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="glass rounded-[2rem] p-6">
            <p className="flex gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden />
              <span>
                <span className="block font-serif text-xl">Visit our office</span>
                <span className="text-sm text-muted">{site.address}</span>
              </span>
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-gold-light hover:underline">
                Get directions →
              </a>
              <SocialIcons />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
