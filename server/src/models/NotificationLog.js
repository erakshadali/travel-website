import mongoose from 'mongoose'

// One row per message we intend to send. The unique index on (booking, dedupeKey, channel) is what
// stops the same notification going out twice: a sender must first create its row, and a second
// attempt at the same message finds the row already there.
const notificationLogSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    type: { type: String, required: true }, // what it is, e.g. booking_confirmation, agency_alert
    dedupeKey: { type: String, required: true }, // which occurrence; equals `type` for one-off messages
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    recipient: { type: String, maxlength: 254 }, // email address or WhatsApp number
    mode: { type: String, enum: ['log', 'live'], required: true }, // 'log' rows are never real sends
    status: { type: String, enum: ['pending', 'sent', 'failed', 'skipped'], required: true },
    attempts: { type: Number, default: 0 }, // real (live) send attempts
    error: { type: String, maxlength: 600 },
    providerId: { type: String, maxlength: 200 }, // Resend email id / WhatsApp message id
    sentAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id
        delete ret._id
        return ret
      },
    },
  },
)

notificationLogSchema.index({ booking: 1, dedupeKey: 1, channel: 1 }, { unique: true })
notificationLogSchema.index({ status: 1, attempts: 1 })

export const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema)
