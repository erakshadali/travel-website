import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import GoldCursor from './components/global/GoldCursor'
import Loader from './components/global/Loader'
import FloatingActions from './components/global/FloatingActions'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'))
const Destinations = lazy(() => import('./pages/Destinations'))
const Packages = lazy(() => import('./pages/Packages'))
const PackageDetail = lazy(() => import('./pages/PackageDetail'))
const TripPlanner = lazy(() => import('./pages/TripPlanner'))
const Booking = lazy(() => import('./pages/Booking'))
const Experiences = lazy(() => import('./pages/Experiences'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
// The whole admin area is one lazy chunk: visitors to the public site never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading page">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1900)
    return () => clearTimeout(t)
  }, [])

  // /admin has its own layout: no public navbar, footer, loader, cursor or WhatsApp button.
  if (location.pathname === '/admin' || location.pathname.startsWith('/admin/')) {
    return (
      <Suspense fallback={<PageFallback />}>
        <AdminApp />
      </Suspense>
    )
  }

  return (
    <>
      <AnimatePresence>{loading && <Loader key="loader" />}</AnimatePresence>
      <GoldCursor />
      <Navbar />
      <main id="main">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Suspense fallback={<PageFallback />}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/packages" element={<Packages />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/planner" element={<TripPlanner />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/experiences" element={<Experiences />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}
