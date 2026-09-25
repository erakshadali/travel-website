// End-to-end check of the admin panel in a real browser.
//
//   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... node scripts/e2e-admin.mjs [frontendUrl] [--keep-flight] [--shots]
//
// Env: E2E_BOOKING  reference (FT-XXXXXXX) of the booking to update. Default: the newest booking whose
//                   email contains E2E_SEARCH (default "example.test"), i.e. a test booking.
//      E2E_SHOT_DIR where --shots (and failures) save screenshots.
// The frontend must be served with VITE_API_URL pointing at a running backend (see e2e-forms.mjs).
// The password is only typed into the login form; it is never printed.
//
// It changes the chosen booking: status + note, and flight details (removed again unless --keep-flight).
import { chromium } from 'playwright'

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5180'
const KEEP_FLIGHT = process.argv.includes('--keep-flight')
const SHOTS = process.argv.includes('--shots')
const EMAIL = process.env.E2E_ADMIN_EMAIL
const PASSWORD = process.env.E2E_ADMIN_PASSWORD
const SHOT_DIR = process.env.E2E_SHOT_DIR
const NOTE = `E2E status check ${Date.now().toString(36)}`
if (!EMAIL || !PASSWORD) {
  console.error('Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.')
  process.exit(2)
}

const results = []
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

