import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { AGENCY_NAME, agencyAlertEmail, clientConfirmationEmail, clientWhatsAppParams, escapeHtml, firstName, oneLine } from '../src/notify/messages.js'
import { HELLO_WORLD, WHATSAPP_TEMPLATES, renderTemplate } from '../src/notify/templates.js'
import { sendResendEmail } from '../src/notify/resend.js'
import { cleanParam, sendWhatsAppTemplate } from '../src/notify/whatsapp.js'
import { createTransports, describeNotifications } from '../src/notify/transports.js'
import { captureLogger, testNotify } from './helpers.js'

const booking = (overrides = {}) => ({
  id: '64b7f0c2a1b2c3d4e5f60718',
  reference: 'FT-AB12CDE',
  clientName: 'Aisha Khan',
  email: 'aisha@example.test',
  whatsappNumber: '+971501234567',
  passportName: 'AISHA KHAN',
  packageName: 'Dubai Luxe Escape',
  destination: 'Dubai',
  travelDate: new Date('2026-10-12T00:00:00Z'),
  travellers: { adults: 2, children: 1 },
  roomType: 'deluxe',
  currency: 'USD',
  estimatedTotal: 4200,
  insurance: true,
  whatsappConsent: true,
  optedOut: false,
  specialRequests: 'Halal meals',
  occasion: 'Honeymoon',
  ...overrides,
})

