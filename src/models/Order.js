import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedOptions: {
    storage: String,
    color: String,
    condition: String,
    warranty: String,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestEmail: { type: String },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      postcode: { type: String, required: true },
      country: { type: String, default: 'United Kingdom' },
    },
    paymentMethod: { type: String, default: 'Credit Card / Debit Card' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Paid' },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Processing', '50-Point Checked', 'Dispatched', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    warrantyPlan: {
      id: { type: String, default: 'standard' },
      title: { type: String, default: '12-Month Standard Warranty' },
      price: { type: Number, default: 0 },
    },
    emiDetails: {
      provider: { type: String },
      tenureMonths: { type: Number },
      monthlyAmount: { type: Number },
    },
    courierName: { type: String, default: 'Royal Mail Tracked 24' },
    trackingNumber: { type: String },
    estimatedDelivery: { type: String, default: '2-4 working days' },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development' && mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);

