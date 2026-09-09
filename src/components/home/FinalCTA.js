import { Button, Container } from "../ui";

export function FinalCTA({
  title = "Ready to find your next refurbished phone?",
  subtitle = "Explore premium second-hand smartphones with trusted quality checks, warranty protection, and fast UK delivery.",
  primaryCtaText = "Shop Phones",
  secondaryCtaText = "View All Phones",
}) {
  return (
    <section className="py-5 py-lg-6 bg-soft">
      <Container>
        <div
          className="final-cta rounded-4 p-4 p-lg-5 text-center text-lg-start"
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(37, 99, 235, 0.82))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 1.25rem 2.5rem rgba(15, 23, 42, 0.16)",
          }}
        >
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <h2 className="display-6 fw-bold mb-3 text-white">{title}</h2>
              <p className="mb-0 text-white-50" style={{ maxWidth: "40rem" }}>
                {subtitle}
              </p>
            </div>

            <div className="col-12 col-lg-4">
              <div className="d-flex flex-column flex-sm-row justify-content-lg-end gap-3">
                <Button variant="light" size="lg">
                  {primaryCtaText}
                </Button>
                <Button variant="outline" size="lg" className="text-white border-white-50">
                  {secondaryCtaText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
