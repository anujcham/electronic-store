import { products as fallbackProducts, featuredProducts as fallbackFeatured } from "../data/products";

// Base API URL helper for server and client side fetching
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Browser uses relative path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export async function getProducts() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p) => ({ ...p, id: p._id || p.id }));
      }
    }
  } catch (error) {
    console.error("Error fetching products from API, using fallback:", error);
  }
  return fallbackProducts;
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => String(product._id || product.id) === String(id)) ?? null;
}

export async function getProductBySlug(slug) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.product) {
        return { ...data.product, id: data.product._id || data.product.id };
      }
    }
  } catch (error) {
    console.error("Error fetching product by slug from API, using fallback:", error);
  }
  return fallbackProducts.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/products?featured=true`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p) => ({ ...p, id: p._id || p.id }));
      }
    }
  } catch (error) {
    console.error("Error fetching featured products from API, using fallback:", error);
  }
  return fallbackFeatured;
}

export async function getProductsByCategory(category) {
  try {
    const baseUrl = getBaseUrl();
    const url = category ? `${baseUrl}/api/products?category=${encodeURIComponent(category)}` : `${baseUrl}/api/products`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p) => ({ ...p, id: p._id || p.id }));
      }
    }
  } catch (error) {
    console.error("Error fetching products by category from API, using fallback:", error);
  }
  if (!category) return fallbackProducts;
  return fallbackProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase());
}
