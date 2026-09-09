"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PRODUCT_CONDITION_DETAILS } from "../../constants/productConstants";

export function ConditionGuideModal({ isOpen, onClose, selectedCondition }) {
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
          <div className="modal-header bg-primary text-white p-4 align-items-center">
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck size={24} className="text-warning" />
              <div>
                <h5 className="modal-title fw-bold mb-0">Refurbished Condition Guide</h5>
                <p className="small text-white-50 mb-0">Learn how we grade our pre-owned & refurbished devices</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          <div className="modal-body p-4 bg-light" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="alert alert-primary border-0 rounded-3 mb-4 d-flex align-items-center gap-2">
              <CheckCircle2 size={20} className="flex-shrink-0 text-primary" />
              <span className="small">
                <strong>100% Functionality Guarantee:</strong> Every single phone — regardless of cosmetic grade — undergoes our rigorous 50-point diagnostic check and is guaranteed to work like new.
              </span>
            </div>

            <div className="row g-3">
              {Object.entries(PRODUCT_CONDITION_DETAILS).map(([grade, details]) => {
                const isCurrentSelection = selectedCondition === grade;
                return (
                  <div key={grade} className="col-12">
                    <div
                      className={`card border-2 rounded-3 p-3 transition-all ${
                        isCurrentSelection
                          ? "border-primary bg-white shadow-sm"
                          : "border-light bg-white"
                      }`}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-primary fs-5">{grade}</span>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                            {details.badge}
                          </span>
                        </div>
                        {isCurrentSelection && (
                          <span className="badge bg-success">Selected</span>
                        )}
                      </div>

                      <div className="row g-2 small text-secondary">
                        <div className="col-12 col-md-6">
                          <strong className="text-dark">📱 Screen:</strong> {details.screen}
                        </div>
                        <div className="col-12 col-md-6">
                          <strong className="text-dark">✨ Body Casing:</strong> {details.body}
                        </div>
                        <div className="col-12 col-md-6">
                          <strong className="text-dark">🔋 Battery Health:</strong> {details.battery}
                        </div>
                        <div className="col-12 col-md-6">
                          <strong className="text-dark">⚡ Functionality:</strong> {details.functionality}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer bg-white p-3">
            <button type="button" className="btn btn-primary w-100" onClick={onClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

