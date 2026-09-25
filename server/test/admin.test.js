import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { Booking } from '../src/models/Booking.js'
import { ADMIN, listen, sampleBooking, sampleFlight, startServer, testConfig } from './helpers.js'

let s
let token

before(async () => {
  s = await startServer()
  token = await s.login()
})
after(() => s.stop())

describe('health + errors', () => {
  test('GET /api/health is public', async () => {
    const r = await s.call('GET', '/api/health')
    assert.equal(r.status, 200)
    assert.deepEqual(r.body, { ok: true, db: true })
  })

  test('unknown route returns JSON 404', async () => {
    const r = await s.call('GET', '/api/nope')
    assert.equal(r.status, 404)
    assert.equal(r.body.error, 'Not found')
  })

  test('malformed JSON returns 400, not 500', async () => {
    const res = await fetch(s.base + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email": ',
    })
    assert.equal(res.status, 400)
  })

  test('CORS allows the configured frontend origin only', async () => {
    const ok = await s.call('GET', '/api/health', { headers: { Origin: 'https://frontend.test' } })
    assert.equal(ok.headers.get('access-control-allow-origin'), 'https://frontend.test')
    const bad = await s.call('GET', '/api/health', { headers: { Origin: 'https://evil.test' } })
    assert.equal(bad.headers.get('access-control-allow-origin'), null)
  })
})

describe('admin auth', () => {
  test('login succeeds with correct credentials (email is case-insensitive)', async () => {
    const r = await s.call('POST', '/api/admin/login', {
      body: { email: ADMIN.email.toUpperCase(), password: ADMIN.password },
    })
    assert.equal(r.status, 200)
    const payload = jwt.verify(r.body.token, testConfig().jwtSecret)
    assert.equal(payload.role, 'admin')
    assert.equal(payload.sub, ADMIN.email)
  })

  test('wrong password and wrong email both give the same 401', async () => {
    const a = await s.call('POST', '/api/admin/login', { body: { email: ADMIN.email, password: 'nope' } })
    const b = await s.call('POST', '/api/admin/login', { body: { email: 'other@x.test', password: ADMIN.password } })
    assert.equal(a.status, 401)
    assert.equal(b.status, 401)
    assert.deepEqual(a.body, b.body)
  })

  test('login validates input', async () => {
    const r = await s.call('POST', '/api/admin/login', { body: { email: 'not-an-email' } })
    assert.equal(r.status, 400)
    assert.equal(r.body.error, 'Validation failed')
  })

  test('login is rate limited', async () => {
    const limited = await listen({ loginRateLimit: 3 })
    try {
      const statuses = []
      for (let i = 0; i < 5; i++) {
        statuses.push((await limited.call('POST', '/api/admin/login', { body: { email: ADMIN.email, password: 'bad' } })).status)
      }
      assert.deepEqual(statuses, [401, 401, 401, 429, 429])
    } finally {
      await limited.close()
    }
  })

  test('successful logins do not use up the attempt limit; failures still do', async () => {
    const limited = await listen({ loginRateLimit: 3 })
    try {
      const good = () => limited.call('POST', '/api/admin/login', { body: ADMIN })
      const bad = () => limited.call('POST', '/api/admin/login', { body: { email: ADMIN.email, password: 'bad' } })
      const goods = []
      for (let i = 0; i < 6; i++) goods.push((await good()).status)
      assert.deepEqual(goods, Array(6).fill(200))
      assert.deepEqual([(await bad()).status, (await bad()).status, (await bad()).status, (await bad()).status], [401, 401, 401, 429])
    } finally {
      await limited.close()
    }
  })

  test('GET /me works with a valid token', async () => {
    const r = await s.call('GET', '/api/admin/me', { token })
    assert.equal(r.status, 200)
    assert.equal(r.body.email, ADMIN.email)
  })

  const secret = testConfig().jwtSecret
  const rejected = {
    'no token': undefined,
    'garbage token': 'not.a.jwt',
    'signed with another secret': jwt.sign({ role: 'admin' }, 'y'.repeat(40)),
    expired: jwt.sign({ role: 'admin' }, secret, { expiresIn: -10 }),
    'alg none': `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"role":"admin"}').toString('base64url')}.`,
  }
  for (const [name, bad] of Object.entries(rejected)) {
    test(`admin routes reject: ${name}`, async () => {
      const r = await s.call('GET', '/api/admin/bookings', { token: bad })
      assert.equal(r.status, 401)
    })
  }

  test('a validly signed token without the admin role is 403', async () => {
    const r = await s.call('GET', '/api/admin/bookings', { token: jwt.sign({ role: 'customer' }, secret) })
    assert.equal(r.status, 403)
  })
})

