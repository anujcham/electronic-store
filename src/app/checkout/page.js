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
  Wallet,
  Smartphone,
  Percent,
  Clock,
  Check,
} from "lucide-react";

import { Button, Container, Badge } from "../../components/ui";
import { useCart } from "../../features/cart/useCart";
import { getSavedAddresses, saveAddress, deleteAddress } from "../../services/addressService";
import { createOrder } from "../../services/orderService";
import { getCurrentUser } from "../../services/authService";
import { AuthModal } from "../../components/modals/AuthModal";
import { PaymentTrustBanner } from "../../components/checkout/PaymentTrustBanner";

const paymentOptions = [
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Pay securely with Visa, Mastercard, or American Express",
    type: "card",
    badge: "Instant & Secure",
    icons: ["VISA", "Mastercard", "AMEX"],
  },
  {
    id: "klarna",
    label: "Klarna — Pay in 3 or Pay Later",
    description: "Slice into 3 equal payments of £{third} or pay in 30 days. 0% interest.",
    type: "bnpl",
    badge: "0% APR",
    icons: ["Klarna"],
  },
  {
    id: "clearpay",
    label: "Clearpay — 4 Interest-Free Instalments",
    description: "Pay 4 bi-weekly payments of £{quarter}. No interest fees.",
    type: "bnpl",
    badge: "4x 0% Interest",
    icons: ["Clearpay"],
  },
  {
    id: "emi",
    label: "Flexible Monthly Financing (EMI)",
    description: "Spread your payment over 3, 6, 12, or 24 months with instant decision.",
    type: "emi",
    badge: "Low Monthly Cost",
    icons: ["EMI"],
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Safe payment with Buyer Protection. Pay now or spread in 3.",
    type: "wallet",
    badge: "Buyer Protection",
    icons: ["PayPal"],
  },
  {
    id: "applepay",
    label: "Apple Pay / Google Pay",
    description: "Fast, contactless 1-touch checkout with biometric authorization.",
    type: "wallet",
    badge: "1-Touch",
    icons: ["Apple Pay"],
  },
];

