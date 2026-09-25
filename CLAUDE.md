# Fatima Tours and Travels

Luxury travel agency website. Pages: Home, Destinations, Packages, Package detail,
Experiences, Trip Planner, Booking, About, Contact, 404. The four forms (Booking, Trip Planner, Contact,
Newsletter) POST to the backend in `server/` (see below) when `VITE_API_URL` is set, and are simulated otherwise.
Live: https://fatima-travels-one.vercel.app (Vercel project `fatima-travels`).
**The deployed version is OLD**: forms are simulated, there is no `/admin`, and no backend is deployed yet. Everything below runs locally.

## Status: what is done, what is left
Done (all tested; `npm test` in `server/` = 230 tests, and the two browser scripts in `scripts/` pass):
- **Frontend**: the complete public site.
- **Phase 1 (public API)**: `POST /api/bookings` (creates an `FT-XXXXXXX` reference), `/trip-plans`, `/contact`, `/newsletter`, with validation,
  helmet, CORS and per-endpoint rate limits. The four forms use them, with loading/success/error states. The booking form has a required
  "Send me trip updates on WhatsApp" consent checkbox (the server enforces it too). The Trip Planner also collects name/email/phone.
- **Phase 2 (admin)**: JWT admin API and the `/admin` panel (see "Admin panel"), plus flight details stored in UTC with IANA timezones.
- **Phase 3 (notifications)**: a new booking sends the client an email + a WhatsApp (only with consent, not opted out) and the agency an alert email.
  `NOTIFY_MODE=log` (default) prints instead of sending; `live` sends through Resend and the WhatsApp Cloud API. Every message is recorded in
  `NotificationLog` and never sent twice. Tested in log mode only. Details: `server/NOTIFICATIONS.md`, code in `server/src/notify/`.

Left, in this order:
1. **Live email + WhatsApp test.** The owner has a Resend key in `server/.env`; the WhatsApp keys are still empty (Meta app, Phone number ID,
   permanent System User token, and the `booking_confirmation` template approved in WhatsApp Manager: all in `server/NOTIFICATIONS.md`).
   Then: set `NOTIFY_MODE=live`, run `npm run notify:check -- --email-only`, `-- --whatsapp-only`, `-- --whatsapp-only --template booking_confirmation`,
   then submit a real booking and read the result with `npm run find-submissions -- <email>`. Without a verified domain, Resend's
   `onboarding@resend.dev` only delivers to the email the Resend account was created with (so clients get nothing yet), and the WhatsApp test
   number only reaches the (up to 5) numbers verified in Meta. Real clients need a domain and the business's own WhatsApp number.
