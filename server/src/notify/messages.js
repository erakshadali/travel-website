// What we say to people: the client's confirmation email and WhatsApp message, and the agency's alert.
// Everything that came from a visitor (names, requests...) is HTML-escaped before it goes into an email.
import { WHATSAPP_TEMPLATES } from './templates.js'

export const AGENCY_NAME = 'Premium Tours and Travels'

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])

// One line, no control characters: for email subjects and WhatsApp variables, where a newline could
// break the message (or be used to smuggle in extra email headers).
export const oneLine = (value) => String(value ?? '').replace(/[\u0000-\u001f\u007f\s]+/g, ' ').trim()

export const firstName = (fullName) => oneLine(fullName).split(' ')[0] || 'there'

export const fmtDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const fmtMoney = (amount, currency = 'USD') => `${currency} ${Math.round(amount).toLocaleString('en-US')}`
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
const travellersText = ({ adults, children }) => (children ? `${plural(adults, 'adult', 'adults')}, ${plural(children, 'child', 'children')}` : plural(adults, 'adult', 'adults'))
const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const whatsappLink = (number) => `https://wa.me/${number.replace(/\D/g, '')}`

// ---- email layout ---------------------------------------------------------------------------
// Table-based with inline styles: the only thing every mail app renders the same way. Light body
// (dark-on-white survives Gmail/Outlook dark modes better than a dark design does).

const COLORS = { page: '#F4F0E8', card: '#FFFFFF', ink: '#1C1B19', muted: '#6F6A60', line: '#E6DFD0', gold: '#8C6D3F', band: '#0A0A0C', bandText: '#E6D3A3' }
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "Arial, Helvetica, sans-serif"

function cell(value) {
  if (value && typeof value === 'object') return `<a href="${escapeHtml(value.href)}" style="color:${COLORS.gold}">${escapeHtml(value.text)}</a>`
  return escapeHtml(value)
}
const plain = (value) => (value && typeof value === 'object' ? `${value.text} (${value.href})` : String(value))

function renderEmail({ preheader, heading, paragraphs = [], rows = [], steps, button, footer }) {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:9px 12px 9px 0;width:38%;vertical-align:top;font-size:13px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.line}">${escapeHtml(label)}</td>` +
        `<td style="padding:9px 0;vertical-align:top;font-size:15px;color:${COLORS.ink};border-bottom:1px solid ${COLORS.line}">${cell(value)}</td></tr>`,
    )
    .join('')
  const stepsHtml = steps
    ? `<ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.7;color:${COLORS.ink}">${steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ol>`
    : ''
  const buttonHtml = button
    ? `<p style="margin:0 0 24px"><a href="${escapeHtml(button.href)}" style="display:inline-block;background:${COLORS.band};color:${COLORS.bandText};padding:12px 26px;border-radius:24px;text-decoration:none;font-size:13px;letter-spacing:1px">${escapeHtml(button.text)}</a></p>`
    : ''

  const html =
    `<!doctype html><html><body style="margin:0;padding:0;background:${COLORS.page}">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.page};padding:24px 12px"><tr><td align="center">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${COLORS.card};border-radius:12px;overflow:hidden">` +
    `<tr><td style="background:${COLORS.band};padding:22px 28px;font-family:${SERIF};font-size:22px;color:${COLORS.bandText};letter-spacing:1px">${escapeHtml(AGENCY_NAME)}</td></tr>` +
    `<tr><td style="padding:28px;font-family:${SANS};color:${COLORS.ink}">` +
    `<h1 style="margin:0 0 16px;font-family:${SERIF};font-weight:normal;font-size:26px;line-height:1.25;color:${COLORS.ink}">${escapeHtml(heading)}</h1>` +
    paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7">${escapeHtml(p)}</p>`).join('') +
    (rows.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px">${rowsHtml}</table>` : '') +
    stepsHtml +
    buttonHtml +
    (footer ? `<p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.muted}">${escapeHtml(footer)}</p>` : '') +
    `</td></tr></table></td></tr></table></body></html>`

  const text = [
    heading,
    '',
    ...paragraphs.flatMap((p) => [p, '']),
    ...rows.map(([label, value]) => `${label}: ${plain(value)}`),
    ...(rows.length ? [''] : []),
    ...(steps ? [...steps.map((s, i) => `${i + 1}. ${s}`), ''] : []),
    ...(button ? [`${button.text}: ${button.href}`, ''] : []),
    ...(footer ? [footer] : []),
    '',
    `${AGENCY_NAME}`,
  ].join('\n')

  return { html, text }
}

