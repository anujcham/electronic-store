"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Truck, X, Copy, CheckCheck, Sparkles, ArrowRight } from "lucide-react";

export function OrderConfirmedModal({ isOpen, onClose, order }) {
  const [copied, setCopied] = useState(false);
  const [animateTick, setAnimateTick] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateTick(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnimateTick(false);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderRef = order.orderNumber || order.orderId || order._id || "EV-ORD-882710";
  const customerName = order.shippingAddress?.fullName || order.customer?.firstName || "Customer";
  const totalAmount = order.totalAmount ?? order.totals?.total ?? 0;
  const warrantyTitle = order.warrantyPlan?.title || "12-Month Standard Warranty (Included)";
  const paymentMethod = order.paymentMethod || "Credit / Debit Card";
  const emiDetails = order.emiDetails;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        zIndex: 1090,
        backgroundColor: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-2xl overflow-hidden w-100 position-relative"
        style={{
          maxWidth: "520px",
          animation: "popInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header Accent */}
        <div
          style={{
            height: "6px",
            background: "linear-gradient(90deg, #10B981, #059669, #0284C7)",
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-3 p-1.5 border-0 shadow-sm"
          style={{ zIndex: 10 }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-4 p-md-5 text-center">
          {/* Animated Green Tick Icon */}
          <div className="d-flex justify-content-center mb-3.5">
            <div
              className="position-relative d-flex align-items-center justify-content-center"
              style={{ width: "92px", height: "92px" }}
            >
              {/* Pulsing halo */}
              <div
                className="position-absolute rounded-circle bg-success"
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: 0.15,
                  animation: "pulseHalo 2s infinite ease-in-out",
                }}
              />

              {/* Animated SVG Circle and Checkmark */}
              <svg
                width="84"
                height="84"
                viewBox="0 0 84 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Circle path */}
                <circle
                  cx="42"
                  cy="42"
                  r="38"
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 240,
                    strokeDashoffset: animateTick ? 0 : 240,
                    transition: "stroke-dashoffset 0.65s cubic-bezier(0.65, 0, 0.45, 1)",
                  }}
                />
                {/* Checkmark path */}
                <path
                  d="M26 43.5L37 54.5L58 31.5"
                  stroke="#10B981"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 55,
                    strokeDashoffset: animateTick ? 0 : 55,
                    transition: "stroke-dashoffset 0.45s 0.4s cubic-bezier(0.65, 0, 0.45, 1)",
                  }}
                />
              </svg>
            </div>
          </div>

          <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-3 py-1 rounded-pill small fw-bold mb-2">
            Payment Verified • Dispatch Queued
          </span>

          <h3 className="fw-bold text-dark mb-1">Order Confirmed!</h3>
          <p className="text-secondary small mb-4">
            Thank you, <strong className="text-dark">{customerName}</strong>! Your order has been secured and registered for 50-point diagnostic quality testing.
          </p>

          {/* Reference Pill */}
          <div
            className="bg-light border rounded-3 mb-3 d-flex align-items-center justify-content-between"
            style={{ padding: "16px 20px" }}
          >
            <div className="text-start">
              <span className="text-muted d-block" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                ORDER REFERENCE
              </span>
              <strong className="text-primary font-monospace fs-5">{orderRef}</strong>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1.5 fw-semibold"
              style={{ padding: "6px 14px", fontSize: "12px" }}
              onClick={handleCopy}
              title="Copy Order ID"
            >
              {copied ? <CheckCheck size={14} className="text-success" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Quick Details Cards */}
          <div className="row g-3 mb-3 text-start">
            <div className="col-6">
              <div className="border rounded-3 bg-white h-100 shadow-xs" style={{ padding: "16px 18px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                  TOTAL PAID
                </span>
                <div className="fw-bold text-dark fs-5">
                  £{Number(totalAmount).toFixed(2)}
                </div>
                {emiDetails && (
                  <div className="text-primary small mt-0.5" style={{ fontSize: "12px", fontWeight: "600" }}>
                    £{Number(emiDetails.monthlyAmount).toFixed(2)}/mo ({emiDetails.tenureMonths} mo)
                  </div>
                )}
              </div>
            </div>

            <div className="col-6">
              <div className="border rounded-3 bg-white h-100 shadow-xs" style={{ padding: "16px 18px" }}>
                <span className="text-muted d-block mb-1" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                  PAYMENT METHOD
                </span>
                <div className="fw-bold text-dark" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                  {paymentMethod}
                </div>
              </div>
            </div>

            <div className="col-12">
              <div
                className="border rounded-3 bg-white d-flex align-items-center justify-content-between shadow-xs"
                style={{ padding: "16px 18px" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <ShieldCheck size={20} className="text-primary flex-shrink-0" />
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px" }}>
                      WARRANTY & GUARANTEE
                    </span>
                    <span className="fw-semibold text-dark small">{warrantyTitle}</span>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-2.5 py-1.5" style={{ fontSize: "11px" }}>
                  Certified
                </span>
              </div>
            </div>
          </div>

          <div
            className="bg-success-subtle text-success border border-success border-opacity-25 rounded-3 mb-4 small d-flex align-items-center justify-content-center gap-2"
            style={{ padding: "14px 18px" }}
          >
            <Truck size={17} className="flex-shrink-0" />
            <span>
              Expected delivery: <strong>2-4 working days</strong> (Royal Mail Tracked 24)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2.5">
            <button
              type="button"
              className="btn btn-primary w-100 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ padding: "12px 20px" }}
              onClick={onClose}
            >
              <span>View Full Order Details & Certificate</span>
              <ArrowRight size={16} />
            </button>

            <Link
              href="/shop"
              className="btn btn-outline-secondary w-100 rounded-3 fw-semibold small text-decoration-none"
              style={{ padding: "10px 20px" }}
              onClick={onClose}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes popInScale {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes pulseHalo {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.28;
          }
        }
      `}</style>
    </div>
  );
}