describe('bookings list + detail', () => {
  let a, b, c
  before(async () => {
    await Booking.deleteMany({})
    a = await Booking.create(sampleBooking({ clientName: 'Aisha Khan', destination: 'Dubai' }))
    b = await Booking.create(sampleBooking({ clientName: 'Bilal Ahmed', destination: 'Maldives', status: 'Confirmed', travelDate: new Date('2026-09-01T00:00:00Z') }))
    c = await Booking.create(sampleBooking({ clientName: 'Chloe (VIP) Dupont', destination: 'Paris' }))
  })

  test('lists all, newest first, without statusHistory', async () => {
    const r = await s.call('GET', '/api/admin/bookings', { token })
    assert.equal(r.status, 200)
    assert.equal(r.body.total, 3)
    assert.equal(r.body.data[0].reference, c.reference)
    assert.equal(r.body.data[0].statusHistory, undefined)
    assert.equal(r.body.data[0].id, String(c._id))
    assert.equal(r.body.data[0]._id, undefined)
    assert.equal(r.body.data[0].__v, undefined)
  })

  test('filters by status', async () => {
    const r = await s.call('GET', '/api/admin/bookings?status=Confirmed', { token })
    assert.deepEqual(r.body.data.map((x) => x.clientName), ['Bilal Ahmed'])
  })

  test('rejects an unknown status filter', async () => {
    const r = await s.call('GET', '/api/admin/bookings?status=Bogus', { token })
    assert.equal(r.status, 400)
  })

  test('searches name, reference and destination, case-insensitively', async () => {
    const byName = await s.call('GET', '/api/admin/bookings?search=aisha', { token })
    assert.deepEqual(byName.body.data.map((x) => x.clientName), ['Aisha Khan'])
    const byRef = await s.call('GET', `/api/admin/bookings?search=${b.reference.toLowerCase()}`, { token })
    assert.deepEqual(byRef.body.data.map((x) => x.clientName), ['Bilal Ahmed'])
    const byDest = await s.call('GET', '/api/admin/bookings?search=maldiv', { token })
    assert.equal(byDest.body.total, 1)
  })

  test('search treats regex characters literally', async () => {
    const literal = await s.call('GET', '/api/admin/bookings?search=' + encodeURIComponent('(VIP)'), { token })
    assert.deepEqual(literal.body.data.map((x) => x.clientName), ['Chloe (VIP) Dupont'])
    const wildcard = await s.call('GET', '/api/admin/bookings?search=' + encodeURIComponent('.*'), { token })
    assert.equal(wildcard.body.total, 0)
  })

  test('sorts by travel date and paginates', async () => {
    const r = await s.call('GET', '/api/admin/bookings?sort=travelDate&limit=2&page=1', { token })
    assert.equal(r.body.data[0].clientName, 'Bilal Ahmed')
    assert.equal(r.body.data.length, 2)
    assert.equal(r.body.pages, 2)
    const page2 = await s.call('GET', '/api/admin/bookings?sort=travelDate&limit=2&page=2', { token })
    assert.equal(page2.body.data.length, 1)
  })

  test('rejects an out-of-range limit', async () => {
    const r = await s.call('GET', '/api/admin/bookings?limit=1000', { token })
    assert.equal(r.status, 400)
  })

  test('detail by id and by reference (any case), includes status history and flight: null', async () => {
    const byId = await s.call('GET', `/api/admin/bookings/${a._id}`, { token })
    assert.equal(byId.status, 200)
    assert.equal(byId.body.reference, a.reference)
    assert.equal(byId.body.flight, null)
    assert.deepEqual(byId.body.statusHistory.map((h) => h.status), ['Received'])
    const byRef = await s.call('GET', `/api/admin/bookings/${a.reference.toLowerCase()}`, { token })
    assert.equal(byRef.status, 200)
    assert.equal(byRef.body.id, String(a._id))
  })

  test('unknown id, unknown reference and junk all give 404', async () => {
    for (const id of ['64b7f0c2a1b2c3d4e5f60718', 'FT-ZZZZZZZ', 'garbage']) {
      const r = await s.call('GET', `/api/admin/bookings/${id}`, { token })
      assert.equal(r.status, 404, id)
    }
  })
})

