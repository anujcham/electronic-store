"use client";

import React from "react";
import {
  X,
  History,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  User,
  Shield,
  ArrowRight,
  FileText,
} from "lucide-react";

export function OrderActivityModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  // Only show activities performed by the admin panel team
  const adminLogs = (Array.isArray(order.activityLog) ? order.activityLog : [])
    .filter((log) => {
      const role = (log.performedByRole || "").toLowerCase();
      const action = (log.action || "").toLowerCase();
      // Exclude customer actions & customer order placement
      if (role === "customer") return false;
      if (action.includes("order placed") && action.includes("payment")) return false;
      return true;
    });

  // If no logged admin entries yet (legacy orders or untouched orders), synthesize status change if already advanced past Processing
  if (adminLogs.length === 0 && order.orderStatus && order.orderStatus !== "Processing") {
    adminLogs.push({
      action: `Status Changed to '${order.orderStatus}'`,
      previousStatus: "Processing",
      newStatus: order.orderStatus,
      performedBy: "Staff Administrator",
      performedByRole: "admin",
      note: `Order status advanced to '${order.orderStatus}' via Admin Portal.`,
      timestamp: order.updatedAt || order.createdAt || new Date(),
    });
  }

  // Sort newest first
  const sortedLogs = [...adminLogs].sort(
    (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
  );

  const getActionIcon = (action = "", newStatus = "") => {
    const act = (action + " " + newStatus).toLowerCase();
    if (act.includes("courier") || act.includes("carrier")) {
      return {
        icon: <Truck size={16} className="text-white" />,
        bg: "bg-primary",
      };
    }
    if (act.includes("delivered")) {
      return {
        icon: <CheckCircle2 size={16} className="text-white" />,
        bg: "bg-success",
      };
    }
    if (act.includes("dispatch") || act.includes("shipped") || act.includes("tracking")) {
      return {
        icon: <Truck size={16} className="text-white" />,
        bg: "bg-primary",
      };
    }
    if (act.includes("50-point") || act.includes("check") || act.includes("inspect")) {
      return {
        icon: <ShieldCheck size={16} className="text-white" />,
        bg: "bg-info",
      };
    }
    if (act.includes("cancel")) {
      return {
        icon: <AlertCircle size={16} className="text-white" />,
        bg: "bg-danger",
      };
    }
    return {
      icon: <History size={16} className="text-white" />,
      bg: "bg-dark",
    };
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-xl overflow-hidden w-100 d-flex flex-column"
        style={{ maxWidth: "680px", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-bottom bg-light d-flex align-items-center justify-content-between flex-shrink-0">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-3 d-flex align-items-center justify-content-center shadow-xs"
              style={{ width: "42px", height: "42px" }}
            >
              <History size={20} className="text-primary" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="fw-bold text-dark mb-0 fs-6">
                  Activity Timeline &amp; Audit Log
                </h5>
                <span className="badge bg-primary text-white font-monospace small">
                  {order.orderNumber}
                </span>
              </div>
              <small className="text-muted d-block mt-0.5" style={{ fontSize: "0.78rem" }}>
                Complete audit history of who performed each update and when
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 border-0 text-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
            <span className="small text-muted">
              Total Logged Events: <strong>{sortedLogs.length}</strong>
            </span>
            <span className="small text-muted">
              Current Status:{" "}
              <strong className="text-dark">{order.orderStatus || "Processing"}</strong>
            </span>
          </div>

          {sortedLogs.length === 0 ? (
            <div className="text-center py-5 px-4 bg-light rounded-4 border border-dashed my-2">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-circle shadow-xs mb-3 text-muted"
                style={{ width: "54px", height: "54px" }}
              >
                <History size={26} className="text-primary" />
              </div>
              <h6 className="fw-bold text-dark mb-1">No Administrative Activities Yet</h6>
              <p className="text-muted small mb-0" style={{ maxWidth: "380px", margin: "0 auto" }}>
                This audit timeline records actions taken by the staff panel team (status advances, courier assignments, and tracking number updates).
              </p>
            </div>
          ) : (
            <div className="position-relative ps-4 ms-2">
              {/* Vertical timeline connector line */}
              <div
                className="position-absolute top-0 bottom-0 start-0 bg-light border-start border-2"
                style={{ left: "15px", zIndex: 1 }}
              ></div>

              <div className="d-flex flex-column gap-4 position-relative" style={{ zIndex: 2 }}>
              {sortedLogs.map((log, idx) => {
                const { icon, bg } = getActionIcon(log.action, log.newStatus);
                const logDate = log.timestamp
                  ? new Date(log.timestamp).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "Date unavailable";

                const isCustomer = (log.performedByRole || "").toLowerCase() === "customer";

                return (
                  <div key={idx} className="d-flex align-items-start gap-3 position-relative">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm ${bg}`}
                      style={{
                        width: "32px",
                        height: "32px",
                        marginLeft: "-32px",
                      }}
                    >
                      {icon}
                    </div>

                    {/* Card Content */}
                    <div className="card border rounded-3 p-3 w-100 shadow-xs bg-white">
                      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-1 mb-2">
                        <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-1.5">
                          <span>{log.action}</span>
                        </div>
                        <span
                          className="text-muted small font-monospace d-flex align-items-center gap-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <Clock size={12} />
                          <span>{logDate}</span>
                        </span>
                      </div>

                      {/* Transition Badges (Courier, Tracking, or Order Status) */}
                      {(() => {
                        const act = (log.action || "").toLowerCase();
                        let prev = log.previousStatus;
                        let next = log.newStatus;
                        let label = "Status Flow";

                        if (act.includes("courier") || act.includes("carrier")) {
                          label = "Courier Change";
                          // Extract from note if previousStatus/newStatus was legacy order status
                          const match = (log.note || "").match(/from '([^']+)' to '([^']+)'/i);
                          if (match) {
                            prev = match[1];
                            next = match[2];
                          }
                        } else if (act.includes("tracking")) {
                          label = "Tracking Reference";
                          const match = (log.note || "").match(/set to '([^']+)'/i);
                          if (match && (!next || next === log.previousStatus)) {
                            next = match[1];
                          }
                        } else if (act.includes("delivery window") || act.includes("estimated delivery")) {
                          label = "Delivery Window";
                          const match = (log.note || "").match(/from '([^']+)' to '([^']+)'/i);
                          if (match) {
                            prev = match[1];
                            next = match[2];
                          }
                        }

                        // Never show if values are identical (e.g. 50-Point Checked -> 50-Point Checked)
                        if (!prev || !next || String(prev).trim() === String(next).trim()) {
                          return null;
                        }

                        return (
                          <div className="d-flex align-items-center gap-2 mb-2 p-2 rounded-2 bg-light border flex-wrap">
                            <span className="small text-muted fw-semibold me-1" style={{ fontSize: "0.72rem" }}>
                              {label}:
                            </span>
                            <span
                              className="badge bg-secondary text-white small font-monospace"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {prev}
                            </span>
                            <ArrowRight size={13} className="text-muted" />
                            <span
                              className="badge bg-primary text-white small font-monospace"
                              style={{ fontSize: "0.72rem" }}
                            >
                              {next}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Log Note / Description */}
                      {log.note && (
                        <p className="text-secondary small mb-2" style={{ fontSize: "0.82rem" }}>
                          {log.note}
                        </p>
                      )}

                      {/* Who performed this action */}
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-1 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-light p-1 rounded-circle text-muted d-flex align-items-center justify-content-center"
                            style={{ width: "22px", height: "22px" }}
                          >
                            {isCustomer ? <User size={13} /> : <Shield size={13} className="text-primary" />}
                          </div>
                          <span className="small text-dark fw-semibold" style={{ fontSize: "0.8rem" }}>
                            {log.performedBy || "System Admin"}
                            {log.performedByEmail && (
                              <span className="text-muted fw-normal ms-1 font-monospace" style={{ fontSize: "0.75rem" }}>
                                ({log.performedByEmail})
                              </span>
                            )}
                          </span>
                        </div>

                        <span
                          className={`badge ${
                            isCustomer
                              ? "bg-secondary bg-opacity-10 text-secondary border"
                              : "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                          }`}
                          style={{ fontSize: "0.68rem" }}
                        >
                          {isCustomer ? "Customer" : log.performedByRole || "Admin Staff"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-top bg-light d-flex align-items-center justify-content-between flex-shrink-0">
          <small className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
            <FileText size={13} />
            <span>All activity timestamps are stored securely in MongoDB Atlas</span>
          </small>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-4 py-1.5 rounded-3 fw-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

