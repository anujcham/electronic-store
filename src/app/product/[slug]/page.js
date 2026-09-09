import { notFound } from "next/navigation";

import { ProductDetails } from "../../../components/product/ProductDetails";
import { getProductBySlug, getProducts } from "../../../services/productService";

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProducts())
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 4);

  return <ProductDetails product={product} relatedProducts={relatedProducts} />;
}
