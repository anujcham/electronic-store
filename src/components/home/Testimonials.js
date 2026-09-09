import { Quote, Star } from "lucide-react";

import { Container } from "../ui";

const defaultTestimonials = [
  {
    name: "Maya R.",
    location: "Birmingham",
    review:
      "I bought a refurbished iPhone 13 from here and it arrived in excellent condition. The phone looks practically new and the delivery was quick across the UK.",
    rating: 5,
  },
  {
    name: "Daniel T.",
    location: "Manchester",
    review:
      "The quality check process really stood out. My Samsung Galaxy S23 Ultra feels premium, and the warranty gave me real confidence when ordering.",
    rating: 5,
  },
  {
    name: "Sophie L.",
    location: "Leeds",
    review:
      "I was nervous about buying refurbished, but the phone arrived sealed, charging properly, and the customer support was genuinely helpful. Great value for money.",
    rating: 4,
  },
  {
    name: "Ahmed K.",
    location: "London",
    review:
      "A smooth experience from start to finish. The phone was exactly as described, the price was fair, and the whole process felt trustworthy and professional.",
    rating: 5,
  },
];

export function Testimonials({
  title = "What our customers say",
  subtitle = "Real feedback from shoppers who chose trusted refurbished phones for everyday use.",
  testimonials = defaultTestimonials,
}) {
  return (
    <section className="py-5 py-lg-6 bg-white">
      <Container>
        <div className="text-center mb-4 mb-lg-5">
          <h2 className="display-6 fw-bold mb-2 text-primary">{title}</h2>
          <p
            className="mx-auto mb-0 text-secondary"
            style={{ maxWidth: "42rem" }}
          >
            {subtitle}
          </p>
        </div>

        <div className="row g-4">
          {testimonials.map(({ name, location, review, rating }, index) => {
            return (
              <div key={`${name}-${index}`} className="col-12 col-md-6 col-xl-3">
                <div
                  className="testimonial-card h-100 rounded-4 border bg-soft p-4"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    boxShadow: "0 0.75rem 1.5rem rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        background: "rgba(37, 99, 235, 0.08)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Quote size={18} strokeWidth={2.2} />
                    </div>

                    <div className="d-flex align-items-center gap-1 text-warning">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${name}-star-${starIndex}`}
                          size={15}
                          fill={starIndex < rating ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mb-3 text-secondary">“{review}”</p>

                  <div className="d-flex align-items-center justify-content-between gap-2 pt-3 border-top border-light-subtle">
                    <div>
                      <div className="fw-semibold text-primary">{name}</div>
                      {location ? <div className="small text-muted">{location}</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
