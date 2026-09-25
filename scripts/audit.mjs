// Responsive audit: opens every page / form step at every viewport and reports
// horizontal overflow (with the offending elements), small tap targets and small body text.
// Usage: node scripts/audit.mjs [baseUrl] [--shots]
import { chromium } from 'playwright'
import fs from 'fs'

const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:5181'
const SHOTS = process.argv.includes('--shots')
const SHOT_DIR = 'audit-shots'

const VIEWPORTS = [
  { name: '360', width: 360, height: 740, phone: true },
  { name: '375', width: 375, height: 812, phone: true },
  { name: '390', width: 390, height: 844, phone: true },
  { name: '414', width: 414, height: 896, phone: true },
  { name: '360-land', width: 740, height: 360, phone: true },
  { name: '375-land', width: 812, height: 375, phone: true },
  { name: '390-land', width: 844, height: 390, phone: true },
  { name: '414-land', width: 896, height: 414, phone: true },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1440', width: 1440, height: 900 },
]

// Measure what really overflows: disable the site's own overflow-x safety net while measuring.
const UNCLIP = 'html,body{overflow-x:visible!important}'

async function measure(page, vp) {
  return page.evaluate(({ phone, width }) => {
    // use the configured device width: mobile Chrome widens innerWidth when content overflows
    const vw = width
    const docOverflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw
    const isFixed = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true
      return false
    }
    const clippedByAncestor = (el) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const ox = getComputedStyle(n).overflowX
        if (ox !== 'visible' && n.getBoundingClientRect().right <= vw + 1) return true
      }
      return false
    }
    const describe = (el) => {
      const r = el.getBoundingClientRect()
      const cls = (el.getAttribute('class') || '').split(/\s+/).slice(0, 6).join('.')
      const txt = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)
      return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} [w=${Math.round(r.width)} right=${Math.round(r.right)}] "${txt}"`
    }
    const offenders = []
    if (docOverflow > 0) {
      const all = [...document.body.querySelectorAll('*')]
      const out = new Set(
        all.filter((el) => {
          const r = el.getBoundingClientRect()
          return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !isFixed(el) && !clippedByAncestor(el)
        }),
      )
      // report only the outermost offenders
      for (const el of out) if (!out.has(el.parentElement)) offenders.push(describe(el))
    }

    let smallTaps = []
    let smallText = []
    if (phone) {
      const seen = new Set()
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')) {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || isFixed(el) && cs.opacity === '0') continue
        if (el.closest('[aria-hidden="true"]') || el.classList.contains('sr-only')) continue
        // not-yet-loaded lazy images give gallery buttons a temporary 0-2px height
        if ([...el.querySelectorAll('img')].some((img) => !img.complete)) continue
        // a control wrapped in a <label> is tapped via the whole label
        const hit = Math.max(r.height, el.closest('label')?.getBoundingClientRect().height ?? 0)
        if (hit < 43.5) {
          const key = describe(el).replace(/\[w=.*?\]/, '')
          if (!seen.has(key)) { seen.add(key); smallTaps.push(`${describe(el)} h=${Math.round(r.height)}`) }
        }
      }
      for (const el of document.querySelectorAll('main p, main li, footer p, footer li')) {
        const r = el.getBoundingClientRect()
        const fs = parseFloat(getComputedStyle(el).fontSize)
        const text = (el.innerText || '').trim()
        if (r.width && fs < 15 && text.length > 25) smallText.push(`${fs}px "${text.slice(0, 40)}"`)
      }
    }
    return { vw, docOverflow, offenders: offenders.slice(0, 8), smallTaps, smallText: [...new Set(smallText)] }
  }, vp)
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, document.body.scrollHeight)
    await new Promise((r) => setTimeout(r, 900))
  })
}

async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: UNCLIP })
  await page.waitForTimeout(2900) // loader + intro animations
}

// ---- scenarios -------------------------------------------------------------
const pages = [
  ['Home', '/'],
  ['Destinations', '/destinations'],
  ['Packages', '/packages'],
  ['Package: Dubai', '/packages/dubai-luxe-escape'],
  ['Package: Swiss', '/packages/swiss-alpine-grandeur'],
  ['Package: Maldives', '/packages/maldives-overwater-romance'],
  ['Experiences', '/experiences'],
  ['About', '/about'],
  ['Contact', '/contact'],
  ['404', '/this-page-does-not-exist'],
]

async function plannerFlow(page, record) {
  await open(page, '/planner')
  const cont = page.getByRole('button', { name: /continue|review plan/i })
  await record('Planner step 1 (destination)')
  await page.getByRole('button', { name: 'Bali', exact: false }).first().click()
  await cont.click(); await page.waitForTimeout(700)
  await record('Planner step 2 (dates)')
  await page.getByText('My dates are flexible').click()
  await cont.click(); await page.waitForTimeout(700)
  await record('Planner step 3 (travellers)')
  await cont.click(); await page.waitForTimeout(700)
  await record('Planner step 4 (budget)')
  await page.getByRole('button', { name: /\$1,500 – \$3,000/ }).click()
  await cont.click(); await page.waitForTimeout(700)
  await record('Planner step 5 (interests)')
  await page.getByRole('button', { name: 'Beach' }).click()
  await cont.click(); await page.waitForTimeout(700)
  await record('Planner step 6 (hotel)')
  await page.getByRole('button', { name: /Luxury 5★/ }).click()
  await cont.click(); await page.waitForTimeout(900)
  await record('Planner summary')
  await page.fill('#tp-name', 'Aisha Rahman')
  await page.fill('#tp-email', 'aisha@example.com')
  await page.getByRole('button', { name: /send my plan/i }).click()
  await page.waitForTimeout(2200)
  await record('Planner sent')
}

async function bookingFlow(page, record) {
  await open(page, '/booking?package=maldives-overwater-romance')
  await record('Booking step 1 (traveller)')
  await page.fill('#bk-fullName', 'Aisha Rahman')
  await page.fill('#bk-email', 'aisha@example.com')
  await page.fill('#bk-whatsapp', '+971 50 123 4567')
  await page.fill('#bk-passportName', 'AISHA RAHMAN')
  await page.getByLabel(/send me trip updates on whatsapp/i).check()
  await page.getByRole('button', { name: /continue/i }).click(); await page.waitForTimeout(800)
  const d = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
  await page.fill('#bk-departure', d)
  await page.fill('#bk-children', '2')
  await record('Booking step 2 (trip)')
  await page.getByRole('button', { name: /continue/i }).click(); await page.waitForTimeout(800)
  await page.getByText(/Add comprehensive travel insurance/).click()
  await record('Booking step 3 (requests)')
  await page.getByRole('button', { name: /confirm booking/i }).click()
  await page.waitForTimeout(2500)
  await record('Booking success')
}

async function extras(page, record, vp) {
  if (vp.width < 1280) {
    await open(page, '/')
    await page.getByRole('button', { name: 'Open menu' }).click(); await page.waitForTimeout(900)
    await record('Mobile menu open')
  }
  await open(page, '/experiences')
  await page.locator('button[aria-label^="View photo"]').first().scrollIntoViewIfNeeded()
  await page.locator('button[aria-label^="View photo"]').first().click(); await page.waitForTimeout(900)
  await record('Lightbox open')
}

// ---- run -------------------------------------------------------------------
const onlyVp = process.env.VP?.split(',')
const results = []
const browser = await chromium.launch()
if (SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true })

for (const vp of VIEWPORTS.filter((v) => !onlyVp || onlyVp.includes(v.name))) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.phone, isMobile: vp.phone, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))

  const record = async (label, { beforeScroll } = {}) => {
    const m = await measure(page, vp)
    results.push({ vp: vp.name, label, ...m })
  }

  for (const [label, path] of pages) {
    await open(page, path)
    const before = await measure(page, vp)
    results.push({ vp: vp.name, label: `${label} (on load)`, ...before })
    await scrollThrough(page)
    await record(`${label} (scrolled)`)
    if (SHOTS && ['390', '1440'].includes(vp.name)) {
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400)
      await page.screenshot({ path: `${SHOT_DIR}/${vp.name}-${label.replace(/[^a-z0-9]+/gi, '_')}.png`, fullPage: true })
    }
  }
  const shot = async (label) => {
    await record(label)
    if (SHOTS && ['390', '1440'].includes(vp.name)) await page.screenshot({ path: `${SHOT_DIR}/${vp.name}-${label.replace(/[^a-z0-9]+/gi, '_')}.png` })
  }
  try { await plannerFlow(page, shot) } catch (e) { results.push({ vp: vp.name, label: 'Planner flow FAILED', error: e.message.split('\n').slice(0, 10).join(' / ') }) }
  try { await bookingFlow(page, shot) } catch (e) { results.push({ vp: vp.name, label: 'Booking flow FAILED', error: e.message.split('\n').slice(0, 10).join(' / ') }) }
  try { await extras(page, shot, vp) } catch (e) { results.push({ vp: vp.name, label: 'Extras FAILED', error: e.message.split('\n').slice(0, 10).join(' / ') }) }
  if (errors.length) results.push({ vp: vp.name, label: 'JS errors', error: [...new Set(errors)].join(' | ') })
  await ctx.close()
  process.stdout.write(`done ${vp.name}\n`)
}
await browser.close()

fs.writeFileSync(process.env.OUT ?? 'audit-results.json', JSON.stringify(results, null, 2))
const fails = results.filter((r) => r.docOverflow > 0 || r.error)
console.log(`\nStates checked: ${results.length}  |  overflow/errors: ${fails.length}`)
for (const r of fails) {
  console.log(`\n[${r.vp}] ${r.label}: ${r.error ?? `overflow ${r.docOverflow}px`}`)
  for (const o of r.offenders ?? []) console.log('   - ' + o)
}
