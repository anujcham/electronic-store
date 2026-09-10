"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Leaf,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Container } from "../ui";
import { Logo } from "../common/Logo";

const phoneCategories = [
  { label: "Refurbished iPhones", href: "/shop?brand=Apple" },
  { label: "Refurbished Samsung", href: "/shop?brand=Samsung" },
  { label: "Refurbished Google Pixel", href: "/shop?brand=Google" },
  { label: "Refurbished OnePlus", href: "/shop?brand=OnePlus" },
  { label: "5G Smartphones", href: "/shop?feature=5G" },
];

const conditionGrades = [
  { label: "Pristine Grade (Like New)", href: "/shop?condition=Like+New" },
  { label: "Premium Grade (Excellent)", href: "/shop?condition=Excellent" },
  { label: "Standard Grade (Very Good)", href: "/shop?condition=Very+Good" },
  { label: "Value Grade (Good)", href: "/shop?condition=Good" },
  { label: "Budget Grade (Fair)", href: "/shop?condition=Fair" },
];

const customerSupport = [
  { label: "50-Point Inspection Guide", href: "#info-condition" },
  { label: "Warranty & Repair Guarantee", href: "/warranty" },
  { label: "Track Your Order", href: "/order-confirmation" },
  { label: "Returns & 30-Day Money Back", href: "/returns" },
  { label: "Customer FAQ", href: "/support" },
];

const companyInfo = [
  { label: "Our Refurbishment Process", href: "/about" },
  { label: "Sustainability & Eco Impact", href: "#eco-impact" },
  { label: "Careers", href: "/careers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer({ brandName = "ElectroStore Refurbished" }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white border-top border-secondary border-opacity-25" style={{ backgroundColor: "#0b1329" }}>
      {/* Top Feature Bar */}
      <div className="border-bottom border-secondary border-opacity-25 py-4 bg-black bg-opacity-25">
        <Container>
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-25 text-primary p-2.5 rounded-3">
                  <Award size={24} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">50-Point Quality Checked</h6>
                  <small className="text-white-50">Master technician certified</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-25 text-success p-2.5 rounded-3">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">12-Month Seller Warranty</h6>
                  <small className="text-white-50">Full hardware defect cover</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-info bg-opacity-25 text-info p-2.5 rounded-3">
                  <Truck size={24} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">Free Tracked Delivery</h6>
                  <small className="text-white-50">Fast 2-4 day UK shipping</small>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-25 text-warning p-2.5 rounded-3">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <h6 className="fw-bold text-white mb-0">30-Day Money Back</h6>
                  <small className="text-white-50">Hassle-free order returns</small>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Footer Links */}
      <div className="py-5">
        <Container>
          <div className="row g-4 g-lg-5">
            {/* Column 1: Brand & Bio */}
            <div className="col-12 col-lg-4">
              <div className="mb-3">
                <Logo theme="light" size="lg" href="/" />
              </div>

              <p className="text-white-50 small mb-4" style={{ lineHeight: 1.6 }}>
                Your trusted destination for certified refurbished smartphones. Every handset undergoes a 50-point diagnostic check, features an 85%+ battery health guarantee, and comes backed by our 12-month warranty.
              </p>

              <div className="d-flex align-items-center gap-2 text-success small mb-4 bg-success bg-opacity-10 border border-success border-opacity-25 p-2.5 rounded-3">
                <Leaf size={18} className="flex-shrink-0" />
                <span>Every purchase saves up to 70kg of CO₂ e-waste</span>
              </div>

              <div className="d-flex flex-column gap-2 text-white-50 small">
                <div className="d-flex align-items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  <span>+44 (0) 20 7946 0912 (Mon-Fri 9am-6pm)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Mail size={14} className="text-primary" />
                  <span>support@electronicstore.co.uk</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  <span>London Refurbishment Hub, United Kingdom</span>
                </div>
              </div>
            </div>

            {/* Column 2: Refurbished Phones */}
            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7 tracking-wider">
                Refurbished Phones
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2.5 mb-0 small">
                {phoneCategories.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-white-50 text-decoration-none hover-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Condition Grades */}
            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7 tracking-wider">
                Condition Tiers
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2.5 mb-0 small">
                {conditionGrades.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-white-50 text-decoration-none hover-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Customer Support */}
            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7 tracking-wider">
                Help & Support
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2.5 mb-0 small">
                {customerSupport.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-white-50 text-decoration-none hover-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Company */}
            <div className="col-6 col-sm-3 col-lg-2">
              <h6 className="fw-bold text-white mb-3 text-uppercase fs-7 tracking-wider">
                About Us
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2.5 mb-0 small">
                {companyInfo.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-white-50 text-decoration-none hover-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Newsletter Banner */}
      <div className="border-top border-bottom border-secondary border-opacity-25 py-4 bg-black bg-opacity-40">
        <Container>
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6">
              <h6 className="fw-bold text-white mb-1">Get £15 Off Your First Refurbished Order</h6>
              <p className="text-white-50 small mb-0">Subscribe for exclusive flash sales, new stock drops, and tech tips.</p>
            </div>
            <div className="col-12 col-md-6">
              <form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2" suppressHydrationWarning>
                <input
                  type="email"
                  className="form-control form-control-dark bg-dark border-secondary text-white"
                  placeholder="Enter your email address..."
                  required
                  suppressHydrationWarning
                />
                <button type="submit" className="btn btn-primary px-4 fw-bold text-nowrap" suppressHydrationWarning>
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="py-4 bg-black bg-opacity-60 text-white-50 small">
        <Container>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div>
              © {currentYear} {brandName}. All rights reserved. Registered UK Refurbished Retailer.
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="d-flex align-items-center gap-1 text-white-50">
                <Lock size={14} className="text-success" /> SSL 256-Bit Encrypted Checkout
              </span>
              <div className="d-flex gap-1.5">
                <span className="badge bg-secondary text-white px-2 py-1">VISA</span>
                <span className="badge bg-secondary text-white px-2 py-1">Mastercard</span>
                <span className="badge bg-secondary text-white px-2 py-1">Apple Pay</span>
                <span className="badge bg-secondary text-white px-2 py-1">GPay</span>
                <span className="badge bg-secondary text-white px-2 py-1">Klarna</span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
