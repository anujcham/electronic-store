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
  Plus,
  Lock,
  ArrowRight,
  CheckCircle2,
  Trash2,
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
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "warranties" | "addresses" | "security"

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
      setCurrentUser(user);

      if (user) {
        setProfileName(user.name || "");
        setProfilePhone(user.phone || "");

        const userId = user.id || user._id;
        const userOrders = await getUserOrders(userId, user.email);
        setOrders(userOrders || []);

        const userAddresses = await getSavedAddresses(userId);
        setAddresses(userAddresses || []);
      } else {
        setOrders([]);
        setAddresses([]);
      }
    }

    loadAccountData();

    async function handleUserChange() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setProfileName(user.name || "");
        setProfilePhone(user.phone || "");

        const userId = user.id || user._id;
        const userOrders = await getUserOrders(userId, user.email);
        setOrders(userOrders || []);

        const userAddresses = await getSavedAddresses(userId);
        setAddresses(userAddresses || []);
      } else {
        setOrders([]);
        setAddresses([]);
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
    toast.info("Logged Out", "You have been logged out.");
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

        {!currentUser ? (
          /* Guest Unauthenticated Account Prompt */
          <div className="bg-white border rounded-4 p-5 text-center shadow-sm max-w-2xl mx-auto my-5">
            <div className="bg-primary text-white p-3 rounded-circle d-inline-flex mb-3">
              <Lock size={32} />
            </div>
            <h3 className="fw-bold text-primary mb-2">Sign in to your Refurbished Account</h3>
            <p className="text-muted mb-4" style={{ maxWidth: "28rem", margin: "0 auto" }}>
              Track active refurbished smartphone orders, view 50-point quality inspection reports, download 12-month seller warranties, and manage delivery addresses.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="primary" size="lg" onClick={() => setIsAuthModalOpen(true)}>
                Sign In or Register
              </Button>
            </div>
          </div>
        ) : (
          /* Logged In Customer Profile Dashboard */
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
                    <h5 className="fw-bold text-primary mb-4">Refurbished Phone Orders</h5>

                    {orders.length === 0 ? (
                      <div className="text-center py-5">
                        <Package size={48} className="text-muted mb-3 opacity-50" />
                        <h6 className="fw-bold text-dark mb-1">No Orders Placed Yet</h6>
                        <p className="text-muted small mb-3">Your order history and live shipping updates will appear here.</p>
                        <Link href="/shop" className="btn btn-primary rounded-pill px-4 fw-bold">
                          Explore Refurbished Phones
                        </Link>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-4">
                        {orders.map((order) => (
                          <div key={order._id || order.orderNumber} className="border rounded-4 overflow-hidden shadow-xs">
                            <div className="bg-light p-3 p-md-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                              <div>
                                <span className="small text-muted d-block">Order Reference</span>
                                <strong className="text-dark font-monospace">{order.orderNumber}</strong>
                              </div>
                              <div>
                                <span className="small text-muted d-block">Placed On</span>
                                <span className="small text-dark fw-medium">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB") : "Recently"}
                                </span>
                              </div>
                              <div>
                                <span className="small text-muted d-block">Total Amount</span>
                                <strong className="text-primary">£{order.totalAmount}</strong>
                              </div>
                              <div>
                                <span className={`badge ${order.orderStatus === "Delivered" ? "bg-success" : "bg-warning text-dark"} px-3 py-1.5 fs-7`}>
                                  {order.orderStatus || "Processing"}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 p-md-4">
                              <div className="d-flex flex-column gap-3">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 pb-3 border-bottom border-light">
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="position-relative border rounded-3 overflow-hidden bg-white flex-shrink-0" style={{ width: "64px", height: "64px" }}>
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
                                        <div className="d-flex flex-wrap gap-1 mb-1">
                                          {item.selectedOptions?.condition && (
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-1.5 py-0.5" style={{ fontSize: "0.68rem" }}>
                                              Grade: {item.selectedOptions.condition}
                                            </span>
                                          )}
                                          {item.selectedOptions?.storage && (
                                            <span className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: "0.68rem" }}>
                                              {item.selectedOptions.storage}
                                            </span>
                                          )}
                                        </div>
                                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                          12-Month Seller Warranty Included
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
                                        <Award size={15} className="text-warning" />
                                        <span>Inspection Cert</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between text-muted small" style={{ fontSize: "0.78rem" }}>
                                <span>🚚 Shipping via Royal Mail / DPD Tracked</span>
                                <span>Tracking: <strong className="text-dark font-monospace">{order.trackingNumber || "GB-EV-94028104"}</strong></span>
                              </div>
                            </div>
                          </div>
                        ))}
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
                        <p className="text-secondary small mb-0">Every refurbished phone purchased is fully covered against hardware defects.</p>
                      </div>
                      <span className="badge bg-success fs-6 px-3 py-1.5">Full Protection</span>
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
                                <small className="text-muted">Serial/IMEI Certified • 12 Months Warranty Active</small>
                              </div>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">
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
                      <h5 className="fw-bold text-primary mb-0">Saved Shipping Addresses</h5>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                        onClick={() => setIsAddAddressModalOpen(true)}
                        suppressHydrationWarning
                      >
                        <Plus size={14} /> Add New Address
                      </button>
                    </div>

                    <div className="row g-3">
                      {addresses.length === 0 ? (
                        <div className="col-12 text-muted py-4 text-center">
                          No saved delivery addresses found. Click <strong>"+ Add New Address"</strong> above to add one!
                        </div>
                      ) : (
                        addresses.map((addr) => (
                          <div key={addr._id || addr.addressLine1} className="col-12 col-md-6">
                            <div className="border rounded-3 p-3 bg-white shadow-xs position-relative h-100 d-flex flex-column justify-content-between">
                              <div>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <span className="fw-bold text-dark">{addr.fullName}</span>
                                  {addr.isDefault ? (
                                    <span className="badge bg-primary">Default</span>
                                  ) : (
                                    <button
                                      type="button"
                                      className="btn btn-link btn-sm p-0 small text-primary text-decoration-none"
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

                              <div className="pt-2 mt-2 border-top text-end">
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-danger p-0 text-decoration-none d-inline-flex align-items-center gap-1"
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  suppressHydrationWarning
                                >
                                  <Trash2 size={14} /> Delete
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
                            placeholder="+91 98765 43210"
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
        )}
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
        product={selectedCertProduct}
      />
    </main>
  );
}
