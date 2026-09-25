import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { Booking, ROOM_TYPES } from '../models/Booking.js'
import { TripPlan } from '../models/TripPlan.js'
import { ContactMessage } from '../models/ContactMessage.js'
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js'
import { E164, normalizeWhatsapp } from '../utils/phone.js'
import { parseDay } from '../utils/time.js'

// ---- shared field rules ---------------------------------------------------------------------

const email = z.string().trim().toLowerCase().max(254).pipe(z.email('Please enter a valid email address'))

// Optional free-text: "" and missing both mean "not provided".
const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined)

const optionalPhone = z
  .string()
  .trim()
  .max(30)
  .optional()
  .transform((v) => v || undefined)
  .pipe(z.string().regex(/^[+\d\s\-().]{6,30}$/, 'Please enter a valid phone number').optional())

const whatsappNumber = z
  .string()
  .max(40)
  .transform(normalizeWhatsapp)
  .pipe(z.string().regex(E164, 'Include the country code, e.g. +971 50 123 4567'))

const DAY_MS = 86_400_000
// A calendar date (YYYY-MM-DD) that isn't in the past and isn't absurdly far ahead. One day of
// slack on the past side so a client in a timezone ahead of UTC isn't rejected for "today".
const futureDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((s) => parseDay(s) !== null, 'That is not a real calendar date')
  .transform(parseDay)
  .refine((d) => d.getTime() >= Date.now() - DAY_MS, 'Date must not be in the past')
  .refine((d) => d.getTime() <= Date.now() + 3 * 366 * DAY_MS, 'Date is too far in the future')

const travellers = z.object({
  adults: z.int('Adults must be a whole number').min(1, 'At least one adult is required').max(30),
  children: z.int('Children must be a whole number').min(0).max(30).default(0),
})

// ---- request bodies -------------------------------------------------------------------------
// Unknown keys are stripped, so a client can never set status, reference, optedOut, etc.

const bookingBody = z.object({
  clientName: z.string().trim().min(2, 'Please enter your full name').max(120),
  email,
  whatsappNumber,
  passportName: z
    .string()
    .trim()
    .min(3, 'Enter the name exactly as on your passport')
    .max(120)
    // Letters (incl. accents), spaces, hyphens, dots and both straight and curly apostrophes:
    // phone keyboards turn O'Neil into O’Neil.
    .regex(/^\p{L}[\p{L}\p{M}\s'’.-]*$/u, 'Passport name can only contain letters, spaces, hyphens and apostrophes'),
  packageName: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(80),
  travelDate: futureDay,
  travellers,
  roomType: z.enum(ROOM_TYPES),
  specialRequests: optionalText(2000),
  occasion: optionalText(60),
  insurance: z.boolean().default(false),
  estimatedTotal: z.number().min(0).max(10_000_000),
  currency: z.literal('USD').default('USD'),
  whatsappConsent: z.literal(true, 'WhatsApp consent is required to book'),
})

const tripPlanBody = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name').max(120),
    email,
    phone: optionalPhone,
    destination: z.string().trim().min(1).max(80),
    flexibleDates: z.boolean().default(false),
    startDate: futureDay.optional(),
    endDate: futureDay.optional(),
    travellers,
    budget: z.string().trim().min(1).max(60),
    interests: z.array(z.string().trim().min(1).max(40)).min(1, 'Pick at least one interest').max(10),
    hotel: z.string().trim().min(1).max(80),
  })
  .superRefine((plan, ctx) => {
    if (plan.flexibleDates) return
    if (!plan.startDate) ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Choose a departure date, or mark dates as flexible' })
    if (!plan.endDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Choose a return date, or mark dates as flexible' })
    if (plan.startDate && plan.endDate && plan.endDate < plan.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Return date must not be before departure' })
    }
  })

const contactBody = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email,
  phone: optionalPhone,
  topic: optionalText(60),
  message: z.string().trim().min(10, 'Tell us a little more (10+ characters)').max(3000),
})

const newsletterBody = z.object({ email })

// ---- helpers --------------------------------------------------------------------------------

// The reference is random; on the (astronomically unlikely) collision, draw another.
async function createBooking(data) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await Booking.create(data)
    } catch (err) {
      if (err.code === 11000 && err.keyPattern?.reference) continue
      throw err
    }
  }
  throw new Error('Could not generate a unique booking reference')
}

const isDuplicateKey = (err) => err?.code === 11000

export function publicRouter(config, { notifications }) {
  const router = Router()

  // One limiter (and one counter per client IP) per endpoint.
  const limited = () =>
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: config.publicRateLimit,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later' },
    })

  router.post('/bookings', limited(), async (req, res) => {
    const booking = await createBooking({ ...bookingBody.parse(req.body), whatsappConsentAt: new Date() })
    // Not awaited: the visitor should not wait for Resend or WhatsApp, and a message that fails must
    // never make the booking itself fail (each failure is recorded in NotificationLog instead).
    notifications.bookingCreated(booking).catch((err) => console.error('Booking notifications crashed:', err))
    res.status(201).json({ ok: true, reference: booking.reference })
  })

  router.post('/trip-plans', limited(), async (req, res) => {
    const plan = tripPlanBody.parse(req.body)
    if (plan.flexibleDates) {
      plan.startDate = undefined
      plan.endDate = undefined
    }
    await TripPlan.create(plan)
    res.status(201).json({ ok: true })
  })

  router.post('/contact', limited(), async (req, res) => {
    await ContactMessage.create(contactBody.parse(req.body))
    res.status(201).json({ ok: true })
  })

  // Always answers the same way, so nobody can probe which addresses are already subscribed.
  router.post('/newsletter', limited(), async (req, res) => {
    const { email } = newsletterBody.parse(req.body)
    try {
      await NewsletterSubscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true })
    } catch (err) {
      if (!isDuplicateKey(err)) throw err // two identical signups racing: the other one won, which is fine
    }
    res.json({ ok: true })
  })

  return router
}
