// End-to-end check of the four forms (Booking, Trip Planner, Contact, Newsletter) in a real browser.
//
//   node scripts/e2e-forms.mjs [frontendUrl]                     # default http://localhost:5180
//   node scripts/e2e-forms.mjs http://localhost:5182 --expect-failure
//
// Success mode: fills every form like a visitor and expects the success screen. Everything it
// submits uses <marker>@example.test addresses (marker = E2E_MARKER or generated), and the marker
// is printed at the end so the records can be looked up in the database.
// --expect-failure: for a frontend whose API is unreachable; expects each form to show its error
// message, stay on the form, and not show success.
//
// The frontend must be served with VITE_API_URL pointing at the backend, e.g.
//   VITE_API_URL=http://localhost:4111/api npm run dev -- --port 5180
import { chromium } from 'playwright'

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5180'
const EXPECT_FAILURE = process.argv.includes('--expect-failure')
const MARKER = process.env.E2E_MARKER ?? `e2e-${Date.now().toString(36)}`
const email = (who) => `${MARKER}-${who}@example.test`
const inDays = (n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)
const UNREACHABLE = /couldn.t reach the server/i

const results = []
const apiCalls = []

async function check(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`  PASS  ${name}`)
  } catch (err) {
    results.push({ name, ok: false })
    console.log(`  FAIL  ${name}\n        ${String(err.message).split('\n').slice(0, 2).join(' | ')}`)
    if (process.env.E2E_SHOT_DIR) {
      const file = `${process.env.E2E_SHOT_DIR}/${name.replace(/\W+/g, '-')}.png`
      await page.screenshot({ path: file, fullPage: true }).catch(() => {})
      console.log(`        screenshot: ${file}`)
    }
  }
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
page.on('response', (res) => {
  const req = res.request()
  if (req.method() === 'POST' && new URL(res.url()).pathname.startsWith('/api/')) apiCalls.push(`${res.status()} POST ${new URL(res.url()).pathname}`)
})

async function open(path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.locator('[aria-label^="Loading Fatima"]').waitFor({ state: 'detached', timeout: 15_000 })
}
const expectVisible = (locator, timeout = 20_000) => locator.waitFor({ state: 'visible', timeout })

console.log(`Frontend ${BASE}  marker ${MARKER}  mode ${EXPECT_FAILURE ? 'expect-failure' : 'success'}\n`)
let bookingReference = null

// ---------------------------------------------------------------- Newsletter
await check('Newsletter: invalid address is rejected in the browser', async () => {
  await open('/')
  const input = page.getByPlaceholder('Your email address').first()
  await input.fill('not-an-email')
  await page.getByRole('button', { name: /subscribe/i }).first().click()
  await expectVisible(page.getByText('Please enter a valid email address.'), 5000)
})
await check(EXPECT_FAILURE ? 'Newsletter: shows a friendly error when the server is unreachable' : 'Newsletter: subscribing shows the success message', async () => {
  await open('/')
  await page.getByPlaceholder('Your email address').first().fill(email('newsletter'))
  await page.getByRole('button', { name: /subscribe/i }).first().click()
  if (EXPECT_FAILURE) {
    await expectVisible(page.getByRole('alert').filter({ hasText: UNREACHABLE }))
    if (await page.getByText("You're on the list").count()) throw new Error('success message shown despite failure')
  } else {
    await expectVisible(page.getByText("You're on the list"))
  }
})

// ------------------------------------------------------------------- Contact
await check(EXPECT_FAILURE ? 'Contact: error shown, form keeps the typed message' : 'Contact: sending shows the success message', async () => {
  await open('/contact')
  await page.locator('#c-name').fill('E2E Contact')
  await page.locator('#c-email').fill(email('contact'))
  await page.locator('#c-topic').selectOption('Visa assistance')
  await page.locator('#c-msg').fill(`Automated test message ${MARKER}. Please ignore.`)
  await page.getByRole('button', { name: /send message/i }).click()
  if (EXPECT_FAILURE) {
    await expectVisible(page.getByRole('alert').filter({ hasText: UNREACHABLE }))
    if ((await page.locator('#c-msg').inputValue()) === '') throw new Error('form was cleared after a failed send')
    if (await page.getByText('Message sent').count()) throw new Error('success shown despite failure')
  } else {
    await expectVisible(page.getByText('Message sent'))
  }
})

