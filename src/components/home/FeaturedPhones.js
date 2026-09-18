import { PRODUCT_CATEGORIES } from "../../constants/productConstants";
import { getFeaturedProductsDirect } from "../../lib/products.server";
import { ProductCarousel } from "../product/ProductCarousel";

export async function FeaturedPhones() {
  const featuredProducts = await getFeaturedProductsDirect();
  const phoneProducts = featuredProducts.filter(
    (product) => !product.category || product.category === PRODUCT_CATEGORIES.SMARTPHONES
  );

  // If no featured phones selected in admin panel, do not render the section at all
  if (!phoneProducts || phoneProducts.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      products={JSON.parse(JSON.stringify(phoneProducts))}
      title="Featured Handsets"
      subtitle="Premium pre-owned and certified refurbished smartphones, individually inspected for pristine quality and value."
      badgeIcon="sparkles"
      badgeText="MASTER CHECKED"
      badgeClass="bg-primary-subtle text-primary border border-primary-subtle"
      actionLink="/shop"
      actionText="Explore All Phones"
      sectionBg="bg-white"
    />
  );
}