// A stand-in for fetch: records every call and answers with whatever `respond` returns.
const fakeFetch = (respond) => {
  const calls = []
  const fn = async (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined })
    return respond(url, init)
  }
  fn.calls = calls
  return fn
}
const reply = (status, data) => new Response(typeof data === 'string' ? data : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

describe('text helpers', () => {
  test('escapeHtml neutralises markup and quotes', () => {
    assert.equal(escapeHtml(`<script>alert("x")</script> & 'y'`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;')
    assert.equal(escapeHtml(undefined), '')
  })
  test('oneLine removes line breaks and control characters', () => {
    assert.equal(oneLine('a\r\nb\tc   d\u0000e'), 'a b c d e')
  })
  test('firstName', () => {
    assert.equal(firstName('  Aisha   Khan '), 'Aisha')
    assert.equal(firstName(''), 'there')
  })
})

describe('client confirmation email', () => {
  test('carries the booking details in both the HTML and the plain-text version', () => {
    const { subject, html, text } = clientConfirmationEmail(booking())
    assert.match(subject, /FT-AB12CDE/)
    for (const part of ['Aisha', 'FT-AB12CDE', 'Dubai Luxe Escape', '12 Oct 2026', '2 adults, 1 child', 'Deluxe', 'AISHA KHAN', 'USD 4,200', 'Halal meals']) {
      assert.ok(html.includes(part), `html is missing "${part}"`)
      assert.ok(text.includes(part), `text is missing "${part}"`)
    }
    assert.ok(text.includes(AGENCY_NAME))
  })
  test('promises WhatsApp only to clients who agreed to it', () => {
    assert.match(clientConfirmationEmail(booking()).text, /by WhatsApp and email/)
    assert.match(clientConfirmationEmail(booking({ whatsappConsent: false })).text, /by email within/)
    assert.doesNotMatch(clientConfirmationEmail(booking({ optedOut: true })).text, /WhatsApp/)
  })
  test('anything a visitor typed is escaped, so it cannot inject markup into the email', () => {
    const evil = booking({
      clientName: '<img src=x onerror=alert(1)>',
      packageName: 'Tour <b>&</b> "more"',
      passportName: `O'NEIL <script>`,
      specialRequests: '<script>steal()</script>\n"><a href="http://evil.test">click</a>',
    })
    const { html } = clientConfirmationEmail(evil)
    assert.doesNotMatch(html, /<script/i)
    assert.doesNotMatch(html, /<img/i)
    assert.doesNotMatch(html, /href="http:\/\/evil/)
    assert.ok(html.includes('&lt;script&gt;steal()'))
    assert.ok(html.includes('Tour &lt;b&gt;&amp;&lt;/b&gt; &quot;more&quot;'))
  })
  test('the subject is a single line even if the name contains line breaks', () => {
    const { subject } = clientConfirmationEmail(booking({ clientName: 'Eve\r\nBcc: victim@example.test' }))
    assert.doesNotMatch(subject, /[\r\n]/)
    const alert = agencyAlertEmail(booking({ clientName: 'Eve\r\nBcc: victim@example.test' }))
    assert.doesNotMatch(alert.subject, /[\r\n]/)
  })
  test('optional rows are left out when empty', () => {
    const { text } = clientConfirmationEmail(booking({ specialRequests: undefined }))
    assert.doesNotMatch(text, /Your requests/)
  })
})

describe('agency alert email', () => {
  test('has everything the agency needs to act, with working contact links', () => {
    const { subject, html, text } = agencyAlertEmail(booking(), { siteUrl: 'https://site.test' })
    assert.match(subject, /New booking FT-AB12CDE: Aisha Khan, Dubai, 12 Oct 2026/)
    for (const part of ['aisha@example.test', '+971501234567', 'AISHA KHAN', 'Honeymoon', 'Halal meals', 'Client agreed']) assert.ok(text.includes(part), `text missing ${part}`)
    assert.ok(html.includes('href="mailto:aisha@example.test"'))
    assert.ok(html.includes('href="https://wa.me/971501234567"'))
    assert.ok(html.includes('href="https://site.test/admin/bookings/64b7f0c2a1b2c3d4e5f60718"'))
    assert.match(text, /OPEN IN ADMIN: https:\/\/site\.test\/admin\/bookings\/64b7f0c2a1b2c3d4e5f60718/)
  })
  test('no admin button without a SITE_URL', () => {
    const { html, text } = agencyAlertEmail(booking())
    assert.doesNotMatch(html, /OPEN IN ADMIN/)
    assert.doesNotMatch(text, /OPEN IN ADMIN/)
  })
  test('shows when the client did not agree to WhatsApp', () => {
    assert.match(agencyAlertEmail(booking({ whatsappConsent: false })).text, /No consent or opted out/)
  })
  test('escapes visitor input here too', () => {
    const { html } = agencyAlertEmail(booking({ clientName: '<script>x</script>', specialRequests: '<iframe src=//evil>' }))
    assert.doesNotMatch(html, /<script|<iframe/i)
  })
})

describe('WhatsApp template', () => {
  test('the variables are first name, reference, package, date, in that order', () => {
    assert.deepEqual(clientWhatsAppParams(booking({ packageName: 'Dubai\nLuxe' })), ['Aisha', 'FT-AB12CDE', 'Dubai Luxe', '12 Oct 2026'])
  })
  test('renders the sentence the customer will read', () => {
    const text = renderTemplate(WHATSAPP_TEMPLATES.booking_confirmation, clientWhatsAppParams(booking()))
    assert.match(text, /^Hello Aisha, thank you for booking with Premium Tours and Travels\. Your booking reference is FT-AB12CDE for Dubai Luxe Escape, departing 12 Oct 2026\./)
    assert.doesNotMatch(text, /\{\{/)
  })
  test('follows the WhatsApp template rules: variables are numbered, do not start or end the text, and examples match', () => {
    const t = WHATSAPP_TEMPLATES.booking_confirmation
    assert.deepEqual([...t.body.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1])), [1, 2, 3, 4])
    assert.equal(t.examples.length, 4)
    assert.doesNotMatch(t.body, /^\{\{/)
    assert.doesNotMatch(t.body, /\}\}[.!\s]*$/)
    assert.match(t.name, /^[a-z0-9_]+$/)
    assert.ok(t.body.length < 1024)
  })
  test('cleanParam removes what WhatsApp rejects', () => {
    assert.equal(cleanParam('a\nb\tc    d'), 'a b c d')
    assert.equal(cleanParam('x'.repeat(2000)).length, 1000)
  })
})

describe('sendResendEmail', () => {
  const settings = (fetchImpl) => ({ apiKey: 're_test_key', from: 'Fatima <onboarding@resend.dev>', fetchImpl })
  const message = { to: 'aisha@example.test', subject: 'Hi', html: '<p>Hi</p>', text: 'Hi', replyTo: 'agency@example.test' }

  test('posts the email to Resend in the documented shape and returns its id', async () => {
    const fetchImpl = fakeFetch(() => reply(200, { id: 'abc-123' }))
    assert.deepEqual(await sendResendEmail(settings(fetchImpl), message), { id: 'abc-123' })
    const [call] = fetchImpl.calls
    assert.equal(call.url, 'https://api.resend.com/emails')
    assert.equal(call.init.method, 'POST')
    assert.equal(call.init.headers.Authorization, 'Bearer re_test_key')
    assert.deepEqual(call.body, { from: 'Fatima <onboarding@resend.dev>', to: ['aisha@example.test'], subject: 'Hi', html: '<p>Hi</p>', text: 'Hi', reply_to: 'agency@example.test' })
  })
  test('leaves reply_to out when there is none', async () => {
    const fetchImpl = fakeFetch(() => reply(200, { id: 'x' }))
    await sendResendEmail(settings(fetchImpl), { ...message, replyTo: undefined })
    assert.equal('reply_to' in fetchImpl.calls[0].body, false)
  })
  test("passes Resend's own explanation through, e.g. the testing-domain restriction", async () => {
    const fetchImpl = fakeFetch(() => reply(403, { statusCode: 403, name: 'validation_error', message: 'You can only send testing emails to your own email address (me@example.test).' }))
    await assert.rejects(sendResendEmail(settings(fetchImpl), message), /Resend 403 \(validation_error\): You can only send testing emails to your own email address/)
  })
  test('copes with an error page instead of JSON, a missing id, a dead network and a timeout', async () => {
    await assert.rejects(sendResendEmail(settings(fakeFetch(() => reply(502, '<html>Bad gateway</html>'))), message), /Resend 502: no details given/)
    await assert.rejects(sendResendEmail(settings(fakeFetch(() => reply(200, {}))), message), /returned no email id/)
    await assert.rejects(sendResendEmail(settings(async () => { throw new TypeError('fetch failed') }), message), /Could not reach Resend: fetch failed/)
    const hangs = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)))
    await assert.rejects(sendResendEmail({ ...settings(hangs), timeoutMs: 40 }, message), /Resend did not answer within/)
  })
})

describe('sendWhatsAppTemplate', () => {
  const settings = (fetchImpl) => ({ phoneNumberId: '1234567890', accessToken: 'EAAtoken', apiVersion: 'v23.0', defaultLanguage: 'en', fetchImpl })
  const ok = () => reply(200, { messaging_product: 'whatsapp', contacts: [{ wa_id: '911234567890' }], messages: [{ id: 'wamid.HBg' }] })

  test('posts a template message in the documented shape', async () => {
    const fetchImpl = fakeFetch(ok)
    const result = await sendWhatsAppTemplate(settings(fetchImpl), {
      to: '+911234567890',
      template: WHATSAPP_TEMPLATES.booking_confirmation,
      params: ['Aisha', 'FT-AB12CDE', 'Dubai\nLuxe  Escape', '12 Oct 2026'],
    })
    assert.deepEqual(result, { id: 'wamid.HBg' })
    const [call] = fetchImpl.calls
    assert.equal(call.url, 'https://graph.facebook.com/v23.0/1234567890/messages')
    assert.equal(call.init.headers.Authorization, 'Bearer EAAtoken')
    assert.deepEqual(call.body, {
      messaging_product: 'whatsapp',
      to: '911234567890', // digits only, no +
      type: 'template',
      template: {
        name: 'booking_confirmation',
        language: { code: 'en' },
        components: [{ type: 'body', parameters: ['Aisha', 'FT-AB12CDE', 'Dubai Luxe Escape', '12 Oct 2026'].map((text) => ({ type: 'text', text })) }],
      },
    })
  })
  test('a template with no variables (hello_world) has no components, and can override the language', async () => {
    const fetchImpl = fakeFetch(ok)
    await sendWhatsAppTemplate(settings(fetchImpl), { to: '+911234567890', template: HELLO_WORLD, language: HELLO_WORLD.language })
    assert.deepEqual(fetchImpl.calls[0].body.template, { name: 'hello_world', language: { code: 'en_US' } })
  })

  const cases = [
    [190, 'Error validating access token: Session has expired', /Hint: The access token is invalid or has expired\. Temporary tokens last only about 24 hours/],
    [131030, 'Recipient phone number not in allowed list', /Hint: This number is not on the allowed recipient list\. Add it/],
    [132001, 'Template name does not exist in the translation', /Hint: That template name does not exist in that language/],
    [132000, 'Number of parameters does not match the expected number of params', /Hint: The number of variables sent does not match/],
    [100, 'Invalid parameter', /Hint: Meta rejected the request\. Check that WHATSAPP_PHONE_NUMBER_ID/],
  ]
  for (const [code, message, expected] of cases) {
    test(`error ${code} comes with a plain-language hint`, async () => {
      const fetchImpl = fakeFetch(() => reply(400, { error: { message, type: 'OAuthException', code, fbtrace_id: 'x' } }))
      await assert.rejects(sendWhatsAppTemplate(settings(fetchImpl), { to: '+911234567890', template: HELLO_WORLD }), (err) => {
        assert.match(err.message, new RegExp(`WhatsApp error ${code}: ${message}`))
        assert.match(err.message, expected)
        return true
      })
    })
  }
  test('an unknown error code is reported without a made-up hint', async () => {
    const fetchImpl = fakeFetch(() => reply(400, { error: { message: 'Something new', code: 999999 } }))
    await assert.rejects(sendWhatsAppTemplate(settings(fetchImpl), { to: '+1', template: HELLO_WORLD }), (err) => {
      assert.match(err.message, /WhatsApp error 999999: Something new/)
      assert.doesNotMatch(err.message, /Hint/)
      return true
    })
  })
  test('the access token never appears in an error message', async () => {
    const fetchImpl = fakeFetch(() => reply(401, { error: { message: 'bad token', code: 190 } }))
    await assert.rejects(sendWhatsAppTemplate(settings(fetchImpl), { to: '+1', template: HELLO_WORLD }), (err) => !err.message.includes('EAAtoken'))
  })
  test('copes with a missing message id, an error page, a dead network and a timeout', async () => {
    await assert.rejects(sendWhatsAppTemplate(settings(fakeFetch(() => reply(200, {}))), { to: '+1', template: HELLO_WORLD }), /returned no message id/)
    await assert.rejects(sendWhatsAppTemplate(settings(fakeFetch(() => reply(503, '<html>'))), { to: '+1', template: HELLO_WORLD }), /WhatsApp error 503: no details given/)
    await assert.rejects(sendWhatsAppTemplate(settings(async () => { throw new TypeError('fetch failed') }), { to: '+1', template: HELLO_WORLD }), /Could not reach WhatsApp: fetch failed/)
    const hangs = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)))
    await assert.rejects(sendWhatsAppTemplate({ ...settings(hangs), timeoutMs: 40 }, { to: '+1', template: HELLO_WORLD }), /WhatsApp did not answer within/)
  })
})

