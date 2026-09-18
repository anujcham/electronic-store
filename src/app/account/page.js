"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User,
  Package,
  ShieldCheck,
  MapPin,
  LogOut,
  Award,
  Truck,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileCheck2,
  Clock,
} from "lucide-react";

import { Container, Badge, Button } from "../../components/ui";
import { AuthModal } from "../../components/modals/AuthModal";
import { AddAddressModal } from "../../components/modals/AddAddressModal";
import { EditProfileModal } from "../../components/modals/EditProfileModal";
import { InspectionReportModal } from "../../components/product/InspectionReportModal";
import OrderProgressBar, { getOrderTimelineInfo } from "../../components/orders/OrderProgressBar";
import { useToast } from "../../components/common/Toast";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { getUserOrders } from "../../services/orderService";
import { getSavedAddresses, deleteAddress, setDefaultAddress } from "../../services/addressService";

export default function AccountPage() {
  const router = useRouter();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "warranties" | "addresses"
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Sync tab from URL query param if present (e.g. /account?tab=warranties)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["orders", "warranties", "addresses"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Inspection Certificate Modal State
  const [selectedCertProduct, setSelectedCertProduct] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Orders and Addresses State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    async function loadAccountData() {
      const user = await getCurrentUser();
      if (!user) {
        setIsInitialLoading(false);
        router.replace("/");
        return;
      }

      setCurrentUser(user);

      const userId = user.id || user._id;
      const userOrders = await getUserOrders(userId, user.email);
      setOrders(userOrders || []);

      const userAddresses = await getSavedAddresses(userId);
      setAddresses(userAddresses || []);
      setIsInitialLoading(false);
    }

    loadAccountData();

    async function handleUserChange() {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/");
        return;
      }

      setCurrentUser(user);

      const userId = user.id || user._id;
      const userOrders = await getUserOrders(userId, user.email);
      setOrders(userOrders || []);

      const userAddresses = await getSavedAddresses(userId);
      setAddresses(userAddresses || []);
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
  }, [router]);

  async function handleLogOut() {
    await logoutUser();
    setCurrentUser(null);
    toast.info("Logged Out", "You have been logged out successfully.");
    router.replace("/");
  }

  function handleOpenCertModal(product) {
    setSelectedCertProduct(product);
    setIsCertModalOpen(true);
  }

  async function handleSetDefaultAddress(addressId) {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    const res = await setDefaultAddress(userId, addressId);
    if (res.success) {
      setAddresses(res.addresses);
      toast.success("Default Address", "Your default delivery address has been updated!");
    } else {
      toast.error("Error", res.error || "Failed to update default address.");
    }
  }

  async function handleDeleteAddress(addressId) {
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    const res = await deleteAddress(userId, addressId);
    if (res.success) {
      setAddresses(res.addresses);
      toast.success("Address Deleted", "Address removed from your account.");
    } else {
      toast.error("Error", res.error || "Failed to delete address.");
    }
  }


  if (isInitialLoading) {
    return (
      <main className="py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading account...</span>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <main className="py-5 py-lg-6 bg-soft min-vh-100">
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

        {/* Navigation & Content Dashboard */}
        <div className="row g-4 align-items-start">
          {/* Left Column: My Profile Card & Navigation Menu */}
          <div className="col-12 col-lg-4 col-xl-3">
            <h4 className="fw-bold text-dark mb-3">My Profile</h4>

            {/* Dark Profile Card matching design */}
            <div
              className="rounded-4 shadow-sm overflow-hidden mb-3 text-white position-relative"
              style={{ backgroundColor: "#111827" }}
            >
              <div className="p-4">
                <h5 className="fw-bold text-white mb-1 fs-5">{currentUser.name || "Customer"}</h5>
                <p
                  className="small mb-3"
                  style={{ color: "#9ca3af", fontSize: "0.85rem", wordBreak: "break-word" }}
                >
                  {[currentUser.phone, currentUser.email].filter(Boolean).join(" | ")}
                </p>

                <button
                  type="button"
                  className="btn btn-link text-white text-decoration-none p-0 d-inline-flex align-items-center gap-1.5 fw-medium small"
                  style={{ fontSize: "0.9rem" }}
                  onClick={() => setIsEditProfileModalOpen(true)}
                >
                  <span>Edit Profile</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Email Verification Pending Banner */}
              {!currentUser.isVerified && (
                <div
                  className="px-3 py-2 d-flex align-items-center justify-content-between text-dark small fw-medium"
                  style={{ backgroundColor: "#FEEED4", color: "#854D0E" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <AlertCircle size={15} className="flex-shrink-0" style={{ color: "#B45309" }} />
                    <span style={{ fontSize: "0.78rem" }}>Email Verification Pending. Click here to verify</span>
                  </div>
                  <ArrowRight size={13} className="flex-shrink-0 ms-1" />
                </div>
              )}
            </div>

            {/* Navigation Menu Card */}
            <div className="bg-white border rounded-4 p-2.5 shadow-sm d-flex flex-column gap-1">
              <button
                type="button"
                className="btn text-start py-2.5 px-3 rounded-3 fw-medium border-0"
                style={
                  activeTab === "orders"
                    ? { backgroundColor: "#E6F8F6", color: "#0D9488", fontWeight: "600" }
                    : { color: "#374151", backgroundColor: "transparent" }
                }
                onClick={() => setActiveTab("orders")}
                suppressHydrationWarning
              >
                My Orders
              </button>

              <button
                type="button"
                className="btn text-start py-2.5 px-3 rounded-3 fw-medium border-0"
                style={
                  activeTab === "warranties"
                    ? { backgroundColor: "#E6F8F6", color: "#0D9488", fontWeight: "600" }
                    : { color: "#374151", backgroundColor: "transparent" }
                }
                onClick={() => setActiveTab("warranties")}
                suppressHydrationWarning
              >
                12-Month Warranties
              </button>

              <button
                type="button"
                className="btn text-start py-2.5 px-3 rounded-3 fw-medium border-0"
                style={
                  activeTab === "addresses"
                    ? { backgroundColor: "#E6F8F6", color: "#0D9488", fontWeight: "600" }
                    : { color: "#374151", backgroundColor: "transparent" }
                }
                onClick={() => setActiveTab("addresses")}
                suppressHydrationWarning
              >
                Saved Addresses
              </button>

              <div className="border-top my-1 opacity-25"></div>

              <button
                type="button"
                className="btn text-start py-2 px-3 rounded-3 fw-medium text-danger border-0 d-flex align-items-center gap-2"
                onClick={handleLogOut}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Right Column: Main Content Pane */}
          <div className="col-12 col-lg-8 col-xl-9">
                {/* TAB 1: ORDERS */}
                {activeTab === "orders" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h5 className="fw-bold text-primary mb-1">Refurbished Phone Orders</h5>
                        <p className="text-secondary small mb-0">Track active shipments and view diagnostic inspection reports from MongoDB.</p>
                      </div>
                      <Badge variant="primary">{orders.length} {orders.length === 1 ? "Order" : "Orders"}</Badge>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                        <Package size={48} className="text-muted mb-3 opacity-50 mx-auto" />
                        <h6 className="fw-bold text-dark mb-1">No Orders Placed Yet</h6>
                        <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: "22rem" }}>
                          Your order history and step-by-step delivery progress will appear here when you place an order.
                        </p>
                        <Link href="/shop" className="btn btn-primary rounded-pill px-4 py-2.5 fw-bold">
                          Explore Refurbished Phones
                        </Link>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-4">
                        {orders.map((order) => {
                          const timeline = getOrderTimelineInfo(
                            order.orderStatus,
                            order.estimatedDelivery,
                            order.courierName
                          );
                          const recipientName = order.shippingAddress?.fullName || currentUser.name;
                          const recipientAddress = order.shippingAddress
                            ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.postcode}`
                            : "Standard UK Delivery";

                          return (
                            <div key={order._id || order.orderNumber} className="border rounded-4 overflow-hidden shadow-sm bg-white">
                              {/* Order Header Summary Bar */}
                              <div className="bg-light p-3 p-md-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                                <div>
                                  <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>Order Reference</span>
                                  <strong className="text-dark font-monospace">{order.orderNumber || order._id}</strong>
                                </div>
                                <div>
                                  <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>Placed On</span>
                                  <span className="small text-dark fw-semibold">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}
                                  </span>
                                </div>
                                <div>
                                  <span className="small text-muted d-block" style={{ fontSize: "0.75rem" }}>Total Paid</span>
                                  <strong className="text-primary">£{order.totalAmount}</strong>
                                </div>
                                <div>
                                  <span className={`badge ${timeline.topBadgeClass} px-3 py-1.5 fs-7 rounded-pill`}>
                                    {timeline.topBadgeText}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Live Delivery Progress Step Timeline Bar */}
                              <div className="p-3 p-md-4 border-bottom bg-light bg-opacity-40">
                                <OrderProgressBar
                                  orderStatus={order.orderStatus}
                                  trackingNumber={order.trackingNumber}
                                  courierName={order.courierName}
                                  estimatedDelivery={order.estimatedDelivery}
                                  createdAt={order.createdAt}
                                  updatedAt={order.updatedAt}
                                  activityLog={order.activityLog || []}
                                  showTimestamps={true}
                                />
                              </div>

                              {/* Order Items Breakdown */}
                              <div className="p-3 p-md-4">
                                <div className="d-flex flex-column gap-3 mb-3">
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom border-light">
                                      <div className="d-flex align-items-center gap-3">
                                        <div className="position-relative border rounded-3 overflow-hidden bg-light flex-shrink-0" style={{ width: "64px", height: "64px" }}>
                                          <Image
                                            src={item.image || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone"}
                                            alt={item.name}
                                            fill
                                            sizes="64px"
                                            style={{ objectFit: "cover" }}
                                            unoptimized
                                          />
                                        </div>
                                        <div>
                                          <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                                          <div className="d-flex flex-wrap gap-1.5 mb-1">
                                            {item.selectedOptions?.condition && (
                                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                                                Grade: {item.selectedOptions.condition}
                                              </span>
                                            )}
                                            {item.selectedOptions?.storage && (
                                              <span className="badge bg-white text-dark border px-2 py-0.5" style={{ fontSize: "0.7rem" }}>
                                                {item.selectedOptions.storage}
                                              </span>
                                            )}
                                          </div>
                                          <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                                            Qty: {item.quantity || 1} • Price: £{item.price} • 12-Month Seller Warranty Active
                                          </small>
                                        </div>
                                      </div>

                                      <div className="text-sm-end">
                                        <button
                                          type="button"
                                          className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                                          onClick={() => handleOpenCertModal(item)}
                                          suppressHydrationWarning
                                        >
                                          <FileCheck2 size={15} className="text-warning" />
                                          <span>Inspection Cert</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 text-muted small pt-1" style={{ fontSize: "0.78rem" }}>
                                  <span>📍 Delivered to: <strong>{recipientName}</strong> ({recipientAddress})</span>
                                  <span>🚚 Courier: <strong>{order.courierName || "Tracked UK Express (Royal Mail / DPD)"}</strong></span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: WARRANTIES */}
                {activeTab === "warranties" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h5 className="fw-bold text-primary mb-1">12-Month Seller Warranty Coverage</h5>
                        <p className="text-secondary small mb-0">Every refurbished smartphone purchased is fully protected against hardware & battery defects.</p>
                      </div>
                      <span className="badge bg-success fs-6 px-3 py-1.5">Full Coverage</span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-muted small py-4 text-center">No active warranty items found. Place an order to activate protection.</div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {orders.flatMap((o) => o.items).map((item, idx) => (
                          <div key={idx} className="border rounded-3 p-3 bg-light d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-success text-white p-2.5 rounded-circle flex-shrink-0">
                                <ShieldCheck size={22} />
                              </div>
                              <div>
                                <h6 className="fw-bold text-dark mb-0">{item.name} ({item.selectedOptions?.storage || "128GB"})</h6>
                                <small className="text-muted">Serial/IMEI Diagnostic Certified • 12 Months Active Coverage</small>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1.5">
                                ✓ 100% Covered
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SAVED ADDRESSES */}
                {activeTab === "addresses" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h5 className="fw-bold text-primary mb-1">Saved Shipping Addresses</h5>
                        <p className="text-secondary small mb-0">Manage delivery addresses saved in MongoDB Atlas for express checkout.</p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1 shadow-sm"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        suppressHydrationWarning
                      >
                        <Plus size={15} /> Add New Address
                      </button>
                    </div>

                    <div className="row g-3">
                      {addresses.length === 0 ? (
                        <div className="col-12 text-muted py-5 text-center bg-light rounded-4 border border-dashed">
                          <MapPin size={32} className="text-muted mb-2 opacity-50 mx-auto" />
                          <h6 className="fw-bold text-dark mb-1">No Saved Delivery Addresses</h6>
                          <p className="small text-muted mb-3">Click below to add your shipping address to MongoDB.</p>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
                            onClick={() => setIsAddAddressModalOpen(true)}
                          >
                            <Plus size={15} /> Add Delivery Address
                          </button>
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr._id || addr.addressLine1} className="col-12 col-md-6">
                            <div className="border rounded-4 p-4 bg-white shadow-xs position-relative h-100 d-flex flex-column justify-content-between">
                              <div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fw-bold text-dark">{addr.fullName}</span>
                                  {addr.isDefault ? (
                                    <span className="badge bg-primary">Default</span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 small text-primary text-decoration-none fw-semibold"
                                      onClick={() => handleSetDefaultAddress(addr._id)}
                                      suppressHydrationWarning
                                    >
                                      Set as Default
                                    </button>
                                  )}
                                </div>
                                <p className="small text-muted mb-1">
                                  {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                </p>
                                <p className="small text-muted mb-1">
                                  {addr.city}, {addr.postcode} ({addr.country})
                                </p>
                                <p className="small text-muted mb-0">📞 {addr.phone}</p>
                              </div>

                              <div className="pt-3 mt-3 border-top text-end">
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-danger p-0 text-decoration-none d-inline-flex align-items-center gap-1 font-weight-bold"
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  suppressHydrationWarning
                                >
                                  <Trash2 size={14} /> Delete Address
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
      </Container>

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <AddAddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        userId={currentUser?.id || currentUser?._id}
        onAddressSaved={(newAddresses) => setAddresses(newAddresses)}
      />

      <InspectionReportModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        productName={selectedCertProduct?.name || "Refurbished Smartphone"}
        serialOrImei={selectedCertProduct?.inspectionCertId || "CERT-928371"}
      />
    </main>
  );
}