// ---- the messages ---------------------------------------------------------------------------

const whatsappEligible = (booking) => booking.whatsappConsent === true && !booking.optedOut

export function clientConfirmationEmail(booking) {
  const name = firstName(booking.clientName)
  const channels = whatsappEligible(booking) ? 'WhatsApp and email' : 'email'
  const { html, text } = renderEmail({
    preheader: `We have received your booking request ${booking.reference}.`,
    heading: `Thank you, ${name}. We have your booking request.`,
    paragraphs: [
      `Your reference is ${booking.reference}. Our team is checking availability now and will confirm by ${channels} within a few hours. Nothing is charged at this stage.`,
    ],
    rows: [
      ['Reference', booking.reference],
      ['Package', booking.packageName],
      ['Destination', booking.destination],
      ['Departure date', fmtDate(booking.travelDate)],
      ['Travellers', travellersText(booking.travellers)],
      ['Room', capitalise(booking.roomType)],
      ['Name on passport', booking.passportName],
      ['Estimated total', `${fmtMoney(booking.estimatedTotal, booking.currency)} (an estimate, confirmed when we reply)`],
      ...(booking.specialRequests ? [['Your requests', booking.specialRequests]] : []),
    ],
    steps: [
      'We check availability, usually within a few hours.',
      'We confirm your booking and explain the next steps.',
      'Once your tickets are issued, we send your flight details.',
    ],
    footer: 'Please check that the passport name above matches your passport exactly. If anything needs correcting, just reply to this email.',
  })
  return { subject: oneLine(`Booking request ${booking.reference} received | ${AGENCY_NAME}`), html, text }
}

export function agencyAlertEmail(booking, { siteUrl } = {}) {
  const adminUrl = siteUrl ? `${siteUrl}/admin/bookings/${booking.id}` : null
  const { html, text } = renderEmail({
    preheader: `${booking.clientName}: ${booking.packageName}, ${fmtDate(booking.travelDate)}`,
    heading: `New booking ${booking.reference}`,
    paragraphs: [`${booking.clientName} has just booked ${booking.packageName}. Status: Received.`],
    rows: [
      ['Client', booking.clientName],
      ['Email', { text: booking.email, href: `mailto:${booking.email}` }],
      ['WhatsApp', { text: booking.whatsappNumber, href: whatsappLink(booking.whatsappNumber) }],
      ['Name on passport', booking.passportName],
      ['Package', booking.packageName],
      ['Destination', booking.destination],
      ['Departure date', fmtDate(booking.travelDate)],
      ['Travellers', travellersText(booking.travellers)],
      ['Room', capitalise(booking.roomType)],
      ...(booking.occasion ? [['Celebrating', booking.occasion]] : []),
      ['Travel insurance', booking.insurance ? 'Yes' : 'No'],
      ['Estimated total', fmtMoney(booking.estimatedTotal, booking.currency)],
      ['WhatsApp updates', whatsappEligible(booking) ? 'Client agreed' : 'No consent or opted out'],
      ...(booking.specialRequests ? [['Special requests', booking.specialRequests]] : []),
    ],
    button: adminUrl ? { text: 'OPEN IN ADMIN', href: adminUrl } : undefined,
  })
  return { subject: oneLine(`New booking ${booking.reference}: ${booking.clientName}, ${booking.destination}, ${fmtDate(booking.travelDate)}`), html, text }
}

// Variables for the booking_confirmation WhatsApp template, in the order {{1}}..{{4}}.
export function clientWhatsAppParams(booking) {
  return [firstName(booking.clientName), booking.reference, oneLine(booking.packageName), fmtDate(booking.travelDate)]
}
export const BOOKING_CONFIRMATION_TEMPLATE = WHATSAPP_TEMPLATES.booking_confirmation
export { whatsappEligible }
