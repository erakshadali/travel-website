import { Router } from 'express'
import { z } from 'zod'
import { Booking, BOOKING_STATUSES } from '../models/Booking.js'
import { FlightDetails } from '../models/FlightDetails.js'
import { HttpError } from '../utils/httpError.js'
import { LOCAL_DATETIME, isValidZone, localToUtc, parseDay } from '../utils/time.js'
import { paginate, paging, searchFilter } from '../utils/query.js'

const SEARCH_FIELDS = ['reference', 'clientName', 'email', 'whatsappNumber', 'passportName', 'destination', 'packageName']

// YYYY-MM-DD from a date input; an empty value means "no limit".
const dayParam = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
    .refine((s) => parseDay(s) !== null, 'That is not a real calendar date')
    .transform(parseDay)
    .optional(),
)

const listQuery = z
  .object({
    status: z.enum(BOOKING_STATUSES).optional(),
    search: z.string().trim().max(100).optional(),
    travelFrom: dayParam,
    travelTo: dayParam,
    sort: z.enum(['newest', 'oldest', 'travelDate']).default('newest'),
    ...paging,
  })
  .refine((q) => !q.travelFrom || !q.travelTo || q.travelFrom <= q.travelTo, {
    path: ['travelTo'],
    message: 'The end date must not be before the start date',
  })
const SORTS = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, travelDate: { travelDate: 1, createdAt: -1 } }

const statusBody = z.object({
  status: z.enum(BOOKING_STATUSES),
  note: z.string().trim().max(500).optional(),
})

// The admin types the time printed on the ticket (local to the airport) plus that airport's
// timezone. It is converted to UTC before storing.
const legBody = z
  .object({
    city: z.string().trim().min(1).max(80),
    airport: z.string().trim().min(2).max(80),
    localDateTime: z.string().regex(LOCAL_DATETIME, 'Use the format YYYY-MM-DDTHH:mm, e.g. 2026-10-12T10:30'),
    timezone: z.string().refine(isValidZone, 'Must be an IANA timezone, e.g. Asia/Dubai'),
  })
  .refine((leg) => localToUtc(leg.localDateTime, leg.timezone) !== null, {
    path: ['localDateTime'],
    message: 'That local time does not exist in this timezone (daylight-saving gap)',
  })

const flightBody = z.strictObject({
  airline: z.string().trim().min(2).max(80),
  flightNumber: z
    .string()
    .trim()
    .transform((s) => s.toUpperCase().replace(/\s+/g, ' '))
    .pipe(z.string().regex(/^[A-Z0-9]{2,3} ?\d{1,4}[A-Z]?$/, 'Use an airline code plus number, e.g. EK 511')),
  pnr: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.string().regex(/^[A-Z0-9]{5,8}$/, 'PNR must be 5-8 letters or digits')),
  departure: legBody,
  arrival: legBody,
})

const toStoredLeg = ({ city, airport, localDateTime, timezone }) => ({
  city,
  airport,
  timezone,
  at: localToUtc(localDateTime, timezone),
})

// Accepts the Mongo _id or the public reference (FT-XXXXXXX).
async function loadBooking(idOrReference) {
  let filter
  if (/^[a-f\d]{24}$/i.test(idOrReference)) filter = { _id: idOrReference }
  else if (/^FT-[A-Z0-9]{7}$/i.test(idOrReference)) filter = { reference: idOrReference.toUpperCase() }
  const booking = filter && (await Booking.findOne(filter))
  if (!booking) throw new HttpError(404, 'Booking not found')
  return booking
}

export function adminBookingsRouter() {
  const router = Router()

  router.get('/', async (req, res) => {
    const { status, search, travelFrom, travelTo, sort, page, limit } = listQuery.parse(req.query)

    const filter = searchFilter(search, SEARCH_FIELDS)
    if (status) filter.status = status
    // travelDate is stored at UTC midnight, so both ends of the range are inclusive.
    if (travelFrom || travelTo) {
      filter.travelDate = { ...(travelFrom && { $gte: travelFrom }), ...(travelTo && { $lte: travelTo }) }
    }

    res.json(await paginate(Booking, { filter, sort: SORTS[sort], select: '-statusHistory', page, limit }))
  })

  // Counts per status for the dashboard (always across all bookings, whatever the list filters are).
  router.get('/stats', async (_req, res) => {
    const rows = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    const byStatus = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, 0]))
    let total = 0
    for (const { _id, count } of rows) {
      if (_id in byStatus) byStatus[_id] = count
      total += count
    }
    res.json({ total, byStatus })
  })

  router.get('/:id', async (req, res) => {
    const booking = await loadBooking(req.params.id)
    const flight = await FlightDetails.findOne({ booking: booking._id })
    res.json({ ...booking.toJSON(), flight: flight?.toJSON() ?? null })
  })

  router.patch('/:id/status', async (req, res) => {
    const { status, note } = statusBody.parse(req.body)
    const booking = await loadBooking(req.params.id)

    // Atomic: the status filter turns a repeated or racing update into a no-op instead of a
    // duplicate history entry.
    const updated = await Booking.findOneAndUpdate(
      { _id: booking._id, status: { $ne: status } },
      { $set: { status }, $push: { statusHistory: { status, note: note || undefined, changedAt: new Date() } } },
      { returnDocument: 'after', runValidators: true },
    )
    if (!updated) throw new HttpError(409, `Booking is already "${status}"`)
    res.json(updated)
  })

  router.get('/:id/flight', async (req, res) => {
    const booking = await loadBooking(req.params.id)
    const flight = await FlightDetails.findOne({ booking: booking._id })
    if (!flight) throw new HttpError(404, 'No flight details for this booking yet')
    res.json(flight)
  })

  router.put('/:id/flight', async (req, res) => {
    const body = flightBody.parse(req.body)
    const booking = await loadBooking(req.params.id)

    const departure = toStoredLeg(body.departure)
    const arrival = toStoredLeg(body.arrival)
    if (arrival.at <= departure.at) {
      throw new HttpError(400, 'Validation failed', [
        { path: 'arrival.localDateTime', message: 'Arrival must be after departure (compared in UTC)' },
      ])
    }

    const existing = await FlightDetails.findOne({ booking: booking._id })
    const flight = existing ?? new FlightDetails({ booking: booking._id })
    flight.set({ airline: body.airline, flightNumber: body.flightNumber, pnr: body.pnr, departure, arrival })
    await flight.save()
    res.status(existing ? 200 : 201).json(flight)
  })

  router.delete('/:id/flight', async (req, res) => {
    const booking = await loadBooking(req.params.id)
    const { deletedCount } = await FlightDetails.deleteOne({ booking: booking._id })
    if (!deletedCount) throw new HttpError(404, 'No flight details for this booking yet')
    res.status(204).end()
  })

  return router
}
