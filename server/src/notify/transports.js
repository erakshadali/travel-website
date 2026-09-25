import { randomUUID } from 'node:crypto'
import { sendResendEmail } from './resend.js'
import { renderTemplate } from './templates.js'
import { sendWhatsAppTemplate } from './whatsapp.js'

const indent = (text) => text.split('\n').map((line) => `    ${line}`).join('\n')

// LOG mode: nothing leaves this machine. The message is printed exactly as it would be sent.
function logEmail(logger, from, message) {
  logger.info(
    [
      '[notify:log] EMAIL',
      `  from:     ${from}`,
      `  to:       ${message.to}`,
      message.replyTo && `  reply-to: ${message.replyTo}`,
      `  subject:  ${message.subject}`,
      '  ---',
      indent(message.text),
      '  ---',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  return { id: `log-${randomUUID()}` }
}

function logWhatsApp(logger, defaultLanguage, message) {
  logger.info(
    [
      '[notify:log] WHATSAPP',
      `  to:       ${message.to}`,
      `  template: ${message.template.name} (${message.language ?? defaultLanguage})`,
      `  text:     ${renderTemplate(message.template, message.params)}`,
    ].join('\n'),
  )
  return { id: `log-${randomUUID()}` }
}

/**
 * The two ways out of the server. Each has `ready` (can it send right now?), `missing` (which env keys
 * it lacks), and `send(message)` which resolves `{ id }` or throws.
 *   email message:    { to, subject, html, text, replyTo? }
 *   whatsapp message: { to, template, params, language? }   (template = an entry of WHATSAPP_TEMPLATES)
 */
export function createTransports({ notify, fetchImpl = fetch, logger = console }) {
  const live = notify.mode === 'live'
  const { email, whatsapp } = notify

  const emailMissing = live && !email.apiKey ? ['RESEND_API_KEY'] : []
  const whatsappMissing = live ? [!whatsapp.phoneNumberId && 'WHATSAPP_PHONE_NUMBER_ID', !whatsapp.accessToken && 'WHATSAPP_ACCESS_TOKEN'].filter(Boolean) : []

  return {
    mode: notify.mode,
    email: {
      ready: emailMissing.length === 0,
      missing: emailMissing,
      send: live ? (message) => sendResendEmail({ apiKey: email.apiKey, from: email.from, fetchImpl }, message) : async (message) => logEmail(logger, email.from, message),
    },
    whatsapp: {
      ready: whatsappMissing.length === 0,
      missing: whatsappMissing,
      send: live
        ? (message) =>
            sendWhatsAppTemplate(
              { phoneNumberId: whatsapp.phoneNumberId, accessToken: whatsapp.accessToken, apiVersion: whatsapp.apiVersion, defaultLanguage: whatsapp.templateLanguage, fetchImpl },
              message,
            )
        : async (message) => logWhatsApp(logger, whatsapp.templateLanguage, message),
    },
  }
}

// One line for the server's start-up log, so a wrong mode or a missing key is obvious straight away.
export function describeNotifications(notify) {
  if (notify.mode === 'log') return 'Notifications: LOG mode. Nothing is sent; messages are printed and recorded.'
  const t = createTransports({ notify })
  const part = (name, transport) => (transport.ready ? `${name} on` : `${name} OFF (no ${transport.missing.join(' / ')})`)
  return `Notifications: LIVE mode. ${part('email', t.email)}, ${part('WhatsApp', t.whatsapp)}, ${notify.agencyEmail ? 'agency alerts on' : 'agency alerts OFF (no AGENCY_EMAIL)'}.`
}
