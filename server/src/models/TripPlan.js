import mongoose from 'mongoose'

const tripPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    destination: { type: String, required: true, trim: true, maxlength: 80 },
    flexibleDates: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    travellers: {
      adults: { type: Number, required: true, min: 1, max: 30 },
      children: { type: Number, default: 0, min: 0, max: 30 },
    },
    budget: { type: String, required: true, trim: true, maxlength: 60 },
    interests: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    hotel: { type: String, required: true, trim: true, maxlength: 80 },
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

tripPlanSchema.index({ createdAt: -1 })

export const TripPlan = mongoose.model('TripPlan', tripPlanSchema)
