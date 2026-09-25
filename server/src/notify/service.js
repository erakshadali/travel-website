import { Booking } from '../models/Booking.js'
import { NotificationLog } from '../models/NotificationLog.js'
import { BOOKING_CONFIRMATION_TEMPLATE, agencyAlertEmail, clientConfirmationEmail, clientWhatsAppParams, whatsappEligible } from './messages.js'

export const MAX_ATTEMPTS = 3 // real (live) send attempts per message before we stop retrying
const STALE_PENDING_MS = 10 * 60 * 1000 // a send that has been "in progress" this long died with the server

/**
 * Sends the messages and keeps NotificationLog honest about it.
 *
 * Every message is claimed before it is sent, by creating its NotificationLog row. The unique index
 * means only one caller can claim a given (booking, message, channel), so however many times
 * bookingCreated() runs for a booking (retries, two requests at once) each message goes out once.
 * A failed message can be claimed again, up to MAX_ATTEMPTS live attempts.
 */
export function createNotifications({ notify, transports, logger = console, now = () => new Date() }) {
  const live = notify.mode === 'live'

  // Promises still running, so shutdown (and tests) can wait for them.
  const inflight = new Set()
  const track = (promise) => {
    const settled = promise.catch(() => {})
    inflight.add(settled)
    settled.finally(() => inflight.delete(settled))
    return promise
  }
  async function idle() {
    while (inflight.size) await Promise.allSettled([...inflight])
  }

  async function claim({ booking, type, dedupeKey, channel, recipient }) {
    const key = { booking: booking._id, dedupeKey, channel }
    try {
      return await NotificationLog.create({ ...key, type, recipient, mode: notify.mode, status: 'pending', attempts: live ? 1 : 0 })
    } catch (err) {
      if (err.code !== 11000) throw err
    }
    // Already exists: take it over only if it failed (and may still be retried), got stuck, or was only
    // ever a log-mode record, which must never stop a real send.
    const stuckBefore = new Date(now().getTime() - STALE_PENDING_MS)
    return NotificationLog.findOneAndUpdate(
      {
        ...key,
        $or: [
          { status: 'failed', attempts: { $lt: MAX_ATTEMPTS } },
          { status: 'pending', updatedAt: { $lt: stuckBefore } },
          ...(live ? [{ mode: 'log', status: { $in: ['sent', 'skipped'] } }] : []),
        ],
      },
      { $set: { status: 'pending', mode: notify.mode, recipient, error: null }, $inc: { attempts: live ? 1 : 0 }, $unset: { providerId: 1, sentAt: 1 } },
      { returnDocument: 'after' },
    )
  }

  // build() returns { message } to send, or { skip: 'reason' } for a message that must not go out.
  async function deliver({ booking, type, channel, recipient, dedupeKey = type, build }) {
    const label = `${booking.reference} ${type}/${channel}`
    const row = await claim({ booking, type, dedupeKey, channel, recipient })
    if (!row) return { type, channel, outcome: 'duplicate' }

    const finish = (fields) => NotificationLog.updateOne({ _id: row._id }, { $set: fields })
    try {
      const built = build()
      if (built.skip) {
        await finish({ status: 'skipped', error: built.skip })
        logger.info(`[notify] ${label} skipped: ${built.skip}`)
        return { type, channel, outcome: 'skipped', reason: built.skip }
      }
      const transport = transports[channel]
      if (!transport.ready) throw new Error(`${channel} is not configured (missing ${transport.missing.join(', ')})`)
      const { id } = await transport.send(built.message)
      await finish({ status: 'sent', providerId: id, sentAt: now(), error: null })
      logger.info(`[notify] ${label} ${live ? 'sent' : 'logged'} (${id})`)
      return { type, channel, outcome: 'sent', id }
    } catch (err) {
      const reason = String(err.message).slice(0, 500)
      logger.error(`[notify] ${label} FAILED: ${reason}`)
      await finish({ status: 'failed', error: reason }).catch((e) => logger.error(`[notify] could not record the failure: ${e.message}`))
      return { type, channel, outcome: 'failed', error: reason }
    }
  }

  // The messages a new booking triggers: confirmation to the client (email + WhatsApp) and an alert to the agency.
  function bookingCreated(booking) {
    return track(
      Promise.all([
        deliver({
          booking,
          type: 'booking_confirmation',
          channel: 'email',
          recipient: booking.email,
          build: () => ({ message: { to: booking.email, replyTo: notify.agencyEmail, ...clientConfirmationEmail(booking) } }),
        }),
        deliver({
          booking,
          type: 'booking_confirmation',
          channel: 'whatsapp',
          recipient: booking.whatsappNumber,
          build: () => {
            if (booking.optedOut) return { skip: 'client has opted out of WhatsApp messages' }
            if (!whatsappEligible(booking)) return { skip: 'client did not agree to WhatsApp messages' }
            return { message: { to: booking.whatsappNumber, template: BOOKING_CONFIRMATION_TEMPLATE, params: clientWhatsAppParams(booking) } }
          },
        }),
        deliver({
          booking,
          type: 'agency_alert',
          channel: 'email',
          recipient: notify.agencyEmail,
          build: () =>
            notify.agencyEmail
              ? { message: { to: notify.agencyEmail, ...agencyAlertEmail(booking, { siteUrl: notify.siteUrl }) } }
              : { skip: 'AGENCY_EMAIL is not set' },
        }),
      ]),
    )
  }

  // Tries again everything that failed (or got stuck) and may still be retried. Safe to run as often
  // as you like: messages that already went out are left alone.
  function retryFailed() {
    return track(
      (async () => {
        const stuckBefore = new Date(now().getTime() - STALE_PENDING_MS)
        const ids = await NotificationLog.distinct('booking', {
          $or: [{ status: 'failed', attempts: { $lt: MAX_ATTEMPTS } }, { status: 'pending', updatedAt: { $lt: stuckBefore } }],
        })
        const bookings = await Booking.find({ _id: { $in: ids } })
        const results = (await Promise.all(bookings.map((b) => bookingCreated(b)))).flat()
        return { bookings: bookings.length, sent: results.filter((r) => r.outcome === 'sent').length, failed: results.filter((r) => r.outcome === 'failed').length }
      })(),
    )
  }

  return { bookingCreated, retryFailed, idle }
}
