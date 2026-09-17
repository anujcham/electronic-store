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
  KeyRound,
  LogOut,
  Award,
  Truck,
  Plus,
  Lock,
  ArrowRight,
  CheckCircle2,
  Trash2,
  FileCheck2,
  Clock,
} from "lucide-react";

import { Container, Badge, Button } from "../../components/ui";
import { AuthModal } from "../../components/modals/AuthModal";
import { AddAddressModal } from "../../components/modals/AddAddressModal";
import { InspectionReportModal } from "../../components/product/InspectionReportModal";
import { useToast } from "../../components/common/Toast";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { getUserOrders } from "../../services/orderService";
import { getSavedAddresses, deleteAddress, setDefaultAddress } from "../../services/addressService";
import { apiPut } from "../../services/apiClient";

export default function AccountPage() {
  const router = useRouter();
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "warranties" | "addresses" | "security"

  // Sync tab from URL query param if present (e.g. /account?tab=warranties)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["orders", "warranties", "addresses", "security"].includes(tabParam)) {
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

  // Profile Edit State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      const user = await getCurrentUser();
      if (!user) {
        setIsInitialLoading(false);
        router.replace("/");
        return;
      }

      setCurrentUser(user);
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");

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
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");

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

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!currentUser) return;
    setUpdatingProfile(true);

    try {
      const userId = currentUser.id || currentUser._id;
      const res = await apiPut("/user/profile", {
        userId,
        name: profileName,
        phone: profilePhone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setUpdatingProfile(false);
      if (res.success) {
        setCurrentUser(res.user);
        setCurrentPassword("");
        setNewPassword("");
        toast.success("Profile Updated", "Your profile and security settings have been saved to MongoDB!");
      } else {
        toast.error("Update Failed", res.error || "Failed to update profile.");
      }
    } catch (err) {
      setUpdatingProfile(false);
      toast.error("Update Failed", err.message || "Failed to update profile.");
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

        {/* Logged In Customer Profile Dashboard */}
        <div>
            {/* Header Banner */}
            <div className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 position-relative" style={{ zIndex: 2 }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white p-3 rounded-circle fw-bold fs-4 d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="fw-bold text-dark mb-0">{currentUser.name}</h4>
                      {currentUser.isVerified && (
                        <Badge variant="success">Verified Account</Badge>
                      )}
                    </div>
                    <p className="text-muted small mb-0">{currentUser.email} • {currentUser.phone || "No phone added"}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleLogOut}>
                    <LogOut size={16} className="me-1" /> Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="row g-4">
              <div className="col-12 col-lg-3">
                <div className="bg-white border rounded-4 p-3 shadow-sm d-flex flex-column gap-1">
                  <button
                    type="button"
                    className={`btn text-start d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 fw-medium ${
                      activeTab === "orders" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                    }`}
                    onClick={() => setActiveTab("orders")}
                    suppressHydrationWarning
                  >
                    <Package size={18} /> My Orders ({orders.length})
                  </button>

                  <button
                    type="button"
                    className={`btn text-start d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 fw-medium ${
                      activeTab === "warranties" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                    }`}
                    onClick={() => setActiveTab("warranties")}
                    suppressHydrationWarning
                  >
                    <ShieldCheck size={18} /> 12-Month Warranties
                  </button>

                  <button
                    type="button"
                    className={`btn text-start d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 fw-medium ${
                      activeTab === "addresses" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                    }`}
                    onClick={() => setActiveTab("addresses")}
                    suppressHydrationWarning
                  >
                    <MapPin size={18} /> Saved Addresses ({addresses.length})
                  </button>

                  <button
                    type="button"
                    className={`btn text-start d-flex align-items-center gap-2.5 py-2.5 px-3 rounded-3 fw-medium ${
                      activeTab === "security" ? "btn-primary text-white shadow-sm" : "btn-light text-dark"
                    }`}
                    onClick={() => setActiveTab("security")}
                    suppressHydrationWarning
                  >
                    <KeyRound size={18} /> Security & Profile
                  </button>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="col-12 col-lg-9">
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
                          const isShipped = order.orderStatus === "Shipped" || order.orderStatus === "Delivered";
                          const isDelivered = order.orderStatus === "Delivered";
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
                                  <span className={`badge ${isDelivered ? "bg-success" : isShipped ? "bg-primary" : "bg-warning text-dark"} px-3 py-1.5 fs-7 rounded-pill`}>
                                    Status: {order.orderStatus || "Processing"}
                                  </span>
                                </div>
                              </div>

                              {/* Interactive Live Delivery Progress Step Timeline Bar */}
                              <div className="p-3 p-md-4 border-bottom bg-light bg-opacity-40">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <span className="small fw-bold text-primary d-flex align-items-center gap-1.5">
                                    <Truck size={16} /> Live Shipment Tracking & Dispatch Status
                                  </span>
                                  <span className="small text-muted" style={{ fontSize: "0.78rem" }}>
                                    Tracking ID: <strong className="text-dark font-monospace">{order.trackingNumber || "GB-EV-992100"}</strong>
                                  </span>
                                </div>

                                <div className="row g-2 text-center">
                                  {/* Step 1 */}
                                  <div className="col-3">
                                    <div className="p-2.5 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 h-100">
                                      <div className="badge bg-success mb-1" style={{ fontSize: "0.65rem" }}>✓ Done</div>
                                      <div className="fw-bold text-dark small" style={{ fontSize: "0.78rem" }}>1. Placed</div>
                                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>Saved</div>
                                    </div>
                                  </div>

                                  {/* Step 2 */}
                                  <div className="col-3">
                                    <div className="p-2.5 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 h-100">
                                      <div className="badge bg-success mb-1" style={{ fontSize: "0.65rem" }}>✓ Passed</div>
                                      <div className="fw-bold text-dark small" style={{ fontSize: "0.78rem" }}>2. 50-Point Checked</div>
                                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>Verified</div>
                                    </div>
                                  </div>

                                  {/* Step 3 */}
                                  <div className="col-3">
                                    <div className={`p-2.5 rounded-3 h-100 border ${isShipped ? "bg-success bg-opacity-10 border-success border-opacity-25" : "bg-primary bg-opacity-10 border-primary border-opacity-25"}`}>
                                      <div className={`badge ${isShipped ? "bg-success" : "bg-primary"} mb-1`} style={{ fontSize: "0.65rem" }}>
                                        {isShipped ? "✓ Dispatched" : "In Progress"}
                                      </div>
                                      <div className="fw-bold text-dark small" style={{ fontSize: "0.78rem" }}>3. Eco Sealed</div>
                                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>Packaged</div>
                                    </div>
                                  </div>

                                  {/* Step 4 */}
                                  <div className="col-3">
                                    <div className={`p-2.5 rounded-3 h-100 border ${isDelivered ? "bg-success bg-opacity-10 border-success border-opacity-25" : "bg-light border-light-subtle"}`}>
                                      <div className={`badge ${isDelivered ? "bg-success" : "bg-secondary"} mb-1`} style={{ fontSize: "0.65rem" }}>
                                        {isDelivered ? "✓ Delivered" : "Scheduled"}
                                      </div>
                                      <div className="fw-bold text-dark small" style={{ fontSize: "0.78rem" }}>4. Delivery</div>
                                      <div className="text-muted" style={{ fontSize: "0.7rem" }}>{order.estimatedDelivery || "2-4 Days"}</div>
                                    </div>
                                  </div>
                                </div>
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
                                  <span>🚚 Courier: <strong>Tracked UK Express (Royal Mail / DPD)</strong></span>
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

                {/* TAB 4: SECURITY & PROFILE */}
                {activeTab === "security" && (
                  <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                    <h5 className="fw-bold text-primary mb-3">Security & Profile Settings</h5>
                    <form onSubmit={handleUpdateProfile}>
                      <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Email Address (Read Only)</label>
                          <input
                            type="email"
                            className="form-control bg-light"
                            value={currentUser.email}
                            disabled
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            placeholder="+44 7700 900077"
                          />
                        </div>
                      </div>

                      <hr className="my-4" />

                      <h6 className="fw-bold text-dark mb-3">Change Password (Optional)</h6>
                      <div className="row g-3 mb-4">
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">Current Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label small fw-semibold text-dark">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="text-end">
                        <Button type="submit" variant="primary" loading={updatingProfile}>
                          Save Profile Changes
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
      </Container>

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
