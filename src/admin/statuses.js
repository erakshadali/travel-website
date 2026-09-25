// Same list and order as the backend (server/src/models/Booking.js).
export const STATUSES = ['Received', 'Under Review', 'Confirmed', 'Ticket Issued', 'Travelling', 'Completed', 'Cancelled']

// Solid tints only (no gradients: see the design rules in CLAUDE.md). Full class names so Tailwind can see them.
export const STATUS_STYLES = {
  Received: 'border-white/25 bg-white/5 text-ivory/85',
  'Under Review': 'border-gold/45 bg-gold/10 text-gold-light',
  Confirmed: 'border-emerald-300/35 bg-emerald-300/10 text-emerald-300',
  'Ticket Issued': 'border-sky-300/35 bg-sky-300/10 text-sky-300',
  Travelling: 'border-violet-300/35 bg-violet-300/10 text-violet-300',
  Completed: 'border-teal-200/30 bg-teal-200/10 text-teal-200',
  Cancelled: 'border-red-300/35 bg-red-300/10 text-red-300',
}
