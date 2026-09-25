import { after, before, beforeEach, describe, mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { Booking } from '../src/models/Booking.js'
import { TripPlan } from '../src/models/TripPlan.js'
import { ContactMessage } from '../src/models/ContactMessage.js'
import { NewsletterSubscriber } from '../src/models/NewsletterSubscriber.js'
import { listen, startServer } from './helpers.js'

let s

before(async () => {
  s = await startServer()
})
after(() => s.stop())

const futureDay = (days) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)

const bookingBody = (overrides = {}) => ({
  clientName: '  Aisha Khan ',
  email: ' Aisha.Khan@Example.TEST ',
  whatsappNumber: '+971 50 123-4567',
  passportName: "aisha o'neil-khan",
  packageName: 'Dubai Luxe Escape',
  destination: 'Dubai',
  travelDate: futureDay(30),
  travellers: { adults: 2, children: 1 },
  roomType: 'deluxe',
  specialRequests: 'Halal meals',
  occasion: 'Honeymoon',
  insurance: true,
  estimatedTotal: 4200,
  currency: 'USD',
  whatsappConsent: true,
  ...overrides,
})

const tripPlanBody = (overrides = {}) => ({
  name: 'Bilal Ahmed',
  email: 'bilal@example.test',
  phone: '+44 7700 900123',
  destination: 'Maldives',
  flexibleDates: false,
  startDate: futureDay(60),
  endDate: futureDay(67),
  travellers: { adults: 2, children: 0 },
  budget: '$3,000 – $5,000',
  interests: ['Beach', 'Food'],
  hotel: 'Luxury 5★',
  ...overrides,
})

const contactBody = (overrides = {}) => ({
  name: 'Chloe Dupont',
  email: 'chloe@example.test',
  phone: '',
  topic: 'Visa assistance',
  message: 'Could you help with a Schengen visa?',
  ...overrides,
})

