"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Cpu,
  Layers3,
  MonitorSmartphone,
  Smartphone,
  Sparkles,
  Waves,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { Container } from "../ui";

const defaultCategories = [
  {
    name: "iPhone",
    label: "Certified refurbished Apple iPhones",
    href: "/shop?brand=Apple",
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
    icon: Smartphone,
    badge: "Most Popular",
  },
  {
    name: "Samsung",
    label: "Galaxy S & Note series with OLED displays",
    href: "/shop?brand=Samsung",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    icon: MonitorSmartphone,
    badge: "5G Flagships",
  },
  {
    name: "Google Pixel",
    label: "Pure Android experience & pro AI camera",
    href: "/shop?brand=Google",
    imageUrl:
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=900&q=80",
    icon: Camera,
    badge: "Top Camera",
  },
  {
    name: "OnePlus",
    label: "Warp fast charging & fluid 120Hz screens",
    href: "/shop?brand=OnePlus",
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    icon: Cpu,
    badge: "High Speed",
  },
  {
    name: "Xiaomi",
    label: "High value spec smartphones for less",
    href: "/shop?brand=Xiaomi",
    imageUrl:
      "https://images.unsplash.com/photo-1580910051074-3e8d6c4f2051?auto=format&fit=crop&w=900&q=80",
    icon: Waves,
    badge: "Best Value",
  },
  {
    name: "Other Brands",
    label: "Rare finds and budget friendly choices",
    href: "/shop",
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
    icon: Layers3,
    badge: "Explore All",
  },
];

export function PhoneCategories({
  title = "Shop By Brand",
  subtitle = "Select your preferred smartphone brand to explore master-tested pre-owned options.",
  categories = defaultCategories,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollState, 350);
    }
  };

  return (
    <section className="py-5 py-lg-6 bg-white border-top border-bottom">
      <Container>
        {/* Header with Carousel Navigation Buttons */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-bold">
                📱 Certified Smartphone Brands
              </span>
            </div>
            <h2 className="display-6 fw-bold text-primary mb-1">{title}</h2>
            <p className="text-secondary mb-0" style={{ maxWidth: "38rem" }}>
              {subtitle}
            </p>
          </div>

          {/* Carousel Next/Prev Controls */}
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
        </div>

        {/* Horizontal Cards Carousel Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollState}
          className="d-flex gap-4 overflow-x-auto pb-3 pt-2 no-scrollbar"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {categories.map(({ name, label, href, imageUrl, icon: Icon, badge }) => (
            <div key={name} className="brand-carousel-item">
              <Link
                href={href}
                className="phone-category-card d-block position-relative overflow-hidden rounded-4 border bg-white text-decoration-none h-100 shadow-sm transition-all"
                style={{
                  borderColor: "rgba(148, 163, 184, 0.25)",
                }}
              >
                <div className="position-relative" style={{ aspectRatio: "16 / 10" }}>
                  <Image
                    src={imageUrl}
                    alt={`${name} category`}
                    fill
                    sizes="320px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />

                  {/* Gradient Overlay */}
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 p-3 d-flex justify-content-between align-items-start"
                    style={{
                      background: "linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.1) 70%)",
                    }}
                  >
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(4px)",
                        color: "#fff",
                      }}
                    >
                      <Icon size={18} strokeWidth={2.2} />
                    </div>

                    <span className="badge bg-white text-dark shadow-sm border px-2.5 py-1 rounded-pill small fw-bold">
                      {badge}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                    <h3 className="h5 fw-bold mb-0 text-primary">{name}</h3>
                    <ArrowRight size={18} className="text-primary" />
                  </div>

                  <p className="mb-0 text-secondary small" style={{ lineHeight: 1.5 }}>
                    {label}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
