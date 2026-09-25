import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createApp } from '../src/app.js'
import { Booking } from '../src/models/Booking.js'
import { NewsletterSubscriber } from '../src/models/NewsletterSubscriber.js'
import { NotificationLog } from '../src/models/NotificationLog.js'
import { createNotificationSystem } from '../src/notify/index.js'

export const ADMIN = { email: 'owner@fatimatravels.test', password: 'correct horse battery' }

// Collects log lines instead of printing them.
export const captureLogger = () => {
  const lines = []
  return { lines, info: (m) => lines.push(m), error: (m) => lines.push(`ERROR ${m}`) }
}

export const testNotify = (overrides = {}) => ({
  mode: 'log',
  siteUrl: 'https://site.test',
  agencyEmail: 'agency@fatimatravels.test',
  email: { apiKey: undefined, from: 'Fatima Tours and Travels <onboarding@resend.dev>' },
  whatsapp: { phoneNumberId: undefined, accessToken: undefined, apiVersion: 'v23.0', templateLanguage: 'en' },
  ...overrides,
})

export const testConfig = (overrides = {}) => ({
  env: 'test',
  jwtSecret: 'x'.repeat(40),
  jwtExpiresIn: '1h',
  adminEmail: ADMIN.email,
  adminPasswordHash: bcrypt.hashSync(ADMIN.password, 4),
  frontendOrigins: ['https://frontend.test'],
  loginRateLimit: 1000,
  publicRateLimit: 1000,
  notify: testNotify(),
  ...overrides,
})

// HTTP server + JSON client around the real app (no database needed for routes that never touch it).
// `deps.notifications` swaps in a custom notification service; otherwise a real one runs in the config's
// mode (log by default) with a capturing logger, returned as `logger`.
export async function listen(configOverrides, deps = {}) {
  const config = testConfig(configOverrides)
  const logger = captureLogger()
  const system = createNotificationSystem(config, { logger, fetchImpl: deps.fetchImpl })
  const notifications = deps.notifications ?? system.notifications
  const server = createApp(config, { notifications }).listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const base = `http://127.0.0.1:${server.address().port}`

  const call = async (method, path, { body, token, headers } = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await res.text()
    return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null }
  }

  const login = async () => (await call('POST', '/api/admin/login', { body: ADMIN })).body.token
  const close = () => new Promise((resolve) => server.close(resolve))
  return { base, call, login, close, notifications, logger }
}

// One in-memory MongoDB + HTTP server per test file.
export async function startServer(configOverrides, deps) {
  const mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  await Promise.all([Booking.init(), NewsletterSubscriber.init(), NotificationLog.init()]) // unique indexes must exist before tests insert
  const api = await listen(configOverrides, deps)
  const stop = async () => {
    await api.close()
    await mongoose.disconnect()
    await mongod.stop()
  }
  return { ...api, stop }
}

let counter = 0
export const sampleBooking = (overrides = {}) => {
  counter += 1
  return {
    clientName: `Client ${counter}`,
    email: `client${counter}@example.test`,
    whatsappNumber: '+971501234567',
    passportName: `Client Number${counter}`,
    packageName: 'Dubai Luxe Escape',
    destination: 'Dubai',
    travelDate: new Date('2026-10-12T00:00:00Z'),
    travellers: { adults: 2, children: 0 },
    roomType: 'deluxe',
    estimatedTotal: 4200,
    whatsappConsent: true,
    ...overrides,
  }
}

export const sampleFlight = (overrides = {}) => ({
  airline: 'Emirates',
  flightNumber: 'ek 511',
  pnr: 'abc123',
  departure: { city: 'Mumbai', airport: 'BOM', localDateTime: '2026-10-12T04:30', timezone: 'Asia/Kolkata' },
  arrival: { city: 'Dubai', airport: 'DXB', localDateTime: '2026-10-12T06:15', timezone: 'Asia/Dubai' },
  ...overrides,
})
