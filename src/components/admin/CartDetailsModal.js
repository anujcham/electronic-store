"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingCart,
  User,
  Mail,
  Phone,
  Calendar,
  PoundSterling,
  Clock,
  Layers,
  ExternalLink,
  ShieldCheck,
  Package,
  ArrowUpRight,
  Eye,
} from "lucide-react";

export function CartDetailsModal({
  cart,
  isOpen,
  onClose,
  onViewCustomer,
}) {
  if (!isOpen || !cart) return null;

  const items = Array.isArray(cart.items) ? cart.items : [];
  const user = cart.user || {};
  const isRegisteredUser = Boolean(user.email && !user.email.includes("guest@"));
  const totalItems = Number(cart.totalItems || items.reduce((s, it) => s + (Number(it.quantity) || 1), 0));
  const cartTotal = Number(cart.cartTotal || items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0));

  const formattedDate = cart.updatedAt || cart.createdAt
    ? new Date(cart.updatedAt || cart.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently active";

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
        style={{
          maxWidth: "840px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-bottom bg-light d-flex align-items-center justify-content-between flex-shrink-0"
          style={{ padding: "18px 24px" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center bg-warning bg-opacity-15 text-warning-emphasis rounded-circle fw-bold fs-5 shadow-xs"
              style={{ width: "46px", height: "46px" }}
            >
              <ShoppingCart size={22} className="text-dark" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold text-dark mb-0">Active Shopping Cart</h5>
                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-50 rounded-pill px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                  Pending Checkout
                </span>
              </div>
              <small className="text-muted d-flex align-items-center gap-2 mt-0.5">
                <span>Last Activity: {formattedDate}</span>
                <span>•</span>
                <span className="font-monospace text-secondary" style={{ fontSize: "0.74rem" }}>
                  Cart ID: {String(cart._id || cart.id).slice(-8)}
                </span>
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 border-0"
            onClick={onClose}
            title="Close cart details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="p-4 overflow-y-auto flex-grow-1 no-scrollbar hide-scrollbar"
          style={{ fontSize: "0.9rem", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* 1. Metric Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Cart Total</span>
                  <PoundSterling size={16} className="text-primary" />
                </div>
                <div className="fs-5 fw-bold text-primary">£{cartTotal.toFixed(2)}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Potential order value
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Total Quantity</span>
                  <ShoppingCart size={16} className="text-success" />
                </div>
                <div className="fs-5 fw-bold text-dark">{totalItems} unit{totalItems === 1 ? "" : "s"}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Selected handset items
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Distinct Models</span>
                  <Layers size={16} className="text-info" />
                </div>
                <div className="fs-5 fw-bold text-dark">{items.length}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Unique product SKU{items.length === 1 ? "" : "s"}
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Shopper Type</span>
                  <User size={16} className="text-secondary" />
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: "0.92rem", marginTop: "2px" }}>
                  {isRegisteredUser ? "Registered Buyer" : "Guest Shopper"}
                </div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  {isRegisteredUser ? "Customer account linked" : "Anonymous session"}
                </small>
              </div>
            </div>
          </div>

          {/* 2. Shopper Profile Card */}
          <div className="card border rounded-3 p-3 mb-4 shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-2.5">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <User size={16} className="text-primary" />
                <span>Shopper Information</span>
              </h6>
              {isRegisteredUser && onViewCustomer && (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-1 px-2.5 rounded-2 fw-semibold d-inline-flex align-items-center gap-1"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => onViewCustomer(user)}
                >
                  <Eye size={12} />
                  <span>View Full Customer Profile</span>
                </button>
              )}
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Customer Name
                </label>
                <div className="fw-bold text-dark mt-0.5">
                  {user.name || "Guest Shopper"}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Email Address
                </label>
                <div className="d-flex align-items-center gap-1.5 mt-0.5">
                  <Mail size={14} className="text-muted flex-shrink-0" />
                  {user.email && !user.email.includes("shopper.co.uk") ? (
                    <a
                      href={`mailto:${user.email}`}
                      className="text-primary text-decoration-none text-truncate fw-semibold"
                      title="Email this customer"
                    >
                      {user.email}
                    </a>
                  ) : (
                    <span className="text-muted small">Guest (No email provided)</span>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Phone Number
                </label>
                <div className="d-flex align-items-center gap-1.5 mt-0.5">
                  <Phone size={14} className="text-muted flex-shrink-0" />
                  {user.phone && user.phone !== "N/A" ? (
                    <a href={`tel:${user.phone}`} className="text-dark text-decoration-none fw-semibold">
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-muted small">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Items in Cart Table */}
          <div className="card border rounded-3 p-3 shadow-xs">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Package size={16} className="text-primary" />
                <span>Handsets in Cart</span>
              </h6>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-0.5" style={{ fontSize: "0.72rem" }}>
                {items.length} Product Line{items.length === 1 ? "" : "s"}
              </span>
            </div>

            {items.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.84rem" }}>
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-2">Specifications</th>
                      <th className="py-2.5 px-2 text-center">Qty</th>
                      <th className="py-2.5 px-2 text-end">Unit Price</th>
                      <th className="py-2.5 px-3 text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const itemTotal = (Number(it.price) || 0) * (Number(it.quantity) || 1);
                      const opts = it.selectedOptions || {};

                      return (
                        <tr key={it._id || it.id || it.itemKey || `${cart?._id || "cart"}-${it.slug || it.name}-${opts.storage || ""}-${opts.color || ""}-${opts.condition || ""}`}>
                          <td className="px-3 py-2.5">
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="position-relative bg-light rounded-2 border flex-shrink-0"
                                style={{ width: "48px", height: "48px" }}
                              >
                                <Image
                                  src={it.image || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone"}
                                  alt={it.name || "Handset"}
                                  fill
                                  sizes="48px"
                                  style={{ objectFit: "cover" }}
                                  className="rounded-2"
                                  unoptimized
                                />
                              </div>
                              <div>
                                <div className="fw-bold text-dark d-flex align-items-center gap-1.5">
                                  <span>{it.name}</span>
                                  {it.slug && (
                                    <Link
                                      href={`/product/${it.slug}`}
                                      target="_blank"
                                      className="text-muted hover-text-primary"
                                      title="Open product page on storefront"
                                    >
                                      <ArrowUpRight size={13} />
                                    </Link>
                                  )}
                                </div>
                                <span className="text-muted font-monospace" style={{ fontSize: "0.72rem" }}>
                                  SKU: {it.itemKey || it.slug || `ITEM-${idx + 1}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-2">
                            <div className="d-flex flex-wrap gap-1">
                              {opts.color && (
                                <span className="badge bg-light text-dark border" style={{ fontSize: "0.7rem" }}>
                                  {opts.color}
                                </span>
                              )}
                              {opts.storage && (
                                <span className="badge bg-light text-dark border" style={{ fontSize: "0.7rem" }}>
                                  {opts.storage}
                                </span>
                              )}
                              {opts.condition && (
                                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: "0.7rem" }}>
                                  {opts.condition}
                                </span>
                              )}
                              {!opts.color && !opts.storage && !opts.condition && (
                                <span className="text-muted small">Standard Spec</span>
                              )}
                            </div>
                          </td>

                          <td className="px-2 text-center fw-bold text-dark font-monospace">
                            x{it.quantity || 1}
                          </td>

                          <td className="px-2 text-end text-muted">
                            £{Number(it.price || 0).toFixed(2)}
                          </td>

                          <td className="px-3 text-end fw-bold text-primary font-monospace">
                            £{itemTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light border-top">
                    <tr>
                      <td colSpan={4} className="text-end fw-semibold text-muted py-2 px-3">
                        Subtotal Estimated:
                      </td>
                      <td className="text-end fw-bold text-dark py-2 px-3 font-monospace">
                        £{cartTotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end fw-semibold text-muted py-1.5 px-3">
                        Shipping (Standard Tracked 24):
                      </td>
                      <td className="text-end text-success fw-bold py-1.5 px-3 small">
                        FREE
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="text-end fw-bold text-dark py-2.5 px-3 fs-6">
                        Estimated Cart Value:
                      </td>
                      <td className="text-end fw-bold text-primary py-2.5 px-3 fs-6 font-monospace">
                        £{cartTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center bg-light rounded-3 border border-dashed">
                <ShoppingCart size={28} className="text-muted mb-2" />
                <h6 className="fw-bold text-dark mb-1">Cart is Empty</h6>
                <p className="text-muted small mb-0">No active handsets currently in this shopper's basket.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between p-3 px-4 border-top bg-light flex-shrink-0">
          <div className="d-flex align-items-center gap-2">
            {user.email && !user.email.includes("shopper.co.uk") ? (
              <a
                href={`mailto:${user.email}?subject=Your%20ElectroVault%20Cart&body=Hi%20${encodeURIComponent(user.name || "there")},%20we%20noticed%20you%20left%20items%20in%20your%20shopping%20cart!`}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              >
                <Mail size={13} />
                <span>Email Cart Reminder</span>
              </a>
            ) : null}
            {user.phone && user.phone !== "N/A" ? (
              <a
                href={`tel:${user.phone}`}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Shopper</span>
              </a>
            ) : null}
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-bold shadow-sm"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

