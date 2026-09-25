import { after, before, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { Booking } from '../src/models/Booking.js'
import { NotificationLog } from '../src/models/NotificationLog.js'
import { createNotifications, MAX_ATTEMPTS } from '../src/notify/service.js'
import { WHATSAPP_TEMPLATES } from '../src/notify/templates.js'
import { captureLogger, sampleBooking, startServer, testNotify } from './helpers.js'

let s

before(async () => {
  s = await startServer()
})
after(() => s.stop())
beforeEach(async () => {
  await Promise.all([Booking.deleteMany({}), NotificationLog.deleteMany({})])
})

// Transports that record what they were asked to send. Override `email` / `whatsapp` to make one misbehave.
const fakeTransports = (overrides = {}) => {
  const sent = { email: [], whatsapp: [] }
  const channel = (name, custom = {}) => ({
    ready: true,
    missing: [],
    send: async (message) => {
      sent[name].push(message)
      return { id: `${name}-${sent[name].length}` }
    },
    ...custom,
  })
  return { sent, email: channel('email', overrides.email), whatsapp: channel('whatsapp', overrides.whatsapp) }
}
const service = ({ mode = 'live', notify = {}, transports = fakeTransports() } = {}) => {
  const logger = captureLogger()
  return { transports, logger, svc: createNotifications({ notify: testNotify({ mode, ...notify }), transports, logger }) }
}
const outcomes = (results) => Object.fromEntries(results.map((r) => [`${r.type}/${r.channel}`, r.outcome]))
const rows = async () => Object.fromEntries((await NotificationLog.find()).map((r) => [`${r.type}/${r.channel}`, r]))
const fails = (n, message = 'boom') => {
  let calls = 0
  return { send: async () => { calls += 1; if (calls <= n) throw new Error(message); return { id: 'ok-after-failures' } } }
}

describe('a new booking', () => {
  test('sends the client an email and a WhatsApp, and the agency an alert, and records each one', async () => {
    const { svc, transports } = service()
    const booking = await Booking.create(sampleBooking({ email: 'aisha@example.test', whatsappNumber: '+911234567890' }))
    const result = await svc.bookingCreated(booking)

    assert.deepEqual(outcomes(result), { 'booking_confirmation/email': 'sent', 'booking_confirmation/whatsapp': 'sent', 'agency_alert/email': 'sent' })
    // sent in parallel, so find each by who it went to rather than by position
    const clientEmail = transports.sent.email.find((m) => m.to === 'aisha@example.test')
    const agencyEmail = transports.sent.email.find((m) => m.to === 'agency@fatimatravels.test')
    assert.equal(transports.sent.email.length, 2)
    assert.equal(clientEmail.replyTo, 'agency@fatimatravels.test') // replies reach the agency, not the no-reply sender
    assert.match(clientEmail.subject, new RegExp(booking.reference))
    assert.equal(agencyEmail.to, 'agency@fatimatravels.test')
    assert.match(agencyEmail.subject, /New booking/)
    assert.equal(transports.sent.whatsapp.length, 1)
    assert.equal(transports.sent.whatsapp[0].to, '+911234567890')
    assert.equal(transports.sent.whatsapp[0].template, WHATSAPP_TEMPLATES.booking_confirmation)
    assert.equal(transports.sent.whatsapp[0].params[1], booking.reference)

    const log = await rows()
    assert.equal(Object.keys(log).length, 3)
    for (const row of Object.values(log)) {
      assert.equal(row.status, 'sent')
      assert.equal(row.mode, 'live')
      assert.equal(row.attempts, 1)
      assert.ok(row.providerId)
      assert.ok(row.sentAt)
      assert.equal(String(row.booking), String(booking._id))
    }
    assert.equal(log['booking_confirmation/email'].recipient, 'aisha@example.test')
    assert.equal(log['booking_confirmation/whatsapp'].recipient, '+911234567890')
    assert.equal(log['agency_alert/email'].recipient, 'agency@fatimatravels.test')
  })

  test('running it again, even many times at once, never sends anything twice', async () => {
    const { svc, transports } = service()
    const booking = await Booking.create(sampleBooking())
    const runs = await Promise.all(Array.from({ length: 6 }, () => svc.bookingCreated(booking)))
    const sentCounts = runs.flat().filter((r) => r.outcome === 'sent').length
    assert.equal(sentCounts, 3)
    assert.equal(transports.sent.email.length, 2)
    assert.equal(transports.sent.whatsapp.length, 1)

    const again = await svc.bookingCreated(booking)
    assert.ok(again.every((r) => r.outcome === 'duplicate'))
    assert.equal(transports.sent.email.length + transports.sent.whatsapp.length, 3)
    assert.equal(await NotificationLog.countDocuments(), 3)
  })

  test('WhatsApp is skipped, and recorded as skipped, without consent or after opt-out; email still goes', async () => {
    for (const [overrides, reason] of [
      [{ whatsappConsent: false }, /did not agree/],
      [{ optedOut: true }, /opted out/],
    ]) {
      await Promise.all([Booking.deleteMany({}), NotificationLog.deleteMany({})])
      const { svc, transports } = service()
      const booking = await Booking.create(sampleBooking(overrides))
      const result = await svc.bookingCreated(booking)
      assert.equal(outcomes(result)['booking_confirmation/whatsapp'], 'skipped')
      assert.equal(outcomes(result)['booking_confirmation/email'], 'sent')
      assert.equal(transports.sent.whatsapp.length, 0)
      const row = (await rows())['booking_confirmation/whatsapp']
      assert.equal(row.status, 'skipped')
      assert.match(row.error, reason)
    }
  })

  test('without AGENCY_EMAIL the alert is skipped and the client is still looked after', async () => {
    const { svc, transports } = service({ notify: { agencyEmail: undefined } })
    const result = await svc.bookingCreated(await Booking.create(sampleBooking()))
    assert.equal(outcomes(result)['agency_alert/email'], 'skipped')
    assert.equal(transports.sent.email.length, 1)
    assert.equal(transports.sent.email[0].replyTo, undefined)
  })

  test('one channel failing does not stop the others, and the reason is recorded', async () => {
    const { svc, transports, logger } = service({ transports: fakeTransports({ email: fails(99, 'Resend 403 (validation_error): testing emails only') }) })
    const booking = await Booking.create(sampleBooking())
    const result = await svc.bookingCreated(booking)
    assert.deepEqual(outcomes(result), { 'booking_confirmation/email': 'failed', 'booking_confirmation/whatsapp': 'sent', 'agency_alert/email': 'failed' })
    assert.equal(transports.sent.whatsapp.length, 1)
    const row = (await rows())['booking_confirmation/email']
    assert.equal(row.status, 'failed')
    assert.match(row.error, /testing emails only/)
    assert.equal(row.sentAt, undefined)
    assert.ok(logger.lines.some((l) => /ERROR .*booking_confirmation\/email FAILED: Resend 403/.test(l)))
  })

  test('a channel with missing keys fails with a clear message, and works on retry once the keys are added', async () => {
    const transports = fakeTransports({ whatsapp: { ready: false, missing: ['WHATSAPP_ACCESS_TOKEN'] } })
    const { svc } = service({ transports })
    const booking = await Booking.create(sampleBooking())
    await svc.bookingCreated(booking)
    const row = (await rows())['booking_confirmation/whatsapp']
    assert.equal(row.status, 'failed')
    assert.match(row.error, /whatsapp is not configured \(missing WHATSAPP_ACCESS_TOKEN\)/)

    transports.whatsapp.ready = true // the keys were added
    const retry = await svc.retryFailed()
    assert.deepEqual(retry, { bookings: 1, sent: 1, failed: 0 })
    assert.equal(transports.sent.whatsapp.length, 1)
    assert.equal((await rows())['booking_confirmation/whatsapp'].status, 'sent')
  })
})

describe('retrying', () => {
  test('retryFailed sends only what failed; what already went out is left alone', async () => {
    const { svc, transports } = service({ transports: fakeTransports({ email: fails(2) }) }) // both emails fail once
    const booking = await Booking.create(sampleBooking())
    await svc.bookingCreated(booking)
    assert.equal(transports.sent.whatsapp.length, 1)

    const retry = await svc.retryFailed()
    assert.deepEqual(retry, { bookings: 1, sent: 2, failed: 0 })
    assert.equal(transports.sent.whatsapp.length, 1, 'the WhatsApp that already went out must not be sent again')
    const log = await rows()
    assert.equal(log['booking_confirmation/email'].status, 'sent')
    assert.equal(log['booking_confirmation/email'].attempts, 2)
    assert.equal(log['booking_confirmation/email'].error, null)
    assert.equal(log['booking_confirmation/whatsapp'].attempts, 1)

    assert.deepEqual(await svc.retryFailed(), { bookings: 0, sent: 0, failed: 0 })
  })

  test(`gives up after ${MAX_ATTEMPTS} attempts instead of retrying forever`, async () => {
    let attempts = 0
    const { svc } = service({ transports: fakeTransports({ email: { send: async () => { attempts += 1; throw new Error('still down') } } }) })
    const booking = await Booking.create(sampleBooking())
    await svc.bookingCreated(booking)
    for (let i = 0; i < 5; i++) await svc.retryFailed()
    assert.equal(attempts, MAX_ATTEMPTS * 2) // client email + agency email, MAX_ATTEMPTS each
    const row = (await rows())['booking_confirmation/email']
    assert.equal(row.status, 'failed')
    assert.equal(row.attempts, MAX_ATTEMPTS)
  })

  test('a send that was in progress when the server died is retried, but one still in progress is not', async () => {
    const { svc, transports } = service()
    const booking = await Booking.create(sampleBooking())
    const old = new Date(Date.now() - 60 * 60 * 1000)
    const base = { booking: booking._id, type: 'booking_confirmation', dedupeKey: 'booking_confirmation', mode: 'live', status: 'pending', attempts: 1 }
    await NotificationLog.collection.insertOne({ ...base, channel: 'email', recipient: booking.email, createdAt: old, updatedAt: old }) // stuck for an hour
    await NotificationLog.collection.insertOne({ ...base, channel: 'whatsapp', recipient: booking.whatsappNumber, createdAt: new Date(), updatedAt: new Date() }) // in progress right now

    const result = await svc.bookingCreated(booking)
    const byKey = outcomes(result)
    assert.equal(byKey['booking_confirmation/email'], 'sent')
    assert.equal(byKey['booking_confirmation/whatsapp'], 'duplicate')
    assert.equal(transports.sent.whatsapp.length, 0)
  })
})

describe('log mode versus live mode', () => {
  test('log mode sends nothing anywhere but records everything as a log entry', async () => {
    const { svc, transports } = service({ mode: 'log' })
    const booking = await Booking.create(sampleBooking())
    await svc.bookingCreated(booking)
    for (const row of Object.values(await rows())) {
      assert.equal(row.mode, 'log')
      assert.equal(row.status, 'sent')
      assert.equal(row.attempts, 0)
    }
    assert.equal(transports.sent.email.length + transports.sent.whatsapp.length, 3) // the (fake) log transports were used
  })

  test('messages that were only logged do not stop the real ones once you switch to live', async () => {
    const booking = await Booking.create(sampleBooking())
    await service({ mode: 'log' }).svc.bookingCreated(booking)

    const live = service({ mode: 'live' })
    const result = await live.svc.bookingCreated(booking)
    assert.ok(result.every((r) => r.outcome === 'sent'), JSON.stringify(result))
    assert.equal(live.transports.sent.email.length + live.transports.sent.whatsapp.length, 3)
    for (const row of Object.values(await rows())) {
      assert.equal(row.mode, 'live')
      assert.equal(row.attempts, 1)
      assert.doesNotMatch(row.providerId, /^log-/)
    }
    assert.ok((await live.svc.bookingCreated(booking)).every((r) => r.outcome === 'duplicate'), 'a real send must not be repeated')
  })

  test('going back to log mode never overrides a real send', async () => {
    const booking = await Booking.create(sampleBooking())
    await service({ mode: 'live' }).svc.bookingCreated(booking)
    const logMode = service({ mode: 'log' })
    assert.ok((await logMode.svc.bookingCreated(booking)).every((r) => r.outcome === 'duplicate'))
  })
})

describe('waiting for messages', () => {
  test('idle() resolves only when messages that are still being sent have finished', async () => {
    const slow = { send: async () => { await new Promise((r) => setTimeout(r, 150)); return { id: 'slow' } } }
    const { svc } = service({ transports: fakeTransports({ email: slow, whatsapp: slow }) })
    const booking = await Booking.create(sampleBooking())
    const pending = svc.bookingCreated(booking) // deliberately not awaited
    assert.equal(await NotificationLog.countDocuments({ status: 'sent' }), 0)
    await svc.idle()
    assert.equal(await NotificationLog.countDocuments({ status: 'sent' }), 3)
    await pending
  })
})

describe('booking form to notifications, through the real HTTP API', () => {
  const day = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)
  const body = (overrides = {}) => ({
    clientName: 'Aisha Khan',
    email: 'aisha@example.test',
    whatsappNumber: '+91 12345 67890',
    passportName: 'Aisha Khan',
    packageName: 'Dubai Luxe Escape',
    destination: 'Dubai',
    travelDate: day(30),
    travellers: { adults: 2, children: 0 },
    roomType: 'deluxe',
    estimatedTotal: 4200,
    whatsappConsent: true,
    ...overrides,
  })

  test('a booking triggers the three messages (log mode) and the printed text names the right people', async () => {
    s.logger.lines.length = 0
    const r = await s.call('POST', '/api/bookings', { body: body() })
    assert.equal(r.status, 201)
    await s.notifications.idle()

    const all = s.logger.lines.join('\n')
    assert.match(all, /\[notify:log\] EMAIL[\s\S]*to:       aisha@example\.test/)
    assert.match(all, /\[notify:log\] EMAIL[\s\S]*to:       agency@fatimatravels\.test/)
    assert.match(all, /\[notify:log\] WHATSAPP\n {2}to:       \+911234567890/) // normalised from "+91 12345 67890"
    assert.ok(all.includes(r.body.reference))
    const log = await NotificationLog.find()
    assert.equal(log.length, 3)
    assert.ok(log.every((row) => row.status === 'sent' && row.mode === 'log'))
  })

  test('the visitor is not kept waiting for slow providers', async () => {
    const slow = { send: async () => { await new Promise((r) => setTimeout(r, 1500)); return { id: 'x' } } }
    const { svc } = service({ transports: fakeTransports({ email: slow, whatsapp: slow }) })
    const api = await (await import('./helpers.js')).listen({}, { notifications: svc })
    try {
      const started = Date.now()
      const r = await api.call('POST', '/api/bookings', { body: body() })
      assert.equal(r.status, 201)
      assert.ok(Date.now() - started < 1000, `took ${Date.now() - started} ms`)
      await svc.idle()
      assert.equal(await NotificationLog.countDocuments({ status: 'sent' }), 3)
    } finally {
      await api.close()
    }
  })

  test('a provider failing does not fail the booking; the failure is recorded', async () => {
    const { svc } = service({ transports: fakeTransports({ email: fails(99, 'Resend down'), whatsapp: fails(99, 'Meta down') }) })
    const api = await (await import('./helpers.js')).listen({}, { notifications: svc })
    try {
      const r = await api.call('POST', '/api/bookings', { body: body() })
      assert.equal(r.status, 201)
      assert.match(r.body.reference, /^FT-/)
      await svc.idle()
      assert.equal(await Booking.countDocuments({ reference: r.body.reference }), 1)
      assert.equal(await NotificationLog.countDocuments({ status: 'failed' }), 3)
      assert.equal(JSON.stringify(r.body).includes('down'), false, 'provider errors must not leak to the visitor')
    } finally {
      await api.close()
    }
  })

  test('a rejected booking triggers nothing', async () => {
    const r = await s.call('POST', '/api/bookings', { body: body({ whatsappConsent: false }) })
    assert.equal(r.status, 400)
    await s.notifications.idle()
    assert.equal(await NotificationLog.countDocuments(), 0)
  })
})
