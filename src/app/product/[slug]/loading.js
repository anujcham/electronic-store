import { Container } from "@/components/ui";

export default function ProductLoading() {
  return (
    <main className="py-4 py-lg-5 bg-soft min-vh-100">
      <Container>
        {/* Breadcrumb Skeleton */}
        <div className="skeleton-line mb-3" style={{ width: "240px", height: "18px" }} />

        {/* Product Details Card Skeleton */}
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden p-4 p-md-5 mb-4">
          <div className="row g-4 g-lg-5">
            {/* Gallery Column Skeleton */}
            <div className="col-12 col-lg-6">
              <div
                className="position-relative bg-light rounded-4 overflow-hidden mb-3 border d-flex align-items-center justify-content-center"
                style={{ aspectRatio: "1 / 1" }}
              >
                <div className="skeleton-shimmer" />
              </div>
              <div className="d-flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-3 border bg-light position-relative overflow-hidden"
                    style={{ width: "70px", height: "70px", flexShrink: 0 }}
                  >
                    <div className="skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Column Skeleton */}
            <div className="col-12 col-lg-6 d-flex flex-column gap-3">
              <div className="skeleton-line" style={{ width: "40%", height: "20px" }} />
              <div className="skeleton-line" style={{ width: "85%", height: "36px" }} />
              <div className="skeleton-line" style={{ width: "60%", height: "16px" }} />
              <div className="skeleton-line my-2" style={{ width: "35%", height: "42px" }} />

              <div className="border-top pt-3 d-flex flex-column gap-2">
                <div className="skeleton-line" style={{ width: "30%", height: "16px" }} />
                <div className="d-flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-pill" style={{ width: "90px", height: "38px" }} />
                  ))}
                </div>
              </div>

              <div className="border-top pt-3 d-flex flex-column gap-2">
                <div className="skeleton-line" style={{ width: "30%", height: "16px" }} />
                <div className="d-flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-pill" style={{ width: "70px", height: "38px" }} />
                  ))}
                </div>
              </div>

              <div className="row g-2 pt-3 mt-auto">
                <div className="col-6">
                  <div className="skeleton-pill w-100" style={{ height: "48px" }} />
                </div>
                <div className="col-6">
                  <div className="skeleton-pill w-100" style={{ height: "48px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