2. **Phase 4: scheduler.** `POST /api/cron/run` protected by a secret header (`CRON_SECRET`), called every 15 minutes by cron-job.org (NOT node-cron:
   Render's free tier sleeps). It should send: weather forecast 2 days before departure (OpenWeatherMap free API); flight-day morning
   ("Today is your flight to Dubai, EK 511 at 10:30 AM", in the departure airport's local time, from `FlightDetails`); "Welcome to Dubai!" 1 hour after
   scheduled arrival; a check-in/offers message every 15 days after the trip ends, until opt-out. Reuse `createNotifications` (`deliver` + `dedupeKey`,
   e.g. `checkin:2026-11-01`, so repeats are recorded once each) and call `notifications.retryFailed()` on every run. Each message needs its own WhatsApp
   template added to `server/src/notify/templates.js` and approved by Meta (the owner does that; give exact text). WhatsApp only if `whatsappConsent && !optedOut`.
   An opt-out mechanism does not exist yet (inbound WhatsApp webhook for STOP, or an admin toggle): the consent text already promises "opt out at any time".
3. **Phase 5: deploy the backend to Render** (free web service, root `server`, build `npm install`, start `npm start`, env vars from `.env.example`;
   Atlas Network Access `0.0.0.0/0`; `FRONTEND_ORIGINS` and `SITE_URL` = the Vercel URL). Then set `VITE_API_URL=https://<service>.onrender.com/api`
   in Vercel and redeploy the frontend (this also publishes `/admin`). Steps are in `server/README.md`. Point cron-job.org at it.
4. **Booking status feature.** Not specified yet: ask the owner what it should do before building. Likely candidates: messages to the client when the
   status changes (Confirmed, Ticket Issued...), and/or a page where a client checks a booking by its FT reference.
5. **Housekeeping.** Replace the placeholder contact details in `src/data/data.js` (`site`); delete the test records in Atlas (booking `FT-NWUREYW`,
   plus anything with an `@example.test` email); rotate secrets that were pasted into chat sessions (Atlas DB user password, the admin password via
   `npm run hash-password`, any Resend/Meta key); add a custom domain in Vercel and verify it in Resend.

## Tech stack
React 19 + Vite, Tailwind CSS v4 (theme in `src/index.css` `@theme`, no tailwind.config), Framer Motion,
React Three Fiber + drei (globe), React Router, Lucide icons. Playwright is dev-only (responsive audit).

## Folder structure
```
src/
  App.jsx, main.jsx, index.css
  data/        data.js (ALL content + `site` contact details), images.js (every photo, one place)
  services/    api.js (POSTs to VITE_API_URL, which includes /api; simulated when unset; throws ApiError with a visitor-ready message)
  hooks/       useMediaQuery, useDocumentTitle
  pages/       one file per route
  components/  global/ (loader, cursor, floating buttons)  layout/ (Navbar, Footer)
               home/ (hero, sections)  three/ (Globe, lazy-loaded)  ui/ (shared cards, forms, lightbox)
  admin/       the /admin panel: AdminApp (routes), auth.jsx + session.js (token), api.js (client), pages/ (Login, Dashboard,
               BookingDetail, Inbox), FlightForm.jsx, timezones.js (timezone list + airport codes), ui.jsx, format.js
scripts/       audit.mjs (overflow/tap-target audit), section-shots.mjs, e2e-forms.mjs (drives all 4 forms in a browser),
               e2e-admin.mjs (drives the admin panel: login, filters, status, flights, phone overflow)
```

## Design rules (luxury, don't drift)
- Background `#0A0A0C` + subtle grain. Text ivory `#F3EFE6`, muted `#9E998F`.
- Gold: primary `#C9A96E`, light `#E6D3A3`, dark `#8C6D3F` (dark is unused; never for text).
- Gold text = solid `text-champagne` (#E6D3A3). NEVER use gradient text (background-clip) or gradient
  fills: Samsung Internet forced dark mode turns them brown. `color-scheme: dark` is set in HTML and CSS.
- Headings: Cormorant Garamond, weight 400-500 only (no bold). Body/nav/buttons/filters: Inter, weight 300-400.
- Buttons: `btn-gold` (solid champagne, dark text) and `btn-outline` (thin outline). No text-shadows, no heavy glows.
- Motion: slow ease-out (0.6-0.8s, `cubic-bezier(0.16,1,0.3,1)`), no springs or bounces.
- Photos: add/change only in `src/data/images.js`; check each image actually shows its subject.

## Responsive rules
- Mobile first. Tap targets >= 44px; phone body text >= 15px; no fixed widths that break at 360px.
- Grid/flex children need `min-w-0`; fix overflow at its root. `overflow-x: clip` on html/body is only a safety net.
- Floating WhatsApp/scroll-to-top hide on phones near elements marked `data-fab-avoid`.
- After layout changes run the audit (below); it must report 0 overflow.

## Commands
```
npm run dev -- --host --port 5180        # dev server (5173-5176 are often taken by other projects)
npm run build                            # production build to dist/
npx vite preview --port 5181             # serve the build, then in another shell:
node scripts/audit.mjs                   # VP=360,390 limits sizes; add --shots for screenshots
# forms end to end: serve the frontend with VITE_API_URL=http://localhost:4111/api and run the API (server/), then
node scripts/e2e-forms.mjs http://localhost:<vite-port>            # add --expect-failure against a frontend whose API is down
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... node scripts/e2e-admin.mjs http://localhost:<vite-port>   # changes one booking; --keep-flight, --shots
```

## Deployment (Vercel)
1. `npm run build` must pass, and the audit must show 0 overflow.
2. `vercel deploy --prod --yes` from the project root (already linked; `vercel.json` rewrites all routes to index.html).
3. Verify: `curl -s https://fatima-travels-one.vercel.app/` returns the new asset hashes; check /booking and /contact return 200.
- `.vercelignore` keeps `scripts`, `audit-*`, `dist-baseline` and `node_modules` out of uploads.
- Vercel is not connected to GitHub: nothing is auto-deployed. Deploy manually with the CLI after every change.

## Git and secrets
Git repo on branch `main` (the GitHub remote is private; add it with `git remote add origin <url>`). **Never commit secrets.**
`.gitignore` excludes `.env`, `.env.*` (except `.env.example`), key files, `node_modules`, build and audit output. Real values live only in
`server/.env`. Before every commit, list what is staged (`git status`) and scan it for `re_`, `EAA`, `mongodb+srv://user:pass`, passwords, JWT secrets,
bcrypt hashes and the owner's personal phone/email; tests and docs use fake values (`+911234567890`, `@example.test`). Never print a secret in a reply.

## Backend (`server/`)
Separate Node/Express/Mongoose app with its own `package.json`; deployed to Render, not Vercel (`.vercelignore` skips it).
Free services only (Atlas M0, Resend, Meta WhatsApp Cloud API, OpenWeatherMap, cron-job.org hitting `POST /api/cron/run`; no node-cron).
Setup, endpoints and commands are in `server/README.md`; email/WhatsApp setup in `server/NOTIFICATIONS.md`. Run `npm test` in `server/` after
changes (it starts an in-memory MongoDB: run it from `server/`, the binary is cached in `server/node_modules/.cache`). The API's dev port is 4111
(`server/.env`), because 4000 clashes with another project on the owner's machine. Data lives in Atlas database `fatima-tours`.

## Admin panel (`/admin`)
For the agency owner. Sign in with `ADMIN_EMAIL` and the password whose hash is in `server/.env`. Needs `VITE_API_URL` (no backend = a notice on the login page).
- Pages: `/admin/login`; `/admin` bookings dashboard (counts per status, search by name/FT reference/email, status and travel-date filters, all in the URL);
  `/admin/bookings/:id` (client and trip info, change status with a note, add/edit/remove flight details with a timezone dropdown, history timeline);
  `/admin/trip-plans`, `/admin/messages`, `/admin/subscribers` (read-only, searchable).
- `App.jsx` renders `AdminApp` (one lazy chunk) for every `/admin` URL *instead of* the public chrome. Nothing on the public site links to it.
- Not indexed: `<meta name="robots" content="noindex">` set by `useNoIndex`, plus an `X-Robots-Tag` header for `/admin/*` in `vercel.json` (takes effect on the next deploy).
- Login token: JWT in `localStorage` (`ft-admin-token`, 12 h); any 401 signs out and returns to the login page. Only failed logins count towards the login rate limit.
- Flight times: the admin types the time printed on the ticket + the airport's timezone; the server stores UTC. Typing an airport code (DXB, BOM...) fills city and timezone (`AIRPORTS` in `timezones.js`).
- Same design rules as the public site. Numbers in Cormorant use `lining-nums` (its default old-style figures make 1 look like "I" and 0 like "O").
- Every effect must return nothing or a cleanup function: `useEffect(() => window.scrollTo(0, 0))` crashes the whole tree; use a block body.

## Working notes (learned the hard way)
- The owner is not a developer and wants the work done for them: do the setup and testing yourself, and when they must act (creating accounts,
  clicking in Meta/Resend/Atlas, typing a password) give short numbered steps with the exact names of buttons and the exact `.env` lines.
- Test against a throwaway database first, then once against Atlas. Throwaway: start `mongodb-memory-server` from `server/` (a small script that
  prints its URI), seed with `npm run seed`, run the API with `MONGODB_URI` overridden (env vars beat `.env`). Tag test data `@example.test`.
- Ports 5173, 5180, 5182 and 4000 are usually taken by dev servers from other sessions/projects: check before binding, and never kill processes
  you did not start. Use `--strictPort`. Playwright's Chromium is installed (`scripts/e2e-*.mjs`, `scripts/audit.mjs`).
- Bash tool: heredocs mangle backslashes in regexes and paths. Use the Edit/Write tools for code that contains `\`, and check regex literals after a scripted edit.
- React: an effect must return nothing or a cleanup function (`useEffect(() => window.scrollTo(0, 0))` blank-pages the app). Read URL params from
  `window.location.search` inside timers/handlers, not from a render-time copy. The admin login limiter counts only failed attempts (10 per 15 min per IP).
- WhatsApp: business-initiated messages must be approved templates (`server/src/notify/templates.js`); variables cannot contain newlines or tabs.
- Screenshots (`--shots`, or a failed check with `E2E_SHOT_DIR`) are the fastest way to see what a browser test saw.

## Before going live for real
Replace placeholder phone, WhatsApp number, email, address and social links (`site` in `src/data/data.js`);
replace sample prices/testimonials/team; deploy `server/` to Render and set `VITE_API_URL` (with /api) in Vercel; add a custom domain in Vercel.
