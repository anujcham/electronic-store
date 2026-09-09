import { featuredProducts, products } from "../data/products";

export async function getProducts() {
  return products;
}

export async function getProductById(id) {
  return products.find((product) => product.id === Number(id)) ?? null;
}

export async function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts() {
  return featuredProducts;
}

export async function getProductsByCategory(category) {
  if (!category) {
    return products;
  }

  return products.filter((product) => product.category === category);
}
