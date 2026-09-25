const DATE = { day: 'numeric', month: 'short', year: 'numeric' }

// Dates without a time (travel date) are stored at UTC midnight, so show them in UTC or they slip a day.
export const fmtDay = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { ...DATE, timeZone: 'UTC' }) : '-')

// A moment in time (created, status changed) shown in the admin's own timezone.
export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { ...DATE, hour: 'numeric', minute: '2-digit' })

export const fmtMoney = (amount, currency = 'USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

// "2026-10-12T04:30": wall-clock time at the airport, shown as printed on the ticket.
export function fmtLocal(localDateTime) {
  const [date, time] = localDateTime.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { ...DATE, timeZone: 'UTC' })
  return `${day}, ${time}`
}

export const fmtUtc = (iso) =>
  `${new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' })} UTC`

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
export const travellersText = ({ adults, children }) =>
  children ? `${plural(adults, 'adult', 'adults')}, ${plural(children, 'child', 'children')}` : plural(adults, 'adult', 'adults')

export const whatsappUrl = (number) => `https://wa.me/${number.replace(/\D/g, '')}`
