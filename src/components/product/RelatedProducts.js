import { ProductGrid } from "./ProductGrid";

export function RelatedProducts({ products = [] }) {
  return (
    <section className="mt-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
        <div>
          <p className="text-uppercase text-primary fw-semibold small mb-1">You may also like</p>
          <h2 className="h3 mb-0 text-primary">Related Phones</h2>
        </div>
      </div>

      <ProductGrid
        products={products}
        columns={{
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 4,
        }}
      />
    </section>
  );
}