const warrantyOptions = [
  {
    id: "standard",
    title: "12-Month Standard Warranty",
    subtitle: "Included with every device at no extra charge",
    badge: "Free Included",
    price: 0,
    features: ["Covers all hardware faults", "50-point quality certified", "Free courier returns"],
  },
  {
    id: "extended-24",
    title: "24-Month Extended Care Warranty",
    subtitle: "Double your peace of mind with 2 full years of coverage",
    badge: "Most Popular",
    price: 24.99,
    features: ["2 full years hardware coverage", "Priority express repair or exchange", "Dedicated VIP technical support"],
  },
  {
    id: "complete-protection",
    title: "Complete Care: 2-Year Warranty + Screen & Spill Protection",
    subtitle: "Total zero-deductible coverage against cracks, drops, & spills",
    badge: "Ultimate Protection",
    price: 39.99,
    features: ["24-month hardware warranty", "Accidental screen crack & liquid damage cover", "Same-day express replacement unit"],
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
  const [selectedWarranty, setSelectedWarranty] = useState("standard");
  const [selectedEmiTenure, setSelectedEmiTenure] = useState("3"); // 3, 6, 12, or 24 months
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }

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

  async function handleLoginSuccess(user) {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setValidationError("");

    let addresses = [];
    if (user && (user.id || user._id)) {
      addresses = await getSavedAddresses(user.id || user._id);
    }
    setSavedAddresses(addresses);

    if (addresses.length > 0) {
      const first = addresses.find((a) => a.isDefault) || addresses[0];
      handleSelectSavedAddress(first);
    } else {
      setFormValues((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ")[1] || "",
        phone: user.phone || "",
      }));
    }
  }

  const [buyNowItem, setBuyNowItem] = useState(null);
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isDirect = urlParams.get("direct") === "true";
      if (isDirect) {
        setIsDirectCheckout(true);
        try {
          const stored = window.sessionStorage.getItem("electroVault.buyNowItem");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && (parsed.price || parsed.name)) {
              setBuyNowItem(parsed);
            }
          }
        } catch (err) {
          console.error("Error reading buyNowItem from sessionStorage", err);
        }
      }
    }
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

  // If Buy Now direct checkout, only checkout this single item directly without touching or requiring the cart
  const checkoutItems = isDirectCheckout && buyNowItem
    ? [buyNowItem]
    : items.length > 0
    ? items
    : fallbackItems;

  const checkoutSubtotal = isDirectCheckout && buyNowItem
    ? Number(buyNowItem.price) * Number(buyNowItem.quantity || 1)
    : items.length > 0
    ? subtotal
    : 489;

  const checkoutItemCount = isDirectCheckout && buyNowItem
    ? Number(buyNowItem.quantity || 1)
    : items.length > 0
    ? itemCount
    : 1;

  const activeWarrantyObj = warrantyOptions.find((w) => w.id === selectedWarranty) || warrantyOptions[0];
  const warrantyFee = activeWarrantyObj ? Number(activeWarrantyObj.price || 0) : 0;
  const deliveryFee = 0;
  const orderTotal = checkoutSubtotal + warrantyFee + deliveryFee;

  function calculateEmiMonthly(total, tenure) {
    const months = Number(tenure) || 3;
    if (months === 3) return total / 3;
    if (months === 6) return total / 6;
    if (months === 12) return (total * 1.05) / 12;
    if (months === 24) return (total * 1.09) / 24;
    return total / months;
  }

  const emiMonthlyAmount = calculateEmiMonthly(orderTotal, selectedEmiTenure);

  const [cardForm, setCardForm] = useState({
    cardNumber: "4532 •••• •••• 8892",
    nameOnCard: "",
    expiryDate: "12/28",
    cvv: "•••",
  });

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

    if (!currentUser) {
      setValidationError("🔒 Login required! Please log in or create an account to place your order.");
      setIsAuthModalOpen(true);
      return;
    }

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

    setIsProcessingPayment(true);

    const emiData =
      paymentMethod === "emi"
        ? {
            provider: "ElectroVault Financing",
            tenureMonths: Number(selectedEmiTenure),
            monthlyAmount: emiMonthlyAmount,
          }
        : paymentMethod === "klarna"
        ? {
            provider: "Klarna",
            tenureMonths: 3,
            monthlyAmount: orderTotal / 3,
          }
        : paymentMethod === "clearpay"
        ? {
            provider: "Clearpay",
            tenureMonths: 2,
            monthlyAmount: orderTotal / 4,
          }
        : null;

    const formattedPaymentMethod =
      paymentMethod === "card"
        ? "Credit / Debit Card (Visa/Mastercard/AMEX)"
        : paymentMethod === "klarna"
        ? "Klarna (Pay in 3 / Pay Later)"
        : paymentMethod === "clearpay"
        ? "Clearpay (4x 0% Interest)"
        : paymentMethod === "emi"
        ? `Monthly EMI Financing (${selectedEmiTenure} Months @ £${emiMonthlyAmount.toFixed(2)}/mo)`
        : paymentMethod === "paypal"
        ? "PayPal"
        : "Apple Pay / Google Pay";

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
          warranty: activeWarrantyObj.title,
        },
      })),
      paymentMethod: formattedPaymentMethod,
      subtotal: checkoutSubtotal,
      shippingFee: deliveryFee,
      tax: 0,
      totalAmount: orderTotal,
      warrantyPlan: {
        id: activeWarrantyObj.id,
        title: activeWarrantyObj.title,
        price: warrantyFee,
      },
      emiDetails: emiData,
    };

    const res = await createOrder(orderPayload);
    setIsProcessingPayment(false);

    if (res?.success) {
      if (isDirectCheckout) {
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.removeItem("electroVault.buyNowItem");
          } catch {}
        }
      } else {
        clearCart();
      }
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
            {isDirectCheckout ? (
              <>
                <Link href="/shop" className="text-decoration-none text-primary fw-medium">
                  Shop
                </Link>
                <span className="mx-2 text-muted">/</span>
                <span className="text-secondary fw-medium">Instant Checkout</span>
              </>
            ) : (
              <>
                <Link href="/cart" className="text-decoration-none text-primary fw-medium">
                  Cart
                </Link>
                <span className="mx-2 text-muted">/</span>
                <span className="text-secondary fw-medium">Checkout</span>
              </>
            )}
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

        {!currentUser && (
          <div className="alert alert-warning border-warning border-2 rounded-4 mb-4 p-3.5 d-flex align-items-center justify-content-between shadow-sm">
            <div className="d-flex align-items-center gap-2.5 text-dark">
              <Lock size={20} className="text-warning flex-shrink-0" />
              <div>
                <strong className="d-block">Login Required for Checkout</strong>
                <span className="small text-muted">You are currently browsing as guest. Please log in or create an account to proceed.</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-warning btn-sm px-3.5 py-1.5 rounded-pill fw-bold shadow-sm"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Log In / Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} noValidate>
          <div className="row g-4">
            {/* Left Column: Delivery Address + Warranty + Payment */}
            <div className="col-12 col-lg-7">
              {/* Delivery Address Section */}
              <div id="delivery-address-section" className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <MapPin size={20} /> 1. Select Delivery Address <span className="text-danger">*</span>
                  </h5>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                      onClick={handleOpenAddModal}
                    >
                      <Plus size={15} /> Add Delivery Address
                    </button>
                  )}
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
                  <div className="pt-2">
                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                      onClick={handleOpenAddModal}
                    >
                      <Plus size={18} /> Add Delivery Address
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Warranty & Guarantee Protection Plan */}
              <div className="bg-white border rounded-4 p-4 p-md-5 mb-4 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <ShieldCheck size={22} className="text-primary" /> 2. Warranty & Guarantee Protection Plan
                  </h5>
                  <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-2.5 py-1">
                    Direct Exchange
                  </span>
                </div>
                <p className="small text-muted mb-4">
                  Select your peace-of-mind coverage tier. Every device is backed by our certified UK repair centre.
                </p>

                <div className="d-flex flex-column gap-3">
                  {warrantyOptions.map((w) => {
                    const isSelected = selectedWarranty === w.id;
                    return (
                      <div
                        key={w.id}
                        className={`border-2 rounded-4 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                            : "border-light-subtle bg-white hover-border-primary"
                        }`}
                        onClick={() => setSelectedWarranty(w.id)}
                        style={{ cursor: "pointer", padding: "18px 22px" }}
                      >
                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div className="d-flex align-items-start gap-3 flex-grow-1">
                            <input
                              type="radio"
                              name="warrantyTier"
                              id={w.id}
                              checked={isSelected}
                              onChange={() => setSelectedWarranty(w.id)}
                              className="form-check-input mt-1 flex-shrink-0"
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                <label htmlFor={w.id} className="fw-bold text-dark mb-0 cursor-pointer fs-6">
                                  {w.title}
                                </label>
                                <span
                                  className={`badge ${
                                    w.id === "complete-protection"
                                      ? "bg-warning text-dark fw-bold"
                                      : w.id === "extended-24"
                                      ? "bg-primary text-white"
                                      : "bg-success-subtle text-success border border-success border-opacity-25"
                                  }`}
                                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                >
                                  {w.badge}
                                </span>
                              </div>
                              <p className="small text-secondary mb-2">{w.subtitle}</p>

                              <div className="d-flex flex-wrap gap-x-4 gap-y-1 small text-dark mt-2 pt-1 border-top border-light-subtle">
                                {w.features.map((feat, i) => (
                                  <span key={i} className="d-inline-flex align-items-center gap-1.5 text-secondary me-3 mt-1" style={{ fontSize: "0.8rem" }}>
                                    <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-end flex-shrink-0 ms-2">
                            <div className="fw-bold text-dark fs-5">
                              {w.price === 0 ? "FREE" : `+${formatCurrency(w.price)}`}
                            </div>
                            <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                              {w.price === 0 ? "Included" : "One-off fee"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
                    <CreditCard size={22} className="text-primary" /> 3. Select Payment Method
                  </h5>
                  <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1 small fw-bold">
                    <Lock size={12} className="me-1" /> 100% Encrypted
                  </span>
                </div>
                <p className="small text-muted mb-3">
                  Choose your preferred payment method. We support cards, PayPal, Apple Pay, and interest-free instalment options.
                </p>

                {/* Exact Payment Trust Banner matching user screenshot */}
                <PaymentTrustBanner className="mb-4" />

                {/* 1. Prepaid Offers / Instant Pay Section (Cashify Style) */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2.5">
                    <h6 className="fw-bold text-dark mb-0 fs-6">Prepaid Offers</h6>
                    <span className="text-success small fw-semibold">Instant Dispatch</span>
                  </div>

                  <div className="row g-3">
                    {[
                      {
                        id: "card",
                        title: "Credit/Debit Card",
                        subtitle: "Visa, Mastercard, AMEX",
                        offer: "Instant & 256-Bit SSL",
                        icon: <CreditCard size={20} className="text-primary" />,
                        iconBg: "#e0f2fe",
                      },
                      {
                        id: "paypal",
                        title: "PayPal",
                        subtitle: "Wallet & Pay in 3",
                        offer: "Buyer Protection Included",
                        icon: <Wallet size={20} className="text-info" />,
                        iconBg: "#dbeafe",
                      },
                      {
                        id: "applepay",
                        title: "Apple Pay / GPay",
                        subtitle: "1-Touch Biometric",
                        offer: "Fast 1-Touch Checkout",
                        icon: <Smartphone size={20} className="text-dark" />,
                        iconBg: "#f1f5f9",
                      },
                      {
                        id: "netbanking",
                        title: "Net Banking",
                        subtitle: "Faster Payments",
                        offer: "Direct Bank Transfer",
                        icon: <Building size={20} className="text-success" />,
                        iconBg: "#dcfce7",
                      },
                    ].map((m) => {
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div key={m.id} className="col-6 col-md-3">
                          <div
                            className={`card h-100 rounded-4 border-2 transition-all position-relative ${
                              isSelected
                                ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                                : "border-light-subtle bg-white hover-border-primary"
                            }`}
                            style={{ cursor: "pointer", padding: "16px 14px" }}
                            onClick={() => setPaymentMethod(m.id)}
                          >
                            {isSelected && (
                              <span
                                className="position-absolute top-0 end-0 m-2 badge bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center shadow-xs"
                                style={{ width: "20px", height: "20px" }}
                              >
                                <Check size={12} className="text-white" strokeWidth={3} />
                              </span>
                            )}
                            <div
                              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2.5"
                              style={{ width: "42px", height: "42px", backgroundColor: m.iconBg }}
                            >
                              {m.icon}
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
                              {m.title}
                            </div>
                            <div className="text-success fw-medium" style={{ fontSize: "11.5px", lineHeight: "1.3" }}>
                              {m.offer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. EMI Section (Cashify Style) */}
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2.5">
                    <div>
                      <h6 className="fw-bold text-dark mb-0 fs-6">EMI & Pay Later</h6>
                      <small className="text-muted">No Cost EMI available</small>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary border-opacity-25 px-2 py-1 small">
                      0% Interest Plans
                    </span>
                  </div>

                  <div className="row g-3">
                    {[
                      {
                        id: "emi",
                        title: "Cardless / Bank EMI",
                        subtitle: "3 to 24 Months",
                        offer: `From £${(orderTotal / 3).toFixed(2)}/mo`,
                        badge: "0% Available",
                        icon: <Percent size={20} style={{ color: "#7c3aed" }} />,
                        iconBg: "#f3e8ff",
                      },
                      {
                        id: "klarna",
                        title: "Klarna Pay in 3",
                        subtitle: "3 Equal Payments",
                        offer: `3 x £${(orderTotal / 3).toFixed(2)} (0% APR)`,
                        badge: "Pay in 30d",
                        icon: <Zap size={20} style={{ color: "#e11d48" }} />,
                        iconBg: "#ffe4e6",
                      },
                      {
                        id: "clearpay",
                        title: "Clearpay 4x",
                        subtitle: "4 Bi-Weekly Payments",
                        offer: `4 x £${(orderTotal / 4).toFixed(2)}`,
                        badge: "Zero Fees",
                        icon: <Clock size={20} style={{ color: "#059669" }} />,
                        iconBg: "#ccfbf1",
                      },
                    ].map((m) => {
                      const isSelected = paymentMethod === m.id;
                      return (
                        <div key={m.id} className="col-12 col-md-4">
                          <div
                            className={`card h-100 rounded-4 border-2 transition-all position-relative ${
                              isSelected
                                ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                                : "border-light-subtle bg-white hover-border-primary"
                            }`}
                            style={{ cursor: "pointer", padding: "16px 16px" }}
                            onClick={() => setPaymentMethod(m.id)}
                          >
                            {isSelected && (
                              <span
                                className="position-absolute top-0 end-0 m-2 badge bg-primary rounded-circle p-1 d-flex align-items-center justify-content-center shadow-xs"
                                style={{ width: "20px", height: "20px" }}
                              >
                                <Check size={12} className="text-white" strokeWidth={3} />
                              </span>
                            )}
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div
                                className="rounded-circle d-inline-flex align-items-center justify-content-center"
                                style={{ width: "42px", height: "42px", backgroundColor: m.iconBg }}
                              >
                                {m.icon}
                              </div>
                              {m.badge && (
                                <span
                                  className={`badge ${
                                    m.id === "klarna"
                                      ? "text-dark"
                                      : m.id === "clearpay"
                                      ? "text-dark"
                                      : "bg-primary-subtle text-primary"
                                  }`}
                                  style={{
                                    fontSize: "10.5px",
                                    padding: "4px 8px",
                                    backgroundColor:
                                      m.id === "klarna" ? "#FFB3C7" : m.id === "clearpay" ? "#BAF9D8" : undefined,
                                  }}
                                >
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <div className="fw-bold text-dark mb-1" style={{ fontSize: "14px" }}>
                              {m.title}
                            </div>
                            <div className="text-success fw-medium" style={{ fontSize: "12px", lineHeight: "1.3" }}>
                              {m.offer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Interactive Active Details Drawer */}
                <div className="border rounded-4 bg-light p-4 mb-4 shadow-xs" style={{ borderColor: "#e2e8f0" }}>
                  {/* Card Details Form */}
                  {paymentMethod === "card" && (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <strong className="text-dark fs-6 d-flex align-items-center gap-2">
                          <CreditCard size={18} className="text-primary" /> Enter Card Details
                        </strong>
                        <span className="badge bg-white text-dark border small">Visa • Mastercard • AMEX</span>
                      </div>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            style={{ padding: "10px 14px" }}
                            placeholder="John Doe"
                            value={cardForm.nameOnCard}
                            onChange={(e) => setCardForm({ ...cardForm, nameOnCard: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Card Number
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control bg-white font-monospace"
                              style={{ padding: "10px 14px" }}
                              placeholder="4532 •••• •••• 8892"
                              value={cardForm.cardNumber}
                              onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                            />
                            <span className="input-group-text bg-white small text-muted px-3">
                              💳 Visa / MC
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            className="form-control bg-white"
                            style={{ padding: "10px 14px" }}
                            placeholder="MM/YY"
                            value={cardForm.expiryDate}
                            onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold text-dark mb-1">
                            CVC / CVV
                          </label>
                          <div className="input-group">
                            <input
                              type="password"
                              className="form-control bg-white"
                              style={{ padding: "10px 14px" }}
                              placeholder="•••"
                              maxLength={4}
                              value={cardForm.cvv}
                              onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                            />
                            <span className="input-group-text bg-white small text-muted px-3">
                              <Lock size={14} />
                            </span>
                          </div>
                        </div>
                        <div className="col-12 small text-muted d-flex align-items-center gap-1.5 pt-1">
                          <Lock size={14} className="text-success flex-shrink-0" />
                          <span>Payments are processed using 256-bit banking-grade encryption.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Flexible EMI Financing Selector */}
                  {paymentMethod === "emi" && (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <strong className="text-dark fs-6 d-flex align-items-center gap-2">
                          <Percent size={18} style={{ color: "#7c3aed" }} /> Select EMI Repayment Tenure
                        </strong>
                        <span className="badge bg-success-subtle text-success border border-success border-opacity-25">
                          Instant Decision
                        </span>
                      </div>
                      <div className="row g-2 mb-3">
                        {[
                          { tenure: "3", label: "3 Months", apr: "0% APR" },
                          { tenure: "6", label: "6 Months", apr: "0% APR" },
                          { tenure: "12", label: "12 Months", apr: "5% APR" },
                          { tenure: "24", label: "24 Months", apr: "9% APR" },
                        ].map((t) => {
                          const isTenureSelected = selectedEmiTenure === t.tenure;
                          const monthly = calculateEmiMonthly(orderTotal, t.tenure);

                          return (
                            <div key={t.tenure} className="col-6 col-sm-3">
                              <div
                                className={`rounded-3 border text-center cursor-pointer transition-all ${
                                  isTenureSelected
                                    ? "border-primary bg-primary text-white shadow-sm"
                                    : "bg-white text-dark hover-border-primary"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEmiTenure(t.tenure);
                                }}
                                style={{ cursor: "pointer", padding: "14px 10px" }}
                              >
                                <div className={`small fw-bold mb-1 ${isTenureSelected ? "text-white" : "text-dark"}`}>
                                  {t.label}
                                </div>
                                <div className={`fs-6 fw-bold mb-1 ${isTenureSelected ? "text-white" : "text-primary"}`}>
                                  £{monthly.toFixed(2)}
                                  <span style={{ fontSize: "0.7rem", fontWeight: "normal" }}>/mo</span>
                                </div>
                                <span
                                  className={`badge ${
                                    isTenureSelected
                                      ? "bg-white text-primary"
                                      : "bg-success-subtle text-success"
                                  }`}
                                  style={{ fontSize: "0.65rem", padding: "3px 8px" }}
                                >
                                  {t.apr}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-white rounded-3 border small" style={{ padding: "16px 18px" }}>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Monthly Payment ({selectedEmiTenure} months):</span>
                          <strong className="text-primary fs-6">£{emiMonthlyAmount.toFixed(2)} / month</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Total Repayment:</span>
                          <strong className="text-dark">£{(emiMonthlyAmount * Number(selectedEmiTenure)).toFixed(2)}</strong>
                        </div>
                        <div className="text-muted pt-2 border-top" style={{ fontSize: "0.75rem" }}>
                          ⚡ Instant pre-qualification check without affecting your credit rating.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Klarna Options */}
                  {paymentMethod === "klarna" && (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <strong className="text-dark fs-6 d-flex align-items-center gap-2">
                          <Zap size={18} style={{ color: "#e11d48" }} /> Klarna Pay Options
                        </strong>
                        <span className="badge text-dark" style={{ backgroundColor: "#FFB3C7" }}>Klarna</span>
                      </div>
                      <div className="d-flex flex-column gap-3">
                        <div className="bg-white rounded-3 border" style={{ padding: "16px 18px" }}>
                          <div className="d-flex align-items-center justify-content-between mb-1.5">
                            <strong className="text-dark">Klarna Pay in 3</strong>
                            <span className="badge bg-success-subtle text-success">0% APR</span>
                          </div>
                          <div className="text-secondary small">
                            3 monthly interest-free payments of <strong>£{(orderTotal / 3).toFixed(2)}</strong>.
                            First payment today, remaining in 30 & 60 days.
                          </div>
                        </div>
                        <div className="bg-white rounded-3 border" style={{ padding: "16px 18px" }}>
                          <div className="d-flex align-items-center justify-content-between mb-1.5">
                            <strong className="text-dark">Klarna Pay in 30 Days</strong>
                            <span className="badge bg-light text-dark">Try Before You Buy</span>
                          </div>
                          <div className="text-secondary small">
                            Order today and pay only after 30 days. No upfront payment required.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clearpay Options */}
                  {paymentMethod === "clearpay" && (
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <strong className="text-dark fs-6 d-flex align-items-center gap-2">
                          <Clock size={18} style={{ color: "#059669" }} /> Clearpay Instalment Breakdown
                        </strong>
                        <span className="badge text-dark" style={{ backgroundColor: "#BAF9D8" }}>Clearpay</span>
                      </div>
                      <div className="bg-white rounded-3 border" style={{ padding: "18px 20px" }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <strong className="text-dark">4 Bi-Weekly Payments</strong>
                          <span className="badge text-dark" style={{ backgroundColor: "#BAF9D8", padding: "6px 10px" }}>
                            4 x £{(orderTotal / 4).toFixed(2)}
                          </span>
                        </div>
                        <div className="row g-2 text-center small text-secondary">
                          <div className="col-3">
                            <div className="bg-light rounded-3 border" style={{ padding: "10px 8px" }}>
                              <div className="fw-bold text-dark mb-1">Today</div>
                              <div className="text-primary fw-semibold">£{(orderTotal / 4).toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="bg-light rounded-3 border" style={{ padding: "10px 8px" }}>
                              <div className="fw-bold text-dark mb-1">2 Weeks</div>
                              <div className="text-primary fw-semibold">£{(orderTotal / 4).toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="bg-light rounded-3 border" style={{ padding: "10px 8px" }}>
                              <div className="fw-bold text-dark mb-1">4 Weeks</div>
                              <div className="text-primary fw-semibold">£{(orderTotal / 4).toFixed(2)}</div>
                            </div>
                          </div>
                          <div className="col-3">
                            <div className="bg-light rounded-3 border" style={{ padding: "10px 8px" }}>
                              <div className="fw-bold text-dark mb-1">6 Weeks</div>
                              <div className="text-primary fw-semibold">£{(orderTotal / 4).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="small text-muted mt-3 text-center">
                          ✓ Zero interest and no added fees when paid on time.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal Option */}
                  {paymentMethod === "paypal" && (
                    <div className="bg-white rounded-3 border text-center" style={{ padding: "20px 24px" }}>
                      <p className="small text-secondary mb-3">
                        You will be redirected to PayPal to complete your purchase securely with Buyer Protection.
                      </p>
                      <div className="d-inline-flex align-items-center gap-2 px-3 py-2 bg-light rounded-pill border small fw-bold text-dark">
                        <Lock size={14} className="text-primary" /> PayPal 180-Day Buyer Protection Included
                      </div>
                    </div>
                  )}

                  {/* Apple Pay Option */}
                  {paymentMethod === "applepay" && (
                    <div className="bg-white rounded-3 border text-center" style={{ padding: "20px 24px" }}>
                      <p className="small text-secondary mb-3">
                        Fast & private. Authorize seamlessly using Face ID, Touch ID, or your device passcode.
                      </p>
                      <div className="badge bg-dark px-4 py-2 rounded-pill fs-6 fw-bold">
                         Pay 1-Touch Checkout
                      </div>
                    </div>
                  )}

                  {/* Net Banking Option */}
                  {paymentMethod === "netbanking" && (
                    <div className="bg-white rounded-3 border" style={{ padding: "18px 20px" }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <strong className="text-dark d-flex align-items-center gap-2">
                          <Building size={18} className="text-success" /> UK Faster Payments / Bank Transfer
                        </strong>
                        <span className="badge bg-success-subtle text-success">Instant Confirmation</span>
                      </div>
                      <p className="small text-muted mb-3">
                        Transfer directly from any UK bank account. Your order will be certified upon confirmation:
                      </p>
                      <div className="bg-light p-3 rounded-3 small font-monospace text-dark mb-2">
                        <div>Bank: <strong>Barclays Bank UK</strong></div>
                        <div>Sort Code: <strong>20-00-00</strong></div>
                        <div>Account No: <strong>88271044</strong></div>
                        <div>Beneficiary: <strong>ElectroVault Ltd</strong></div>
                      </div>
                      <div className="small text-muted" style={{ fontSize: "0.78rem" }}>
                        🔒 Faster Payments transfers are verified within 60 seconds.
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="btn btn-primary btn-lg w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Processing Order Securely...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      <span>
                        Place Order & Pay {formatCurrency(orderTotal)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary & Guarantee Info */}
            <div className="col-12 col-lg-5">
              {/* Order Summary Card */}
              <div className="bg-white border rounded-4 p-4 shadow-sm sticky-top" style={{ top: "100px" }}>
                <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                  <h5 className="fw-bold text-primary mb-0">Order Summary</h5>
                  <span className="badge bg-primary rounded-pill">
                    {checkoutItemCount} {checkoutItemCount === 1 ? "Device" : "Devices"}
                  </span>
                </div>

                {/* Direct Buy Now Indicator */}
                {isDirectCheckout && (
                  <div className="alert alert-info py-2 px-3 rounded-3 mb-3 small d-flex align-items-center gap-2">
                    <Zap size={15} className="text-info flex-shrink-0" />
                    <span>
                      <strong>Instant Direct Purchase:</strong> Checking out directly without altering your regular cart.
                    </span>
                  </div>
                )}

                {/* Items List */}
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
                          Grade: <strong className="text-primary">{item.condition || "Excellent"}</strong> • {item.storage || "128GB"} • Qty: {item.quantity || 1}
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

                {/* Subtotals & Fees */}
                <div className="border-top pt-3 text-secondary small d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between">
                    <span>Handset(s) Subtotal</span>
                    <span className="fw-semibold text-dark">{formatCurrency(checkoutSubtotal)}</span>
                  </div>

                  {/* Selected Warranty Row */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span>Warranty & Guarantee</span>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                        {activeWarrantyObj.title}
                      </div>
                    </div>
                    <span className={`fw-bold ${warrantyFee > 0 ? "text-dark" : "text-success"}`}>
                      {warrantyFee > 0 ? `+${formatCurrency(warrantyFee)}` : "FREE INCLUDED"}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div>
                      <span>UK Tracked 24 Express Shipping</span>
                      <div className="text-muted" style={{ fontSize: "0.72rem" }}>Royal Mail Next-Day Tracked</div>
                    </div>
                    <span className="fw-bold text-success">FREE</span>
                  </div>

                  {/* Total Amount */}
                  <div className="border-top pt-2 mt-1 d-flex justify-content-between align-items-center fs-5 text-dark">
                    <span className="fw-bold text-primary">Order Total</span>
                    <span className="fw-bold text-primary">{formatCurrency(orderTotal)}</span>
                  </div>

                  {/* Monthly breakdown highlight */}
                  {(paymentMethod === "emi" || paymentMethod === "klarna" || paymentMethod === "clearpay") && (
                    <div className="p-2.5 bg-primary-subtle bg-opacity-20 border border-primary border-opacity-25 rounded-3 mt-1 text-center">
                      <span className="small fw-bold text-primary">
                        ⚡ Spread the cost: From £
                        {paymentMethod === "emi"
                          ? emiMonthlyAmount.toFixed(2)
                          : paymentMethod === "klarna"
                          ? (orderTotal / 3).toFixed(2)
                          : (orderTotal / 4).toFixed(2)}{" "}
                        / month
                      </span>
                    </div>
                  )}
                </div>

                {/* Trust Highlights below Summary */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex flex-column gap-2 text-secondary" style={{ fontSize: "0.78rem" }}>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                      <span><strong>14-Day Money Back Guarantee</strong> — full refund if unsatisfied</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={15} className="text-primary flex-shrink-0" />
                      <span><strong>Certified Diagnostic</strong> — complete 50-point inspection card</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Truck size={15} className="text-dark flex-shrink-0" />
                      <span><strong>Royal Mail Tracked 24</strong> — dispatch with live tracking link</span>
                    </div>
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

        {/* Auth Login Modal Popup for Checkout */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </Container>
    </main>
  );
}
