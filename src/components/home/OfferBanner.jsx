import { Link } from 'react-router-dom'
import { images } from '../../data/images'
import Reveal from '../ui/Reveal'

export default function OfferBanner() {
  return (
    <section className="bg-paper py-16 sm:py-24 lg:py-28">
      <div className="container-lux">
        <Reveal className="grid border border-hairline sm:grid-cols-2">
          <div className="overflow-hidden">
            <img
              src={images.heroes.offer}
              alt="A cliffside resort pool overlooking the sea"
              loading="lazy"
              className="h-56 w-full object-cover transition duration-700 hover:scale-105 sm:h-full sm:min-h-[340px]"
            />
          </div>
          <div className="flex flex-col justify-center bg-linen p-7 sm:p-14">
            <p className="text-[11px] tracking-[0.25em] text-gold-dark uppercase sm:text-xs sm:tracking-[0.3em]">Premium Signature Offer</p>
            <h3 className="mt-3 font-serif text-[26px] font-medium text-charcoal sm:text-[34px]">Early Bird Savings on 2027 Journeys</h3>
            <div className="mt-3.5 h-px w-8 bg-gold-dark" />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-stone">
              Book any international package before 31 December and save up to 15%, plus complimentary airport transfers.
            </p>
            <Link to="/planner" className="btn-lt mt-6 w-fit">
              Enquire Now
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
