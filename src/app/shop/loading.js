import { Container } from "@/components/ui";
import { ProductSkeletonGrid } from "@/components/product/ProductSkeletonGrid";

export default function ShopLoading() {
  return (
    <main className="py-4 py-lg-5 bg-soft min-vh-100">
      <Container>
        {/* Breadcrumb & Trust Banner Skeleton */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div className="skeleton-line" style={{ width: "200px", height: "18px" }} />
          <div className="skeleton-line d-none d-sm-block" style={{ width: "280px", height: "16px" }} />
        </div>

        {/* Toolbar Skeleton */}
        <div className="bg-white border rounded-4 p-3 mb-4 shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="skeleton-line" style={{ width: "160px", height: "24px" }} />
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-pill" style={{ width: "120px", height: "36px" }} />
            <div className="skeleton-pill" style={{ width: "90px", height: "36px" }} />
          </div>
        </div>

        {/* Layout Row */}
        <div className="row g-4">
          {/* Desktop Filters Sidebar Skeleton */}
          <div className="d-none d-lg-block col-lg-3 align-self-start">
            <div className="card border rounded-4 shadow-sm p-4 bg-white">
              <div className="skeleton-line mb-4" style={{ width: "70%", height: "20px" }} />
              <div className="d-flex flex-column gap-2.5 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="d-flex align-items-center gap-2">
                    <div className="skeleton-pill" style={{ width: "18px", height: "18px", borderRadius: "4px" }} />
                    <div className="skeleton-line" style={{ width: `${60 + i * 8}%`, height: "16px" }} />
                  </div>
                ))}
              </div>
              <div className="skeleton-line mb-3" style={{ width: "50%", height: "18px" }} />
              <div className="skeleton-pill w-100 mb-2" style={{ height: "36px" }} />
              <div className="skeleton-pill w-100" style={{ height: "36px" }} />
            </div>
          </div>

          {/* Catalog Skeleton Grid */}
          <div className="col-12 col-lg-9">
            <ProductSkeletonGrid count={6} viewMode="grid" />
          </div>
        </div>
      </Container>
    </main>
  );
}

