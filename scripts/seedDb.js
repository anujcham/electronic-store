const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Simple mock products list matching src/data/products.js structure
const initialProducts = [
  {
    slug: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'iPhones',
    price: 999,
    originalPrice: 1199,
    condition: 'Superb',
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1695048133021-0a44222a7f5c?auto=format&fit=crop&q=80&w=800',
    ],
    shortDescription: 'Refurbished iPhone 15 Pro Max with Titanium design and Action Button.',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    storage: '256GB',
    color: 'Natural Titanium',
    availableColors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'],
    availableStorage: ['256GB', '512GB', '1TB'],
    stock: 12,
    featured: true,
    tags: ['Best Seller', 'Hot Deal', 'Flagship'],
    conditionOptions: ['Superb', 'Very Good', 'Good'],
    batteryOptions: ['Optimal (85%+)', 'New Battery (100%)'],
    simOptions: ['Single SIM + eSIM', 'Dual eSIM'],
  },
  {
    slug: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Android',
    price: 899,
    originalPrice: 1299,
    condition: 'Superb',
    rating: 4.8,
    reviewCount: 35,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    ],
    shortDescription: 'Galaxy AI is here. Epic camera with 200MP sensor and S Pen built-in.',
    description: 'Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.',
    storage: '512GB',
    color: 'Titanium Gray',
    availableColors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet'],
    availableStorage: ['256GB', '512GB', '1TB'],
    stock: 8,
    featured: true,
    tags: ['Galaxy AI', 'S-Pen', 'Flagship'],
    conditionOptions: ['Superb', 'Very Good', 'Good'],
    batteryOptions: ['Optimal (85%+)', 'New Battery (100%)'],
    simOptions: ['Dual SIM'],
  },
  {
    slug: 'macbook-pro-14-m3',
    name: 'MacBook Pro 14" M3',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: 'MacBooks',
    price: 1399,
    originalPrice: 1599,
    condition: 'Very Good',
    rating: 4.9,
    reviewCount: 28,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    ],
    shortDescription: 'Liquid Retina XDR display, up to 22 hours battery life, Apple M3 chip.',
    description: 'The 14-inch MacBook Pro blasts forward with M3, an incredibly advanced chip that brings massive speed and capability for everyday workflows.',
    storage: '512GB SSD',
    color: 'Space Gray',
    availableColors: ['Space Gray', 'Silver'],
    availableStorage: ['512GB SSD', '1TB SSD'],
    stock: 5,
    featured: true,
    tags: ['Apple Silicon', 'Professional', 'Retina'],
    conditionOptions: ['Superb', 'Very Good'],
    batteryOptions: ['Optimal (90%+)', 'New Battery'],
    simOptions: ['N/A'],
  },
  {
    slug: 'google-pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    category: 'Smartphones',
    subcategory: 'Android',
    price: 649,
    originalPrice: 999,
    condition: 'Superb',
    rating: 4.7,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
    ],
    shortDescription: 'Google Tensor G3 chip, fully upgraded cameras, and Google AI features.',
    description: 'Pixel 8 Pro has four exceptional cameras with Pixel’s best zoom ever. And it introduces Pro controls for advanced settings.',
    storage: '128GB',
    color: 'Bay Blue',
    availableColors: ['Bay Blue', 'Obsidian', 'Porcelain'],
    availableStorage: ['128GB', '256GB'],
    stock: 15,
    featured: true,
    tags: ['Google AI', 'Best Camera', 'Clean Android'],
    conditionOptions: ['Superb', 'Very Good', 'Good'],
    batteryOptions: ['Optimal (85%+)'],
    simOptions: ['Single SIM + eSIM'],
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting to MongoDB Atlas for seeding...');
  try {
    await mongoose.connect(uri);
    await Product.deleteMany({});
    const inserted = await Product.insertMany(initialProducts);
    console.log(`✅ SUCCESS: Seeded database with ${inserted.length} real products!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR seeding database:', err.message);
    process.exit(1);
  }
}

seed();

