"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Award, FileCheck2, Cpu } from "lucide-react";
import { INSPECTION_CATEGORIES } from "../../constants/productConstants";

export function InspectionReportModal({ isOpen, onClose, productName, serialOrImei = "358941092847102" }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1055 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white p-4 align-items-center border-bottom border-secondary">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success text-white p-2 rounded-3 d-flex align-items-center justify-content-center">
                <Award size={28} />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="modal-title fw-bold mb-0 text-white">50-Point Inspection Certificate</h5>
                  <span className="badge bg-success">VERIFIED & PASSED</span>
                </div>
                <p className="small text-white-50 mb-0">Certified by Master Technicians • Diagnostic Report</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Device Certificate Stamp */}
          <div className="modal-body p-4 bg-light" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="bg-white border rounded-3 p-3 mb-4 shadow-sm">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-7">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <Cpu size={18} className="text-primary" />
                    <span className="fw-bold text-dark fs-6">{productName || "Refurbished Smartphone"}</span>
                  </div>
                  <div className="small text-muted">
                    <span>IMEI Status: </span>
                    <span className="text-success fw-semibold">Clean / Unlocked</span>
                    <span className="mx-2">•</span>
                    <span>Refurbished ID: </span>
                    <span className="text-dark font-monospace">CERT-{serialOrImei.slice(-6)}</span>
                  </div>
                </div>
                <div className="col-12 col-md-5 text-md-end">
                  <div className="d-inline-flex align-items-center gap-2 bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill small fw-bold">
                    <ShieldCheck size={16} />
                    100% Tested & Certified
                  </div>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="d-flex gap-2 overflow-x-auto pb-2 mb-3">
              {INSPECTION_CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.category}
                  type="button"
                  className={`btn btn-sm text-nowrap rounded-pill px-3 ${
                    activeCategoryIndex === idx
                      ? "btn-primary shadow-sm"
                      : "btn-outline-secondary bg-white"
                  }`}
                  onClick={() => setActiveCategoryIndex(idx)}
                >
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Diagnostic Checklist */}
            <div className="card border-0 rounded-3 shadow-sm p-3 bg-white">
              <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                <FileCheck2 size={18} />
                {INSPECTION_CATEGORIES[activeCategoryIndex].category} Diagnostic Checks
              </h6>
              <div className="row g-2">
                {INSPECTION_CATEGORIES[activeCategoryIndex].checks.map((check) => (
                  <div key={check.name} className="col-12 col-md-6">
                    <div className="d-flex align-items-center justify-content-between p-2.5 rounded-2 bg-light border border-light">
                      <span className="small text-dark fw-medium">{check.name}</span>
                      <span className="badge bg-success d-flex align-items-center gap-1">
                        <CheckCircle2 size={12} />
                        {check.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer bg-white p-3 d-flex align-items-center justify-content-between">
            <span className="small text-muted">
              🔒 Includes 12-Month Seller Warranty & 30-Day Returns
            </span>
            <button type="button" className="btn btn-dark px-4" onClick={onClose}>
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