describe('POST /api/bookings', () => {
  beforeEach(() => Booking.deleteMany({}))

  test('creates a booking, returns its FT- reference, and stores cleaned data', async () => {
    const r = await s.call('POST', '/api/bookings', { body: bookingBody() })
    assert.equal(r.status, 201)
    assert.equal(r.body.ok, true)
    assert.match(r.body.reference, /^FT-[A-HJ-NP-Z2-9]{7}$/)

    const saved = await Booking.findOne({ reference: r.body.reference })
    assert.equal(saved.clientName, 'Aisha Khan')
    assert.equal(saved.email, 'aisha.khan@example.test')
    assert.equal(saved.whatsappNumber, '+971501234567')
    assert.equal(saved.passportName, "AISHA O'NEIL-KHAN")
    assert.equal(saved.status, 'Received')
    assert.deepEqual(saved.statusHistory.map((h) => h.status), ['Received'])
    assert.equal(saved.whatsappConsent, true)
    assert.ok(Math.abs(saved.whatsappConsentAt - Date.now()) < 5000)
    assert.equal(saved.optedOut, false)
    assert.equal(saved.travelDate.toISOString(), `${futureDay(30)}T00:00:00.000Z`)
    assert.equal(saved.travellers.adults, 2)
    assert.equal(saved.travellers.children, 1)
    assert.equal(saved.estimatedTotal, 4200)
    assert.equal(saved.insurance, true)
  })

  test('normalises WhatsApp numbers typed with 00, brackets and dots', async () => {
    for (const [typed, stored] of [
      ['00971 50 123 4567', '+971501234567'],
      ['+91 (98200) 12345', '+919820012345'],
      ['+44.7700.900123', '+447700900123'],
    ]) {
      const r = await s.call('POST', '/api/bookings', { body: bookingBody({ whatsappNumber: typed }) })
      assert.equal(r.status, 201, typed)
      assert.equal((await Booking.findOne({ reference: r.body.reference })).whatsappNumber, stored)
    }
  })

  test('passport names with curly apostrophes, accents and combining marks are accepted', async () => {
    for (const name of ['Aisha O’Neil', 'José García', 'José Nuñez', 'Anne-Marie St. John']) {
      const r = await s.call('POST', '/api/bookings', { body: bookingBody({ passportName: name }) })
      assert.equal(r.status, 201, name)
    }
  })

  test('optional fields can be omitted or empty', async () => {
    const r = await s.call('POST', '/api/bookings', {
      body: bookingBody({ specialRequests: '', occasion: undefined, insurance: undefined, currency: undefined }),
    })
    assert.equal(r.status, 201)
    const saved = await Booking.findOne({ reference: r.body.reference })
    assert.equal(saved.specialRequests, undefined)
    assert.equal(saved.insurance, false)
    assert.equal(saved.currency, 'USD')
  })

  test('clients cannot set status, reference, opt-out or history', async () => {
    const r = await s.call('POST', '/api/bookings', {
      body: {
        ...bookingBody(),
        status: 'Confirmed',
        reference: 'FT-AAAAAAA',
        optedOut: true,
        statusHistory: [{ status: 'Completed' }],
        whatsappConsentAt: '2000-01-01T00:00:00Z',
        _id: '64b7f0c2a1b2c3d4e5f60718',
      },
    })
    assert.equal(r.status, 201)
    assert.notEqual(r.body.reference, 'FT-AAAAAAA')
    const saved = await Booking.findOne({ reference: r.body.reference })
    assert.equal(saved.status, 'Received')
    assert.equal(saved.optedOut, false)
    assert.deepEqual(saved.statusHistory.map((h) => h.status), ['Received'])
    assert.ok(saved.whatsappConsentAt.getFullYear() >= 2026)
    assert.notEqual(String(saved._id), '64b7f0c2a1b2c3d4e5f60718')
  })

  const invalid = {
    'missing consent': () => bookingBody({ whatsappConsent: undefined }),
    'consent false': () => bookingBody({ whatsappConsent: false }),
    'consent as the string "true"': () => bookingBody({ whatsappConsent: 'true' }),
    'WhatsApp number without country code': () => bookingBody({ whatsappNumber: '050 123 4567' }),
    'WhatsApp number too short': () => bookingBody({ whatsappNumber: '+12345' }),
    'WhatsApp number with letters': () => bookingBody({ whatsappNumber: '+971 50 CALL ME' }),
    'invalid email': () => bookingBody({ email: 'not-an-email' }),
    'email as an object (NoSQL injection)': () => bookingBody({ email: { $ne: null } }),
    'passport name with digits': () => bookingBody({ passportName: 'Agent 007' }),
    'name too short': () => bookingBody({ clientName: 'A' }),
    'travel date in the past': () => bookingBody({ travelDate: '2020-01-01' }),
    'travel date not a real day': () => bookingBody({ travelDate: '2027-02-30' }),
    'travel date in the wrong format': () => bookingBody({ travelDate: '12/10/2027' }),
    'travel date decades away': () => bookingBody({ travelDate: '2099-01-01' }),
    'zero adults': () => bookingBody({ travellers: { adults: 0, children: 0 } }),
    'fractional adults': () => bookingBody({ travellers: { adults: 1.5, children: 0 } }),
    'too many children': () => bookingBody({ travellers: { adults: 2, children: 31 } }),
    'unknown room type': () => bookingBody({ roomType: 'penthouse' }),
    'negative total': () => bookingBody({ estimatedTotal: -1 }),
    'total as a string': () => bookingBody({ estimatedTotal: '4200' }),
    'unsupported currency': () => bookingBody({ currency: 'EUR' }),
    'oversized special requests': () => bookingBody({ specialRequests: 'x'.repeat(2001) }),
    'missing package': () => bookingBody({ packageName: undefined }),
  }
  for (const [name, make] of Object.entries(invalid)) {
    test(`rejects ${name} with 400 and saves nothing`, async () => {
      const r = await s.call('POST', '/api/bookings', { body: make() })
      assert.equal(r.status, 400, JSON.stringify(r.body))
      assert.equal(r.body.error, 'Validation failed')
      assert.ok(r.body.details.length >= 1)
      assert.equal(await Booking.countDocuments(), 0)
    })
  }

  test('a missing body and a non-JSON content type give 400, not 500', async () => {
    assert.equal((await s.call('POST', '/api/bookings')).status, 400)
    const res = await fetch(s.base + '/api/bookings', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hello' })
    assert.equal(res.status, 400)
  })

  test('retries with a fresh reference when the first one collides', async () => {
    const create = Booking.create.bind(Booking)
    let calls = 0
    const spy = mock.method(Booking, 'create', async (data) => {
      calls += 1
      if (calls === 1) throw Object.assign(new Error('E11000 duplicate key'), { code: 11000, keyPattern: { reference: 1 } })
      return create(data)
    })
    try {
      const r = await s.call('POST', '/api/bookings', { body: bookingBody() })
      assert.equal(r.status, 201)
      assert.equal(calls, 2)
    } finally {
      spy.mock.restore()
    }
  })

  test('gives up (500, no leak) if references keep colliding', async () => {
    const spy = mock.method(Booking, 'create', async () => {
      throw Object.assign(new Error('E11000 duplicate key'), { code: 11000, keyPattern: { reference: 1 } })
    })
    const log = mock.method(console, 'error', () => {})
    try {
      const r = await s.call('POST', '/api/bookings', { body: bookingBody() })
      assert.equal(r.status, 500)
      assert.deepEqual(r.body, { error: 'Internal server error' })
      assert.equal(spy.mock.callCount(), 3)
    } finally {
      spy.mock.restore()
      log.mock.restore()
    }
  })

  test('a booking made here shows up in the admin API', async () => {
    const created = await s.call('POST', '/api/bookings', { body: bookingBody() })
    const token = await s.login()
    const detail = await s.call('GET', `/api/admin/bookings/${created.body.reference}`, { token })
    assert.equal(detail.status, 200)
    assert.equal(detail.body.clientName, 'Aisha Khan')
    assert.equal(detail.body.flight, null)
  })
})

describe('POST /api/trip-plans', () => {
  beforeEach(() => TripPlan.deleteMany({}))

  test('saves a plan with dates', async () => {
    const r = await s.call('POST', '/api/trip-plans', { body: tripPlanBody() })
    assert.equal(r.status, 201)
    assert.deepEqual(r.body, { ok: true })
    const saved = await TripPlan.findOne()
    assert.equal(saved.name, 'Bilal Ahmed')
    assert.equal(saved.destination, 'Maldives')
    assert.equal(saved.startDate.toISOString(), `${futureDay(60)}T00:00:00.000Z`)
    assert.deepEqual([...saved.interests], ['Beach', 'Food'])
    assert.equal(saved.travellers.adults, 2)
    assert.equal(saved.phone, '+44 7700 900123')
  })

  test('flexible dates need no dates, and any dates sent are discarded', async () => {
    const r = await s.call('POST', '/api/trip-plans', { body: tripPlanBody({ flexibleDates: true }) })
    assert.equal(r.status, 201)
    const saved = await TripPlan.findOne()
    assert.equal(saved.flexibleDates, true)
    assert.equal(saved.startDate, undefined)
    assert.equal(saved.endDate, undefined)
    const bare = await s.call('POST', '/api/trip-plans', { body: tripPlanBody({ flexibleDates: true, startDate: undefined, endDate: undefined }) })
    assert.equal(bare.status, 201)
  })

  test('phone is optional', async () => {
    const r = await s.call('POST', '/api/trip-plans', { body: tripPlanBody({ phone: '' }) })
    assert.equal(r.status, 201)
    assert.equal((await TripPlan.findOne()).phone, undefined)
  })

  const invalid = {
    'no dates and not flexible': () => tripPlanBody({ startDate: undefined, endDate: undefined }),
    'return before departure': () => tripPlanBody({ startDate: futureDay(60), endDate: futureDay(50) }),
    'past departure': () => tripPlanBody({ startDate: '2020-01-01', endDate: futureDay(5) }),
    'missing email': () => tripPlanBody({ email: undefined }),
    'missing name': () => tripPlanBody({ name: '' }),
    'no interests': () => tripPlanBody({ interests: [] }),
    'too many interests': () => tripPlanBody({ interests: Array.from({ length: 11 }, (_, i) => `I${i}`) }),
    'interests not an array': () => tripPlanBody({ interests: 'Beach' }),
    'bad phone': () => tripPlanBody({ phone: 'call me maybe' }),
    'zero adults': () => tripPlanBody({ travellers: { adults: 0 } }),
    'missing budget': () => tripPlanBody({ budget: '' }),
  }
  for (const [name, make] of Object.entries(invalid)) {
    test(`rejects ${name}`, async () => {
      const r = await s.call('POST', '/api/trip-plans', { body: make() })
      assert.equal(r.status, 400, JSON.stringify(r.body))
      assert.equal(await TripPlan.countDocuments(), 0)
    })
  }
})

describe('POST /api/contact', () => {
  beforeEach(() => ContactMessage.deleteMany({}))

  test('saves a message (empty phone is dropped)', async () => {
    const r = await s.call('POST', '/api/contact', { body: contactBody() })
    assert.equal(r.status, 201)
    const saved = await ContactMessage.findOne()
    assert.equal(saved.name, 'Chloe Dupont')
    assert.equal(saved.topic, 'Visa assistance')
    assert.equal(saved.phone, undefined)
    assert.equal(saved.message, 'Could you help with a Schengen visa?')
  })

  const invalid = {
    'short message': () => contactBody({ message: 'hi' }),
    'huge message': () => contactBody({ message: 'x'.repeat(3001) }),
    'bad email': () => contactBody({ email: 'chloe@' }),
    'missing name': () => contactBody({ name: undefined }),
    'message as an object': () => contactBody({ message: { $gt: '' } }),
  }
  for (const [name, make] of Object.entries(invalid)) {
    test(`rejects ${name}`, async () => {
      const r = await s.call('POST', '/api/contact', { body: make() })
      assert.equal(r.status, 400, JSON.stringify(r.body))
      assert.equal(await ContactMessage.countDocuments(), 0)
    })
  }
})

describe('POST /api/newsletter', () => {
  beforeEach(() => NewsletterSubscriber.deleteMany({}))

  test('subscribes, lower-casing the address', async () => {
    const r = await s.call('POST', '/api/newsletter', { body: { email: ' Traveller@Example.TEST ' } })
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true })
    assert.deepEqual((await NewsletterSubscriber.find()).map((x) => x.email), ['traveller@example.test'])
  })

  test('signing up again (any case) succeeds identically and creates no duplicate', async () => {
    const first = await s.call('POST', '/api/newsletter', { body: { email: 'a@example.test' } })
    const again = await s.call('POST', '/api/newsletter', { body: { email: 'A@EXAMPLE.TEST' } })
    assert.deepEqual([again.status, again.body], [first.status, first.body])
    assert.equal(await NewsletterSubscriber.countDocuments(), 1)
  })

  test('many simultaneous identical signups all succeed with one record', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, () => s.call('POST', '/api/newsletter', { body: { email: 'race@example.test' } })))
    assert.deepEqual(results.map((r) => r.status), Array(8).fill(200))
    assert.equal(await NewsletterSubscriber.countDocuments(), 1)
  })

  for (const [name, body] of Object.entries({
    'invalid email': { email: 'nope' },
    'missing email': {},
    'email as an object': { email: { $ne: null } },
    'email too long': { email: `${'a'.repeat(250)}@example.test` },
  })) {
    test(`rejects ${name}`, async () => {
      const r = await s.call('POST', '/api/newsletter', { body })
      assert.equal(r.status, 400)
      assert.equal(await NewsletterSubscriber.countDocuments(), 0)
    })
  }
})

