import CtaBanner from '../components/home/CtaBanner'
import ExperiencesTeaser from '../components/home/ExperiencesTeaser'
import FeaturedDestinations from '../components/home/FeaturedCarousel'
import GalleryStrip from '../components/home/GalleryStrip'
import Hero from '../components/home/Hero'
import HowItWorks from '../components/home/HowItWorks'
import OfferBanner from '../components/home/OfferBanner'
import PopularPackages from '../components/home/PopularPackages'
import QuickActions from '../components/home/QuickActions'
import RoutesFromIndia from '../components/home/RoutesFromIndia'
import ServicesRow from '../components/home/ServicesRow'
import SpotlightDestinations from '../components/home/SpotlightDestinations'
import Testimonials from '../components/home/Testimonials'
import TrustStrip from '../components/home/TrustStrip'
import WhyChooseUs from '../components/home/WhyChooseUs'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <QuickActions />
      <TrustStrip />
      <FeaturedDestinations />
      <ServicesRow />
      <HowItWorks />
      <SpotlightDestinations />
      <RoutesFromIndia />
      <OfferBanner />
      <ExperiencesTeaser />
      <WhyChooseUs />
      <PopularPackages />
      <Testimonials />
      <GalleryStrip />
      <CtaBanner />
    </>
  )
}
