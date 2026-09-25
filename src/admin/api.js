// Client for the admin part of the backend (`${VITE_API_URL}/admin/...`).
// Every call resolves with parsed JSON (or null for 204) or throws an AdminApiError whose `message`
// is ready to show to the admin. A 401 on an authenticated call clears the token and signs out.
import { clearToken, getToken } from './session'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')
const TIMEOUT_MS = 60_000 // covers Render's free tier waking from sleep

export const isBackendConfigured = Boolean(API_URL)

export class AdminApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
    this.details = details // [{ path, message }] for validation errors
  }
}

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

function messageFor(status, data, hadToken) {
  if (status === 401 && hadToken) return 'Your session has expired. Please sign in again.'
  if (status === 400 && Array.isArray(data?.details) && data.details.length) {
    return [...new Set(data.details.map((d) => d.message))].join(' ')
  }
  if (status >= 500) return 'Something went wrong on the server. Please try again.'
  return data?.error ?? 'Something went wrong. Please try again.'
}

async function request(method, path, { body, query, auth = true } = {}) {
  if (!API_URL) throw new AdminApiError('The backend is not connected: set VITE_API_URL and restart the site.')

  const search = new URLSearchParams(Object.entries(query ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
  const token = auth ? getToken() : null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const url = `${API_URL}/admin${path}${search ? `?${search}` : ''}`
  const init = {
    method,
    headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: controller.signal,
  }

  let res
  try {
    for (let attempt = 0; !res; attempt++) {
      try {
        res = await fetch(url, init)
      } catch {
        // A dropped connection on a read is safe to repeat once (phone networks do this). Writes are
        // never repeated: if the first one got through, a second could double-apply it.
        const retryable = method === 'GET' && attempt === 0 && !controller.signal.aborted
        if (!retryable) throw new AdminApiError("Couldn't reach the server. Check your connection and try again.")
        await new Promise((resolve) => setTimeout(resolve, 400))
      }
    }
  } finally {
    clearTimeout(timer)
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken()
      onUnauthorized()
    }
    throw new AdminApiError(messageFor(res.status, data, Boolean(token)), res.status, data?.details)
  }
  return data
}

const id = encodeURIComponent

export const adminApi = {
  login: (email, password) => request('POST', '/login', { body: { email, password }, auth: false }),

  stats: () => request('GET', '/bookings/stats'),
  bookings: (query) => request('GET', '/bookings', { query }),
  booking: (bookingId) => request('GET', `/bookings/${id(bookingId)}`),
  setStatus: (bookingId, status, note) => request('PATCH', `/bookings/${id(bookingId)}/status`, { body: { status, note } }),
  saveFlight: (bookingId, flight) => request('PUT', `/bookings/${id(bookingId)}/flight`, { body: flight }),
  deleteFlight: (bookingId) => request('DELETE', `/bookings/${id(bookingId)}/flight`),

  tripPlans: (query) => request('GET', '/trip-plans', { query }),
  messages: (query) => request('GET', '/contact-messages', { query }),
  subscribers: (query) => request('GET', '/newsletter-subscribers', { query }),
}
