"use client";

import React from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  PoundSterling,
  TrendingUp,
  MapPin,
  ExternalLink,
  Eye,
  CheckCircle2,
  Truck,
  Clock,
  AlertCircle,
  Package,
} from "lucide-react";

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onViewOrder,
}) {
  if (!isOpen || !customer) return null;

  const totalOrders = Number(customer.totalOrders || customer.orders?.length || 0);
  const totalSpent = Number(customer.totalSpent || 0);
  const aov = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const addresses = Array.isArray(customer.addresses) ? customer.addresses : [];
  const customerOrders = Array.isArray(customer.orders) ? customer.orders : [];

  const formattedJoinDate = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Registered Customer";

  // Status badge styling helper for customer order history rows
  const getOrderStatusBadge = (st) => {
    switch (st) {
      case "Delivered":
        return {
          bg: "bg-success bg-opacity-10 text-success border border-success border-opacity-25",
          icon: <CheckCircle2 size={12} className="me-1" />,
          label: "Delivered",
        };
      case "Dispatched":
      case "Shipped":
        return {
          bg: "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25",
          icon: <Truck size={12} className="me-1" />,
          label: "Dispatched",
        };
      case "50-Point Checked":
        return {
          bg: "bg-info bg-opacity-10 text-info border border-info border-opacity-25",
          icon: <ShieldCheck size={12} className="me-1" />,
          label: "50-Pt Checked",
        };
      case "Cancelled":
        return {
          bg: "bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25",
          icon: <AlertCircle size={12} className="me-1" />,
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-warning bg-opacity-10 text-warning-emphasis border border-warning border-opacity-25",
          icon: <Clock size={12} className="me-1" />,
          label: st || "Processing",
        };
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
      style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
        style={{
          maxWidth: "860px",
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
              className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle fw-bold fs-5 shadow-xs"
              style={{ width: "46px", height: "46px" }}
            >
              <User size={22} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold text-dark mb-0">{customer.name || "Customer Profile"}</h5>
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                  Active Buyer
                </span>
              </div>
              <small className="text-muted d-flex align-items-center gap-2 mt-0.5">
                <span>Member since {formattedJoinDate}</span>
                <span>•</span>
                <span className="font-monospace text-secondary" style={{ fontSize: "0.74rem" }}>
                  ID: {customer._id || customer.id || "N/A"}
                </span>
              </small>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 border-0"
            onClick={onClose}
            title="Close customer profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="p-4 overflow-y-auto flex-grow-1 no-scrollbar hide-scrollbar"
          style={{ fontSize: "0.9rem", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* 1. Quick Stats Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Total Orders</span>
                  <ShoppingBag size={16} className="text-primary" />
                </div>
                <div className="fs-5 fw-bold text-dark">{totalOrders}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  {totalOrders > 0 ? "Lifetime store purchases" : "No orders yet"}
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Lifetime Spend</span>
                  <PoundSterling size={16} className="text-success" />
                </div>
                <div className="fs-5 fw-bold text-success">£{totalSpent.toFixed(2)}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Gross settled value
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Avg. Order Value</span>
                  <TrendingUp size={16} className="text-info" />
                </div>
                <div className="fs-5 fw-bold text-dark">£{aov.toFixed(2)}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Per purchase average
                </small>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="small text-muted fw-semibold">Delivery Book</span>
                  <MapPin size={16} className="text-secondary" />
                </div>
                <div className="fs-5 fw-bold text-dark">{addresses.length}</div>
                <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                  Saved UK address{addresses.length === 1 ? "" : "es"}
                </small>
              </div>
            </div>
          </div>

          {/* 2. Contact Information & Account Details */}
          <div className="card border rounded-3 p-3 mb-4 shadow-xs">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <User size={16} className="text-primary" />
              <span>Contact &amp; Account Details</span>
            </h6>

            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Full Name
                </label>
                <div className="fw-bold text-dark mt-0.5">{customer.name || "N/A"}</div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Email Address
                </label>
                <div className="d-flex align-items-center gap-1.5 mt-0.5">
                  <Mail size={14} className="text-muted flex-shrink-0" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-primary text-decoration-none text-truncate fw-semibold"
                    title="Send email"
                  >
                    {customer.email || "No email"}
                  </a>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Phone Number
                </label>
                <div className="d-flex align-items-center gap-1.5 mt-0.5">
                  <Phone size={14} className="text-muted flex-shrink-0" />
                  {customer.phone && customer.phone !== "N/A" ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-dark text-decoration-none fw-semibold"
                    >
                      {customer.phone}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Account Status
                </label>
                <div className="mt-0.5">
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 d-inline-flex align-items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Verified Customer</span>
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Registration Timestamp
                </label>
                <div className="text-dark small mt-0.5">
                  <Calendar size={13} className="text-muted me-1 inline" />
                  {formattedJoinDate}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="small text-muted fw-semibold d-block" style={{ fontSize: "0.74rem" }}>
                  Security &amp; Role
                </label>
                <div className="text-dark small text-capitalize mt-0.5">
                  Standard {customer.role || "customer"}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Saved Delivery Addresses */}
          <div className="card border rounded-3 p-3 mb-4 shadow-xs">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>Saved Shipping Addresses</span>
              </div>
              <span className="badge bg-light text-muted border rounded-pill px-2" style={{ fontSize: "0.7rem" }}>
                {addresses.length} on file
              </span>
            </h6>

            {addresses.length > 0 ? (
              <div className="row g-3">
                {addresses.map((addr, aIdx) => (
                  <div key={addr._id || addr.id || `${addr.postcode || "pc"}-${addr.addressLine1 || "addr"}-${aIdx}`} className="col-12 col-md-6">
                    <div className="p-3 rounded-3 border bg-light bg-opacity-25 h-100 position-relative">
                      {addr.isDefault && (
                        <span className="badge bg-primary position-absolute top-0 end-0 m-2" style={{ fontSize: "0.62rem" }}>
                          Default
                        </span>
                      )}
                      <div className="fw-bold text-dark mb-1">{addr.fullName || customer.name}</div>
                      <div className="text-muted small mb-0.5">{addr.addressLine1}</div>
                      {addr.addressLine2 && <div className="text-muted small mb-0.5">{addr.addressLine2}</div>}
                      <div className="text-dark small fw-semibold">
                        {addr.city}, {addr.postcode}
                      </div>
                      <div className="text-muted small mt-1">{addr.country || "United Kingdom"}</div>
                      {addr.phone && (
                        <div className="text-muted small mt-1 d-flex align-items-center gap-1">
                          <Phone size={12} />
                          <span>{addr.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center bg-light rounded-3 border border-dashed">
                <MapPin size={22} className="text-muted mb-1" />
                <p className="text-muted small mb-0">No saved shipping addresses found on this customer's account.</p>
              </div>
            )}
          </div>

          {/* 4. Complete Order History */}
          <div className="card border rounded-3 p-3 shadow-xs">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <Package size={16} className="text-primary" />
                <span>Customer Order History</span>
              </div>
              <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2.5 py-0.5" style={{ fontSize: "0.72rem" }}>
                {customerOrders.length} Order{customerOrders.length === 1 ? "" : "s"}
              </span>
            </h6>

            {customerOrders.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.82rem" }}>
                  <thead className="table-light">
                    <tr className="small text-uppercase text-muted" style={{ fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                      <th className="py-2.5 px-3">Order Ref #</th>
                      <th className="py-2.5 px-3">Date Placed</th>
                      <th className="py-2.5 px-3">Items</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((ord, oIdx) => {
                      const badge = getOrderStatusBadge(ord.orderStatus);
                      const ordDate = ord.createdAt
                        ? new Date(ord.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Recent";

                      return (
                        <tr key={ord._id || ord.id || ord.orderNumber}>
                          <td className="px-3">
                            <span className="font-monospace fw-bold text-primary">
                              #{ord.orderNumber || (ord.id ? String(ord.id).slice(-8) : `ORD-${oIdx + 1}`)}
                            </span>
                          </td>
                          <td className="px-3 text-muted">{ordDate}</td>
                          <td className="px-3">
                            <span className="badge bg-light text-dark border">
                              {ord.itemsCount || 1} item{ord.itemsCount === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td className="px-3 fw-bold text-dark">
                            £{Number(ord.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="px-3">
                            <span className={`badge rounded-pill px-2.5 py-1 ${badge.bg}`}>
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </td>
                          <td className="px-3 text-end">
                            {onViewOrder && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary py-0.5 px-2 rounded-2 fw-semibold d-inline-flex align-items-center gap-1"
                                style={{ fontSize: "0.74rem" }}
                                onClick={() => onViewOrder(ord.orderNumber || ord.id || ord._id)}
                                title="Inspect this order"
                              >
                                <Eye size={12} />
                                <span>View</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center bg-light rounded-3 border border-dashed">
                <ShoppingBag size={28} className="text-muted mb-2" />
                <h6 className="fw-bold text-dark mb-1">No Orders Recorded</h6>
                <p className="text-muted small mb-0">This buyer hasn't placed any checkout orders yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between p-3 px-4 border-top bg-light flex-shrink-0">
          <div className="d-flex align-items-center gap-2">
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              >
                <Mail size={13} />
                <span>Send Email</span>
              </a>
            )}
            {customer.phone && customer.phone !== "N/A" && (
              <a
                href={`tel:${customer.phone}`}
                className="btn btn-outline-secondary btn-sm rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Phone</span>
              </a>
            )}
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

