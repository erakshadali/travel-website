// Vercel Functions entrypoint: wraps the same Express app used by src/index.js (local dev/Render),
// but never calls .listen() and reuses one Mongo connection across warm invocations instead of
// connecting at startup.
import mongoose from 'mongoose'
import { loadConfig } from '../src/config.js'
import { createApp } from '../src/app.js'
import { createNotificationSystem } from '../src/notify/index.js'

const config = loadConfig()
const { notifications } = createNotificationSystem(config)
const app = createApp(config, { notifications })

let connecting = null
function ensureDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve()
  if (!connecting) connecting = mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 })
  return connecting
}

export default async function handler(req, res) {
  try {
    await ensureDb()
  } catch (err) {
    connecting = null
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Database unavailable' }))
    return
  }
  app(req, res)
}
