"use client";

import React from "react";
import { Lock } from "lucide-react";

export function PaymentTrustBanner({ className = "" }) {
  return (
    <div
      className={`bg-white border rounded-4 text-center shadow-sm ${className}`}
      style={{ borderColor: "#e2e8f0", padding: "18px 20px" }}
    >
      {/* Logos Container */}
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-3">
        {/* 1. VISA */}
        <div
          className="d-inline-flex align-items-center justify-content-center bg-white border rounded-2"
          style={{ height: "32px", minWidth: "56px", padding: "4px 10px", borderColor: "#e2e8f0" }}
          title="Visa"
        >
          <span
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: "900",
              fontStyle: "italic",
              fontSize: "15px",
              letterSpacing: "-0.5px",
              color: "#1A1F71",
            }}
          >
            VISA
          </span>
        </div>

        {/* 2. Mastercard */}
        <div
          className="d-inline-flex flex-column align-items-center justify-content-center bg-white border rounded-2 px-2 py-0.5"
          style={{ height: "32px", minWidth: "54px", borderColor: "#e2e8f0" }}
          title="Mastercard"
        >
          <div className="d-flex align-items-center position-relative" style={{ height: "16px" }}>
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#EB001B",
                display: "inline-block",
                marginRight: "-5px",
              }}
            />
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#F79E1B",
                opacity: 0.95,
                display: "inline-block",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "7px",
              fontWeight: "700",
              color: "#1E293B",
              lineHeight: 1,
              letterSpacing: "-0.2px",
              marginTop: "1px",
            }}
          >
            mastercard
          </span>
        </div>

        {/* 3. American Express */}
        <div
          className="d-inline-flex align-items-center justify-content-center bg-white border rounded-2 px-2 py-1"
          style={{ height: "32px", minWidth: "54px", borderColor: "#e2e8f0" }}
          title="American Express"
        >
          <div
            className="d-flex flex-column align-items-center justify-content-center px-1 rounded-1 text-white"
            style={{
              backgroundColor: "#006FCF",
              height: "22px",
              width: "28px",
              lineHeight: "8px",
            }}
          >
            <span style={{ fontSize: "5.5px", fontWeight: "800", letterSpacing: "-0.2px" }}>AMERICAN</span>
            <span style={{ fontSize: "5.5px", fontWeight: "800", letterSpacing: "-0.2px" }}>EXPRESS</span>
          </div>
        </div>

        {/* 4. PayPal */}
        <div
          className="d-inline-flex align-items-center justify-content-center bg-white border rounded-2 px-2.5 py-1"
          style={{ height: "32px", minWidth: "54px", borderColor: "#e2e8f0" }}
          title="PayPal"
        >
          <span style={{ fontStyle: "italic", fontWeight: "800", fontSize: "13px", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#003087" }}>Pay</span>
            <span style={{ color: "#0079C1" }}>Pal</span>
          </span>
        </div>

        {/* 5. Clearpay */}
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-2 px-2.5 py-1"
          style={{
            height: "32px",
            minWidth: "60px",
            backgroundColor: "#BAF9D8",
            border: "1px solid #9aeec3",
          }}
          title="Clearpay"
        >
          <span
            style={{
              fontWeight: "700",
              fontSize: "11px",
              color: "#000",
              letterSpacing: "-0.3px",
              marginRight: "3px",
            }}
          >
            clearpay
          </span>
          {/* Clearpay loop arrow icon */}
          <svg width="12" height="10" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15.5 3L18 5.5L15.5 8M17 5.5H5.5C3 5.5 1 7.5 1 10C1 12.5 3 14.5 5.5 14.5M4.5 13L2 10.5L4.5 8M3 10.5H14.5C17 10.5 19 8.5 19 6C19 3.5 17 1.5 14.5 1.5"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 6. Apple Pay */}
        <div
          className="d-inline-flex align-items-center justify-content-center bg-white border rounded-2 px-2.5 py-1"
          style={{ height: "32px", minWidth: "54px", borderColor: "#e2e8f0" }}
          title="Apple Pay"
        >
          <span style={{ fontWeight: "600", fontSize: "12px", color: "#000" }}>
             Pay
          </span>
        </div>

        {/* 7. Klarna */}
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-2 px-2.5 py-1"
          style={{
            height: "32px",
            minWidth: "54px",
            backgroundColor: "#FFB3C7",
            border: "1px solid #ffa4bc",
          }}
          title="Klarna"
        >
          <span
            style={{
              fontWeight: "800",
              fontSize: "12px",
              color: "#0a0a0a",
              letterSpacing: "-0.4px",
            }}
          >
            Klarna
          </span>
        </div>
      </div>

      {/* Lock and Secure Payment Text */}
      <div className="d-flex align-items-center justify-content-center gap-1.5 text-secondary">
        <Lock size={16} strokeWidth={2.2} style={{ color: "#475569" }} />
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
          Secure payment
        </span>
      </div>
    </div>
  );
}

