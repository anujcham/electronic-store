import { notFound } from "next/navigation";

import { ProductDetails } from "../../../components/product/ProductDetails";
import { getProductBySlug, getProducts } from "../../../services/productService";

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productsResult = await getProducts();
  const allProducts = Array.isArray(productsResult) ? productsResult : (productsResult?.products || []);

  const relatedProducts = allProducts
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 4);

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
      initialColor={query?.color}
    />
  );
}
