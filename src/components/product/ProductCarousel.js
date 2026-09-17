"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Flame } from "lucide-react";
import { Container } from "../ui";
import { ProductCard } from "./ProductCard";

const ICON_MAP = {
  sparkles: Sparkles,
  flame: Flame,
};

export function ProductCarousel({
  products = [],
  title,
  subtitle,
  badgeIcon = "sparkles",
  badgeText,
  badgeClass = "bg-primary-subtle text-primary border border-primary-subtle",
  actionLink = "/shop",
  actionText = "Explore All",
  sectionBg = "bg-white",
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);

  const BadgeIcon = typeof badgeIcon === "string" ? ICON_MAP[badgeIcon.toLowerCase()] : null;

  const checkScrollState = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const overflow = scrollWidth > clientWidth + 10;
      setHasOverflow(overflow);
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  }, []);

  useEffect(() => {
    checkScrollState();
    const handleResize = () => checkScrollState();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(checkScrollState, 250);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [products, checkScrollState]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollState, 350);
    }
  };

  // If no products, do not render the section at all
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`py-5 py-lg-6 ${sectionBg}`}>
      <Container>
        {/* Header with Carousel Controls */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3 mb-4">
          <div>
            {badgeText && (
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className={`badge rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 ${badgeClass}`}>
                  {BadgeIcon && <BadgeIcon size={14} />}
                  <span>{badgeText}</span>
                </span>
              </div>
            )}
            <h2 className="display-6 fw-bold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted mb-0" style={{ maxWidth: "38rem" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* View All CTA Link */}
            {actionLink && (
              <Link href={actionLink} className="btn btn-outline-primary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-2 me-1">
                <span>{actionText}</span>
                <ArrowRight size={14} />
              </Link>
            )}

            {/* Carousel Navigation Buttons - ONLY visible when items exceed viewport to slide */}
            {hasOverflow && (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className={`btn rounded-circle p-2.5 d-flex align-items-center justify-content-center transition-all ${
                    canScrollLeft ? "btn-primary shadow-sm" : "btn-outline-secondary opacity-40"
                  }`}
                  style={{ width: "42px", height: "42px" }}
                  onClick={() => handleScroll("left")}
                  aria-label="Scroll left"
                  disabled={!canScrollLeft}
                  suppressHydrationWarning
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  className={`btn rounded-circle p-2.5 d-flex align-items-center justify-content-center transition-all ${
                    canScrollRight ? "btn-primary shadow-sm" : "btn-outline-secondary opacity-40"
                  }`}
                  style={{ width: "42px", height: "42px" }}
                  onClick={() => handleScroll("right")}
                  aria-label="Scroll right"
                  disabled={!canScrollRight}
                  suppressHydrationWarning
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Cards Sliding Carousel Container (Exactly like Shop By Brand) */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className="d-flex gap-3 gap-md-4 overflow-x-auto pb-3 pt-2 no-scrollbar"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {products.map((product) => (
            <div key={product._id || product.id || product.slug} className="product-carousel-item">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
