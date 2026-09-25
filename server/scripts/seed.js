// Development helper: fills the database with sample bookings so the admin API has something to show.
// Only touches records whose email ends in @example.test, so re-running it is safe and real data is left alone.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Booking } from '../src/models/Booking.js'
import { FlightDetails } from '../src/models/FlightDetails.js'
import { localToUtc } from '../src/utils/time.js'

dotenv.config({ quiet: true })
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to seed with NODE_ENV=production.')
  process.exit(1)
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (see .env.example).')
  process.exit(1)
}

const day = (offset) => {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + offset)
  return d
}
const isoDate = (d) => d.toISOString().slice(0, 10)

const base = { whatsappConsent: true, currency: 'USD', roomType: 'deluxe', travellers: { adults: 2, children: 0 } }
const samples = [
  { ...base, clientName: 'Aisha Khan', email: 'aisha@example.test', whatsappNumber: '+919820012345', passportName: 'AISHA KHAN', packageName: 'Dubai Luxe Escape', destination: 'Dubai', travelDate: day(30), estimatedTotal: 4200, status: 'Received' },
  { ...base, clientName: 'Bilal Ahmed', email: 'bilal@example.test', whatsappNumber: '+447700900123', passportName: 'BILAL AHMED', packageName: 'Maldives Overwater Romance', destination: 'Maldives', travelDate: day(45), roomType: 'suite', occasion: 'Honeymoon', estimatedTotal: 9800, status: 'Under Review' },
  { ...base, clientName: 'Chloe Dupont', email: 'chloe@example.test', whatsappNumber: '+33612345678', passportName: 'CHLOE DUPONT', packageName: 'Paris Romance', destination: 'Paris', travelDate: day(20), estimatedTotal: 5100, status: 'Confirmed' },
  { ...base, clientName: 'Farhan Sheikh', email: 'farhan@example.test', whatsappNumber: '+919876543210', passportName: 'FARHAN SHEIKH', packageName: 'Dubai Luxe Escape', destination: 'Dubai', travelDate: day(2), travellers: { adults: 2, children: 1 }, estimatedTotal: 5600, status: 'Ticket Issued', flight: true },
  { ...base, clientName: 'Gita Rao', email: 'gita@example.test', whatsappNumber: '+14155550123', passportName: 'GITA RAO', packageName: 'Bali Wellness Retreat', destination: 'Bali', travelDate: day(-40), roomType: 'standard', whatsappConsent: false, estimatedTotal: 3300, status: 'Completed' },
]

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 })
console.log(`Connected to "${mongoose.connection.name}"`)

const old = await Booking.find({ email: /@example\.test$/ }).select('_id')
await FlightDetails.deleteMany({ booking: { $in: old.map((b) => b._id) } })
await Booking.deleteMany({ _id: { $in: old.map((b) => b._id) } })

for (const { flight, status, ...fields } of samples) {
  // Real bookings always start as Received; then move to the sample's status like an admin would.
  const booking = await Booking.create(fields)
  if (status !== 'Received') {
    booking.status = status
    booking.statusHistory.push({ status, note: 'Seeded sample data' })
    await booking.save()
  }
  if (flight) {
    const dep = `${isoDate(fields.travelDate)}T10:30`
    const arr = `${isoDate(fields.travelDate)}T12:15`
    await FlightDetails.create({
      booking: booking._id,
      airline: 'Emirates',
      flightNumber: 'EK 511',
      pnr: 'SEED42',
      departure: { city: 'Mumbai', airport: 'BOM', timezone: 'Asia/Kolkata', at: localToUtc(dep, 'Asia/Kolkata') },
      arrival: { city: 'Dubai', airport: 'DXB', timezone: 'Asia/Dubai', at: localToUtc(arr, 'Asia/Dubai') },
    })
  }
  console.log(`  ${booking.reference}  ${booking.status.padEnd(13)}  ${booking.clientName}`)
}

await mongoose.disconnect()
