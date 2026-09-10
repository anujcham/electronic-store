import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { products } from '../src/data/products.js';

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

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
    variantPricing: Array,
    specifications: {
      display: { type: String },
      processor: { type: String },
      camera: { type: String },
      batterySpec: { type: String },
      os: { type: String },
      network: { type: String },
      waterResistance: { type: String },
    },
    reviews: [
      {
        userName: { type: String, required: true },
        rating: { type: Number, required: true },
        date: { type: String },
        comment: { type: String },
        verifiedPurchase: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is missing in .env.local!');
    process.exit(1);
  }
  console.log('Connecting to MongoDB Atlas for seeding...');
  try {
    await mongoose.connect(uri);
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`✅ SUCCESS: Seeded database with ${inserted.length} real phone products with dynamic specifications & multi-image arrays!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR seeding database:', err.message);
    process.exit(1);
  }
}

seed();

