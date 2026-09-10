"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck,
  Lock,
  Award,
  Sparkles,
  Zap,
  ArrowRight,
  MapPin,
  Plus,
  Pencil,
  X,
  Building,
  Home,
  User,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Button, Container, Badge } from "../../components/ui";
import { useCart } from "../../features/cart/useCart";
import { getSavedAddresses, saveAddress, deleteAddress } from "../../services/addressService";
import { createOrder } from "../../services/orderService";
import { getCurrentUser } from "../../services/authService";

const paymentOptions = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, American Express (256-Bit Encrypted)",
    badge: "Most Popular",
  },
  {
    id: "klarna",
    label: "Klarna — Pay in 3",
    description: "Pay in 3 interest-free instalments",
    badge: "0% Interest",
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Express checkout with Buyer Protection",
    badge: "Fast & Easy",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value || 0));
}

const emptyAddressForm = {
  label: "Home Address",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  isDefault: false,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, subtotal, totalPrice, clearCart } = useCart();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [validationError, setValidationError] = useState("");

  // Address Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [modalFormData, setModalFormData] = useState(emptyAddressForm);

  const [formValues, setFormValues] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addProtectionPlan, setAddProtectionPlan] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  function handleSelectSavedAddress(addr) {
    if (!addr) return;
    const addrId = addr.id || addr._id;
    setSelectedAddressId(addrId);

    let firstName = addr.firstName || "";
    let lastName = addr.lastName || "";
    if (!firstName && addr.fullName) {
      const parts = addr.fullName.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    setFormValues({
      email: addr.email || currentUser?.email || "",
      firstName,
      lastName,
      phone: addr.phone || currentUser?.phone || "",
      address: addr.address || addr.addressLine1 || "",
      city: addr.city || "",
      postcode: addr.postcode || "",
      country: addr.country || "United Kingdom",
    });
    setValidationError("");
  }

  // Load saved addresses for user & pre-select address
  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      setCurrentUser(user);

      let addresses = [];
      if (user && (user.id || user._id)) {
        addresses = await getSavedAddresses(user.id || user._id);
      }
      setSavedAddresses(addresses);

      if (addresses.length > 0) {
        const first = addresses.find((a) => a.isDefault) || addresses[0];
        handleSelectSavedAddress(first);
      } else if (user) {
        setFormValues((prev) => ({
          ...prev,
          email: user.email || "",
          firstName: user.name?.split(" ")[0] || "",
          lastName: user.name?.split(" ")[1] || "",
          phone: user.phone || "",
        }));
      }
    }
    loadData();
  }, []);

  const fallbackItems = [
    {
      id: 1,
      itemKey: "demo-iphone-13",
      name: "iPhone 13",
      brand: "Apple",
      price: 489,
      quantity: 1,
      condition: "Excellent",
      storage: "128GB",
      color: "Midnight",
      battery: "Optimal (85%+)",
      sim: "Single SIM",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const checkoutItems = items.length > 0 ? items : fallbackItems;
  const checkoutSubtotal = items.length > 0 ? subtotal : 489;
  const checkoutItemCount = items.length > 0 ? itemCount : 1;

  const protectionFee = addProtectionPlan ? 14.99 : 0;
  const deliveryFee = 0;
  const orderTotal = checkoutSubtotal + protectionFee + deliveryFee;

  function handleOpenAddModal() {
    setEditingAddressId(null);
    setModalFormData({
      ...emptyAddressForm,
      email: currentUser?.email || formValues.email || "",
      firstName: currentUser?.name?.split(" ")[0] || formValues.firstName || "",
      lastName: currentUser?.name?.split(" ")[1] || formValues.lastName || "",
      phone: currentUser?.phone || formValues.phone || "",
      isDefault: savedAddresses.length === 0,
    });
    setIsModalOpen(true);
  }

  function handleOpenEditModal(addr, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    setEditingAddressId(addr.id || addr._id);

    let firstName = addr.firstName || "";
    let lastName = addr.lastName || "";
    if (!firstName && addr.fullName) {
      const parts = addr.fullName.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    setModalFormData({
      label: addr.label || "Home Address",
      firstName,
      lastName,
      email: addr.email || currentUser?.email || "",
      phone: addr.phone || currentUser?.phone || "",
      address: addr.address || addr.addressLine1 || "",
      city: addr.city || "",
      postcode: addr.postcode || "",
      country: addr.country || "United Kingdom",
      isDefault: Boolean(addr.isDefault),
    });
    setIsModalOpen(true);
  }

  async function handleSaveAddressFromModal(e) {
    e.preventDefault();

    const userId = currentUser?.id || currentUser?._id;
    let updatedList = [];

    const fullName = `${modalFormData.firstName} ${modalFormData.lastName}`.trim();
    const formattedData = {
      ...modalFormData,
      fullName,
      addressLine1: modalFormData.address,
    };

    if (userId) {
      const payload = {
        ...formattedData,
        ...(editingAddressId ? { id: editingAddressId } : {}),
      };
      const res = await saveAddress(userId, payload);
      updatedList = res?.success && Array.isArray(res.addresses) ? res.addresses : savedAddresses;
    } else {
      const newAddr = {
        id: editingAddressId || `addr-${Date.now()}`,
        ...formattedData,
      };
      if (editingAddressId) {
        updatedList = savedAddresses.map((a) => ((a.id || a._id) === editingAddressId ? newAddr : a));
      } else {
        updatedList = [...savedAddresses, newAddr];
      }
    }

    setSavedAddresses(updatedList);

    const activeAddr = editingAddressId
      ? updatedList.find((item) => (item.id || item._id) === editingAddressId)
      : updatedList[updatedList.length - 1];

    if (activeAddr) {
      handleSelectSavedAddress(activeAddr);
    } else if (updatedList.length > 0) {
      handleSelectSavedAddress(updatedList[0]);
    }

    setIsModalOpen(false);
  }

  async function handleDeleteAddress(addrId, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    const userId = currentUser?.id || currentUser?._id;
    let updatedList = [];

    if (userId) {
      const res = await deleteAddress(userId, addrId);
      updatedList = res?.success && Array.isArray(res.addresses) ? res.addresses : [];
    } else {
      updatedList = savedAddresses.filter((a) => (a.id || a._id) !== addrId);
    }

    setSavedAddresses(updatedList);

    if (selectedAddressId === addrId) {
      if (updatedList.length > 0) {
        handleSelectSavedAddress(updatedList[0]);
      } else {
        setSelectedAddressId(null);
        setFormValues({
          email: currentUser?.email || "",
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          city: "",
          postcode: "",
          country: "United Kingdom",
        });
      }
    }
  }

  async function handleSubmitOrder(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setValidationError("");

    const activeAddr = savedAddresses.find((a) => (a.id || a._id) === selectedAddressId) || (savedAddresses.length > 0 ? savedAddresses[0] : null);

    if (!activeAddr && (!formValues.address && !formValues.city && !formValues.postcode)) {
      setValidationError("⚠️ Delivery address required! Please click '+ Add Delivery Address' to enter your shipping details.");
      handleOpenAddModal();
      return;
    }

    let firstName = formValues.firstName || activeAddr?.firstName || "";
    let lastName = formValues.lastName || activeAddr?.lastName || "";
    if (!firstName && activeAddr?.fullName) {
      const parts = activeAddr.fullName.trim().split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    const fullName = `${firstName} ${lastName}`.trim() || activeAddr?.fullName || currentUser?.name || "Customer";

    const email = formValues.email || activeAddr?.email || currentUser?.email || "customer@example.co.uk";
    const phone = formValues.phone || activeAddr?.phone || currentUser?.phone || "+44 7700 900077";
    const addressLine1 = formValues.address || activeAddr?.address || activeAddr?.addressLine1;
    const city = formValues.city || activeAddr?.city;
    const postcode = formValues.postcode || activeAddr?.postcode;
    const country = formValues.country || activeAddr?.country || "United Kingdom";

    if (!addressLine1 || !city || !postcode) {
      setValidationError("⚠️ Selected delivery address is incomplete. Please edit your address.");
      if (activeAddr) handleOpenEditModal(activeAddr, event);
      else handleOpenAddModal();
      return;
    }

    const orderPayload = {
      userId: currentUser?.id || currentUser?._id || null,
      guestEmail: email,
      shippingAddress: {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2: "",
        city,
        postcode,
        country,
      },
      items: checkoutItems.map((item) => ({
        name: item.name,
        slug: item.slug,
        image: item.images?.[0] || item.image,
        price: item.price,
        quantity: item.quantity || 1,
        selectedOptions: item.selectedOptions || {
          condition: item.condition,
          storage: item.storage,
          color: item.color,
        },
      })),
      paymentMethod,
      subtotal: checkoutSubtotal,
      shippingFee: deliveryFee,
      tax: 0,
      totalAmount: orderTotal,
    };

    const res = await createOrder(orderPayload);
    if (res?.success) {
      clearCart();
      router.push("/order-confirmation");
    } else {
      setValidationError(res?.error || "Order placement failed. Please verify your delivery details.");
    }
  }

  const activeSelectedAddress = savedAddresses.find((a) => (a.id || a._id) === selectedAddressId) || (savedAddresses.length > 0 ? savedAddresses[0] : null);

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
            <Link href="/cart" className="text-decoration-none text-primary fw-medium">
              Cart
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Checkout</span>
          </div>
        </nav>

        {/* Page Title & Security Badge */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="display-6 fw-bold text-primary mb-1">Express Secure Checkout</h1>
            <p className="text-secondary mb-0">100% Encrypted & Covered by 12-Month Seller Warranty</p>
          </div>

          <div className="d-flex align-items-center gap-2 bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill small fw-bold">
            <Lock size={16} /> 256-Bit SSL Encrypted
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="row g-4">
            {/* Left Column: Express Pay + Delivery Address Cards + Payment */}
            <div className="col-12 col-lg-7">
              {/* Express Checkout Options */}
              <div className="bg-white border rounded-4 p-4 mb-4 shadow-sm">
                <span className="small text-muted fw-bold text-uppercase tracking-wider mb-2 d-block">
                  Express One-Click Payment:
                </span>
                <div className="row g-2">
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-dark w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={handleSubmitOrder}
                    >
                      <span> Apple Pay</span>
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className="btn btn-outline-dark w-100 py-2.5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 bg-light"
                      onClick={handleSubmitOrder}
                    >
                      <span className="text-primary fw-bold">G</span>
                      <span>Pay</span>
                    </button>
                  </div>
                </div>
                <div className="text-center text-muted small mt-2">or select delivery address below</div>
              </div>

              {/* Delivery Address Section */}
              <div id="delivery-address-section" className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <MapPin size={20} /> 1. Select Delivery Address <span className="text-danger">*</span>
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                    onClick={handleOpenAddModal}
                  >
                    <Plus size={15} /> Add Delivery Address
                  </button>
                </div>

                {/* Validation Error Alert */}
                {validationError && (
                  <div className="alert alert-danger border-danger border-2 rounded-3 mb-4 d-flex align-items-start gap-2 shadow-sm">
                    <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                    <div className="small fw-semibold">{validationError}</div>
                  </div>
                )}

                {/* Saved Address Cards */}
                {savedAddresses.length > 0 ? (
                  <div>
                    <div className="row g-3 mb-3">
                      {savedAddresses.map((addr) => {
                        const addrId = addr.id || addr._id;
                        const isSelected = selectedAddressId === addrId;
                        const displayName = addr.fullName || `${addr.firstName || ""} ${addr.lastName || ""}`.trim() || "Delivery Address";
                        const displayStreet = addr.address || addr.addressLine1 || "";

                        return (
                          <div key={addrId} className="col-12 col-md-6">
                            <div
                              className={`card h-100 p-3 border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                                  : "border-light-subtle bg-white hover-border-primary"
                              }`}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleSelectSavedAddress(addr)}
                            >
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="radio"
                                    name="savedAddressSelect"
                                    id={addrId}
                                    checked={isSelected}
                                    onChange={() => handleSelectSavedAddress(addr)}
                                    className="form-check-input mt-0"
                                  />
                                  <label htmlFor={addrId} className="fw-bold text-dark mb-0 cursor-pointer">
                                    {addr.label || "Address"}
                                  </label>
                                  {addr.isDefault && (
                                    <span
                                      className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-1.5 py-0.5"
                                      style={{ fontSize: "0.65rem" }}
                                    >
                                      Default
                                    </span>
                                  )}
                                </div>

                                <div className="d-flex align-items-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary p-1 border-0 rounded-circle"
                                    onClick={(e) => handleOpenEditModal(addr, e)}
                                    title="Edit address"
                                  >
                                    <Pencil size={14} className="text-primary" />
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger p-1 border-0 rounded-circle"
                                    onClick={(e) => handleDeleteAddress(addrId, e)}
                                    title="Delete address"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="small text-dark fw-semibold mb-1">
                                {displayName}
                              </div>
                              <div className="small text-muted mb-1">
                                {displayStreet}, {addr.city}, {addr.postcode}
                              </div>
                              <div className="small text-muted" style={{ fontSize: "0.78rem" }}>
                                📞 {addr.phone || "+44 7700 900077"} • ✉️ {addr.email || currentUser?.email || "customer@example.co.uk"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Selected Address Confirmation Box */}
                    {activeSelectedAddress && (
                      <div className="bg-light border border-success border-opacity-25 rounded-3 p-3 mt-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 text-dark small">
                          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                          <span>
                            Delivering to: <strong>{activeSelectedAddress.fullName || `${formValues.firstName} ${formValues.lastName}`}</strong> (
                            {formValues.address || activeSelectedAddress.address || activeSelectedAddress.addressLine1}, {formValues.city || activeSelectedAddress.city}, {formValues.postcode || activeSelectedAddress.postcode})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-primary p-0 fw-bold text-decoration-none ms-2 flex-shrink-0 d-flex align-items-center gap-1"
                          onClick={(e) => handleOpenEditModal(activeSelectedAddress, e)}
                        >
                          <Pencil size={13} /> Edit Address
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary p-3 rounded-circle mb-3">
                      <MapPin size={32} />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">No Delivery Address Added</h6>
                    <p className="text-secondary small mb-4 mx-auto" style={{ maxWidth: "24rem" }}>
                      Please click the button below to add your shipping address in our secure modal before placing your order.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                      onClick={handleOpenAddModal}
                    >
                      <Plus size={18} /> Add Delivery Address
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                <h5 className="fw-bold text-primary mb-3">2. Select Payment Method</h5>

                <div className="d-flex flex-column gap-3 mb-4">
                  {paymentOptions.map((opt) => {
                    const isSelected = paymentMethod === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`border rounded-3 p-3 transition-all cursor-pointer ${
                          isSelected ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm" : "bg-white"
                        }`}
                        onClick={() => setPaymentMethod(opt.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              id={opt.id}
                              checked={isSelected}
                              onChange={() => setPaymentMethod(opt.id)}
                              className="form-check-input"
                            />
                            <div>
                              <label htmlFor={opt.id} className="fw-bold text-dark mb-0 cursor-pointer">
                                {opt.label}
                              </label>
                              <div className="small text-muted">{opt.description}</div>
                            </div>
                          </div>
                          <span className="badge bg-secondary">{opt.badge}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
                >
                  <Lock size={18} /> Place Order & Get Digital Quality Certificate ({formatCurrency(orderTotal)})
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary & Protection Plan */}
            <div className="col-12 col-lg-5">
              {/* Protection Plan Add-On */}
              <div className="bg-gradient border-2 border-primary rounded-4 p-4 mb-4 bg-white shadow-sm">
                <div className="d-flex align-items-start gap-3">
                  <div className="bg-warning text-dark p-2.5 rounded-circle flex-shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-bold text-dark mb-0">1-Year Screen & Liquid Damage Insurance</h6>
                      <span className="badge bg-warning text-dark fw-bold">+£14.99</span>
                    </div>
                    <p className="small text-muted mb-2">
                      Covers accidental screen cracks, drops, and liquid spill damage with instant zero-deductible phone replacement.
                    </p>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="protectionToggle"
                        checked={addProtectionPlan}
                        onChange={(e) => setAddProtectionPlan(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold text-primary small cursor-pointer" htmlFor="protectionToggle">
                        Yes, add 1-Year Full Accidental Damage Protection (+£14.99)
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white border rounded-4 p-4 shadow-sm sticky-top" style={{ top: "100px" }}>
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                  <h5 className="fw-bold text-primary mb-0">Order Summary</h5>
                  <span className="badge bg-primary rounded-pill">{checkoutItemCount} {checkoutItemCount === 1 ? "Item" : "Items"}</span>
                </div>

                <div className="d-flex flex-column gap-3 mb-4 max-h-300 overflow-y-auto">
                  {checkoutItems.map((item) => (
                    <div key={item.itemKey || item.id} className="d-flex align-items-center gap-3">
                      <div className="position-relative bg-light rounded-3 flex-shrink-0" style={{ width: "60px", height: "60px" }}>
                        {(item.image || item.images?.[0]) && (
                          <Image
                            src={item.image || item.images?.[0]}
                            alt={item.name}
                            fill
                            sizes="60px"
                            style={{ objectFit: "cover" }}
                            className="rounded-3"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark small mb-0">{item.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Grade: <strong className="text-primary">{item.condition || "Good"}</strong> • {item.storage || "128GB"} • Qty: {item.quantity || 1}
                        </div>
                        <div className="text-success" style={{ fontSize: "0.75rem" }}>
                          ✓ Passed 50-Point Diagnostic Check
                        </div>
                      </div>
                      <div className="fw-bold text-primary text-end small">
                        {formatCurrency(Number(item.price) * Number(item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-top pt-3 text-secondary small d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                    <span>Items Subtotal</span>
                    <span className="fw-semibold text-dark">{formatCurrency(checkoutSubtotal)}</span>
                  </div>

                  {addProtectionPlan && (
                    <div className="d-flex justify-content-between text-warning">
                      <span>1-Year Accidental Damage Insurance</span>
                      <span className="fw-bold">+£14.99</span>
                    </div>
                  )}

                  <div className="d-flex justify-content-between">
                    <span>UK Tracked Express Shipping</span>
                    <span className="fw-bold text-success">FREE</span>
                  </div>

                  <div className="border-top pt-2 mt-1 d-flex justify-content-between align-items-center fs-5 text-dark">
                    <span className="fw-bold text-primary">Total Amount</span>
                    <span className="fw-bold text-primary">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Overlay for Adding/Editing Address */}
        {isModalOpen && (
          <div className="modal-backdrop-custom">
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center p-3"
              style={{ zIndex: 1080, backdropFilter: "blur(4px)" }}
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="bg-white rounded-4 shadow-lg overflow-hidden w-100"
                style={{ maxWidth: "560px", animation: "modalPop 0.25s ease-out forwards" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary text-white p-2 rounded-3">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h5 className="fw-bold text-primary mb-0">
                        {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                      </h5>
                      <small className="text-muted">Enter accurate shipping details for tracked dispatch</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-circle p-2 border-0"
                    onClick={() => setIsModalOpen(false)}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveAddressFromModal} className="p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Address Label (e.g. Home, Work)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Home, Office, Parents"
                        value={modalFormData.label}
                        onChange={(e) => setModalFormData({ ...modalFormData, label: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">First Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John"
                        value={modalFormData.firstName}
                        onChange={(e) => setModalFormData({ ...modalFormData, firstName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Last Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Doe"
                        value={modalFormData.lastName}
                        onChange={(e) => setModalFormData({ ...modalFormData, lastName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Email Address <span className="text-danger">*</span></label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@example.co.uk"
                        value={modalFormData.email}
                        onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Phone Number <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+44 7700 900077"
                        value={modalFormData.phone}
                        onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Street Address <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="124 High Street, Suite 4B"
                        value={modalFormData.address}
                        onChange={(e) => setModalFormData({ ...modalFormData, address: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-5">
                      <label className="form-label small fw-semibold text-dark">City / Town <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="London"
                        value={modalFormData.city}
                        onChange={(e) => setModalFormData({ ...modalFormData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold text-dark">Postcode <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="SW1A 1AA"
                        value={modalFormData.postcode}
                        onChange={(e) => setModalFormData({ ...modalFormData, postcode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label small fw-semibold text-dark">Country</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={modalFormData.country}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 py-2 rounded-3 fw-bold"
                    >
                      Save & Use Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
