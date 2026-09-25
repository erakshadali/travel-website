// Read-only: lists bookings, trip plans, contact messages and newsletter signups whose email contains
// the given text. Handy for checking what a form really stored (until the admin screens exist).
//
//   npm run find-submissions -- rehearsal2
//   npm run find-submissions -- someone@example.com
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Booking } from '../src/models/Booking.js'
import { FlightDetails } from '../src/models/FlightDetails.js'
import { NotificationLog } from '../src/models/NotificationLog.js'
import { TripPlan } from '../src/models/TripPlan.js'
import { ContactMessage } from '../src/models/ContactMessage.js'
import { NewsletterSubscriber } from '../src/models/NewsletterSubscriber.js'

dotenv.config({ quiet: true })
const needle = process.argv[2]
if (!needle) {
  console.error('Usage: npm run find-submissions -- <text in the email address>')
  process.exit(1)
}
if (!process.env.MONGODB_URI || /<[^>]*>/.test(process.env.MONGODB_URI)) {
  console.error('MONGODB_URI is missing or still has a <placeholder> in it.')
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
console.log(`Database "${mongoose.connection.name}", emails containing "${needle}"\n`)

const filter = { email: new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
const day = (d) => (d ? d.toISOString().slice(0, 10) : '-')
let total = 0

const section = async (title, docs, describe) => {
  total += docs.length
  console.log(`${title}: ${docs.length}`)
  for (const d of docs) console.log(`  ${await describe(d)}`)
  console.log()
}

await section('Bookings', await Booking.find(filter).sort({ createdAt: 1 }), async (b) => {
  const flight = await FlightDetails.findOne({ booking: b._id })
  const sent = await NotificationLog.find({ booking: b._id }).sort({ createdAt: 1 })
  const notes = b.statusHistory.filter((h) => h.note).map((h) => `"${h.note}"`)
  return [
    b.reference,
    `${b.status} [${b.statusHistory.map((h) => h.status).join(' > ')}]`,
    `${b.clientName} <${b.email}> ${b.whatsappNumber}`,
    `passport "${b.passportName}"`,
    `${b.packageName} / ${b.destination} on ${day(b.travelDate)}`,
    `${b.travellers.adults}A+${b.travellers.children}C ${b.roomType}`,
    `${b.currency} ${b.estimatedTotal}`,
    `whatsappConsent=${b.whatsappConsent} (${b.whatsappConsentAt?.toISOString() ?? 'no timestamp'}) optedOut=${b.optedOut}`,
    notes.length ? `notes: ${notes.join(', ')}` : null,
    flight
      ? `FLIGHT ${flight.flightNumber} ${flight.airline} PNR ${flight.pnr}: ${flight.departure.airport} ${flight.departure.at.toISOString()} -> ${flight.arrival.airport} ${flight.arrival.at.toISOString()} (UTC)`
      : 'no flight details',
    sent.length ? `messages: ${sent.map((n) => `${n.type}/${n.channel}=${n.status}[${n.mode}]${n.error ? ` (${n.error})` : ''}`).join(', ')}` : 'no messages',
  ]
    .filter(Boolean)
    .join(' | ')
})
await section('Trip plans', await TripPlan.find(filter).sort({ createdAt: 1 }), (p) =>
  [
    `${p.name} <${p.email}> ${p.phone ?? '(no phone)'}`,
    p.destination,
    p.flexibleDates ? 'flexible dates' : `${day(p.startDate)} to ${day(p.endDate)}`,
    `${p.travellers.adults}A+${p.travellers.children}C`,
    p.budget,
    p.interests.join('/'),
    p.hotel,
  ].join(' | '),
)
await section('Contact messages', await ContactMessage.find(filter).sort({ createdAt: 1 }), (m) =>
  `${m.name} <${m.email}> | ${m.topic ?? '-'} | "${m.message.slice(0, 60)}"`,
)
await section('Newsletter subscribers', await NewsletterSubscriber.find(filter).sort({ createdAt: 1 }), (n) => `${n.email} (since ${day(n.createdAt)})`)

await mongoose.disconnect()
process.exit(total ? 0 : 2) // 2 = nothing found
