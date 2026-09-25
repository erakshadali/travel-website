# Fatima Travels API

Node.js + Express + MongoDB (Mongoose). ESM, Node 20+.

**Built so far:** public form endpoints (Phase 1), the admin API (Phase 2, used by the `/admin` panel), and email + WhatsApp sending for new bookings (Phase 3, see [NOTIFICATIONS.md](NOTIFICATIONS.md)). Not built yet: the scheduled messages (weather, flight day, arrival, check-ins), weather lookups and the cron endpoint.

## Setup

```bash
cd server
npm install
cp .env.example .env        # then fill it in
npm run hash-password       # prompts (hidden) and prints ADMIN_PASSWORD_HASH for .env
npm run dev                 # http://localhost:4111
npm test                    # 230 tests, uses an in-memory MongoDB (downloads mongod once, ~1 min)
npm run seed                # optional: sample bookings for the admin API (dev only, tagged @example.test)
npm run find-submissions -- <text in email>   # read-only: shows what the forms stored, and which messages were sent
npm run notify:check        # sends one test email + one test WhatsApp with your .env keys (prints only in NOTIFY_MODE=log)
```

`.env` keys are documented in `.env.example`. The server refuses to start if any are missing or invalid.

## Public API (no login, used by the website forms)

Rate limited per client IP, **separately for each endpoint** (default 10 per hour, `PUBLIC_RATE_LIMIT_PER_HOUR`); `429` when exceeded.
CORS only allows `FRONTEND_ORIGINS`. Unknown fields in a body are ignored, so clients can never set `status`, `reference`, `optedOut` etc.
Validation errors are `400 { error: "Validation failed", details: [{ path, message }] }`.

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| POST | `/api/bookings` | `clientName, email, whatsappNumber, passportName, packageName, destination, travelDate (YYYY-MM-DD), travellers {adults, children}, roomType (standard/deluxe/suite), specialRequests?, occasion?, insurance?, estimatedTotal, currency? (USD), whatsappConsent` | `201 { ok, reference }` (`FT-XXXXXXX`), status starts as *Received* |
| POST | `/api/trip-plans` | `name, email, phone?, destination, flexibleDates, startDate?, endDate?, travellers, budget, interests[], hotel` | `201 { ok }` |
| POST | `/api/contact` | `name, email, phone?, topic?, message (10+ chars)` | `201 { ok }` |
| POST | `/api/newsletter` | `email` | `200 { ok }`, identical whether or not the address was already subscribed |

Notes:
- **WhatsApp consent is required**: `whatsappConsent` must be exactly `true`; the time it was given is stored as `whatsappConsentAt`.
- `whatsappNumber` is normalised to E.164 (`+971 50 123-4567` and `00971…` both become `+971501234567`); a number without a country code is rejected.
- `travelDate` may not be in the past (one day of slack for timezones) or more than ~3 years ahead.
- The server has no package catalogue: `packageName`, `destination` and `estimatedTotal` are taken from the client as an *estimate*; the agency confirms real prices.

## Notifications

A new booking sends the client an email and a WhatsApp and the agency an alert email, in the background (the visitor never waits, and a failure never fails the booking).
`NOTIFY_MODE=log` (default) prints every message instead of sending it; `live` sends through Resend and the WhatsApp Cloud API.
Each message is recorded in `NotificationLog` and is never sent twice; failures are retried up to 3 times by `notifications.retryFailed()`.
Setup for Resend and Meta, the exact `.env` lines and troubleshooting: [NOTIFICATIONS.md](NOTIFICATIONS.md).

## Admin API

All admin routes except `login` need `Authorization: Bearer <token>`. Errors are JSON: `{ "error": "...", "details": [{ "path", "message" }] }`.
`:id` is either the Mongo id or the public reference (`FT-XXXXXXX`).

