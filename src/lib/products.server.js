import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { featuredProducts as fallbackFeatured, products as fallbackProducts } from "@/data/products";

export async function getFeaturedProductsDirect() {
  try {
    await dbConnect();
    const products = await Product.find({ featured: true }).sort({ updatedAt: -1 }).lean();
    if (products && products.length > 0) {
      return products.map((p) => ({
        ...p,
        id: p._id ? p._id.toString() : p.id,
        _id: p._id ? p._id.toString() : p.id,
      }));
    }
  } catch (err) {
    console.error("Error fetching featured products directly from MongoDB:", err);
  }
  return fallbackFeatured.map((p) => ({ ...p, id: p._id || p.id }));
}

export async function getHotDealsDirect() {
  try {
    await dbConnect();
    const products = await Product.find({ isHotDeal: true }).sort({ updatedAt: -1 }).lean();
    if (products && products.length > 0) {
      return products.map((p) => ({
        ...p,
        id: p._id ? p._id.toString() : p.id,
        _id: p._id ? p._id.toString() : p.id,
      }));
    }
  } catch (err) {
    console.error("Error fetching hot deals directly from MongoDB:", err);
  }
  return fallbackProducts
    .filter((p) => p.isHotDeal || (p.price && p.originalPrice && p.price < p.originalPrice))
    .map((p) => ({ ...p, id: p._id || p.id }));
}