describe('public endpoint hardening', () => {
  test('helmet security headers are set', async () => {
    const r = await s.call('POST', '/api/newsletter', { body: { email: 'h@example.test' } })
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff')
    assert.ok(r.headers.get('strict-transport-security'))
    assert.equal(r.headers.get('x-powered-by'), null)
  })

  test('CORS preflight for a form POST is allowed from the frontend origin only', async () => {
    const preflight = (origin) =>
      s.call('OPTIONS', '/api/bookings', {
        headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
      })
    const ok = await preflight('https://frontend.test')
    assert.equal(ok.status, 204)
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://frontend.test')
    assert.equal((await preflight('https://evil.test')).headers.get('access-control-allow-origin'), null)
  })

  test('there is no public way to read data: GET on the form URLs is 404', async () => {
    for (const path of ['/api/bookings', '/api/trip-plans', '/api/contact', '/api/newsletter']) {
      assert.equal((await s.call('GET', path)).status, 404, path)
    }
  })

  test('each endpoint is rate limited separately, per hour', async () => {
    const limited = await listen({ publicRateLimit: 2 })
    try {
      const news = (n) => limited.call('POST', '/api/newsletter', { body: { email: `n${n}@example.test` } })
      // (validation failures count too: the limiter runs before the handler)
      assert.deepEqual([(await news(1)).status, (await news(2)).status, (await news(3)).status], [200, 200, 429])
      const blocked = await news(4)
      assert.equal(blocked.status, 429)
      assert.equal(blocked.body.error, 'Too many requests, please try again later')
      assert.ok(blocked.headers.get('retry-after'))
      // the newsletter limit does not use up the contact form's allowance
      const contact = await limited.call('POST', '/api/contact', { body: contactBody() })
      assert.equal(contact.status, 201)
    } finally {
      await limited.close()
    }
  })
})