describe('transports', () => {
  test('log mode prints exactly what would be sent, sends nothing over the network, and is always ready', async () => {
    const logger = captureLogger()
    const fetchImpl = fakeFetch(() => reply(500, {}))
    const t = createTransports({ notify: testNotify(), fetchImpl, logger })
    assert.equal(t.email.ready && t.whatsapp.ready, true)

    const email = await t.email.send({ to: 'aisha@example.test', replyTo: 'agency@example.test', subject: 'Booking request', text: 'Line one\nLine two' })
    assert.match(email.id, /^log-/)
    const wa = await t.whatsapp.send({ to: '+911234567890', template: WHATSAPP_TEMPLATES.booking_confirmation, params: ['Aisha', 'FT-AB12CDE', 'Dubai Luxe Escape', '12 Oct 2026'] })
    assert.match(wa.id, /^log-/)

    const [emailLog, waLog] = logger.lines
    assert.match(emailLog, /\[notify:log\] EMAIL/)
    for (const part of ['to:       aisha@example.test', 'reply-to: agency@example.test', 'subject:  Booking request', 'Line one', 'Line two']) assert.ok(emailLog.includes(part), part)
    assert.match(waLog, /\[notify:log\] WHATSAPP/)
    assert.ok(waLog.includes('to:       +911234567890'))
    assert.ok(waLog.includes('template: booking_confirmation (en)'))
    assert.ok(waLog.includes('Hello Aisha, thank you for booking'))
    assert.equal(fetchImpl.calls.length, 0)
  })

  test('live mode reports which keys each channel is missing', () => {
    const none = createTransports({ notify: testNotify({ mode: 'live' }) })
    assert.deepEqual([none.email.ready, none.email.missing], [false, ['RESEND_API_KEY']])
    assert.deepEqual([none.whatsapp.ready, none.whatsapp.missing], [false, ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN']])
    const emailOnly = createTransports({ notify: testNotify({ mode: 'live', email: { apiKey: 're_x123456789', from: 'x' } }) })
    assert.deepEqual([emailOnly.email.ready, emailOnly.whatsapp.ready], [true, false])
  })

  test('live mode really calls the providers, with the configured sender and keys', async () => {
    const fetchImpl = fakeFetch((url) => (url.includes('resend') ? reply(200, { id: 'em-1' }) : reply(200, { messages: [{ id: 'wa-1' }] })))
    const notify = testNotify({
      mode: 'live',
      email: { apiKey: 're_live_key', from: 'Fatima <hello@example.test>' },
      whatsapp: { phoneNumberId: '555', accessToken: 'EAAlive', apiVersion: 'v23.0', templateLanguage: 'en' },
    })
    const t = createTransports({ notify, fetchImpl })
    assert.deepEqual(await t.email.send({ to: 'a@example.test', subject: 's', html: 'h', text: 't' }), { id: 'em-1' })
    assert.deepEqual(await t.whatsapp.send({ to: '+919999999999', template: HELLO_WORLD, language: 'en_US' }), { id: 'wa-1' })
    assert.equal(fetchImpl.calls[0].body.from, 'Fatima <hello@example.test>')
    assert.equal(fetchImpl.calls[1].url, 'https://graph.facebook.com/v23.0/555/messages')
  })

  test('the start-up summary makes the mode and any missing key obvious', () => {
    assert.match(describeNotifications(testNotify()), /LOG mode\. Nothing is sent/)
    assert.match(describeNotifications(testNotify({ mode: 'live', email: { apiKey: 're_x123456789', from: 'x' } })), /LIVE mode\. email on, WhatsApp OFF \(no WHATSAPP_PHONE_NUMBER_ID \/ WHATSAPP_ACCESS_TOKEN\), agency alerts on/)
    assert.match(describeNotifications(testNotify({ mode: 'live', agencyEmail: undefined, email: { apiKey: 're_x123456789', from: 'x' } })), /agency alerts OFF \(no AGENCY_EMAIL\)/)
  })
})
