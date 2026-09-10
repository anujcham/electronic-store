"use client";

export function ProductSkeletonGrid({ count = 6, viewMode = "grid" }) {
  if (viewMode === "list") {
    return (
      <div className="d-flex flex-column gap-3">
        {Array.from({ length: count }, (_, i) => i).map((key) => (
          <div
            key={key}
            className="card border rounded-4 shadow-sm overflow-hidden bg-white"
          >
            <div className="row g-0 align-items-center">
              {/* Thumbnail Image Placeholder */}
              <div className="col-12 col-sm-4 col-md-3 p-3 text-center bg-light">
                <div
                  className="position-relative mx-auto rounded-3 overflow-hidden bg-white border"
                  style={{ width: "140px", height: "140px" }}
                >
                  <div className="skeleton-shimmer" />
                </div>
              </div>

              {/* Specs & Info Placeholders */}
              <div className="col-12 col-sm-8 col-md-6 p-4 border-end-md">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="skeleton-pill" style={{ width: "60px", height: "20px" }} />
                  <div className="skeleton-pill" style={{ width: "80px", height: "20px" }} />
                </div>

                <div className="skeleton-line mb-2" style={{ width: "75%", height: "22px" }} />
                <div className="skeleton-line mb-2" style={{ width: "90%", height: "14px" }} />

                <div className="d-flex flex-wrap gap-2 pt-2">
                  <div className="skeleton-pill" style={{ width: "120px", height: "18px" }} />
                  <div className="skeleton-pill" style={{ width: "100px", height: "18px" }} />
                  <div className="skeleton-pill" style={{ width: "110px", height: "18px" }} />
                </div>
              </div>

              {/* Pricing & CTA Button Placeholder */}
              <div className="col-12 col-md-3 p-4 bg-light bg-opacity-50 h-100 d-flex flex-column justify-content-center border-top border-top-md-0">
                <div className="skeleton-line mb-1 ms-md-auto" style={{ width: "90px", height: "28px" }} />
                <div className="skeleton-line mb-3 ms-md-auto" style={{ width: "65px", height: "14px" }} />
                <div className="skeleton-pill mt-auto w-100" style={{ height: "38px" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Restore preferred original grid skeleton cards
  return (
    <div className="row g-3 g-md-4">
      {Array.from({ length: count }, (_, i) => i).map((key) => (
        <div key={key} className="col-12 col-sm-6 col-md-4">
          <div className="card h-100 border rounded-4 shadow-sm overflow-hidden bg-white p-3">
            {/* Shimmer Image Placeholder */}
            <div
              className="bg-light rounded-3 mb-3 position-relative overflow-hidden"
              style={{ height: "200px" }}
            >
              <div className="skeleton-shimmer" />
            </div>

            {/* Badges Placeholder */}
            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
              <div className="skeleton-pill" style={{ width: "60px", height: "18px" }} />
              <div className="skeleton-pill" style={{ width: "80px", height: "18px" }} />
            </div>

            {/* Title Placeholder */}
            <div className="skeleton-line mb-2" style={{ width: "85%", height: "20px" }} />
            <div className="skeleton-line mb-3" style={{ width: "60%", height: "16px" }} />

            {/* Price & CTA Placeholder */}
            <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
              <div className="skeleton-line" style={{ width: "70px", height: "24px" }} />
              <div className="skeleton-pill" style={{ width: "100px", height: "36px" }} />
            </div>
          </div>
        </div>
      ))}

      <style jsx global>{`
        .skeleton-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(241, 245, 249, 0.6) 0%,
            rgba(226, 232, 240, 0.9) 50%,
            rgba(241, 245, 249, 0.6) 100%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s infinite ease-in-out;
        }

        .skeleton-line,
        .skeleton-pill {
          background: #e2e8f0;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .skeleton-pill {
          border-radius: 50rem;
        }

        @keyframes skeletonShimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
