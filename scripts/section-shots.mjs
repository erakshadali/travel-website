// Screenshots each <section> (and the footer) of a page separately, for visual review.
// Usage: node scripts/section-shots.mjs <width> <path> [<path> ...]
import { chromium } from 'playwright'
import fs from 'fs'

const [width, ...paths] = process.argv.slice(2)
const w = Number(width)
const phone = w < 640
const BASE = 'http://localhost:5181'
fs.mkdirSync('audit-shots/sections', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: w, height: phone ? 844 : 900 }, isMobile: phone, hasTouch: phone })
for (const path of paths) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2900)
  // scroll slowly so every reveal animation and lazy image fires
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)) }
    await new Promise((r) => setTimeout(r, 1200))
  })
  const blocks = await page.locator('main section, footer').all()
  let i = 0
  for (const b of blocks) {
    const box = await b.boundingBox()
    if (!box || box.height < 20) continue
    await b.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const name = `audit-shots/sections/${w}${path.replace(/[^a-z0-9]+/gi, '_')}-${String(i++).padStart(2, '0')}.png`
    await b.screenshot({ path: name })
  }
  console.log(path, i, 'sections')
}
await browser.close()
