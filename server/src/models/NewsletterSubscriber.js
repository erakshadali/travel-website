import mongoose from 'mongoose'

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
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

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema)
