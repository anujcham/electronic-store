import { notFound } from "next/navigation";
import { ProductDetails } from "../../../components/product/ProductDetails";
import { getProductBySlugDirect, getAllProductsDirect } from "@/lib/products.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlugDirect(slug);
    if (!product) {
      return { title: "Product Not Found | Electronic Store" };
    }
    return {
      title: `${product.name} | Electronic Store`,
      description:
        product.shortDescription ||
        product.description ||
        `Buy certified refurbished ${product.name} at best prices with warranty at Electronic Store.`,
    };
  } catch {
    return { title: "Product Details | Electronic Store" };
  }
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};

  const product = await getProductBySlugDirect(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getAllProductsDirect();

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
