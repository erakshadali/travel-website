import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { loadConfig } from './config.js'
import { createApp } from './app.js'
import { createNotificationSystem, describeNotifications } from './notify/index.js'

dotenv.config({ quiet: true })

let config
try {
  config = loadConfig()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}

try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 })
} catch (err) {
  console.error(`Could not connect to MongoDB: ${err.message}`)
  console.error('Check the password in MONGODB_URI, and that this machine\'s IP is allowed under Atlas > Network Access.')
  process.exit(1)
}
console.log(`MongoDB connected (${mongoose.connection.name})`)
console.log(describeNotifications(config.notify))

const { notifications } = createNotificationSystem(config)
const server = createApp(config, { notifications }).listen(config.port, () => {
  console.log(`Fatima Travels API listening on :${config.port} (${config.env})`)
})
// Node closes idle keep-alive connections after 5 s by default. Browsers and proxies (Render's) reuse
// them for longer, and a request sent on a connection that has just been closed fails as a network error.
server.keepAliveTimeout = 65_000
server.headersTimeout = 66_000

let stopping = false
const shutdown = () => {
  if (stopping) return
  stopping = true
  setTimeout(() => process.exit(1), 15_000).unref() // never hang on the way out
  server.close(async () => {
    await notifications.idle() // let messages that are already being sent finish
    await mongoose.disconnect()
    process.exit(0)
  })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
