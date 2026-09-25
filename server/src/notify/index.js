import { createNotifications } from './service.js'
import { createTransports, describeNotifications } from './transports.js'

export { createNotifications, createTransports, describeNotifications }

// The notification system for a loaded config (see config.js, NOTIFY_MODE).
export function createNotificationSystem(config, { fetchImpl, logger } = {}) {
  const transports = createTransports({ notify: config.notify, fetchImpl, logger })
  return { transports, notifications: createNotifications({ notify: config.notify, transports, logger }) }
}
