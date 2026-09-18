"use vitality";
"use client";

import React from "react";
import { Truck, Check, Clock, ShieldCheck, Package, MapPin, XCircle } from "lucide-react";

/**
 * Normalizes status and returns full stage tracking metadata.
 */
export function getOrderTimelineInfo(orderStatus = "Processing", estimatedDelivery = "2-4 working days", courierName = "Tracked UK Express") {
  const norm = String(orderStatus || "Processing").trim().toLowerCase();

  // 1. CANCELLED
  if (norm === "cancelled") {
    return {
      statusKey: "cancelled",
      topBadgeClass: "bg-danger text-white",
      topBadgeText: "✕ Cancelled",
      progressPercent: 0,
      isCancelled: true,
      activeStep: 0,
      stages: [
        {
          id: 1,
          name: "1. Placed",
          badge: "Cancelled",
          badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          desc: "Order voided",
          isComplete: false,
          isCurrent: false,
        },
        {
          id: 2,
          name: "2. 50-Point Checked",
          badge: "Cancelled",
          badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          desc: "Inspection halted",
          isComplete: false,
          isCurrent: false,
        },
        {
          id: 3,
          name: "3. Eco Sealed",
          badge: "Cancelled",
          badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          desc: "Dispatch halted",
          isComplete: false,
          isCurrent: false,
        },
        {
          id: 4,
          name: "4. Delivery",
          badge: "Cancelled",
          badgeClass: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          desc: "Cancelled",
          isComplete: false,
          isCurrent: false,
        },
      ],
    };
  }

  // 2. DELIVERED
  if (norm === "delivered") {
    return {
      statusKey: "delivered",
      topBadgeClass: "bg-success text-white",
      topBadgeText: "✓ Delivered",
      progressPercent: 100,
      isCancelled: false,
      activeStep: 4,
      stages: [
        {
          id: 1,
          name: "1. Placed",
          badge: "✓ Done",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Saved & Paid",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 2,
          name: "2. 50-Point Checked",
          badge: "✓ Passed",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Verified & Certified",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 3,
          name: "3. Eco Sealed",
          badge: "✓ Dispatched",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Packaged & Handed Over",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 4,
          name: "4. Delivery",
          badge: "✓ Delivered",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Package Received",
          isComplete: true,
          isCurrent: true,
        },
      ],
    };
  }

  // 3. DISPATCHED / SHIPPED
  if (norm === "dispatched" || norm === "shipped") {
    return {
      statusKey: "dispatched",
      topBadgeClass: "bg-primary text-white",
      topBadgeText: "🚚 Dispatched",
      progressPercent: 78,
      isCancelled: false,
      activeStep: 3,
      stages: [
        {
          id: 1,
          name: "1. Placed",
          badge: "✓ Done",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Saved & Paid",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 2,
          name: "2. 50-Point Checked",
          badge: "✓ Passed",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Verified & Certified",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 3,
          name: "3. Eco Sealed",
          badge: "✓ Dispatched",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "In Transit with Carrier",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 4,
          name: "4. Delivery",
          badge: "Out for Delivery",
          badgeClass: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25",
          desc: estimatedDelivery || "2-4 working days",
          isComplete: false,
          isCurrent: true,
        },
      ],
    };
  }

  // 4. 50-POINT CHECKED
  if (norm === "50-point checked" || norm === "checked" || norm === "inspected") {
    return {
      statusKey: "50-point checked",
      topBadgeClass: "bg-info text-dark fw-bold border border-info border-opacity-50",
      topBadgeText: "🛡️ 50-Point Checked",
      progressPercent: 45,
      isCancelled: false,
      activeStep: 2,
      stages: [
        {
          id: 1,
          name: "1. Placed",
          badge: "✓ Done",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Saved & Paid",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 2,
          name: "2. 50-Point Checked",
          badge: "✓ Passed",
          badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          desc: "Verified & Certified",
          isComplete: true,
          isCurrent: false,
        },
        {
          id: 3,
          name: "3. Eco Sealed",
          badge: "In Progress",
          badgeClass: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25",
          desc: "Packaging & Seal",
          isComplete: false,
          isCurrent: true,
        },
        {
          id: 4,
          name: "4. Delivery",
          badge: "Scheduled",
          badgeClass: "bg-light text-muted border border-light-subtle",
          desc: estimatedDelivery || "2-4 working days",
          isComplete: false,
          isCurrent: false,
        },
      ],
    };
  }

  // 5. DEFAULT / PROCESSING / PLACED
  return {
    statusKey: "processing",
    topBadgeClass: "bg-warning text-dark fw-semibold border border-warning",
    topBadgeText: "⏳ Processing",
    progressPercent: 15,
    isCancelled: false,
    activeStep: 1,
    stages: [
      {
        id: 1,
        name: "1. Placed",
        badge: "✓ Done",
        badgeClass: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
        desc: "Saved & Paid",
        isComplete: true,
        isCurrent: false,
      },
      {
        id: 2,
        name: "2. 50-Point Checked",
        badge: "In Progress",
        badgeClass: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25",
        desc: "Quality Diagnostics",
        isComplete: false,
        isCurrent: true,
      },
      {
        id: 3,
        name: "3. Eco Sealed",
        badge: "Scheduled",
        badgeClass: "bg-light text-muted border border-light-subtle",
        desc: "Packaging Queue",
        isComplete: false,
        isCurrent: false,
      },
      {
        id: 4,
        name: "4. Delivery",
        badge: "Scheduled",
        badgeClass: "bg-light text-muted border border-light-subtle",
        desc: estimatedDelivery || "2-4 working days",
        isComplete: false,
        isCurrent: false,
      },
    ],
  };
}

