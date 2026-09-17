import Image from "next/image";
import Link from "next/link";
import { Flame, ArrowRight, Zap, Clock } from "lucide-react";
import { Container } from "../ui";

export function PromoBannerTwo() {
  return (
    <section className="py-4 py-lg-5 bg-white">
      <Container>
        <div
          className="position-relative rounded-4 overflow-hidden shadow-md text-white border"
          style={{
            minHeight: "280px",
            backgroundColor: "#0b0f19",
          }}
        >
          {/* Background Image with Ambient Gradient Overlay */}
          <div className="position-absolute top-0 end-0 w-100 w-lg-60 h-100 opacity-90">
            <Image
              src="/images/banners/hot-deals-banner.jpg"
              alt="Limited Time Hot Deals & Clearance Event"
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center right" }}
            />
            {/* Deep overlay to ensure text contrast on mobile & desktop */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: "linear-gradient(90deg, rgba(11,15,25,0.95) 0%, rgba(11,15,25,0.85) 45%, rgba(11,15,25,0.25) 100%)",
              }}
            />
          </div>

          {/* Banner Content */}
          <div className="position-relative p-4 p-md-5 d-flex flex-column justify-content-center" style={{ zIndex: 2, maxWidth: "620px", minHeight: "280px" }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-danger text-white px-2.5 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm">
                <Flame size={14} className="text-warning" />
                <span>LIMITED TIME FLASH DROPS</span>
              </span>
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-2.5 py-1 rounded-pill small fw-medium d-none d-sm-inline-flex align-items-center gap-1">
                <Clock size={12} />
                <span>Refreshed Weekly</span>
              </span>
            </div>

            <h2 className="display-6 fw-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
              Hot Deals &amp; <span className="text-warning">Price Drops</span>
            </h2>

            <p className="text-light opacity-90 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
              Exclusive limited stock markdowns on top flagship handsets. Slashed prices, pristine grading, and ready for immediate dispatch from our London facility.
            </p>

            <div>
              <Link
                href="/shop?sort=price-asc"
                className="btn btn-warning px-4 py-2.5 rounded-3 fw-bold text-dark d-inline-flex align-items-center gap-2 shadow transition-all"
              >
                <Zap size={16} />
                <span>Grab Deals Before They're Gone</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

