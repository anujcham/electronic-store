import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    condition: { type: String, default: 'Good' },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: String }],
    shortDescription: { type: String },
    description: { type: String },
    storage: { type: String },
    color: { type: String },
    availableColors: [{ type: String }],
    availableStorage: [{ type: String }],
    stock: { type: Number, default: 10 },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    conditionOptions: [{ type: String }],
    batteryOptions: [{ type: String }],
    simOptions: [{ type: String }],
    shippingIncluded: { type: Boolean, default: true },
    deliveryRange: { type: String, default: '2-4 working days' },
    warrantyMonths: { type: Number, default: 12 },
    variantPricing: [
      {
        storage: String,
        color: String,
        condition: String,
        battery: String,
        sim: String,
        price: Number,
        originalPrice: Number,
        stock: Number,
        warrantyMonths: Number,
        deliveryRange: String,
        shippingIncluded: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

