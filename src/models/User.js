import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  postcode: { type: String, required: true },
  country: { type: String, default: 'United Kingdom' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, index: true },
    password: { type: String, required: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'customer', 'admin', 'superadmin'], default: 'customer' },
    tokenVersion: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

// Delete model from cache in development to ensure schema changes apply immediately
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model('User', UserSchema);