/**
 * Interactive Live Shipment Tracking & Horizontal Progress Bar Component
 */
export default function OrderProgressBar({
  orderStatus = "Processing",
  trackingNumber = "GB-EV-72268857",
  courierName = "Tracked UK Express",
  estimatedDelivery = "2-4 working days",
  showTrackingHeader = true,
}) {
  const timeline = getOrderTimelineInfo(orderStatus, estimatedDelivery, courierName);

  return (
    <div>
      {/* Tracking ID and Courier Header */}
      {showTrackingHeader && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-primary d-inline-flex align-items-center gap-1.5">
              <Truck size={17} /> Live Shipment Tracking &amp; Dispatch Status
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {courierName && (
              <span className="small text-muted d-none d-md-inline" style={{ fontSize: "0.78rem" }}>
                Courier: <strong className="text-dark">{courierName}</strong>
              </span>
            )}
            <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
              Tracking ID:{" "}
              <strong className="text-dark font-monospace">
                {trackingNumber || "GB-EV-72268857"}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* HORIZONTAL STEPPER PROGRESS BAR WITH TEXT DIRECTLY BELOW CIRCLES */}
      <div className="position-relative py-2 my-2">
        {/* Background Track Line (Spans between Center of Node 1 at 12.5% and Center of Node 4 at 87.5%) */}
        <div
          style={{
            position: "absolute",
            top: "17px",
            left: "12.5%",
            right: "12.5%",
            height: "4px",
            backgroundColor: "#E2E8F0",
            borderRadius: "3px",
            zIndex: 1,
          }}
        >
          {/* Animated Fill Bar */}
          <div
            style={{
              width: `${timeline.progressPercent}%`,
              height: "100%",
              background: timeline.isCancelled
                ? "#dc3545"
                : "linear-gradient(90deg, #10B981 0%, #059669 40%, #0d6efd 100%)",
              borderRadius: "3px",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        {/* 4 Circular Milestone Nodes with Text & Badges Directly Underneath */}
        <div className="d-flex justify-content-between position-relative" style={{ zIndex: 2 }}>
          {timeline.stages.map((stage) => {
            const isCompleted = stage.isComplete;
            const isCurrent = stage.isCurrent;

            return (
              <div
                key={stage.id}
                className="d-flex flex-column align-items-center text-center px-1"
                style={{ width: "25%" }}
              >
                {/* Node Circle */}
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    timeline.isCancelled
                      ? "bg-danger bg-opacity-10 text-danger border border-danger"
                      : isCompleted
                      ? "bg-success text-white shadow-sm"
                      : isCurrent
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-muted border border-2 border-secondary border-opacity-25"
                  }`}
                  style={{
                    width: "34px",
                    height: "34px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    boxShadow:
                      isCurrent && !timeline.isCancelled
                        ? "0 0 0 4px rgba(13, 110, 253, 0.2)"
                        : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {timeline.isCancelled ? (
                    <XCircle size={16} />
                  ) : isCompleted ? (
                    <Check size={17} strokeWidth={3} />
                  ) : isCurrent ? (
                    <span
                      className="spinner-grow spinner-grow-sm"
                      style={{ width: "11px", height: "11px" }}
                    />
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>

                {/* Stage Badge, Title, and Description Directly Below Node */}
                <div className="mt-2 d-flex flex-column align-items-center" style={{ width: "100%" }}>
                  <span
                    className={`badge mb-1 ${stage.badgeClass}`}
                    style={{ fontSize: "0.68rem", padding: "2.5px 7px" }}
                  >
                    {stage.badge}
                  </span>
                  <div
                    className={`fw-bold small ${
                      isCompleted || isCurrent ? "text-dark" : "text-muted"
                    }`}
                    style={{ fontSize: "0.8rem", lineHeight: "1.25" }}
                  >
                    {stage.name}
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: "0.72rem", marginTop: "2px", lineHeight: "1.2" }}
                  >
                    {stage.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

