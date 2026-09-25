import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import { adminAuthRouter } from './routes/adminAuth.js'
import { adminBookingsRouter } from './routes/adminBookings.js'
import { adminInboxRouter } from './routes/adminInbox.js'
import { publicRouter } from './routes/public.js'
import { requireAdmin } from './middleware/auth.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { createNotificationSystem } from './notify/index.js'

// `notifications` can be passed in (index.js does, so it can wait for messages at shutdown; tests do,
// to watch them); otherwise one is built from config.notify.
export function createApp(config, { notifications = createNotificationSystem(config).notifications } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1) // Render terminates TLS in front of the app; needed for per-client rate limiting

  app.use(helmet())
  app.use(
    cors({
      origin: config.frontendOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 })
  })

  app.use('/api/admin', adminAuthRouter(config))
  app.use('/api/admin/bookings', requireAdmin(config.jwtSecret), adminBookingsRouter())
  app.use('/api/admin', requireAdmin(config.jwtSecret), adminInboxRouter())
  app.use('/api', publicRouter(config, { notifications }))

  app.use(notFound)
  app.use(errorHandler)
  return app
}
