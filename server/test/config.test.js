import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { loadConfig } from '../src/config.js'

const valid = () => ({
  MONGODB_URI: 'mongodb+srv://user:s3cret@cluster0.abc.mongodb.net/fatima-tours?appName=fatima-tours',
  JWT_SECRET: 'x'.repeat(32),
  ADMIN_EMAIL: 'Owner@Example.com',
  ADMIN_PASSWORD_HASH: bcrypt.hashSync('a-long-password', 4),
})

describe('loadConfig', () => {
  test('accepts a complete environment and applies defaults', () => {
    const c = loadConfig(valid())
    assert.equal(c.adminEmail, 'owner@example.com')
    assert.equal(c.port, 4000)
    assert.equal(c.publicRateLimit, 10)
    assert.deepEqual(c.frontendOrigins, ['http://localhost:5180', 'https://premium-travels-one.vercel.app'])
  })

  test('refuses to start while MONGODB_URI still has the <db_password> placeholder', () => {
    const env = { ...valid(), MONGODB_URI: 'mongodb+srv://user:<db_password>@cluster0.abc.mongodb.net/fatima-tours' }
    assert.throws(() => loadConfig(env), /placeholder.*db_password/)
  })

  test('refuses an empty ADMIN_PASSWORD_HASH (until npm run hash-password is run)', () => {
    assert.throws(() => loadConfig({ ...valid(), ADMIN_PASSWORD_HASH: '' }), /npm run hash-password/)
  })

  test('refuses a short JWT_SECRET and reports every problem at once', () => {
    assert.throws(() => loadConfig({ ...valid(), JWT_SECRET: 'short', MONGODB_URI: '' }), (err) => {
      assert.match(err.message, /JWT_SECRET/)
      assert.match(err.message, /MONGODB_URI/)
      return true
    })
  })

  test('error messages never echo secret values', () => {
    const env = { ...valid(), JWT_SECRET: 'tooshort-secret-value', MONGODB_URI: 'mongodb+srv://user:<db_password>@x/y' }
    assert.throws(() => loadConfig(env), (err) => {
      assert.doesNotMatch(err.message, /tooshort-secret-value/)
      assert.doesNotMatch(err.message, /mongodb\+srv/)
      return true
    })
  })
})

describe('notification settings', () => {
  const live = (extra = {}) => ({ ...valid(), NOTIFY_MODE: 'live', ...extra })
  const KEY = 're_' + 'a'.repeat(30)
  const TOKEN = 'EAA' + 'b'.repeat(60)

  test('default to log mode, so nothing is ever sent unless you switch it on', () => {
    const { notify } = loadConfig(valid())
    assert.equal(notify.mode, 'log')
    assert.equal(notify.agencyEmail, undefined)
    assert.equal(notify.email.from, 'Premium Tours and Travels <onboarding@resend.dev>')
    assert.equal(notify.whatsapp.apiVersion, 'v23.0')
    assert.equal(notify.whatsapp.templateLanguage, 'en')
  })

  test('blank lines in .env count as not set', () => {
    const { notify } = loadConfig({ ...valid(), RESEND_API_KEY: '', AGENCY_EMAIL: '  ', WHATSAPP_PHONE_NUMBER_ID: '', WHATSAPP_ACCESS_TOKEN: '', SITE_URL: '' })
    assert.equal(notify.email.apiKey, undefined)
    assert.equal(notify.agencyEmail, undefined)
    assert.equal(notify.whatsapp.phoneNumberId, undefined)
    assert.equal(notify.siteUrl, undefined)
  })

  test('read every setting, tidying addresses and the site URL', () => {
    const { notify } = loadConfig(
      live({
        AGENCY_EMAIL: ' Owner@Example.COM ',
        RESEND_API_KEY: KEY,
        EMAIL_FROM: 'Fatima <hello@example.com>',
        WHATSAPP_PHONE_NUMBER_ID: '123456789012345',
        WHATSAPP_ACCESS_TOKEN: TOKEN,
        SITE_URL: 'https://site.example.com/',
        NOTIFY_TEST_EMAIL: 'me@example.com',
        NOTIFY_TEST_WHATSAPP: '+911234567890',
      }),
    )
    assert.equal(notify.mode, 'live')
    assert.equal(notify.agencyEmail, 'owner@example.com')
    assert.equal(notify.siteUrl, 'https://site.example.com')
    assert.equal(notify.email.apiKey, KEY)
    assert.equal(notify.whatsapp.phoneNumberId, '123456789012345')
    assert.equal(notify.whatsapp.accessToken, TOKEN)
    assert.equal(notify.testWhatsapp, '+911234567890')
  })

  test('live mode with only the email key is allowed (WhatsApp can be added later)', () => {
    assert.equal(loadConfig(live({ RESEND_API_KEY: KEY })).notify.mode, 'live')
    assert.equal(loadConfig(live({ WHATSAPP_PHONE_NUMBER_ID: '123456789', WHATSAPP_ACCESS_TOKEN: TOKEN })).notify.mode, 'live')
  })

  test('live mode with no keys at all is refused: it would silently send nothing', () => {
    assert.throws(() => loadConfig(live()), /NOTIFY_MODE: is "live" but no keys are set/)
  })

  test('WhatsApp needs both the phone number ID and the token', () => {
    assert.throws(() => loadConfig({ ...valid(), WHATSAPP_PHONE_NUMBER_ID: '123456789' }), /WHATSAPP_ACCESS_TOKEN: is required when WHATSAPP_PHONE_NUMBER_ID is set/)
    assert.throws(() => loadConfig({ ...valid(), WHATSAPP_ACCESS_TOKEN: TOKEN }), /WHATSAPP_PHONE_NUMBER_ID: is required when WHATSAPP_ACCESS_TOKEN is set/)
  })

  test('catch common mistakes with a message that says what to do', () => {
    assert.throws(() => loadConfig({ ...valid(), NOTIFY_MODE: 'production' }), /NOTIFY_MODE must be "log" or "live"/)
    assert.throws(() => loadConfig({ ...valid(), WHATSAPP_PHONE_NUMBER_ID: '+91 12345 67890', WHATSAPP_ACCESS_TOKEN: TOKEN }), /must be the numeric "Phone number ID"/)
    assert.throws(() => loadConfig({ ...valid(), AGENCY_EMAIL: 'not-an-email' }), /AGENCY_EMAIL/)
    assert.throws(() => loadConfig({ ...valid(), NOTIFY_TEST_WHATSAPP: '1234567890' }), /must be an international number like \+911234567890/)
    assert.throws(() => loadConfig({ ...valid(), WHATSAPP_API_VERSION: '23' }), /must look like v23\.0/)
    assert.throws(() => loadConfig({ ...valid(), SITE_URL: 'my-site' }), /SITE_URL must be a full URL/)
  })

  test('error messages never echo the secret keys', () => {
    for (const env of [{ WHATSAPP_ACCESS_TOKEN: TOKEN }, live({ RESEND_API_KEY: 're_short' })]) {
      assert.throws(() => loadConfig({ ...valid(), ...env }), (err) => {
        assert.ok(!err.message.includes(TOKEN) && !err.message.includes('re_short'))
        return true
      })
    }
  })
})
