"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  BatteryCharging,
  Phone,
  Mail,
  MessageSquare,
  ChevronDown,
  Search,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Container } from "../../components/ui";

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "quality", label: "Quality & Diagnostics" },
  { id: "battery", label: "Battery Health" },
  { id: "warranty", label: "Warranty & Repairs" },
  { id: "shipping", label: "Shipping & Returns" },
];

const FAQS = [
  {
    category: "quality",
    question: "What is a 50-Point Diagnostic Inspection?",
    answer:
      "Every single refurbished phone undergoes 50+ rigorous hardware and software tests performed by master technicians. We test multi-touch screen response, battery charging capacity, camera optics, optical image stabilization, noise-cancelling microphones, stereo speakers, Face ID/Touch ID biometrics, Wi-Fi/5G antennas, and verify 100% clean IMEI carrier status.",
  },
  {
    category: "quality",
    question: "Are your second-hand phones carrier unlocked?",
    answer:
      "Yes! All phones sold on our platform are 100% factory unlocked. You can use them with any SIM card from any UK or global mobile network (EE, O2, Vodafone, Three, giffgaff, Sky Mobile, etc.).",
  },
  {
    category: "battery",
    question: "What battery health percentage is guaranteed?",
    answer:
      "We guarantee a minimum of 85% battery health capacity on all 'Optimal' devices. For devices marked with 'New Replacement Battery', we install a brand-new 100% capacity replacement battery prior to shipping.",
  },
  {
    category: "battery",
    question: "How do I check the battery health after receiving my phone?",
    answer:
      "On iPhones, go to Settings > Battery > Battery Health & Charging to verify Maximum Capacity. On Android devices (Samsung / Pixel), you can check via Settings > Battery status or Samsung Members Diagnostics.",
  },
  {
    category: "warranty",
    question: "What is covered under the 12-Month Seller Warranty?",
    answer:
      "Our 12-month seller warranty covers all mechanical and electronic component failures (e.g. faulty charging ports, screen touch issues, speaker failures, camera glitches). If a fault develops, we provide free repairs or replacement. Note: Accidental liquid damage or cracked screens caused by drops are excluded from standard warranty.",
  },
  {
    category: "warranty",
    question: "How do I submit a warranty claim?",
    answer:
      "Simply email us at support@electronicstore.co.uk with your order number and a short description or photo of the issue. Our UK support team will issue a pre-paid return shipping label within 24 hours.",
  },
  {
    category: "shipping",
    question: "How fast is delivery within the UK?",
    answer:
      "We offer Free Royal Mail / DPD Tracked 24/48 delivery on all UK orders. Orders placed before 2:00 PM GMT on weekdays are dispatched the same day, with average delivery taking 2–4 working days.",
  },
  {
    category: "shipping",
    question: "What is your 30-Day Money Back Guarantee policy?",
    answer:
      "If you are not 100% satisfied with your phone for any reason, you can return it within 30 days of receipt for a full refund or exchange. The phone must be in the same cosmetic condition as received and signed out of iCloud / Google accounts.",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Form state
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    orderId: "",
    category: "General Inquiry",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="py-5 py-lg-6 bg-soft">
      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Support & FAQs</span>
          </div>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-5">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-bold mb-2 d-inline-flex align-items-center gap-1.5">
            <HelpCircle size={16} /> Help & Customer Care
          </span>
          <h1 className="display-5 fw-bold text-primary mb-2">How Can We Help You Today?</h1>
          <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "42rem" }}>
            Find answers about our 50-point quality checks, 12-month seller warranty, battery health guarantees, shipping, and returns.
          </p>

          {/* Search Box */}
          <div className="mx-auto" style={{ maxWidth: "540px" }}>
            <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border">
              <span className="input-group-text bg-white border-0 ps-3 text-muted">
                <Search size={20} />
              </span>
              <input
                type="search"
                className="form-control bg-white border-0 fs-6 ps-2"
                placeholder="Search FAQs (e.g. warranty, battery, returns)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Top 4 Quick Support Cards */}
        <div className="row g-3 mb-5">
          <div className="col-6 col-lg-3">
            <div className="bg-white border rounded-4 p-4 text-center h-100 shadow-sm transition-all hover-translate-y">
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                <ShieldCheck size={28} />
              </div>
              <h6 className="fw-bold text-primary mb-1">12-Month Warranty</h6>
              <p className="small text-muted mb-0">Full coverage against hardware defects and repairs.</p>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="bg-white border rounded-4 p-4 text-center h-100 shadow-sm transition-all hover-translate-y">
              <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                <BatteryCharging size={28} />
              </div>
              <h6 className="fw-bold text-primary mb-1">85%+ Battery Guarantee</h6>
              <p className="small text-muted mb-0">Optimal capacity tests or brand new battery swap.</p>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="bg-white border rounded-4 p-4 text-center h-100 shadow-sm transition-all hover-translate-y">
              <div className="bg-info-subtle text-info p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                <Truck size={28} />
              </div>
              <h6 className="fw-bold text-primary mb-1">Tracked Delivery</h6>
              <p className="small text-muted mb-0">Free Royal Mail / DPD shipping with tracking.</p>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="bg-white border rounded-4 p-4 text-center h-100 shadow-sm transition-all hover-translate-y">
              <div className="bg-warning-subtle text-warning p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
                <RotateCcw size={28} />
              </div>
              <h6 className="fw-bold text-primary mb-1">30-Day Money Back</h6>
              <p className="small text-muted mb-0">Hassle-free 30-day return policy for refunds.</p>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="row g-4 g-lg-5 mb-5">
          <div className="col-12 col-lg-7">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
              <h3 className="fw-bold text-primary mb-0">Frequently Asked Questions</h3>
              <span className="badge bg-secondary text-white">{filteredFaqs.length} Questions</span>
            </div>

            {/* Category Pills */}
            <div className="d-flex gap-2 overflow-x-auto pb-2 mb-4">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`btn btn-sm rounded-pill text-nowrap px-3 ${
                    activeCategory === cat.id ? "btn-primary shadow-sm" : "btn-outline-secondary bg-white"
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Accordion Items */}
            {filteredFaqs.length === 0 ? (
              <div className="bg-white border rounded-4 p-4 text-center text-muted">
                No matching questions found for "{searchQuery}".
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className={`bg-white border rounded-4 overflow-hidden shadow-xs transition-all ${
                        isOpen ? "border-primary border-opacity-50 shadow-sm" : "border-light-subtle"
                      }`}
                      style={{ transition: "all 0.25s ease" }}
                    >
                      <button
                        type="button"
                        className="w-100 text-start btn border-0 d-flex align-items-center justify-content-between text-dark fw-bold"
                        style={{ padding: "18px 22px" }}
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      >
                        <span
                          className={`pe-3 ${isOpen ? "text-primary fw-bold" : "text-dark"}`}
                          style={{ fontSize: "0.95rem" }}
                        >
                          {faq.question}
                        </span>

                        {/* Animated + / - Toggle Indicator */}
                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 transition-all ${
                            isOpen
                              ? "bg-primary text-white shadow-xs"
                              : "bg-light text-secondary border border-secondary border-opacity-25"
                          }`}
                          style={{
                            width: "30px",
                            height: "30px",
                            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: "12px",
                              height: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {/* Horizontal Bar (always visible) */}
                            <span
                              style={{
                                position: "absolute",
                                width: "12px",
                                height: "2px",
                                backgroundColor: isOpen ? "#ffffff" : "#495057",
                                borderRadius: "1px",
                                transition: "background-color 0.2s ease",
                              }}
                            />
                            {/* Vertical Bar (rotates 90deg and scales down to 0, forming '-') */}
                            <span
                              style={{
                                position: "absolute",
                                width: "2px",
                                height: "12px",
                                backgroundColor: isOpen ? "#ffffff" : "#495057",
                                borderRadius: "1px",
                                transform: isOpen ? "rotate(90deg) scaleY(0)" : "rotate(0deg) scaleY(1)",
                                transition:
                                  "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease",
                              }}
                            />
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div
                          className="text-secondary small border-top bg-light bg-opacity-40"
                          style={{
                            padding: "16px 22px 20px 22px",
                            fontSize: "0.88rem",
                            lineHeight: "1.65",
                          }}
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact Support Sidebar Form */}
          <div className="col-12 col-lg-5">
            <div
              className="bg-white border rounded-4 p-4 p-md-5 shadow-sm sticky-top"
              style={{ top: "100px" }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="fw-bold text-primary mb-0">Contact Support</h4>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 small">
                  ● Live Support
                </span>
              </div>

              <p className="text-muted small mb-4">
                Have a question about a phone or need help with your order? Send us a message and our UK team will reply within 2 hours.
              </p>

              {isSubmitted ? (
                <div className="alert alert-success border-0 rounded-3 p-4 text-center">
                  <CheckCircle2 size={36} className="text-success mx-auto mb-2" />
                  <h6 className="fw-bold text-success mb-1">Message Sent Successfully!</h6>
                  <p className="small text-muted mb-0">
                    Thank you, {formValues.name || "Customer"}. We have received your inquiry and will email you back at <strong>{formValues.email}</strong> shortly.
                  </p>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success mt-3"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="d-flex flex-column gap-3">
                  <div>
                    <label className="form-label small fw-semibold text-dark mb-1">Your Name</label>
                    <input
                      type="text"
                      className="form-control form-control-underline"
                      placeholder="John Doe"
                      required
                      value={formValues.name}
                      onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label small fw-semibold text-dark mb-1">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-underline"
                      placeholder="john@example.com"
                      required
                      value={formValues.email}
                      onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Order # (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-underline"
                        placeholder="ORD-9283"
                        value={formValues.orderId}
                        onChange={(e) => setFormValues({ ...formValues, orderId: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark mb-1">Category</label>
                      <select
                        className="form-select form-control-underline"
                        value={formValues.category}
                        onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                      >
                        <option>General Inquiry</option>
                        <option>Warranty Claim</option>
                        <option>Returns & Exchange</option>
                        <option>Shipping Status</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold text-dark mb-1">Your Message</label>
                    <textarea
                      rows={3}
                      className="form-control form-control-underline"
                      placeholder="How can we assist you?"
                      required
                      value={formValues.message}
                      onChange={(e) => setFormValues({ ...formValues, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm mt-1"
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}

              {/* Direct Channels */}
              <div className="border-top pt-3 mt-4">
                <div className="d-flex align-items-center justify-content-between text-muted small">
                  <a
                    href="tel:+442079460912"
                    className="d-flex align-items-center gap-1.5 text-decoration-none text-muted"
                  >
                    <Phone size={14} className="text-primary" /> +44 20 7946 0912
                  </a>
                  <a
                    href="mailto:support@electronicstore.co.uk"
                    className="d-flex align-items-center gap-1.5 text-decoration-none text-muted"
                  >
                    <Mail size={14} className="text-primary" /> Email Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