| Method | Path | What it does |
| --- | --- | --- |
| POST | `/api/admin/login` | `{ email, password }` → `{ token, expiresIn }`. 10 *failed* attempts / 15 min / IP locks it (`429`); successful logins don't count. |
| GET | `/api/admin/me` | Who the token belongs to. |
| GET | `/api/admin/bookings/stats` | `{ total, byStatus: { Received: n, ... } }`, always across all bookings (every status present, zeros included). |
| GET | `/api/admin/bookings` | Query: `status`, `search` (reference, name, email, WhatsApp, passport name, destination, package), `travelFrom` / `travelTo` (`YYYY-MM-DD`, both inclusive, empty = no limit), `sort` (`newest`/`oldest`/`travelDate`), `page`, `limit` (max 100). Returns `{ data, page, limit, total, pages }`. |
| GET | `/api/admin/bookings/:id` | Full booking with `statusHistory` and `flight` (or `null`). |
| GET | `/api/admin/trip-plans` | Trip Planner submissions, newest first. Query: `search`, `page`, `limit`. Same envelope as bookings. |
| GET | `/api/admin/contact-messages` | Contact form messages, newest first. Same query and envelope. |
| GET | `/api/admin/newsletter-subscribers` | Newsletter sign-ups, newest first. Same query and envelope. |
| PATCH | `/api/admin/bookings/:id/status` | `{ status, note? }`. Appends to `statusHistory`. `409` if already in that status. |
| GET | `/api/admin/bookings/:id/flight` | Flight details, `404` if none yet. |
| PUT | `/api/admin/bookings/:id/flight` | Create or replace (`201` / `200`). See below. |
| DELETE | `/api/admin/bookings/:id/flight` | `204`, or `404` if none. |
| GET | `/api/health` | Public. `{ ok, db }`. |

### Flight details

The admin enters the time **as printed on the ticket** plus the airport's IANA timezone; the server stores UTC.

```json
{
  "airline": "Emirates",
  "flightNumber": "EK 511",
  "pnr": "ABC123",
  "departure": { "city": "Mumbai", "airport": "BOM", "localDateTime": "2026-10-12T04:30", "timezone": "Asia/Kolkata" },
  "arrival":   { "city": "Dubai",  "airport": "DXB", "localDateTime": "2026-10-12T06:15", "timezone": "Asia/Dubai" }
}
```

Responses carry `at` (UTC ISO string), `timezone`, and `localDateTime` (the wall-clock time again, so an edit form can be pre-filled).
Rejected with `400`: fixed offsets like `+04:00` instead of an IANA name, local times that don't exist (DST spring-forward gap), arrival not after departure, unknown fields.
A repeated local time in the DST fall-back hour resolves to the first occurrence.

## Layout

```
src/
  index.js        entrypoint: env → Mongo → listen
  app.js          createApp(config): middleware + routes (also used by tests)
  config.js       env validation
  models/         Booking, FlightDetails, TripPlan, ContactMessage, NewsletterSubscriber, NotificationLog
  routes/         public (forms), adminAuth, adminBookings, adminInbox (trip plans, messages, subscribers)
  middleware/     auth (JWT), errorHandler
  notify/         messages (email + WhatsApp content), templates, resend, whatsapp, transports (log/live), service (idempotent sending)
  utils/          time (local ↔ UTC), phone (E.164), query (search + pagination), httpError
scripts/          hash-password, seed, find-submissions, notify-check
test/             node:test suites
```

## Deploying to Render (free web service)

Root directory `server`, build command `npm install`, start command `npm start`, add the `.env` keys under Environment.
The server sets a 65 s keep-alive so Render's proxy never reuses a connection Node has just closed.
Set `FRONTEND_ORIGINS` to the Vercel URL, and set `VITE_API_URL=https://<your-service>.onrender.com/api` in the Vercel project, then redeploy the frontend.
In Atlas > Network Access allow `0.0.0.0/0`: Render's free tier has no fixed IP address.
The first request after ~15 minutes idle wakes the service (30-50 s); the site's forms wait up to 60 s for it.
