"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Package,
  ShieldCheck,
  MapPin,
  KeyRound,
  LogOut,
  Award,
  Truck,
  ExternalLink,
  Plus,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Clock,
  Sparkles,
} from "lucide-react";

import { Container, Badge, Button } from "../../components/ui";
import { AuthModal } from "../../components/modals/AuthModal";
import { InspectionReportModal } from "../../components/product/InspectionReportModal";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { getUserOrders } from "../../services/orderService";
import { getSavedAddresses } from "../../services/addressService";

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "warranties" | "addresses" | "security"

  // Inspection Certificate Modal State
  const [selectedCertProduct, setSelectedCertProduct] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Orders and Addresses State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    async function loadAccountData() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const userOrders = await getUserOrders(user.id || user._id, user.email);
        setOrders(userOrders || []);
      } else {
        setOrders([]);
      }

      const userAddresses = await getSavedAddresses();
      setAddresses(userAddresses || []);
    }

    loadAccountData();

    async function handleUserChange() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const userOrders = await getUserOrders(user.id || user._id, user.email);
        setOrders(userOrders || []);
      } else {
        setOrders([]);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("electroVault-user-changed", handleUserChange);
      window.addEventListener("storage", handleUserChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("electroVault-user-changed", handleUserChange);
        window.removeEventListener("storage", handleUserChange);
      }
    };
  }, []);

  async function handleLogOut() {
    await logoutUser();
    setCurrentUser(null);
  }

  function handleOpenCertModal(product) {
    setSelectedCertProduct(product);
    setIsCertModalOpen(true);
  }

  return (
    <main className="py-5 py-lg-6 bg-soft">
      <Container>
        {/* Breadcrumb Nav */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Account</span>
          </div>
        </nav>

        {/* Logged Out State Banner */}
        {!currentUser ? (
          <div className="bg-white border rounded-4 p-5 text-center shadow-sm my-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "70px", height: "70px" }}>
              <User size={32} />
            </div>
            <h2 className="display-6 fw-bold text-primary mb-2">Manage Your Refurbished Orders</h2>
            <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "480px" }}>
              Log in or create an account to view your 50-Point Inspection Certificates, track active 12-Month Warranties, and manage your delivery addresses.
            </p>
            <div className="d-flex align-items-center justify-content-center gap-3">
              <Button
                variant="primary"
                className="px-4 py-2.5 rounded-pill fw-bold shadow-sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <Lock size={16} className="me-2" /> Log In / Register
              </Button>
            </div>
          </div>
        ) : (
          /* Logged In Account Dashboard */
          <div>
            {/* Header User Banner */}
            <div className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 flex-shrink-0"
                    style={{ width: "4rem", height: "4rem" }}
                  >
                    {currentUser.name
                      ? currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "JD"}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h2 className="h4 fw-bold text-primary mb-0">{currentUser.name}</h2>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small">
                        Verified Member
                      </span>
                    </div>
                    <p className="text-muted small mb-0 mt-0.5">
                      ✉️ {currentUser.email} • 📞 {currentUser.phone || "+44 7700 900077"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 align-self-start align-self-md-center"
                  onClick={handleLogOut}
                >
                  <LogOut size={15} /> Log Out
                </button>
              </div>
            </div>

            {/* Dashboard Tabs Navigation */}
            <div className="row g-4">
              <div className="col-12 col-lg-3">
                <div className="bg-white border rounded-4 p-3 shadow-sm sticky-top" style={{ top: "90px" }}>
                  <div className="nav flex-column nav-pills gap-1">
                    <button
                      type="button"
                      className={`nav-link text-start py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-between ${
                        activeTab === "orders" ? "active bg-primary text-white" : "text-dark hover-bg-light"
                      }`}
                      onClick={() => setActiveTab("orders")}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <Package size={18} /> Order History
                      </span>
                      <span className={`badge ${activeTab === "orders" ? "bg-white text-primary" : "bg-light text-muted"}`}>
                        {orders.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`nav-link text-start py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-between ${
                        activeTab === "warranties" ? "active bg-primary text-white" : "text-dark hover-bg-light"
                      }`}
                      onClick={() => setActiveTab("warranties")}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <ShieldCheck size={18} /> Active Warranties
                      </span>
                      <span className="badge bg-success">12-Mo</span>
                    </button>

                    <button
                      type="button"
                      className={`nav-link text-start py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-between ${
                        activeTab === "addresses" ? "active bg-primary text-white" : "text-dark hover-bg-light"
                      }`}
                      onClick={() => setActiveTab("addresses")}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <MapPin size={18} /> Saved Addresses
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`nav-link text-start py-2.5 px-3 rounded-3 fw-semibold d-flex align-items-center justify-content-between ${
                        activeTab === "security" ? "active bg-primary text-white" : "text-dark hover-bg-light"
                      }`}
                      onClick={() => setActiveTab("security")}
                    >
                      <span className="d-flex align-items-center gap-2">
                        <KeyRound size={18} /> Security & Settings
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="col-12 col-lg-9">
                {/* TAB 1: ORDER HISTORY */}
                {activeTab === "orders" && (
                  <div className="d-flex flex-column gap-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <h5 className="fw-bold text-primary mb-0">Your Phone Orders</h5>
                      <span className="small text-muted">{orders.length} orders total</span>
                    </div>

                    {orders.map((order) => (
                      <div key={order.orderId} className="card border rounded-4 shadow-sm overflow-hidden bg-white">
                        {/* Order Card Header */}
                        <div className="card-header bg-light p-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-3">
                            <div>
                              <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                Order Number
                              </span>
                              <strong className="text-primary">{order.orderId}</strong>
                            </div>
                            <span className="text-muted">•</span>
                            <div>
                              <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                Date Placed
                              </span>
                              <span className="small fw-semibold text-dark">
                                {new Date(order.placedAt || Date.now()).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 d-flex align-items-center gap-1">
                              <Truck size={13} /> {order.status || "Dispatched"}
                            </span>
                            <span className="fw-extrabold text-primary fs-6">
                              £{(order.totals?.total || order.total || 489).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Order Purchased Devices List */}
                        <div className="card-body p-4">
                          <div className="d-flex flex-column gap-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 p-3 bg-light rounded-3 border">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="position-relative bg-white rounded-3 border p-1 flex-shrink-0" style={{ width: "64px", height: "64px" }}>
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="64px"
                                        style={{ objectFit: "contain" }}
                                        unoptimized
                                      />
                                    ) : (
                                      <span style={{ fontSize: "1.8rem" }}>📱</span>
                                    )}
                                  </div>
                                  <div>
                                    <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                                    <div className="d-flex flex-wrap gap-1 mb-1">
                                      {item.condition && (
                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-1.5 py-0.5" style={{ fontSize: "0.68rem" }}>
                                          Grade: {item.condition}
                                        </span>
                                      )}
                                      {item.storage && (
                                        <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: "0.68rem" }}>
                                          {item.storage}
                                        </span>
                                      )}
                                      {item.battery && (
                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-1.5 py-0.5" style={{ fontSize: "0.68rem" }}>
                                          {item.battery}
                                        </span>
                                      )}
                                    </div>
                                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                      12-Month Seller Warranty Included
                                    </small>
                                  </div>
                                </div>

                                {/* Digital Quality Cert Trigger */}
                                <div className="text-sm-end">
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                                    onClick={() => handleOpenCertModal(item)}
                                  >
                                    <Award size={15} className="text-warning" />
                                    <span>Inspection Cert</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between text-muted small" style={{ fontSize: "0.78rem" }}>
                            <span>🚚 Shipping via {order.courier || "Royal Mail Tracked 24"}</span>
                            <span>Tracking: <strong className="text-dark">{order.trackingNum || "GB940281048291"}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: ACTIVE WARRANTIES */}
                {activeTab === "warranties" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h5 className="fw-bold text-primary mb-1">12-Month Seller Warranty Coverage</h5>
                        <p className="text-secondary small mb-0">Every refurbished phone purchased is fully covered against hardware defects.</p>
                      </div>
                      <span className="badge bg-success fs-6 px-3 py-1.5">Full Protection</span>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {orders.flatMap((o) => o.items).map((item, idx) => (
                        <div key={idx} className="border rounded-3 p-3 bg-light d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-success text-white p-2.5 rounded-circle flex-shrink-0">
                              <ShieldCheck size={22} />
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-0">{item.name} ({item.storage || "128GB"})</h6>
                              <small className="text-muted">Serial/IMEI Certified • Active until March 2027</small>
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
                              ✓ 100% Covered
                            </span>
                            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold">
                              File Claim
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: SAVED ADDRESSES */}
                {activeTab === "addresses" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h5 className="fw-bold text-primary mb-0">Saved Shipping Addresses</h5>
                      <Link href="/checkout" className="btn btn-sm btn-primary rounded-pill px-3 fw-bold">
                        <Plus size={14} /> Add Address at Checkout
                      </Link>
                    </div>

                    <div className="row g-3">
                      {addresses.length === 0 ? (
                        <div className="col-12 text-muted">No saved addresses found.</div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr.id || addr.address} className="col-12 col-md-6">
                            <div className="border rounded-3 p-3 bg-white shadow-xs">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <span className="fw-bold text-dark">{addr.label || "Saved Address"}</span>
                                {addr.isDefault && <span className="badge bg-primary">Default</span>}
                              </div>
                              <p className="small text-muted mb-1">
                                {addr.firstName || currentUser.name} {addr.lastName || ""}
                              </p>
                              <p className="small text-muted mb-1">
                                {addr.address}, {addr.city} {addr.postcode}
                              </p>
                              <p className="small text-muted mb-0">📞 {addr.phone || currentUser.phone || "+44 7700 900077"}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: SECURITY & PROFILE */}
                {activeTab === "security" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <h5 className="fw-bold text-primary mb-3">Security & Profile Settings</h5>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Full Name</label>
                          <input type="text" className="form-control" defaultValue={currentUser.name} />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Email Address</label>
                          <input type="email" className="form-control" defaultValue={currentUser.email} />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Phone Number</label>
                          <input type="tel" className="form-control" defaultValue={currentUser.phone || "+44 7700 900077"} />
                        </div>
                      </div>

                      <hr />

                      <h6 className="fw-bold text-dark mb-3">Change Password</h6>
                      <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Current Password</label>
                          <input type="password" className="form-control" placeholder="••••••••" />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">New Password</label>
                          <input type="password" className="form-control" placeholder="••••••••" />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
                        Save Security Settings
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => setCurrentUser(user)}
        />

        {/* Digital Inspection Report Modal */}
        {selectedCertProduct && (
          <InspectionReportModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            productName={selectedCertProduct.name}
            serialOrImei={selectedCertProduct.inspectionCertId || "IMEI-358941092847102"}
          />
        )}
      </Container>
    </main>
  );
}
