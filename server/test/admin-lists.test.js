import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { Booking, BOOKING_STATUSES } from '../src/models/Booking.js'
import { TripPlan } from '../src/models/TripPlan.js'
import { ContactMessage } from '../src/models/ContactMessage.js'
import { NewsletterSubscriber } from '../src/models/NewsletterSubscriber.js'
import { sampleBooking, startServer } from './helpers.js'

let s
let token

before(async () => {
  s = await startServer()
  token = await s.login()
})
after(() => s.stop())

const day = (iso) => new Date(`${iso}T00:00:00Z`)

describe('GET /api/admin/bookings/stats', () => {
  before(() => Booking.deleteMany({}))

  test('requires auth', async () => {
    assert.equal((await s.call('GET', '/api/admin/bookings/stats')).status, 401)
  })

  test('is all zeros (with every status present) when there are no bookings', async () => {
    const r = await s.call('GET', '/api/admin/bookings/stats', { token })
    assert.equal(r.status, 200)
    assert.equal(r.body.total, 0)
    assert.deepEqual(Object.keys(r.body.byStatus), BOOKING_STATUSES)
    assert.ok(Object.values(r.body.byStatus).every((n) => n === 0))
  })

  test('counts bookings per status, ignoring any list filters', async () => {
    await Booking.create(sampleBooking())
    await Booking.create(sampleBooking())
    await Booking.create(sampleBooking({ status: 'Confirmed' }))
    await Booking.create(sampleBooking({ status: 'Cancelled' }))
    const r = await s.call('GET', '/api/admin/bookings/stats?status=Confirmed&search=zzz', { token })
    assert.equal(r.body.total, 4)
    assert.equal(r.body.byStatus.Received, 2)
    assert.equal(r.body.byStatus.Confirmed, 1)
    assert.equal(r.body.byStatus.Cancelled, 1)
    assert.equal(r.body.byStatus['Under Review'], 0)
  })

  test('/stats is not mistaken for a booking id', async () => {
    const r = await s.call('GET', '/api/admin/bookings/stats', { token })
    assert.equal(r.body.error, undefined)
  })
})

describe('bookings travel-date filter', () => {
  before(async () => {
    await Booking.deleteMany({})
    for (const [name, date] of [['Early', '2026-10-01'], ['Mid', '2026-10-15'], ['Late', '2026-11-01']]) {
      await Booking.create(sampleBooking({ clientName: name, travelDate: day(date) }))
    }
  })
  const names = async (qs) => (await s.call('GET', `/api/admin/bookings?sort=travelDate&${qs}`, { token })).body.data?.map((b) => b.clientName)

  test('from only', async () => assert.deepEqual(await names('travelFrom=2026-10-15'), ['Mid', 'Late']))
  test('to only', async () => assert.deepEqual(await names('travelTo=2026-10-15'), ['Early', 'Mid']))
  test('both ends are inclusive', async () => assert.deepEqual(await names('travelFrom=2026-10-01&travelTo=2026-10-15'), ['Early', 'Mid']))
  test('a single day', async () => assert.deepEqual(await names('travelFrom=2026-10-15&travelTo=2026-10-15'), ['Mid']))
  test('a range with nothing in it', async () => assert.deepEqual(await names('travelFrom=2027-01-01'), []))
  test('empty values (an untouched date input) mean no limit', async () => assert.deepEqual(await names('travelFrom=&travelTo='), ['Early', 'Mid', 'Late']))
  test('combines with status and search', async () => {
    assert.deepEqual(await names('travelFrom=2026-10-15&search=late'), ['Late'])
    assert.deepEqual(await names('travelFrom=2026-10-15&status=Confirmed'), [])
  })

  for (const [name, qs] of Object.entries({
    'wrong format': 'travelFrom=15/10/2026',
    'not a real day': 'travelFrom=2026-02-30',
    'end before start': 'travelFrom=2026-11-01&travelTo=2026-10-01',
  })) {
    test(`rejects ${name} with 400`, async () => {
      const r = await s.call('GET', `/api/admin/bookings?${qs}`, { token })
      assert.equal(r.status, 400)
      assert.equal(r.body.error, 'Validation failed')
    })
  }
})

