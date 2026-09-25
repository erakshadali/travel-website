import mongoose from 'mongoose'
import { randomInt } from 'node:crypto'

export const BOOKING_STATUSES = [
  'Received',
  'Under Review',
  'Confirmed',
  'Ticket Issued',
  'Travelling',
  'Completed',
  'Cancelled',
]
export const ROOM_TYPES = ['standard', 'deluxe', 'suite']

// No 0/O/1/I so references are easy to read out over the phone.
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const generateReference = () =>
  'FT-' + Array.from({ length: 7 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join('')

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: BOOKING_STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, immutable: true, default: generateReference },
    clientName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    // E.164 with country code, e.g. +971501234567
    whatsappNumber: { type: String, required: true, match: /^\+[1-9]\d{7,14}$/ },
    passportName: { type: String, required: true, trim: true, uppercase: true, maxlength: 120 },
    packageName: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    travellers: {
      adults: { type: Number, required: true, min: 1, max: 30 },
      children: { type: Number, default: 0, min: 0, max: 30 },
    },
    roomType: { type: String, enum: ROOM_TYPES, required: true },
    specialRequests: { type: String, trim: true, maxlength: 2000 },
    occasion: { type: String, trim: true, maxlength: 60 },
    insurance: { type: Boolean, default: false },
    estimatedTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    whatsappConsent: { type: Boolean, default: false },
    whatsappConsentAt: { type: Date }, // when the client ticked the box (opt-in evidence)
    optedOut: { type: Boolean, default: false },
    status: { type: String, enum: BOOKING_STATUSES, default: 'Received', index: true },
    statusHistory: { type: [statusHistorySchema], default: [] },
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

bookingSchema.index({ createdAt: -1 })
bookingSchema.index({ travelDate: 1 })

bookingSchema.pre('validate', function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: this.status })
  }
})

export const Booking = mongoose.model('Booking', bookingSchema)
