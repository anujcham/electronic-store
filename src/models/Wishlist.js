import mongoose from 'mongoose';

const WishlistItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  id: { type: String },
  slug: { type: String, required: true },
  name: { type: String },
  price: { type: Number },
  originalPrice: { type: Number },
  image: { type: String },
  addedAt: { type: Date, default: Date.now },
});

const WishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [WishlistItemSchema],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Wishlist;
}

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