async function check(name, fn) {
  try {
    await fn()
    results.push(true)
    console.log(`  PASS  ${name}`)
  } catch (err) {
    results.push(false)
    console.log(`  FAIL  ${name}\n        ${String(err.message).split('\n').slice(0, 3).join(' | ')}`)
    if (SHOT_DIR) {
      const file = `${SHOT_DIR}/admin-FAIL-${name.replace(/\W+/g, '-').slice(0, 60)}.png`
      await page.screenshot({ path: file, fullPage: true }).catch(() => {})
      console.log(`        screenshot: ${file}`)
    }
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}
const visible = (locator, timeout = 15_000) => locator.waitFor({ state: 'visible', timeout })
const shot = async (name) => SHOTS && SHOT_DIR && (await page.screenshot({ path: `${SHOT_DIR}/admin-${name}.png`, fullPage: true }))

async function signIn(email = EMAIL, password = PASSWORD) {
  await page.locator('#admin-email').fill(email)
  await page.locator('#admin-password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}
const rows = () => page.locator('section[aria-label="Bookings"] ul > li')
const tile = (name) => page.locator('section[aria-label="Bookings by status"] button').filter({ hasText: name })
const tileCount = async (name) => Number((await tile(name).first().locator('span').first().innerText()).trim())

console.log(`Frontend ${BASE}\n`)
let reference

// ------------------------------------------------------------ access control
await check('Logged out: /admin redirects to the sign-in page, which has no public site chrome', async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  await page.waitForURL('**/admin/login')
  await visible(page.getByRole('heading', { name: 'Welcome back' }))
  assert((await page.getByRole('link', { name: 'Destinations' }).count()) === 0, 'public navbar is showing')
  assert((await page.getByRole('link', { name: /whatsapp/i }).count()) === 0, 'public WhatsApp button is showing')
  await shot('login')
})
await check('Admin pages are marked noindex; the public site is not, and never links to /admin', async () => {
  assert((await page.locator('meta[name="robots"][content*="noindex"]').count()) === 1, 'no noindex meta on /admin/login')
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  assert((await page.locator('meta[name="robots"]').count()) === 0, 'public page has a robots meta')
  assert((await page.locator('a[href^="/admin"]').count()) === 0, 'public page links to /admin')
})
await check('Deep links are protected too and come back after signing in', async () => {
  await page.goto(`${BASE}/admin/subscribers`, { waitUntil: 'networkidle' })
  await page.waitForURL('**/admin/login')
  await signIn('nobody@example.test', 'definitely-wrong-password')
  await visible(page.getByRole('alert').filter({ hasText: /invalid email or password/i }))
  assert(page.url().endsWith('/admin/login'), 'left the sign-in page after a failed login')
  await signIn()
  await page.waitForURL('**/admin/subscribers')
})

// ----------------------------------------------------------------- dashboard
await check('Signing in shows the dashboard with counts per status that add up', async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  await visible(page.getByRole('heading', { name: 'Bookings', exact: true }))
  await visible(tile('All'))
  const statuses = ['Received', 'Under Review', 'Confirmed', 'Ticket Issued', 'Travelling', 'Completed', 'Cancelled']
  await page.waitForFunction(() => !/^-$/.test(document.querySelector('section[aria-label="Bookings by status"] button span')?.textContent ?? '-'))
  let sum = 0
  for (const s of statuses) sum += await tileCount(s)
  assert(sum === (await tileCount('All')), `status counts add up to ${sum}, "All" says ${await tileCount('All')}`)
  await shot('dashboard')
})
await check('Clicking a status tile filters the list to that status; clearing restores it', async () => {
  const statuses = ['Received', 'Under Review', 'Confirmed', 'Ticket Issued', 'Travelling', 'Completed', 'Cancelled']
  let target
  for (const s of statuses) if ((await tileCount(s)) > 0) { target = s; break }
  assert(target, 'no bookings in any status')
  await tile(target).first().click()
  await page.waitForURL(/status=/)
  await page.waitForFunction((t) => [...document.querySelectorAll('section[aria-label="Bookings"] ul > li')].every((li) => li.textContent.includes(t)), target)
  assert((await rows().count()) > 0, 'filtered list is empty')
  await page.getByRole('button', { name: /clear filters/i }).click()
  await page.waitForFunction(() => !location.search)
})
await check('Search finds a booking by FT reference and by name', async () => {
  // Pick the booking to work on: E2E_BOOKING, or the newest whose email matches E2E_SEARCH.
  const needle = process.env.E2E_BOOKING ?? process.env.E2E_SEARCH ?? 'example.test'
  await page.locator('#f-search').fill(needle)
  await page.waitForFunction((n) => new URLSearchParams(location.search).get('q') === n, needle)
  await rows().first().waitFor({ timeout: 15_000 })
  reference = (await rows().first().locator('p.font-mono').innerText()).trim()
  assert(/^FT-[A-HJ-NP-Z2-9]{7}$/.test(reference), `unexpected reference "${reference}"`)
  const name = (await rows().first().locator('p.truncate').first().innerText()).trim()

  await page.locator('#f-search').fill(reference.toLowerCase())
  await page.waitForFunction((n) => new URLSearchParams(location.search).get('q') === n, reference.toLowerCase())
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Bookings"] ul > li').length === 1)
  await page.locator('#f-search').fill(name)
  await page.waitForFunction((n) => new URLSearchParams(location.search).get('q') === n, name)
  await rows().first().waitFor()
  assert((await rows().first().innerText()).includes(reference), 'search by name did not find the booking')
})
await check('Travel-date filter includes the booking for its date, and shows an empty state otherwise', async () => {
  await page.locator('#f-search').fill(reference)
  await page.waitForFunction((n) => new URLSearchParams(location.search).get('q') === n, reference)
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Bookings"] ul > li').length === 1)
  const dateText = await rows().first().locator('div.text-sm').first().locator('p').first().innerText() // e.g. "3 Nov 2026"
  const travel = new Date(`${dateText} UTC`).toISOString().slice(0, 10)
  await page.locator('#f-from').fill(travel)
  await page.locator('#f-to').fill(travel)
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Bookings"] ul > li').length === 1)
  const after = new Date(new Date(`${travel}T00:00:00Z`).getTime() + 86_400_000 * 2).toISOString().slice(0, 10)
  await page.locator('#f-to').fill('')
  await page.locator('#f-from').fill(after)
  await visible(page.getByText('No bookings match these filters.'))
  await page.getByRole('button', { name: /clear filters/i }).click()
})

await check('Changing a filter while a search is still being typed does not lose either one', async () => {
  await page.getByRole('button', { name: /clear filters/i }).click().catch(() => {})
  await page.waitForFunction(() => !location.search)
  await page.locator('#f-search').fill('a') // starts the 300 ms search timer...
  await page.locator('#f-status').selectOption('Received') // ...and this lands before it fires
  await page.waitForTimeout(900)
  const q = await page.evaluate(() => Object.fromEntries(new URLSearchParams(location.search)))
  assert(q.q === 'a' && q.status === 'Received', `expected q=a and status=Received, got ${JSON.stringify(q)}`)
  await page.getByRole('button', { name: /clear filters/i }).click()
  await page.waitForFunction(() => !location.search)
})

// ------------------------------------------------------------- booking detail
await check('Opening a booking shows client, trip and history; "All bookings" returns to the same filters', async () => {
  await page.locator('#f-search').fill(reference)
  // wait for the search to reach the URL (with a single booking in the database the list is already one row)
  await page.waitForFunction((n) => new URLSearchParams(location.search).get('q') === n, reference)
  await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Bookings"] ul > li').length === 1)
  await rows().first().locator('a').click()
  await page.waitForURL('**/admin/bookings/*')
  await visible(page.locator('[data-testid="booking-reference"]'))
  assert((await page.locator('[data-testid="booking-reference"]').innerText()) === reference, 'wrong booking opened')
  for (const heading of ['Client', 'Trip', 'Flight', 'Status', 'History']) await visible(page.getByRole('heading', { name: heading, exact: true }))
  assert((await page.locator('a[href^="mailto:"]').count()) >= 1, 'no email link')
  assert((await page.locator('a[href^="https://wa.me/"]').count()) === 1, 'no WhatsApp link')
  await shot('detail')
  await page.getByRole('link', { name: /all bookings/i }).click()
  await page.waitForURL(new RegExp(`q=${reference}`, 'i'))
  await rows().first().locator('a').click()
  await page.waitForURL('**/admin/bookings/*')
})
await check('Changing status with a note updates the badge and adds a history entry', async () => {
  await visible(page.locator('#st-status'))
  const before = await page.locator('[data-testid="history-entry"]').count()
  const current = (await page.locator('#st-status').inputValue()).trim()
  const next = current === 'Under Review' ? 'Confirmed' : 'Under Review'
  const update = page.getByRole('button', { name: /update status/i })
  assert(await update.isDisabled(), 'Update is enabled although the status is unchanged')
  await page.locator('#st-status').selectOption(next)
  await page.locator('#st-note').fill(NOTE)
  assert(await update.isEnabled(), 'Update stayed disabled after choosing a new status')
  await update.click()
  await visible(page.getByRole('status').filter({ hasText: `Status changed to ${next}` }))
  await page.waitForFunction((n) => document.querySelectorAll('[data-testid="history-entry"]').length === n, before + 1)
  const newest = page.locator('[data-testid="history-entry"]').first()
  assert((await newest.innerText()).includes(next) && (await newest.innerText()).includes(NOTE), 'newest history entry lacks the new status or the note')
  await visible(page.locator('header').getByText(next, { exact: true }))
  assert(await update.isDisabled(), 'Update should be disabled again for the now-current status')
  assert((await page.locator('#st-note').inputValue()) === '', 'note was not cleared')
})
await check('Flight details: airport code fills city and timezone, UTC preview is right, bad times are refused', async () => {
  const add = page.getByRole('button', { name: /add flight details|^edit$/i })
  await add.click()
  await page.locator('#fl-airline').fill('Emirates')
  await page.locator('#fl-flightNumber').fill('ek 511')
  await page.locator('#fl-pnr').fill('abc123')
  await page.locator('#fl-departure-airport').fill('BOM')
  assert((await page.locator('#fl-departure-city').inputValue()) === 'Mumbai', 'BOM did not fill the city')
  assert((await page.locator('#fl-departure-timezone').inputValue()) === 'Asia/Kolkata', 'BOM did not select Asia/Kolkata')
  await page.locator('#fl-arrival-airport').fill('DXB')
  assert((await page.locator('#fl-arrival-timezone').inputValue()) === 'Asia/Dubai', 'DXB did not select Asia/Dubai')

  // arrival before departure: refused in the browser, nothing saved
  await page.locator('#fl-departure-localDateTime').fill('2027-01-15T04:30')
  await page.locator('#fl-arrival-localDateTime').fill('2027-01-15T01:00')
  await page.getByRole('button', { name: /save flight details/i }).click()
  await visible(page.getByText('Arrival must be after departure (compared in UTC).'), 5000)

  await page.locator('#fl-arrival-localDateTime').fill('2027-01-15T06:15')
  await visible(page.locator('[data-testid="departure-utc"]'))
  assert((await page.locator('[data-testid="departure-utc"]').innerText()).includes('23:00 UTC'), 'departure UTC preview should be 23:00 (04:30 IST is UTC+5:30)')
  assert((await page.locator('[data-testid="arrival-utc"]').innerText()).includes('02:15 UTC'), 'arrival UTC preview should be 02:15 (06:15 Dubai is UTC+4)')
  await shot('flight-form')
  await page.getByRole('button', { name: /save flight details/i }).click()

  const dep = page.locator('[data-testid="departure-leg"]')
  await visible(dep)
  const depText = await dep.innerText()
  const arrText = await page.locator('[data-testid="arrival-leg"]').innerText()
  assert(depText.includes('BOM') && depText.includes('Mumbai') && depText.includes('04:30') && depText.includes('Asia/Kolkata') && depText.includes('23:00 UTC'), `departure leg wrong: ${depText.replace(/\n/g, ' | ')}`)
  assert(arrText.includes('DXB') && arrText.includes('06:15') && arrText.includes('Asia/Dubai') && arrText.includes('02:15 UTC'), `arrival leg wrong: ${arrText.replace(/\n/g, ' | ')}`)
  const card = page.locator('section', { has: page.getByRole('heading', { name: 'Flight', exact: true }) })
  const cardText = await card.innerText()
  assert(cardText.includes('EK 511') && cardText.includes('ABC123') && cardText.includes('Emirates'), 'flight number/PNR/airline not normalised or shown')
  await shot('flight-saved')
})
await check('Editing flight details keeps the values and saves the change', async () => {
  await page.getByRole('button', { name: /^edit$/i }).click()
  assert((await page.locator('#fl-pnr').inputValue()) === 'ABC123', 'PNR not pre-filled')
  assert((await page.locator('#fl-departure-localDateTime').inputValue()) === '2027-01-15T04:30', 'departure time not pre-filled in local time')
  assert((await page.locator('#fl-departure-timezone').inputValue()) === 'Asia/Kolkata', 'timezone not pre-filled')
  await page.locator('#fl-pnr').fill('XYZ789')
  await page.getByRole('button', { name: /save flight details/i }).click()
  await visible(page.locator('[data-testid="departure-leg"]'))
  await page.waitForFunction(() => document.body.innerText.includes('XYZ789'))
})
if (!KEEP_FLIGHT) {
  await check('Removing flight details asks first, then removes them', async () => {
    await page.getByRole('button', { name: /remove flight details/i }).click()
    await visible(page.getByText('Remove these flight details?'))
    await page.getByRole('button', { name: /^keep$/i }).click()
    assert((await page.locator('[data-testid="departure-leg"]').count()) === 1, 'Keep should not remove anything')
    await page.getByRole('button', { name: /remove flight details/i }).click()
    await page.getByRole('button', { name: /yes, remove/i }).click()
    await visible(page.getByText('No flight details yet.'))
  })
}
await check('A reload keeps the change (saved on the server, not just on screen)', async () => {
  await page.reload({ waitUntil: 'networkidle' })
  await visible(page.locator('[data-testid="history-entry"]').first())
  assert((await page.locator('[data-testid="history-entry"]').first().innerText()).includes(NOTE), 'note missing after reload')
  if (KEEP_FLIGHT) assert((await page.locator('[data-testid="departure-leg"]').count()) === 1, 'flight missing after reload')
})

// ---------------------------------------------------------------------- lists
for (const [path, heading] of [['trip-plans', 'Trip plans'], ['messages', 'Messages'], ['subscribers', 'Subscribers']]) {
  await check(`${heading} page loads, shows a total, and search works`, async () => {
    await page.goto(`${BASE}/admin/${path}`, { waitUntil: 'networkidle' })
    await visible(page.getByRole('heading', { name: heading, exact: true }))
    await visible(page.getByText(/\d+ in total/))
    assert((await page.getByRole('alert').count()) === 0, 'an error is showing')
    await page.locator('#inbox-search').fill('zzz-no-such-record-zzz')
    await visible(page.getByText('Nothing matches that search.'))
    await shot(path)
  })
}

// ------------------------------------------------------------- phone layouts
for (const [w, h] of [[360, 740], [390, 844]]) {
  await check(`No horizontal overflow on any admin page at ${w}px`, async () => {
    await page.setViewportSize({ width: w, height: h })
    const overflowing = []
    const urls = [`/admin`, `/admin?status=Confirmed`, `/admin/bookings/`, `/admin/trip-plans`, `/admin/messages`, `/admin/subscribers`]
    for (const url of urls) {
      if (url === '/admin/bookings/') {
        await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
        await page.locator('#f-search').fill(reference)
        await page.waitForFunction(() => document.querySelectorAll('section[aria-label="Bookings"] ul > li').length === 1)
        await rows().first().locator('a').click()
        await visible(page.locator('[data-testid="booking-reference"]'))
        await page.getByRole('button', { name: /add flight details|^edit$/i }).click() // widest section: the flight form
      } else {
        await page.goto(BASE + url, { waitUntil: 'networkidle' })
        await page.locator('h1').first().waitFor()
      }
      await page.waitForTimeout(500)
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (over > 0) overflowing.push(`${url} (+${over}px)`)
      await shot(`phone-${w}-${url.replace(/\W+/g, '_')}`)
    }
    assert(overflowing.length === 0, `overflow on: ${overflowing.join(', ')}`)
    await page.setViewportSize({ width: 1280, height: 900 })
  })
}

// ------------------------------------------------------------------ sessions
await check('An expired or invalid session sends you to sign-in with a notice', async () => {
  await page.evaluate(() => {
    const payload = btoa(JSON.stringify({ exp: 9_999_999_999, role: 'admin' })).replace(/=+$/, '')
    localStorage.setItem('ft-admin-token', `x.${payload}.y`) // looks valid to the browser, rejected by the server
  })
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' })
  await page.waitForURL('**/admin/login')
  await visible(page.getByText(/your session has ended/i))
  assert((await page.evaluate(() => localStorage.getItem('ft-admin-token'))) === null, 'bad token was kept')
})
await check('Signing in again works; Log out ends the session and protects the pages again', async () => {
  await signIn()
  await page.waitForURL(/\/admin(\/)?$/)
  await visible(page.getByRole('heading', { name: 'Bookings', exact: true }))
  await page.getByRole('button', { name: /log out/i }).click()
  await page.waitForURL('**/admin/login')
  await page.goto(`${BASE}/admin/trip-plans`, { waitUntil: 'networkidle' })
  await page.waitForURL('**/admin/login')
  assert((await page.evaluate(() => localStorage.getItem('ft-admin-token'))) === null, 'token still stored after logout')
})

await browser.close()
const failed = results.filter((ok) => !ok).length
console.log(`\nUpdated booking: ${reference}   note: "${NOTE}"`)
console.log(`${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
