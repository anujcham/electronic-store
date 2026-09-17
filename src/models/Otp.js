import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true }, // Normalized phone or email
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // MongoDB TTL auto-cleanup
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Delete model from cache in development to ensure schema changes apply immediately
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Otp;
}

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);

