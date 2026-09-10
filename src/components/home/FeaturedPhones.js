import Link from "next/link";
import { PRODUCT_CATEGORIES } from "../../constants/productConstants";
import { getFeaturedProducts } from "../../services/productService";
import { ProductGrid } from "../product/ProductGrid";
import { Button, Container, SectionHeading } from "../ui";

export async function FeaturedPhones() {
  const featuredProducts = await getFeaturedProducts();
  const phoneProducts = featuredProducts
    .filter((product) => product.category === PRODUCT_CATEGORIES.SMARTPHONES)
    .slice(0, 8);

  return (
    <section className="py-5 py-lg-6 bg-white">
      <Container>
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4 mb-lg-5">
          <SectionHeading
            title="Featured Phones"
            subtitle="Premium second-hand and refurbished smartphones, carefully checked for quality, performance and value."
            className="mb-0"
          />

          <Link href="/shop">
            <Button variant="outline" size="lg">
              View All Phones
            </Button>
          </Link>
        </div>

        {phoneProducts.length > 0 ? (
          <ProductGrid products={phoneProducts} />
        ) : (
          <div className="text-center py-5">
            <p className="mb-0 text-muted">No featured phones available right now.</p>
          </div>
        )}
      </Container>
    </section>
  );
}
