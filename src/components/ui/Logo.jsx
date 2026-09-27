import { Link } from 'react-router-dom'

export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9A96E" />
          <stop offset="1" stopColor="#E6D3A3" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#logo-g)" strokeWidth="2" />
      <ellipse cx="32" cy="32" rx="12" ry="29" fill="none" stroke="url(#logo-g)" strokeWidth="1" opacity="0.5" />
      <line x1="3" y1="32" x2="61" y2="32" stroke="url(#logo-g)" strokeWidth="1" opacity="0.5" />
      <text x="32" y="42" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="30" fontWeight="700" fill="url(#logo-g)">
        F
      </text>
    </svg>
  )
}

// `light` renders the brand name in charcoal for use on light (paper/linen) backgrounds,
// such as the light-theme Navbar. Everywhere else (dark pages, the dark Footer) omits it.
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex min-h-11 items-center gap-3" aria-label="Fatima Tours and Travels, home">
      <LogoMark />
      <span className="leading-none">
        <span className={`block font-serif text-xl tracking-wide ${light ? 'text-charcoal' : 'text-ivory'}`}>Fatima</span>
        <span className={`block text-[10px] tracking-[0.3em] uppercase ${light ? 'text-gold-dark' : 'text-gold'}`}>Tours &amp; Travels</span>
      </span>
    </Link>
  )
}
