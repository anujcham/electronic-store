import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { featuredProducts as fallbackFeatured, products as fallbackProducts } from "@/data/products";

function sanitizeProduct(doc) {
  if (!doc) return null;
  const p = JSON.parse(JSON.stringify(doc));
  const reviews = Array.isArray(p.reviews) ? p.reviews : [];
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
    p.rating = Number((sum / reviews.length).toFixed(1));
    p.reviewCount = reviews.length;
  } else {
    p.rating = Number(p.rating || 0);
    p.reviewCount = Number(p.reviewCount || 0);
  }
  p.id = p._id ? p._id.toString() : p.id;
  p._id = p._id ? p._id.toString() : p.id;
  return p;
}

export async function getProductBySlugDirect(slug) {
  if (!slug) return null;
  try {
    await dbConnect();
    const rawSlug = String(slug).trim();
    const decodedSlug = decodeURIComponent(rawSlug).trim();
    const escaped = decodedSlug.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    const product = await Product.findOne({
      $or: [
        { slug: rawSlug },
        { slug: decodedSlug },
        { slug: { $regex: new RegExp(`^${escaped}$`, "i") } },
      ],
    }).lean();

    if (product) {
      return sanitizeProduct(product);
    }
  } catch (err) {
    console.error(`Error fetching product [${slug}] directly from MongoDB:`, err);
  }

  const decoded = decodeURIComponent(String(slug)).toLowerCase();
  const fallback = fallbackProducts.find(
    (p) =>
      p.slug === slug ||
      p.slug === decodeURIComponent(String(slug)) ||
      p.slug?.toLowerCase() === decoded
  );
  if (fallback) {
    return { ...fallback, id: fallback._id || fallback.id };
  }
  return null;
}

export async function getAllProductsDirect() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ updatedAt: -1 }).lean();
    if (products && products.length > 0) {
      return products.map(sanitizeProduct);
    }
  } catch (err) {
    console.error("Error fetching all products directly from MongoDB:", err);
  }
  return fallbackProducts.map((p) => ({ ...p, id: p._id || p.id }));
}

export async function getProductsDirect(params = {}) {
  try {
    await dbConnect();

    const brandParam = params.brand;
    const conditionParam = params.condition;
    const storageParam = params.storage;
    const categoryParam = params.category;
    const featuredParam = params.featured;
    const hotDealsParam = params.hotDeals || params.isHotDeal;
    const searchParam = params.search;
    const minPriceParam = params.minPrice;
    const maxPriceParam = params.maxPrice;
    const sortByParam = params.sortBy || params.sort || "featured";

    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "50", 10);
    const skip = (page - 1) * limit;

    let query = {};

    if (brandParam && brandParam !== "all") {
      const brands = brandParam.split(",").map((b) => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        query.brand = { $regex: new RegExp(`^${brands[0]}$`, "i") };
      } else if (brands.length > 1) {
        query.brand = { $in: brands.map((b) => new RegExp(`^${b}$`, "i")) };
      }
    }

    if (conditionParam && conditionParam !== "all") {
      const conditions = conditionParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (conditions.length === 1) {
        query.condition = { $regex: new RegExp(`^${conditions[0]}$`, "i") };
      } else if (conditions.length > 1) {
        query.condition = { $in: conditions.map((c) => new RegExp(`^${c}$`, "i")) };
      }
    }

    if (storageParam && storageParam !== "all") {
      const storages = storageParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (storages.length > 0) {
        query.$or = query.$or || [];
        query.$or.push(
          { storage: { $in: storages } },
          { availableStorage: { $in: storages } }
        );
      }
    }

    if (categoryParam && categoryParam !== "all") {
      query.category = { $regex: new RegExp(`^${categoryParam}$`, "i") };
    }

    if (featuredParam === "true" || featuredParam === true) {
      query.featured = true;
    }

    if (hotDealsParam === "true" || hotDealsParam === true) {
      query.isHotDeal = true;
    }

    if (minPriceParam || maxPriceParam) {
      query.price = {};
      if (minPriceParam && !isNaN(Number(minPriceParam))) {
        query.price.$gte = Number(minPriceParam);
      }
      if (maxPriceParam && !isNaN(Number(maxPriceParam))) {
        query.price.$lte = Number(maxPriceParam);
      }
    }

    if (searchParam) {
      const searchOr = [
        { name: { $regex: searchParam, $options: "i" } },
        { brand: { $regex: searchParam, $options: "i" } },
        { slug: { $regex: searchParam, $options: "i" } },
        { shortDescription: { $regex: searchParam, $options: "i" } },
        { description: { $regex: searchParam, $options: "i" } },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    let sortOptions = {};
    switch (sortByParam) {
      case "price-asc":
        sortOptions = { price: 1 };
        break;
      case "price-desc":
        sortOptions = { price: -1 };
        break;
      case "rating":
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "featured":
      default:
        sortOptions = { featured: -1, rating: -1 };
        break;
    }

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      products: products.map(sanitizeProduct),
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit) || 1,
    };
  } catch (err) {
    console.error("Error fetching products directly from MongoDB:", err);
  }

  return {
    products: fallbackProducts.map((p) => ({ ...p, id: p._id || p.id })),
    total: fallbackProducts.length,
    page: 1,
    totalPages: 1,
  };
}

export async function getFeaturedProductsDirect() {
  try {
    await dbConnect();
    const products = await Product.find({ featured: true }).sort({ updatedAt: -1 }).lean();
    if (products && products.length > 0) {
      return products.map(sanitizeProduct);
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
      return products.map(sanitizeProduct);
    }
  } catch (err) {
    console.error("Error fetching hot deals directly from MongoDB:", err);
  }
  return fallbackProducts
    .filter((p) => p.isHotDeal || (p.price && p.originalPrice && p.price < p.originalPrice))
    .map((p) => ({ ...p, id: p._id || p.id }));
}
