import { products as fallbackProducts, featuredProducts as fallbackFeatured } from "../data/products.js";

// Base API URL helper for server and client side fetching
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Browser uses relative path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export async function getProducts(params = {}) {
  try {
    const baseUrl = getBaseUrl();
    let queryString = "";

    if (typeof params === "string") {
      queryString = params ? `?${params.replace(/^\?/, "")}` : "";
    } else if (params && typeof params === "object") {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          query.set(key, String(val));
        }
      });
      const str = query.toString();
      if (str) queryString = `?${str}`;
    }

    const res = await fetch(`${baseUrl}/api/products${queryString}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        return {
          products: data.products.map((p) => ({ ...p, id: p._id || p.id })),
          total: data.total || data.products.length,
          page: data.page || 1,
          totalPages: data.totalPages || 1,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching products from API, using fallback:", error);
  }

  return {
    products: fallbackProducts.map((p) => ({ ...p, id: p._id || p.id })),
    total: fallbackProducts.length,
    page: 1,
    totalPages: 1,
  };
}

export async function getProductById(id) {
  const { products } = await getProducts();
  return products.find((product) => String(product._id || product.id) === String(id)) ?? null;
}

export async function getProductBySlug(slug) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/products/${slug}`, { cache: "no-store" });
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
    const res = await fetch(`${baseUrl}/api/products?featured=true`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p) => ({ ...p, id: p._id || p.id }));
      }
    }
  } catch (error) {
    console.error("Error fetching featured products from API, using fallback:", error);
  }
  return fallbackFeatured.map((p) => ({ ...p, id: p._id || p.id }));
}

export async function getProductsByCategory(category) {
  try {
    const baseUrl = getBaseUrl();
    const url = category ? `${baseUrl}/api/products?category=${encodeURIComponent(category)}` : `${baseUrl}/api/products`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.products && data.products.length > 0) {
        return data.products.map((p) => ({ ...p, id: p._id || p.id }));
      }
    }
  } catch (error) {
    console.error("Error fetching products by category from API, using fallback:", error);
  }
  if (!category) return fallbackProducts.map((p) => ({ ...p, id: p._id || p.id }));
  return fallbackProducts
    .filter((product) => product.category.toLowerCase() === category.toLowerCase())
    .map((p) => ({ ...p, id: p._id || p.id }));
}
