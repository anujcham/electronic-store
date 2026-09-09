import { BadgeDollarSign, Leaf, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "../ui";

const defaultReasons = [
  {
    title: "Save Money",
    description:
      "Get premium smartphones at a fraction of the cost of buying brand new, without sacrificing everyday performance.",
    icon: BadgeDollarSign,
  },
  {
    title: "Quality Checked Phones",
    description:
      "Every handset is carefully inspected, restored and tested so you can shop with confidence.",
    icon: ShieldCheck,
  },
  {
    title: "Warranty & Returns",
    description:
      "Buy with peace of mind thanks to warranty coverage and simple returns on eligible orders.",
    icon: Sparkles,
  },
  {
    title: "Better for the Environment",
    description:
      "Choosing refurbished helps reduce electronic waste and gives perfectly usable phones a second life.",
    icon: Leaf,
  },
];

export function WhyBuyRefurbished({
  title = "Why buy refurbished phones from us?",
  subtitle = "Refurbished phones offer the same everyday usability you expect, with better value and less waste.",
  reasons = defaultReasons,
}) {
  return (
    <section className="py-5 py-lg-6 bg-soft">
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
          {reasons.map(({ title: reasonTitle, description, icon: Icon }, index) => {
            return (
              <div key={reasonTitle} className="col-12 col-md-6 col-xl-3">
                <div
                  className="why-buy-card h-100 rounded-4 border bg-white p-4 p-lg-5"
                  style={{
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    boxShadow: "0 0.75rem 1.5rem rgba(15, 23, 42, 0.04)",
                  }}
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

                  <h3 className="h5 mb-3 text-primary">{reasonTitle}</h3>
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
