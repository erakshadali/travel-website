import { site } from '../../data/data'

// Brand glyphs as inline SVG (Lucide v1 no longer ships brand icons).
const paths = {
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.7a5.1 5.1 0 1 0 0 10.2 5.1 5.1 0 0 0 0-10.2zm0 8.4a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zm5.3-9.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z',
  facebook:
    'M13.5 21.9v-7.7h2.6l.4-3h-3V9.3c0-.9.2-1.5 1.5-1.5h1.6V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6v7.7C5.6 21.2 2 17 2 12 2 6.5 6.5 2 12 2s10 4.5 10 10c0 5-3.6 9.2-8.5 9.9z',
  x: 'M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z',
  youtube:
    'M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.5 3.6 12 3.6 12 3.6s-4.5 0-7.8.3c-.5.1-1.5.1-2.3 1-.7.7-.9 2.3-.9 2.3S.7 9.1.7 11v1.8c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s4.5 0 7.8-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V11c0-1.9-.3-3.8-.3-3.8zM9.7 14.9V8.4l6.1 3.3-6.1 3.2z',
}
const labels = { instagram: 'Instagram', facebook: 'Facebook', x: 'X (Twitter)', youtube: 'YouTube' }

export default function SocialIcons({ className = '' }) {
  return (
    <ul className={`flex gap-3 ${className}`}>
      {Object.entries(site.social).map(([key, href]) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labels[key]}
            className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 text-gold-light transition hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
              <path d={paths[key]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
