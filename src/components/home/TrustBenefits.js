"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BatteryCharging,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { Container } from "../ui";

const defaultBenefits = [
  {
    title: "50-Point Diagnostic Check",
    description:
      "Every phone passes 50+ rigorous hardware and software diagnostic tests before being certified for sale.",
    icon: ShieldCheck,
  },
  {
    title: "85%+ Battery Guarantee",
    description:
      "We guarantee minimum 85% battery health capacity on all optimal phones, or brand new replacements.",
    icon: BatteryCharging,
  },
  {
    title: "12-Month Seller Warranty",
    description:
      "Full coverage against hardware defects with simple UK-based repair or free replacement.",
    icon: BadgeCheck,
  },
  {
    title: "Clean IMEI & Carrier Unlocked",
    description:
      "100% verified non-stolen IMEI status and unlocked for use on any mobile network worldwide.",
    icon: LockKeyhole,
  },
];

export function TrustBenefits({
  title = "Why shoppers trust us",
  subtitle = "Built for confidence, convenience, and long-term value.",
  benefits = defaultBenefits,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="py-5 py-lg-6 bg-white">
      <Container>
        <div className="text-center mb-4 mb-lg-5">
          <h2 className="display-6 fw-bold mb-2 text-primary">{title}</h2>
          <p
            className="mx-auto mb-0 text-secondary"
            style={{ maxWidth: "40rem" }}
          >
            {subtitle}
          </p>
        </div>

        <div className="row g-4">
          {benefits.map(({ title: benefitTitle, description, icon: Icon }, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div key={benefitTitle} className="col-12 col-md-6 col-xl-3">
                <div
                  className="h-100 rounded-4 border bg-soft p-4 p-lg-5"
                  style={{
                    borderColor: isHovered
                      ? "rgba(37, 99, 235, 0.35)"
                      : "rgba(148, 163, 184, 0.2)",
                    boxShadow: isHovered
                      ? "0 1.25rem 2.5rem rgba(15, 23, 42, 0.12)"
                      : "0 0.5rem 1.5rem rgba(15, 23, 42, 0.04)",
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      background: "rgba(37, 99, 235, 0.08)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <h3 className="h5 mb-3 text-primary">{benefitTitle}</h3>
                  <p className="mb-0 text-secondary">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
