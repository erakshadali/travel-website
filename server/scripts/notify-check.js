// Sends ONE test email and ONE test WhatsApp using the settings in .env, so you can check your keys and
// your recipient list before any real booking depends on them. It does not touch the database.
//
//   npm run notify:check                                     both, to NOTIFY_TEST_EMAIL and NOTIFY_TEST_WHATSAPP
//   npm run notify:check -- --email-only
//   npm run notify:check -- --whatsapp-only
//   npm run notify:check -- --template booking_confirmation  send that template (with sample values) instead of hello_world
//
// With NOTIFY_MODE=log it only prints what it would send. With NOTIFY_MODE=live it really sends.
import dotenv from 'dotenv'
import { loadConfig } from '../src/config.js'
import { AGENCY_NAME } from '../src/notify/messages.js'
import { createTransports, describeNotifications } from '../src/notify/transports.js'
import { HELLO_WORLD, WHATSAPP_TEMPLATES } from '../src/notify/templates.js'

dotenv.config({ quiet: true })

let config
try {
  config = loadConfig()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
const { notify } = config
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const option = (name) => args[args.indexOf(`--${name}`) + 1]

const templateName = option('template') ?? 'hello_world'
const template = templateName === 'hello_world' ? HELLO_WORLD : WHATSAPP_TEMPLATES[templateName]
if (!template) {
  console.error(`Unknown template "${templateName}". Known: hello_world, ${Object.keys(WHATSAPP_TEMPLATES).join(', ')}`)
  process.exit(1)
}

const transports = createTransports({ notify })
console.log(`${describeNotifications(notify)}\n`)
let failed = false

async function attempt(label, channel, message) {
  const transport = transports[channel]
  if (!transport.ready) {
    console.log(`SKIP  ${label}: not configured (missing ${transport.missing.join(', ')})\n`)
    failed = true
    return
  }
  try {
    const { id } = await transport.send(message)
    console.log(`OK    ${label}${notify.mode === 'live' ? ` sent (id ${id})` : ' logged above'}\n`)
  } catch (err) {
    failed = true
    console.log(`FAIL  ${label}\n      ${err.message}\n`)
  }
}

if (!flag('whatsapp-only')) {
  const to = notify.testEmail
  if (!to) {
    console.log('SKIP  email: set NOTIFY_TEST_EMAIL in .env (where the test email should go)\n')
    failed = true
  } else {
    await attempt(`email to ${to}`, 'email', {
      to,
      replyTo: notify.agencyEmail,
      subject: `Test email from ${AGENCY_NAME}`,
      text: `This is a test email from ${AGENCY_NAME}.\nIf you can read this, email sending works.`,
      html: `<p style="font-family:Arial,sans-serif">This is a test email from <b>${AGENCY_NAME}</b>.<br>If you can read this, email sending works.</p>`,
    })
  }
}

if (!flag('email-only')) {
  const to = notify.testWhatsapp
  if (!to) {
    console.log('SKIP  WhatsApp: set NOTIFY_TEST_WHATSAPP in .env, like +911234567890\n')
    failed = true
  } else {
    // hello_world exists on every account (language en_US). Your own templates use WHATSAPP_TEMPLATE_LANGUAGE.
    const params = template.examples ?? []
    await attempt(`WhatsApp template "${template.name}" to ${to}`, 'whatsapp', { to, template, params, language: template.language })
  }
}

process.exit(failed ? 1 : 0)