describe('inbox lists', () => {
  const endpoints = {
    '/api/admin/trip-plans': {
      Model: TripPlan,
      make: (i, extra = {}) => ({ name: `Planner ${i}`, email: `plan${i}@example.test`, destination: 'Maldives', travellers: { adults: 2 }, budget: '$3,000 – $5,000', hotel: 'Luxury 5★', interests: ['Beach'], ...extra }),
      searchHit: { destination: 'Santorini' },
      term: 'santor',
    },
    '/api/admin/contact-messages': {
      Model: ContactMessage,
      make: (i, extra = {}) => ({ name: `Sender ${i}`, email: `msg${i}@example.test`, topic: 'Visa assistance', message: `Hello, this is message number ${i}`, ...extra }),
      searchHit: { message: 'Do you arrange honeymoon packages to Bali?' },
      term: 'honeymoon',
    },
    '/api/admin/newsletter-subscribers': {
      Model: NewsletterSubscriber,
      make: (i, extra = {}) => ({ email: `sub${i}@example.test`, ...extra }),
      searchHit: { email: 'findme@example.test' },
      term: 'findme',
    },
  }

  for (const [path, { Model, make, searchHit, term }] of Object.entries(endpoints)) {
    describe(path, () => {
      before(async () => {
        await Model.deleteMany({})
        for (let i = 1; i <= 5; i++) {
          await Model.create(make(i))
          await new Promise((r) => setTimeout(r, 5)) // distinct createdAt so ordering is deterministic
        }
        await Model.create(make(6, searchHit))
      })

      test('requires auth', async () => {
        assert.equal((await s.call('GET', path)).status, 401)
        assert.equal((await s.call('GET', path, { token: 'garbage' })).status, 401)
      })

      test('lists newest first, in the same envelope as bookings, with id instead of _id', async () => {
        const r = await s.call('GET', path, { token })
        assert.equal(r.status, 200)
        assert.equal(r.body.total, 6)
        assert.equal(r.body.page, 1)
        assert.equal(r.body.limit, 20)
        assert.equal(r.body.pages, 1)
        assert.equal(r.body.data.length, 6)
        const times = r.body.data.map((d) => Date.parse(d.createdAt))
        assert.deepEqual(times, [...times].sort((a, b) => b - a))
        assert.ok(r.body.data[0].id)
        assert.equal(r.body.data[0]._id, undefined)
        assert.equal(r.body.data[0].__v, undefined)
      })

      test('paginates', async () => {
        const p1 = await s.call('GET', `${path}?limit=4&page=1`, { token })
        const p2 = await s.call('GET', `${path}?limit=4&page=2`, { token })
        assert.equal(p1.body.data.length, 4)
        assert.equal(p2.body.data.length, 2)
        assert.equal(p1.body.pages, 2)
        const ids = [...p1.body.data, ...p2.body.data].map((d) => d.id)
        assert.equal(new Set(ids).size, 6, 'no record repeated or missing across pages')
      })

      test('searches case-insensitively', async () => {
        const r = await s.call('GET', `${path}?search=${encodeURIComponent(term.toUpperCase())}`, { token })
        assert.equal(r.body.total, 1)
      })

      test('search treats regex characters literally', async () => {
        assert.equal((await s.call('GET', `${path}?search=${encodeURIComponent('.*')}`, { token })).body.total, 0)
        assert.equal((await s.call('GET', `${path}?search=${encodeURIComponent('(')}`, { token })).status, 200)
      })

      test('rejects a bad limit or page', async () => {
        assert.equal((await s.call('GET', `${path}?limit=101`, { token })).status, 400)
        assert.equal((await s.call('GET', `${path}?page=0`, { token })).status, 400)
      })
    })
  }

  test('unknown admin paths are 404 for a logged-in admin and 401 otherwise', async () => {
    assert.equal((await s.call('GET', '/api/admin/nope', { token })).status, 404)
    assert.equal((await s.call('GET', '/api/admin/nope')).status, 401)
  })
})
