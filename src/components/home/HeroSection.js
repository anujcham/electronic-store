"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Leaf, ArrowRight } from "lucide-react";
import { Container } from "../ui";

const HERO_SLIDES = [
  {
    id: 1,
    badge: "Certified Pre-Owned • 100% Tested",
    badgeIcon: ShieldCheck,
    title: "Like-New Smartphones Up To 40% Less",
    subtitle:
      "Explore master-certified refurbished iPhones, Samsung Galaxy & Google Pixel handsets. Passed 50-point quality diagnostic check with 12-month seller warranty.",
    primaryCta: { text: "Shop Refurbished Phones", link: "/shop" },
    secondaryCta: { text: "View Condition Tiers", link: "#info-condition" },
    bgImage:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1920&q=80",
    stats: [
      { value: "50-Point", label: "Diagnostic Check" },
      { value: "12-Month", label: "Seller Warranty" },
      { value: "85%+", label: "Battery Guaranteed" },
    ],
    highlightDeal: "Featured: iPhone 13 (128GB - Excellent Grade) for £489",
  },
  {
    id: 2,
    badge: "Pristine Cosmetic Grading",
    badgeIcon: Sparkles,
    title: "Pristine Quality Without The Pristine Price",
    subtitle:
      "Choose from Like New, Excellent, Very Good, and Good condition tiers. Zero compromises on performance — guaranteed 100% functional with clean IMEI.",
    primaryCta: { text: "Explore Grade Tiers", link: "/shop" },
    secondaryCta: { text: "Check Stock", link: "/shop" },
    bgImage:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1920&q=80",
    stats: [
      { value: "4 Tiers", label: "Clear Condition Grades" },
      { value: "100%", label: "Clean IMEI & Unlocked" },
      { value: "30 Days", label: "Free Return Trial" },
    ],
    highlightDeal: "Popular: Samsung Galaxy S22 Ultra (256GB) for £549",
  },
  {
    id: 3,
    badge: "Sustainable Tech Choice",
    badgeIcon: Leaf,
    title: "Save Money & Reduce Electronic Waste",
    subtitle:
      "Choosing a refurbished phone saves up to 70kg of CO₂ emissions and prevents raw mineral mining. Smart for your wallet, good for the planet.",
    primaryCta: { text: "Calculate Eco Impact", link: "/shop" },
    secondaryCta: { text: "Learn More", link: "/shop" },
    bgImage:
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1920&q=80",
    stats: [
      { value: "70kg", label: "CO₂ Emissions Saved" },
      { value: "175g", label: "E-Waste Prevented" },
      { value: "100%", label: "Recyclable Packaging" },
    ],
    highlightDeal: "Best Value: Google Pixel 7 Pro (128GB) for £399",
  },
];

export function HeroSection() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slideCount = HERO_SLIDES.length;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slideCount);
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slideCount]);

  const handlePrev = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + slideCount) % slideCount);
  };

  const handleNext = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slideCount);
  };

  const currentSlide = HERO_SLIDES[currentSlideIndex];
  const BadgeIcon = currentSlide.badgeIcon;

  return (
    <section
      className="position-relative overflow-hidden bg-dark text-white"
      style={{ minHeight: "560px", width: "100%" }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Image Slides */}
      {HERO_SLIDES.map((slide, index) => {
        const isActive = index === currentSlideIndex;
        return (
          <div
            key={slide.id}
            className="position-absolute top-0 start-0 w-100 h-100 transition-opacity duration-700"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              transition: "opacity 0.8s ease-in-out",
            }}
          >
            <Image
              src={slide.bgImage}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center" }}
              unoptimized
            />
            {/* Dark Gradient Overlay for optimal text readability */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(90deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 55%, rgba(15, 23, 42, 0.45) 100%)",
              }}
            />
          </div>
        );
      })}

      {/* Hero Content Layer */}
      <div className="position-relative py-5 py-lg-6" style={{ zIndex: 2 }}>
        <Container>
          <div className="row align-items-center" style={{ minHeight: "440px" }}>
            <div className="col-12 col-lg-8 col-xl-7">
              {/* Badge */}
              <div className="d-inline-flex align-items-center gap-2 bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 mb-3 fw-bold small">
                <BadgeIcon size={16} />
                <span>{currentSlide.badge}</span>
              </div>

              {/* Title */}
              <h1
                className="display-4 fw-extrabold mb-3 text-white"
                style={{ lineHeight: 1.1, letterSpacing: "-0.03em", textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
              >
                {currentSlide.title}
              </h1>

              {/* Subtitle */}
              <p
                className="lead text-light mb-4 opacity-90"
                style={{ maxWidth: "42rem", fontSize: "1.15rem", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              >
                {currentSlide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <Link
                  href={currentSlide.primaryCta.link}
                  className="btn btn-primary btn-lg px-4 py-3 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-lg"
                >
                  {currentSlide.primaryCta.text} <ArrowRight size={18} />
                </Link>
                <Link
                  href={currentSlide.secondaryCta.link}
                  className="btn btn-outline-light btn-lg px-4 py-3 rounded-3 fw-medium"
                >
                  {currentSlide.secondaryCta.text}
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="row g-3 pt-2 border-top border-secondary border-opacity-50">
                {currentSlide.stats.map((stat, idx) => (
                  <div key={idx} className="col-4 col-sm-4">
                    <div className="h4 fw-bold mb-0 text-warning">{stat.value}</div>
                    <div className="small text-white-50">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Navigation Arrow Controls */}
      <button
        type="button"
        className="btn btn-dark rounded-circle p-2 position-absolute top-50 start-0 translate-middle-y ms-3 d-none d-md-flex align-items-center justify-content-center shadow-lg border border-secondary"
        style={{ zIndex: 3, width: "48px", height: "48px", opacity: 0.85 }}
        onClick={handlePrev}
        aria-label="Previous Slide"
        suppressHydrationWarning
      >
        <ChevronLeft size={24} />
      </button>

      <button
        type="button"
        className="btn btn-dark rounded-circle p-2 position-absolute top-50 end-0 translate-middle-y me-3 d-none d-md-flex align-items-center justify-content-center shadow-lg border border-secondary"
        style={{ zIndex: 3, width: "48px", height: "48px", opacity: 0.85 }}
        onClick={handleNext}
        aria-label="Next Slide"
        suppressHydrationWarning
      >
        <ChevronRight size={24} />
      </button>

      {/* Bottom Bar: Slide Indicators & Highlight Deal */}
      <div
        className="position-absolute bottom-0 start-0 w-100 py-3 bg-dark bg-opacity-75 border-top border-secondary border-opacity-25"
        style={{ zIndex: 3 }}
      >
        <Container>
          <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
            <span className="small text-warning fw-semibold d-flex align-items-center gap-1.5">
              🔥 {currentSlide.highlightDeal}
            </span>

            {/* Slide Dots */}
            <div className="d-flex align-items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn p-0 rounded-pill transition-all ${
                    idx === currentSlideIndex ? "bg-primary" : "bg-white opacity-40"
                  }`}
                  style={{
                    width: idx === currentSlideIndex ? "28px" : "10px",
                    height: "8px",
                    border: "none",
                  }}
                  onClick={() => setCurrentSlideIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  suppressHydrationWarning
                />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
