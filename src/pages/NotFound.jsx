import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section className="container-lux grid min-h-[80vh] place-items-center pt-32 text-center">
      <div>
        <Compass size={56} className="mx-auto text-gold" aria-hidden />
        <p className="eyebrow mt-6">Error 404</p>
        <h1 className="mt-4 text-5xl sm:text-6xl">
          This path leads <span className="text-champagne italic">nowhere.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">The page you're looking for has wandered off. Let us guide you back.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-gold">Back to home</Link>
          <Link to="/destinations" className="btn-outline">Explore destinations</Link>
        </div>
      </div>
    </section>
  )
}
