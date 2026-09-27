import { whatsappLink } from '../../data/data'
import { images } from '../../data/images'

export default function CtaBanner() {
  return (
    <section className="relative h-[360px] overflow-hidden sm:h-[420px] lg:h-[460px]">
      <img src={images.heroes.newsletter} alt="A calm beach at sunrise" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden className="absolute inset-0 bg-ink/50" />
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] tracking-[0.3em] text-gold-light uppercase sm:text-xs sm:tracking-[0.35em]">Plan With Us</p>
        <h2 className="mt-3 font-serif text-[1.75rem] font-medium text-white sm:text-5xl">Begin your next journey</h2>
        <p className="mt-3 max-w-sm text-sm text-white/85 sm:mt-4 sm:max-w-md sm:text-base">
          Speak with a travel designer today, on call or WhatsApp.
        </p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-lt mt-6 sm:mt-7">
          Chat on WhatsApp
        </a>
      </div>
    </section>
  )
}
