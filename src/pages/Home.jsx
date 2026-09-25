import FeaturedCarousel from '../components/home/FeaturedCarousel'
import GalleryStrip from '../components/home/GalleryStrip'
import Hero from '../components/home/Hero'
import NewsletterSection from '../components/home/NewsletterSection'
import PopularPackages from '../components/home/PopularPackages'
import Testimonials from '../components/home/Testimonials'
import WhyChooseUs from '../components/home/WhyChooseUs'
import GoldDivider from '../components/ui/GoldDivider'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function Home() {
  useDocumentTitle()
  return (
    <>
      <Hero />
      <GoldDivider />
      <FeaturedCarousel />
      <GoldDivider />
      <WhyChooseUs />
      <GoldDivider />
      <PopularPackages />
      <GoldDivider />
      <Testimonials />
      <GoldDivider />
      <GalleryStrip />
      <NewsletterSection />
    </>
  )
}
