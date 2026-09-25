import mongoose from 'mongoose'
import { utcToLocal } from '../utils/time.js'

// One end of the flight. `at` is always UTC; `timezone` (IANA) says how to display it locally.
const legSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true, maxlength: 80 },
    airport: { type: String, required: true, trim: true, maxlength: 80 },
    at: { type: Date, required: true },
    timezone: { type: String, required: true },
  },
  { _id: false, toJSON: { virtuals: true, id: false, versionKey: false } },
)

// Wall-clock time at that airport, in the same shape the admin enters it (datetime-local).
legSchema.virtual('localDateTime').get(function () {
  return this.at && this.timezone ? utcToLocal(this.at, this.timezone) : undefined
})

const flightDetailsSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    airline: { type: String, required: true, trim: true, maxlength: 80 },
    flightNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
    pnr: { type: String, required: true, trim: true, uppercase: true, maxlength: 8 },
    departure: { type: legSchema, required: true },
    arrival: { type: legSchema, required: true },
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

export const FlightDetails = mongoose.model('FlightDetails', flightDetailsSchema)
