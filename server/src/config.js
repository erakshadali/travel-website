import { z } from 'zod'
import { E164 } from './utils/phone.js'

// A line like `RESEND_API_KEY=` in .env arrives as "": treat it as "not set".
const optional = (schema) => z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional())
const email = z.string().trim().toLowerCase().pipe(z.email())

const schema = z
  .object({
    NODE_ENV: z.string().default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z
      .string()
      .min(1, 'MONGODB_URI is required')
      .refine((uri) => !/<[^>]*>/.test(uri), 'MONGODB_URI still contains a <placeholder>, e.g. replace <db_password> with your real Atlas password'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('12h'),
    ADMIN_EMAIL: email,
    ADMIN_PASSWORD_HASH: z.string().regex(/^\$2[aby]\$\d{2}\$.{53}$/, 'ADMIN_PASSWORD_HASH must be a bcrypt hash (run: npm run hash-password)'),
    FRONTEND_ORIGINS: z.string().default('http://localhost:5180,https://premium-travels-one.vercel.app'),
    // Per client IP, per form endpoint (bookings, trip plans, contact, newsletter).
    PUBLIC_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(10),

    // --- Notifications ---------------------------------------------------------------------
    // log  = nothing leaves this server; every email / WhatsApp message is printed and recorded instead.
    // live = really send through Resend and the WhatsApp Cloud API.
    NOTIFY_MODE: z.enum(['log', 'live'], 'NOTIFY_MODE must be "log" or "live"').default('log'),
    SITE_URL: optional(z.url('SITE_URL must be a full URL such as https://your-site.vercel.app')),
    AGENCY_EMAIL: optional(email), // where "new booking" alerts go
    EMAIL_FROM: z.string().trim().min(3).default('Premium Tours and Travels <onboarding@resend.dev>'),
    RESEND_API_KEY: optional(z.string().trim().min(10, 'RESEND_API_KEY looks too short')),
    WHATSAPP_PHONE_NUMBER_ID: optional(z.string().trim().regex(/^\d{5,20}$/, 'WHATSAPP_PHONE_NUMBER_ID must be the numeric "Phone number ID" (digits only)')),
    WHATSAPP_ACCESS_TOKEN: optional(z.string().trim().min(20, 'WHATSAPP_ACCESS_TOKEN looks too short')),
    WHATSAPP_API_VERSION: z.string().trim().regex(/^v\d+\.\d+$/, 'WHATSAPP_API_VERSION must look like v23.0').default('v23.0'),
    WHATSAPP_TEMPLATE_LANGUAGE: z.string().trim().regex(/^[a-z]{2}(_[A-Z]{2})?$/, 'WHATSAPP_TEMPLATE_LANGUAGE must look like en or en_US').default('en'),
    // Used only by `npm run notify:check`
    NOTIFY_TEST_EMAIL: optional(email),
    NOTIFY_TEST_WHATSAPP: optional(z.string().trim().regex(E164, 'NOTIFY_TEST_WHATSAPP must be an international number like +911234567890')),
  })
  .superRefine((e, ctx) => {
    const problem = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message })
    if (e.WHATSAPP_PHONE_NUMBER_ID && !e.WHATSAPP_ACCESS_TOKEN) problem('WHATSAPP_ACCESS_TOKEN', 'is required when WHATSAPP_PHONE_NUMBER_ID is set')
    if (e.WHATSAPP_ACCESS_TOKEN && !e.WHATSAPP_PHONE_NUMBER_ID) problem('WHATSAPP_PHONE_NUMBER_ID', 'is required when WHATSAPP_ACCESS_TOKEN is set')
    const whatsappReady = e.WHATSAPP_PHONE_NUMBER_ID && e.WHATSAPP_ACCESS_TOKEN
    if (e.NOTIFY_MODE === 'live' && !e.RESEND_API_KEY && !whatsappReady) {
      problem('NOTIFY_MODE', 'is "live" but no keys are set: add RESEND_API_KEY and/or WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN, or use NOTIFY_MODE=log')
    }
  })

export function loadConfig(env = process.env) {
  const parsed = schema.safeParse(env)
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${problems}`)
  }
  const e = parsed.data
  return {
    env: e.NODE_ENV,
    port: e.PORT,
    mongoUri: e.MONGODB_URI,
    jwtSecret: e.JWT_SECRET,
    jwtExpiresIn: e.JWT_EXPIRES_IN,
    adminEmail: e.ADMIN_EMAIL,
    adminPasswordHash: e.ADMIN_PASSWORD_HASH,
    frontendOrigins: e.FRONTEND_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
    loginRateLimit: 10,
    publicRateLimit: e.PUBLIC_RATE_LIMIT_PER_HOUR,
    notify: {
      mode: e.NOTIFY_MODE,
      siteUrl: e.SITE_URL?.replace(/\/+$/, ''),
      agencyEmail: e.AGENCY_EMAIL,
      email: { apiKey: e.RESEND_API_KEY, from: e.EMAIL_FROM },
      whatsapp: {
        phoneNumberId: e.WHATSAPP_PHONE_NUMBER_ID,
        accessToken: e.WHATSAPP_ACCESS_TOKEN,
        apiVersion: e.WHATSAPP_API_VERSION,
        templateLanguage: e.WHATSAPP_TEMPLATE_LANGUAGE,
      },
      testEmail: e.NOTIFY_TEST_EMAIL,
      testWhatsapp: e.NOTIFY_TEST_WHATSAPP,
    },
  }
}