describe('status changes', () => {
  let booking
  before(async () => {
    booking = await Booking.create(sampleBooking())
  })

  test('updates status and appends to statusHistory with the note', async () => {
    const r = await s.call('PATCH', `/api/admin/bookings/${booking._id}/status`, {
      token,
      body: { status: 'Under Review', note: '  Checking availability  ' },
    })
    assert.equal(r.status, 200)
    assert.equal(r.body.status, 'Under Review')
    assert.deepEqual(r.body.statusHistory.map((h) => h.status), ['Received', 'Under Review'])
    assert.equal(r.body.statusHistory[1].note, 'Checking availability')
    assert.ok(!Number.isNaN(Date.parse(r.body.statusHistory[1].changedAt)))
  })

  test('works by reference and note is optional', async () => {
    const r = await s.call('PATCH', `/api/admin/bookings/${booking.reference}/status`, { token, body: { status: 'Confirmed' } })
    assert.equal(r.status, 200)
    assert.equal(r.body.statusHistory.at(-1).note, undefined)
  })

  test('same status again is 409 and adds no history', async () => {
    const r = await s.call('PATCH', `/api/admin/bookings/${booking._id}/status`, { token, body: { status: 'Confirmed' } })
    assert.equal(r.status, 409)
    const detail = await s.call('GET', `/api/admin/bookings/${booking._id}`, { token })
    assert.equal(detail.body.statusHistory.length, 3)
  })

  test('two simultaneous identical updates: exactly one wins', async () => {
    const fresh = await Booking.create(sampleBooking())
    const send = () => s.call('PATCH', `/api/admin/bookings/${fresh._id}/status`, { token, body: { status: 'Cancelled' } })
    const results = await Promise.all([send(), send(), send()])
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409, 409])
    assert.equal((await Booking.findById(fresh._id)).statusHistory.length, 2)
  })

  test('rejects an invalid status and a missing status', async () => {
    const bad = await s.call('PATCH', `/api/admin/bookings/${booking._id}/status`, { token, body: { status: 'Flying' } })
    assert.equal(bad.status, 400)
    const missing = await s.call('PATCH', `/api/admin/bookings/${booking._id}/status`, { token, body: {} })
    assert.equal(missing.status, 400)
  })

  test('unknown booking is 404', async () => {
    const r = await s.call('PATCH', '/api/admin/bookings/FT-ZZZZZZZ/status', { token, body: { status: 'Confirmed' } })
    assert.equal(r.status, 404)
  })
})

