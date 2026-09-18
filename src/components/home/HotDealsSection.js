import { getHotDealsDirect } from "../../lib/products.server";
import { ProductCarousel } from "../product/ProductCarousel";

export async function HotDealsSection() {
  const hotDeals = await getHotDealsDirect();

  // If no hot deals selected in admin panel, do not render the section at all
  if (!hotDeals || hotDeals.length === 0) {
    return null;
  }

  return (
    <ProductCarousel
      products={JSON.parse(JSON.stringify(hotDeals))}
      title="Hot Deals & Steals"
      subtitle="Exclusive limited-quantity markdowns on top flagship handsets. Refreshed directly from our live stockroom."
      badgeIcon="flame"
      badgeText="LIVE PRICE DROPS"
      badgeClass="bg-danger bg-opacity-10 text-danger border border-danger-subtle"
      actionLink="/shop?sort=price-asc"
      actionText="Explore All Deals"
      sectionBg="bg-light border-top border-bottom"
    />
  );
}
