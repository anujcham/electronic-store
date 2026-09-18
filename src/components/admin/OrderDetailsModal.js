"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Package,
  Calendar,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Pencil,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Smartphone,
  History,
} from "lucide-react";
import OrderProgressBar from "../orders/OrderProgressBar";

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onEditStatus,
  onQuickAdvance,
  onViewTimeline,
}) {
  if (!isOpen || !order) return null;

  const status = order.orderStatus || order.status || "Processing";
  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shippingAddress || {};

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently placed";

  // Status color helper
  const getStatusBadge = (st) => {
    switch (st) {
      case "Delivered":
        return {
          bg: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          icon: <CheckCircle2 size={14} className="me-1" />,
          label: "Delivered",
        };
      case "Dispatched":
      case "Shipped":
        return {
          bg: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25",
          icon: <Truck size={14} className="me-1" />,
          label: "Dispatched",
        };
      case "50-Point Checked":
        return {
          bg: "bg-info bg-opacity-10 text-info border border-info border-opacity-25",
          icon: <ShieldCheck size={14} className="me-1" />,
          label: "50-Point Checked",
        };
      case "Cancelled":
        return {
          bg: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          icon: <AlertCircle size={14} className="me-1" />,
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25",
          icon: <Clock size={14} className="me-1" />,
          label: "Processing",
        };
    }
  };

  const statusBadge = getStatusBadge(status);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-xl overflow-hidden w-100 d-flex flex-column"
        style={{ maxWidth: "860px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 border-bottom bg-light d-flex align-items-center justify-content-between flex-shrink-0">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "42px", height: "42px" }}
            >
              <Package size={20} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="fw-bold text-dark mb-0 fs-6">
                  Order Details: {order.orderNumber || order.orderId || order._id}
                </h5>
                <span
                  className={`badge rounded-pill px-2.5 py-1 small fw-semibold d-inline-flex align-items-center ${statusBadge.bg}`}
                >
                  {statusBadge.icon}
                  <span>{statusBadge.label}</span>
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small fw-semibold">
                  ✓ {order.paymentStatus || "Paid"}
                </span>
              </div>
              <small className="text-muted d-block mt-0.5" style={{ fontSize: "0.78rem" }}>
                <Calendar size={12} className="me-1 text-secondary" />
                Placed on {formattedDate}
                {order.trackingNumber && (
                  <span className="ms-2 font-monospace">
                    • Ref: {order.trackingNumber}
                  </span>
                )}
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

        {/* Modal Body - Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-grow-1" style={{ fontSize: "0.9rem" }}>
          {/* 1. Live Fulfillment Timeline with Exact Timestamps */}
          <div className="bg-light border rounded-4 p-3 mb-4 shadow-xs">
            <OrderProgressBar
              orderStatus={status}
              trackingNumber={order.trackingNumber || "GB-EV-72268857"}
              courierName={order.courierName || "Royal Mail Tracked 24"}
              estimatedDelivery={order.estimatedDelivery || "2-4 working days"}
              showTrackingHeader={true}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              activityLog={order.activityLog || []}
              showTimestamps={true}
            />

            {/* View Activity Timeline Button */}
            {onViewTimeline && (
              <div className="mt-3 pt-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                <span className="small text-muted d-flex align-items-center gap-1.5" style={{ fontSize: "0.8rem" }}>
                  <Clock size={14} className="text-secondary" />
                  <span>Administrative actions and timeline audit log</span>
                </span>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm px-3 py-1 rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 shadow-xs"
                  style={{ fontSize: "0.78rem" }}
                  onClick={() => onViewTimeline(order)}
                >
                  <History size={13} />
                  <span>Activity Timeline Modal</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Items Ordered */}
          <div className="card border rounded-4 shadow-xs mb-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-3 d-flex align-items-center justify-content-between">
              <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                <Smartphone size={16} className="text-primary" />
                <span>Handset Line Items ({items.length})</span>
              </span>
              <span className="badge bg-light text-secondary border">
                Subtotal: £{Number(order.subtotal || order.totalAmount || 0).toFixed(2)}
              </span>
            </div>

            <div className="list-group list-group-flush">
              {items.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No line item details found for this order.
                </div>
              ) : (
                items.map((item, idx) => {
                  const opts = item.selectedOptions || {};
                  const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);

                  return (
                    <div
                      key={item._id || item.id || idx}
                      className="list-group-item p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-light border rounded-3 p-1 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: "54px", height: "54px" }}
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={46}
                              height={46}
                              className="object-fit-contain"
                            />
                          ) : (
                            <Smartphone size={24} className="text-muted" />
                          )}
                        </div>

                        <div>
                          <div className="fw-bold text-dark">{item.name}</div>
                          <div className="d-flex flex-wrap align-items-center gap-1.5 mt-1">
                            {opts.storage && (
                              <span
                                className="badge bg-secondary-subtle text-secondary border border-secondary-subtle"
                                style={{ fontSize: "0.72rem" }}
                              >
                                {opts.storage}
                              </span>
                            )}
                            {opts.color && (
                              <span
                                className="badge bg-light text-dark border"
                                style={{ fontSize: "0.72rem" }}
                              >
                                {opts.color}
                              </span>
                            )}
                            {opts.condition && (
                              <span
                                className="badge bg-info-subtle text-info-emphasis border border-info-subtle"
                                style={{ fontSize: "0.72rem" }}
                              >
                                {opts.condition}
                              </span>
                            )}
                            <span
                              className="badge bg-success-subtle text-success border border-success-subtle"
                              style={{ fontSize: "0.72rem" }}
                            >
                              <ShieldCheck size={11} className="me-0.5" />
                              {opts.warranty || "12-Month Guarantee"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm-end flex-shrink-0 ms-sm-auto">
                        <div className="fw-bold text-primary fs-6">
                          £{lineTotal.toFixed(2)}
                        </div>
                        <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                          £{Number(item.price || 0).toFixed(2)} × {item.quantity || 1}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Customer Information & Shipping Address (2-Column Grid) */}
          <div className="row g-3 mb-4">
            {/* Customer Details */}
            <div className="col-12 col-md-6">
              <div className="card border rounded-4 shadow-xs h-100 overflow-hidden">
                <div className="card-header bg-white border-bottom py-2.5 px-3">
                  <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                    <User size={15} className="text-primary" />
                    <span>Customer &amp; Contact</span>
                  </span>
                </div>
                <div className="card-body p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fw-bold text-dark">
                      {shipping.fullName || order.customerName || "Customer"}
                    </span>
                    {order.user ? (
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "0.7rem" }}>
                        Registered User
                      </span>
                    ) : (
                      <span className="badge bg-light text-muted border" style={{ fontSize: "0.7rem" }}>
                        Guest Checkout
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2 text-secondary mb-1.5 small">
                    <Mail size={14} className="text-muted flex-shrink-0" />
                    <span className="text-break">
                      {shipping.email || order.email || order.guestEmail || "No email on record"}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 text-secondary mb-2 small">
                    <Phone size={14} className="text-muted flex-shrink-0" />
                    <span>{shipping.phone || order.phone || "No phone on record"}</span>
                  </div>

                  <div className="border-top pt-2 mt-2">
                    <div className="d-flex align-items-center gap-2 text-secondary small">
                      <CreditCard size={14} className="text-muted flex-shrink-0" />
                      <span>
                        Payment Method:{" "}
                        <strong className="text-dark">
                          {order.paymentMethod || "Credit / Debit Card"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address & Dispatch Details */}
            <div className="col-12 col-md-6">
              <div className="card border rounded-4 shadow-xs h-100 overflow-hidden">
                <div className="card-header bg-white border-bottom py-2.5 px-3">
                  <span className="fw-bold text-dark small d-flex align-items-center gap-2">
                    <MapPin size={15} className="text-primary" />
                    <span>Delivery Address &amp; Courier</span>
                  </span>
                </div>
                <div className="card-body p-3">
                  <div className="fw-semibold text-dark mb-1">
                    {shipping.fullName || "Recipient"}
                  </div>
                  <div className="text-secondary small line-clamp-2">
                    {shipping.addressLine1 || "Standard Delivery Address"}
                    {shipping.addressLine2 ? `, ${shipping.addressLine2}` : ""}
                  </div>
                  <div className="text-secondary small mb-2">
                    {shipping.city && `${shipping.city}, `}
                    <strong className="text-dark">{shipping.postcode}</strong>
                    {" • "}
                    {shipping.country || "United Kingdom"}
                  </div>

                  <div className="border-top pt-2 mt-2 bg-light rounded-3 p-2 border">
                    <div className="d-flex align-items-center justify-content-between small">
                      <span className="text-muted">Courier:</span>
                      <span className="fw-semibold text-dark">
                        {order.courierName || "Royal Mail Tracked 24"}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between small mt-1">
                      <span className="text-muted">Tracking #:</span>
                      <span className="fw-bold font-monospace text-primary">
                        {order.trackingNumber || "Pending Dispatch"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Financial Breakdown & Order Totals */}
          <div className="card border rounded-4 shadow-xs bg-light">
            <div className="card-body p-3">
              <h6 className="fw-bold text-dark small mb-3">Order Financial Summary</h6>

              <div className="row g-2 small">
                <div className="col-6 text-muted">Subtotal (Items):</div>
                <div className="col-6 text-end fw-semibold text-dark">
                  £{Number(order.subtotal || order.totalAmount || 0).toFixed(2)}
                </div>

                <div className="col-6 text-muted">Tracked Shipping:</div>
                <div className="col-6 text-end fw-semibold text-success">
                  {order.shippingFee && Number(order.shippingFee) > 0
                    ? `£${Number(order.shippingFee).toFixed(2)}`
                    : "FREE (Express Delivery)"}
                </div>

                <div className="col-6 text-muted">
                  Warranty Plan:
                </div>
                <div className="col-6 text-end text-dark">
                  {order.warrantyPlan?.title || "12-Month Guarantee"} (
                  {order.warrantyPlan?.price && Number(order.warrantyPlan.price) > 0
                    ? `£${Number(order.warrantyPlan.price).toFixed(2)}`
                    : "Included"}
                  )
                </div>

                <div className="col-6 text-muted">VAT / Sales Tax:</div>
                <div className="col-6 text-end text-muted">
                  {order.tax && Number(order.tax) > 0
                    ? `£${Number(order.tax).toFixed(2)}`
                    : "Included in retail price"}
                </div>

                <div className="col-12 border-top my-2"></div>

                <div className="col-6 fs-6 fw-bold text-dark">Total Order Value:</div>
                <div className="col-6 text-end fs-5 fw-bold text-primary">
                  £{Number(order.totalAmount || 0).toFixed(2)}
                </div>
              </div>

              {/* Optional EMI breakdown */}
              {order.emiDetails?.provider && (
                <div className="mt-3 p-2.5 rounded-3 bg-white border d-flex align-items-center justify-content-between small">
                  <div className="d-flex align-items-center gap-2">
                    <CreditCard size={15} className="text-primary" />
                    <span>
                      Instalment Plan: <strong>{order.emiDetails.provider}</strong>
                    </span>
                  </div>
                  <span className="fw-bold text-dark">
                    £{Number(order.emiDetails.monthlyAmount || 0).toFixed(2)} / month ×{" "}
                    {order.emiDetails.tenureMonths} mos
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-3 border-top bg-light d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 flex-shrink-0">
          <div className="d-flex align-items-center gap-2">
            {/* Quick Status Advance Trigger */}
            {status === "Processing" && onQuickAdvance && (
              <button
                type="button"
                className="btn btn-sm btn-outline-info rounded-3 py-1.5 px-3 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => onQuickAdvance(order, "50-Point Checked")}
              >
                <ShieldCheck size={14} />
                <span>Mark 50-Point Checked</span>
              </button>
            )}
            {status === "50-Point Checked" && onQuickAdvance && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-3 py-1.5 px-3 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => onQuickAdvance(order, "Dispatched")}
              >
                <Truck size={14} />
                <span>Mark Dispatched</span>
              </button>
            )}
            {status === "Dispatched" && onQuickAdvance && (
              <button
                type="button"
                className="btn btn-sm btn-outline-success rounded-3 py-1.5 px-3 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => onQuickAdvance(order, "Delivered")}
              >
                <CheckCircle2 size={14} />
                <span>Mark Delivered</span>
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 ms-auto">
            {onViewTimeline && (
              <button
                type="button"
                className="btn btn-outline-info btn-sm px-3.5 py-2 rounded-3 fw-semibold d-flex align-items-center gap-1.5"
                onClick={() => onViewTimeline(order)}
              >
                <History size={14} />
                <span>Audit Timeline</span>
              </button>
            )}

            {onEditStatus && (
              <button
                type="button"
                className="btn btn-primary btn-sm px-3.5 py-2 rounded-3 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                onClick={() => onEditStatus(order)}
              >
                <Pencil size={14} />
                <span>Edit Order &amp; Tracking</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 fw-semibold"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