describe('flight details', () => {
  let booking
  before(async () => {
    booking = await Booking.create(sampleBooking())
  })
  const url = () => `/api/admin/bookings/${booking._id}/flight`

  test('GET before any flight is 404', async () => {
    assert.equal((await s.call('GET', url(), { token })).status, 404)
  })

  test('PUT creates (201), converting local times to UTC and normalising values', async () => {
    const r = await s.call('PUT', url(), { token, body: sampleFlight() })
    assert.equal(r.status, 201)
    assert.equal(r.body.flightNumber, 'EK 511')
    assert.equal(r.body.pnr, 'ABC123')
    assert.equal(String(r.body.booking), String(booking._id))
    // Mumbai 04:30 IST (+5:30) = 23:00Z the day before; Dubai 06:15 GST (+4) = 02:15Z
    assert.equal(r.body.departure.at, '2026-10-11T23:00:00.000Z')
    assert.equal(r.body.arrival.at, '2026-10-12T02:15:00.000Z')
    assert.equal(r.body.departure.timezone, 'Asia/Kolkata')
    // local wall-clock time round-trips for the admin UI
    assert.equal(r.body.departure.localDateTime, '2026-10-12T04:30')
    assert.equal(r.body.arrival.localDateTime, '2026-10-12T06:15')
  })

  test('PUT again updates the same record (200) and does not duplicate', async () => {
    const r = await s.call('PUT', url(), { token, body: sampleFlight({ pnr: 'XYZ789', flightNumber: 'EK512' }) })
    assert.equal(r.status, 200)
    assert.equal(r.body.pnr, 'XYZ789')
    assert.equal(r.body.flightNumber, 'EK512')
    const { FlightDetails } = await import('../src/models/FlightDetails.js')
    assert.equal(await FlightDetails.countDocuments({ booking: booking._id }), 1)
  })

  test('GET returns it and the booking detail embeds it', async () => {
    const r = await s.call('GET', url(), { token })
    assert.equal(r.status, 200)
    assert.equal(r.body.airline, 'Emirates')
    const detail = await s.call('GET', `/api/admin/bookings/${booking._id}`, { token })
    assert.equal(detail.body.flight.pnr, 'XYZ789')
    assert.equal(detail.body.flight.departure.at, '2026-10-11T23:00:00.000Z')
  })

  test('daylight saving is applied (New York EDT vs EST)', async () => {
    const summer = await s.call('PUT', url(), {
      token,
      body: sampleFlight({
        departure: { city: 'New York', airport: 'JFK', localDateTime: '2026-07-01T12:00', timezone: 'America/New_York' },
        arrival: { city: 'London', airport: 'LHR', localDateTime: '2026-07-02T00:30', timezone: 'Europe/London' },
      }),
    })
    assert.equal(summer.body.departure.at, '2026-07-01T16:00:00.000Z') // EDT = UTC-4
    assert.equal(summer.body.arrival.at, '2026-07-01T23:30:00.000Z') // BST = UTC+1
    const winter = await s.call('PUT', url(), {
      token,
      body: sampleFlight({
        departure: { city: 'New York', airport: 'JFK', localDateTime: '2026-12-01T12:00', timezone: 'America/New_York' },
        arrival: { city: 'London', airport: 'LHR', localDateTime: '2026-12-02T00:30', timezone: 'Europe/London' },
      }),
    })
    assert.equal(winter.body.departure.at, '2026-12-01T17:00:00.000Z') // EST = UTC-5
    assert.equal(winter.body.arrival.at, '2026-12-02T00:30:00.000Z') // GMT
  })

  const invalid = {
    'invalid IANA timezone': () => sampleFlight({ arrival: { ...sampleFlight().arrival, timezone: 'Dubai' } }),
    'timezone that is a UTC offset': () => sampleFlight({ arrival: { ...sampleFlight().arrival, timezone: '+04:00' } }),
    'local time that does not exist (DST gap)': () =>
      sampleFlight({ departure: { city: 'New York', airport: 'JFK', localDateTime: '2026-03-08T02:30', timezone: 'America/New_York' } }),
    'datetime with a Z suffix': () => sampleFlight({ departure: { ...sampleFlight().departure, localDateTime: '2026-10-12T04:30Z' } }),
    'impossible date': () => sampleFlight({ departure: { ...sampleFlight().departure, localDateTime: '2026-02-30T04:30' } }),
    'arrival before departure': () => sampleFlight({ arrival: { ...sampleFlight().arrival, localDateTime: '2026-10-12T00:15' } }),
    'arrival equal to departure in UTC': () => sampleFlight({ arrival: { ...sampleFlight().arrival, localDateTime: '2026-10-12T03:00' } }),
    'bad PNR': () => sampleFlight({ pnr: 'A-1' }),
    'bad flight number': () => sampleFlight({ flightNumber: 'Emirates' }),
    'missing airline': () => ({ ...sampleFlight(), airline: undefined }),
    'unknown extra field': () => ({ ...sampleFlight(), booking: '64b7f0c2a1b2c3d4e5f60718' }),
  }
  for (const [name, make] of Object.entries(invalid)) {
    test(`PUT rejects ${name}`, async () => {
      const before = await s.call('GET', url(), { token })
      const r = await s.call('PUT', url(), { token, body: make() })
      assert.equal(r.status, 400, JSON.stringify(r.body))
      assert.equal(r.body.error, 'Validation failed')
      const after = await s.call('GET', url(), { token })
      assert.deepEqual(after.body, before.body, 'record must be unchanged')
    })
  }

  test('PUT on an unknown booking is 404', async () => {
    const r = await s.call('PUT', '/api/admin/bookings/FT-ZZZZZZZ/flight', { token, body: sampleFlight() })
    assert.equal(r.status, 404)
  })

  test('flight routes require auth', async () => {
    assert.equal((await s.call('PUT', url(), { body: sampleFlight() })).status, 401)
    assert.equal((await s.call('DELETE', url())).status, 401)
  })

  test('DELETE removes it (204), then GET and DELETE are 404', async () => {
    assert.equal((await s.call('DELETE', url(), { token })).status, 204)
    assert.equal((await s.call('GET', url(), { token })).status, 404)
    assert.equal((await s.call('DELETE', url(), { token })).status, 404)
    const detail = await s.call('GET', `/api/admin/bookings/${booking._id}`, { token })
    assert.equal(detail.body.flight, null)
  })
})
