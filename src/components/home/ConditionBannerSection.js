"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Container } from "../ui";
import { PRODUCT_CONDITION_DETAILS } from "../../constants/productConstants";

export function ConditionBannerSection() {
  const [activeGrade, setActiveGrade] = useState("Like New");

  const activeDetails = PRODUCT_CONDITION_DETAILS[activeGrade] || PRODUCT_CONDITION_DETAILS["Like New"];

  return (
    <section className="py-5 py-lg-6 bg-soft">
      <Container>
        <div className="text-center mb-4 mb-lg-5">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1.5 fw-bold mb-2 d-inline-flex align-items-center gap-1.5">
            <Sparkles size={16} /> Transparent Cosmetic Grading
          </span>
          <h2 className="display-6 fw-bold text-primary mb-2">
            Understand Our Condition Tiers
          </h2>
          <p className="text-secondary mx-auto mb-0" style={{ maxWidth: "40rem" }}>
            Every single phone is <strong>100% fully functional</strong> with a 50-point diagnostic pass. You choose how much you want to save based on cosmetic wear.
          </p>
        </div>

        {/* Grade Tabs */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          {Object.keys(PRODUCT_CONDITION_DETAILS).map((grade) => (
            <button
              key={grade}
              type="button"
              className={`btn px-4 py-2.5 rounded-pill fw-semibold ${
                activeGrade === grade
                  ? "btn-primary shadow-sm"
                  : "btn-outline-primary bg-white"
              }`}
              onClick={() => setActiveGrade(grade)}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* Selected Grade Detail Display */}
        <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm mx-auto" style={{ maxWidth: "900px" }}>
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-7">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="h4 fw-bold text-primary mb-0">{activeGrade} Grade</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                  {activeDetails.badge}
                </span>
              </div>

              <div className="d-flex flex-column gap-2 mb-4 text-secondary">
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-1" />
                  <span><strong>Screen:</strong> {activeDetails.screen}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-1" />
                  <span><strong>Body Casing:</strong> {activeDetails.body}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-1" />
                  <span><strong>Battery Health:</strong> {activeDetails.battery}</span>
                </div>
                <div className="d-flex align-items-start gap-2">
                  <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-1" />
                  <span><strong>Functionality:</strong> {activeDetails.functionality}</span>
                </div>
              </div>

              <Link href="/shop" className="btn btn-primary px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2">
                Browse {activeGrade} Handsets <ArrowRight size={18} />
              </Link>
            </div>

            <div className="col-12 col-md-5">
              <div className="bg-light border rounded-3 p-4 text-center">
                <ShieldCheck size={42} className="text-primary mb-2" />
                <h6 className="fw-bold text-dark mb-1">Standard Guarantee</h6>
                <ul className="list-unstyled text-muted small mb-0 text-start d-flex flex-column gap-1.5 mt-3">
                  <li>✔ 12-Month Seller Warranty</li>
                  <li>✔ 30-Day Money Back Guarantee</li>
                  <li>✔ Clean IMEI & Carrier Unlocked</li>
                  <li>✔ Fast Charger Cable Included</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

