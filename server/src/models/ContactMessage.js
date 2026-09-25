import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    topic: { type: String, trim: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
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

contactMessageSchema.index({ createdAt: -1 })

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)
