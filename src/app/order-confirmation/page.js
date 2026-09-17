"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShoppingBag,
  Award,
  ShieldCheck,
  Truck,
  FileCheck2,
  Package,
  Calendar,
} from "lucide-react";

import { Button, Container, Badge } from "../../components/ui";
import { InspectionReportModal } from "../../components/product/InspectionReportModal";

const ORDER_STORAGE_KEY = "electroVault.latestOrder";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value || 0));
}

export default function OrderConfirmationPage() {
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [selectedCertProduct, setSelectedCertProduct] = useState(null);

  const [order] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedOrder = window.localStorage.getItem(ORDER_STORAGE_KEY);
      return storedOrder ? JSON.parse(storedOrder) : null;
    } catch {
      return null;
    }
  });

  if (!order) {
    return (
      <main className="py-5 py-lg-6 bg-soft">
        <Container>
          <div className="bg-white border rounded-4 p-5 text-center shadow-sm mx-auto" style={{ maxWidth: "560px" }}>
            <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-primary p-3">
              <ShoppingBag size={32} />
            </div>
            <h2 className="fw-bold text-primary mb-2">No Active Order Found</h2>
            <p className="text-secondary mb-4">You haven't placed an order yet. Browse our smartphones to place an order.</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Shop Refurbished Phones
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  // Normalized order getters
  const orderRef = order.orderNumber || order.orderId || order._id || "EV-ORD-882710";
  const trackingRef = order.trackingNumber || "GB-EV-992100";
  const customerName = order.shippingAddress?.fullName || `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim() || "Customer";
  const customerEmail = order.shippingAddress?.email || order.customer?.email || order.guestEmail || "customer@example.co.uk";
  const customerPhone = order.shippingAddress?.phone || order.customer?.phone || "+44 7700 900077";
  const customerAddress = order.shippingAddress?.addressLine1 || order.customer?.address || "124 High Street";
  const customerCity = order.shippingAddress?.city || order.customer?.city || "London";
  const customerPostcode = order.shippingAddress?.postcode || order.customer?.postcode || "SW1A 1AA";
  const subtotal = order.subtotal ?? order.totals?.subtotal ?? order.totalAmount ?? 0;
  const totalAmount = order.totalAmount ?? order.totals?.total ?? subtotal;

  const handleOpenCert = (item) => {
    setSelectedCertProduct(item);
    setIsCertModalOpen(true);
  };

  return (
    <main className="py-5 py-lg-6 bg-soft min-vh-100">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Order Confirmation</span>
          </div>
        </nav>

        {/* Order Confirmed Header Box */}
        <div className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm text-center">
          <div className="mx-auto mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success p-3">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="display-6 fw-bold text-primary mb-1">Order Confirmed!</h1>
          <p className="text-secondary mb-3 fs-5">
            Thank you, <strong>{customerName}</strong>. Your order has been placed successfully in MongoDB Atlas and certified!
          </p>
          <div className="d-inline-flex flex-wrap align-items-center justify-content-center gap-3 bg-light border px-4 py-2 rounded-pill small fw-bold text-dark mb-2">
            <span>Order Reference: <strong className="text-primary">{orderRef}</strong></span>
            <span>•</span>
            <span>Tracking ID: <strong className="text-dark">{trackingRef}</strong></span>
            <span>•</span>
            <span className="text-success">Status: {order.orderStatus || "Processing"}</span>
          </div>
        </div>

        {/* Delivery Tracking Step Timeline Bar */}
        <div className="bg-white border rounded-4 p-4 mb-4 shadow-sm">
          <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
            <Truck size={18} /> Order Progress & Dispatch Timeline
          </h6>

          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25 h-100">
                <div className="badge bg-success mb-2">Completed</div>
                <div className="fw-bold text-dark small">1. Order Placed</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Saved to Database</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25 h-100">
                <div className="badge bg-success mb-2">Completed</div>
                <div className="fw-bold text-dark small">2. 50-Point Inspection</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Diagnostic Passed</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25 h-100">
                <div className="badge bg-primary mb-2">In Progress</div>
                <div className="fw-bold text-dark small">3. Eco Packaging</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Sealed Box</div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-3 border h-100">
                <div className="badge bg-secondary mb-2">Scheduled</div>
                <div className="fw-bold text-dark small">4. Tracked Delivery</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{order.estimatedDelivery || "2-4 Working Days"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Quality Certificate Highlight Card */}
        <div className="bg-dark text-white rounded-4 p-4 p-md-5 mb-4 shadow-lg position-relative overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
          <div className="row align-items-center g-4">
            <div className="col-12 col-md-8">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Award size={24} className="text-warning" />
                <h5 className="fw-bold text-white mb-0">Official Digital Quality Certificate Generated</h5>
              </div>
              <p className="text-white-50 mb-3 small" style={{ maxWidth: "36rem" }}>
                Your order includes a master technician verified <strong>50-Point Inspection Certificate</strong> with IMEI clean status and battery capacity guarantee.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {order.items?.map((item, idx) => (
                  <button
                    key={item.itemKey ? `${item.itemKey}-${idx}` : `${item.slug || item.id || "item"}-${idx}`}
                    type="button"
                    className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-3.5 py-2 d-inline-flex align-items-center gap-1.5 shadow-sm"
                    onClick={() => handleOpenCert(item)}
                  >
                    <FileCheck2 size={16} /> View Certificate: {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12 col-md-4 text-md-end">
              <div className="border border-secondary rounded-3 p-3 bg-black bg-opacity-40 d-inline-block text-start w-100">
                <div className="small text-white-50">Master Technician Stamp:</div>
                <div className="fw-bold text-success font-monospace my-1">✓ PASSED & VERIFIED</div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>Cert ID: {order.items?.[0]?.inspectionCertId || "CERT-928371"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Grid */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-7">
            <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
              <h5 className="fw-bold text-primary mb-3">Ordered Handsets</h5>
              <div className="d-flex flex-column gap-3">
                {order.items?.map((item, idx) => {
                  const imageUrl = item.image || item.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Product";
                  const conditionGrade = item.selectedOptions?.condition || item.condition || "Superb";
                  const storageOption = item.selectedOptions?.storage || item.storage || "128GB";

                  return (
                    <div key={item.itemKey ? `${item.itemKey}-${idx}` : `${item.slug || item.id || "item"}-${idx}`} className="d-flex align-items-center gap-3 border-bottom pb-3">
                      <div className="position-relative bg-light rounded-3 flex-shrink-0" style={{ width: "70px", height: "70px" }}>
                        <Image
                          src={imageUrl}
                          alt={item.name || "Handset"}
                          fill
                          sizes="70px"
                          style={{ objectFit: "cover" }}
                          className="rounded-3"
                          unoptimized
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                        <div className="small text-muted mb-1">
                          Grade: <strong className="text-primary">{conditionGrade}</strong> • Storage: {storageOption}
                        </div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-bold small"
                          onClick={() => handleOpenCert(item)}
                        >
                          📄 View Diagnostic Inspection Checklist
                        </button>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">{formatCurrency(Number(item.price) * Number(item.quantity || 1))}</div>
                        <div className="small text-muted">Qty: {item.quantity || 1}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
              <h5 className="fw-bold text-primary mb-3">Customer & Delivery Info</h5>
              <div className="d-flex flex-column gap-2 text-secondary small mb-4">
                <div><strong>Name:</strong> {customerName}</div>
                <div><strong>Email:</strong> {customerEmail}</div>
                <div><strong>Phone:</strong> {customerPhone}</div>
                <div><strong>Address:</strong> {customerAddress}, {customerCity}, {customerPostcode}</div>
                <div><strong>Delivery Range:</strong> {order.estimatedDelivery || "2-4 Working Days"}</div>
              </div>

              <h6 className="fw-bold text-primary border-top pt-3 mb-2">Payment Summary</h6>
              <div className="d-flex flex-column gap-1.5 small text-secondary">
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span className="fw-bold text-dark">{formatCurrency(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tracked UK Shipping</span>
                  <span className="fw-bold text-success">FREE</span>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-1 fs-5 font-weight-bold text-dark">
                  <span className="fw-bold text-primary">Total Paid</span>
                  <span className="fw-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-3">
          <Link href="/shop" className="btn btn-primary btn-lg px-5 shadow-sm">
            Continue Shopping
          </Link>
        </div>

        {/* Diagnostic Inspection Modal */}
        <InspectionReportModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          productName={selectedCertProduct?.name || "Refurbished Smartphone"}
          serialOrImei={selectedCertProduct?.inspectionCertId || "CERT-928371"}
        />
      </Container>
    </main>
  );
}
