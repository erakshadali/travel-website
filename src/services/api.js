// Service layer for every form on the site.
//
// With VITE_API_URL set (e.g. http://localhost:4111/api, note the /api), each function POSTs JSON to
// `${VITE_API_URL}/<path>`. Without it the calls are simulated, so `npm run dev` works with no backend.
//
// Every function resolves with the parsed response or throws an ApiError whose `message` is already
// written for the visitor: show it as-is.

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

// Render's free tier sleeps when idle; the first request can take ~30-50s while it wakes up.
const TIMEOUT_MS = 60_000

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const simulate = (payload, ms = 1100) =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ ok: true, reference: `FT-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, data: payload }),
      ms,
    ),
  )

function messageFor(status, body) {
  if (status === 400 && Array.isArray(body?.details) && body.details.length) {
    return [...new Set(body.details.map((d) => d.message))].join(' ')
  }
  if (status === 429) return 'Too many requests from your connection. Please try again in a little while.'
  return 'Something went wrong on our side. Please try again, or message us on WhatsApp.'
}

async function post(path, payload) {
  if (!API_URL) return simulate(payload)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError("We couldn't reach the server. Check your connection and try again.")
  } finally {
    clearTimeout(timer)
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(messageFor(res.status, body), res.status)
  return body
}

export const submitBooking = (booking) => post('/bookings', booking)
export const submitTripPlan = (plan) => post('/trip-plans', plan)
export const submitContact = (message) => post('/contact', message)
export const subscribeNewsletter = (email) => post('/newsletter', { email })