// -------------------------------------------------------------- Trip planner
await check(EXPECT_FAILURE ? 'Trip planner: error shown, plan is kept' : 'Trip planner: sending a plan shows the success screen', async () => {
  await open('/planner')
  const next = () => page.getByRole('button', { name: /^(continue|review plan)/i })
  await page.getByRole('button', { name: /dubai/i }).first().click()
  await next().click()
  await page.locator('#tp-start').fill(inDays(45))
  await page.locator('#tp-end').fill(inDays(52))
  await next().click()
  await next().click() // travellers: defaults (2 adults)
  await page.getByRole('button', { name: '$3,000 – $5,000', exact: true }).click()
  await next().click()
  await page.getByRole('button', { name: 'Beach' }).click()
  await page.getByRole('button', { name: 'Food' }).click()
  await next().click()
  await page.getByRole('button', { name: /luxury 5/i }).click()
  await next().click() // "Review plan"

  // contact details are required before sending
  await page.getByRole('button', { name: /send my plan/i }).click()
  await expectVisible(page.getByText('Please enter your name.'), 5000)
  await expectVisible(page.getByText('Please enter a valid email.'), 5000)

  await page.locator('#tp-name').fill('E2E Planner')
  await page.locator('#tp-email').fill(email('plan'))
  await page.locator('#tp-phone').fill('+971 50 123 4567')
  await page.getByRole('button', { name: /send my plan/i }).click()
  if (EXPECT_FAILURE) {
    await expectVisible(page.getByRole('alert').filter({ hasText: UNREACHABLE }))
    if ((await page.locator('#tp-name').inputValue()) !== 'E2E Planner') throw new Error('plan/contact details were lost')
    if (await page.getByText('Your plan is on its way').count()) throw new Error('success shown despite failure')
  } else {
    await expectVisible(page.getByText('Your plan is on its way'))
  }
})

// ------------------------------------------------------------------- Booking
await check(EXPECT_FAILURE ? 'Booking: error shown, booking is kept' : 'Booking: consent is required, then a booking is confirmed with an FT- reference', async () => {
  await open('/booking?package=dubai-luxe-escape')
  const cont = () => page.getByRole('button', { name: /^continue/i })

  await page.locator('#bk-fullName').fill('E2E Booker')
  await page.locator('#bk-email').fill(email('booking'))
  await page.locator('#bk-whatsapp').fill('0501234567') // no country code
  await page.locator('#bk-passportName').fill('agent 007') // digits are not allowed
  await cont().click()
  await expectVisible(page.getByText('Include the country code, e.g. +971 50 123 4567.'), 5000)
  await expectVisible(page.getByText('Use letters only'), 5000)
  await expectVisible(page.getByText('Please tick this box to continue.'), 5000)

  await page.locator('#bk-whatsapp').fill('+971 50 123 4567')
  await page.locator('#bk-passportName').fill('tester o’booker') // curly apostrophe, as phone keyboards type it
  await cont().click()
  await expectVisible(page.getByText('Please tick this box to continue.'), 5000) // number fixed, consent still missing
  await page.getByLabel(/send me trip updates on whatsapp/i).check()
  await cont().click()

  await page.locator('#bk-departure').fill(inDays(40))
  await page.locator('#bk-room').selectOption('deluxe')
  await cont().click()

  await page.locator('#bk-notes').fill(`Automated test ${MARKER}`)
  await page.getByRole('button', { name: /confirm booking/i }).click()
  if (EXPECT_FAILURE) {
    await expectVisible(page.getByRole('alert').filter({ hasText: UNREACHABLE }))
    if (await page.getByText('Booking request received').count()) throw new Error('success shown despite failure')
    await expectVisible(page.getByRole('button', { name: /confirm booking/i }), 5000) // button usable again
  } else {
    await expectVisible(page.getByText('Booking request received'))
    bookingReference = (await page.locator('span.font-mono').first().innerText()).trim()
    if (!/^FT-[A-HJ-NP-Z2-9]{7}$/.test(bookingReference)) throw new Error(`unexpected reference "${bookingReference}"`)
  }
})

await browser.close()

console.log('\nAPI calls seen by the browser:', apiCalls.length ? apiCalls.join(', ') : '(none)')
console.log(JSON.stringify({ marker: MARKER, bookingReference }))
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
