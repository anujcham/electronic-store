import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "../ui";

export function PromoBannerOne() {
  return (
    <section className="py-4 py-lg-5 bg-light">
      <Container>
        <div
          className="position-relative rounded-4 overflow-hidden shadow-md text-white border"
          style={{
            minHeight: "280px",
            backgroundColor: "#0d1424",
          }}
        >
          {/* Background Image with Ambient Gradient Overlay */}
          <div className="position-absolute top-0 end-0 w-100 h-100 opacity-95">
            <Image
              src="/images/banners/refurbished-promo.jpg"
              alt="UK Certified Refurbished Guarantee"
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center right" }}
              priority={false}
            />
            {/* Deep overlay ensuring crystal-clear text readability across mobile & desktop */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(90deg, rgba(13, 20, 36, 0.96) 0%, rgba(13, 20, 36, 0.85) 45%, rgba(13, 20, 36, 0.25) 100%)",
              }}
            />
          </div>

          {/* Banner Content */}
          <div
            className="position-relative p-4 p-md-5 d-flex flex-column justify-content-center"
            style={{ zIndex: 2, maxWidth: "620px", minHeight: "280px" }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-primary text-white px-2.5 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm">
                <ShieldCheck size={14} />
                <span>UK CERTIFIED REFURBISHED</span>
              </span>
              <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-25 px-2.5 py-1 rounded-pill small fw-medium d-none d-sm-inline-flex align-items-center gap-1">
                <CheckCircle2 size={12} className="text-success" />
                <span>12-Month UK Warranty</span>
              </span>
            </div>

            <h2 className="display-6 fw-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
              Pristine Tech. <br />
              <span style={{ color: "#60a5fa" }}>Up to 40% Less</span> than New.
            </h2>

            <p className="text-light opacity-90 mb-4" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
              Every handset passes our 90-point diagnostic check with 85%+ guaranteed battery health, pristine cosmetic grading, and free next-day UK tracked delivery.
            </p>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Link
                href="/shop"
                className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold text-white d-inline-flex align-items-center gap-2 shadow transition-all"
              >
                <Sparkles size={16} />
                <span>Shop Certified Devices</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/support"
                className="btn btn-outline-light px-3.5 py-2.5 rounded-3 fw-semibold small transition-all border-opacity-50 text-decoration-none"
              >
                Learn Our Grading
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
