"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BatteryCharging,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  FileCheck2,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { Badge, Button, Container } from "../ui";
import { RelatedProducts } from "./RelatedProducts";
import { ConditionGuideModal } from "./ConditionGuideModal";
import { InspectionReportModal } from "./InspectionReportModal";

const formatPrice = (value) => `£${Number(value || 0).toFixed(2)}`;

const getOptionValues = (product, key, fallback) => {
  const values = product?.[key];
  if (Array.isArray(values) && values.length) {
    return values;
  }
  return fallback;
};

// Color dot mapping helper
const getColorHex = (colorName) => {
  if (!colorName) return "#64748b";
  const name = colorName.toLowerCase();
  if (name.includes("black") || name.includes("midnight") || name.includes("graphite") || name.includes("dark")) return "#0f172a";
  if (name.includes("white") || name.includes("starlight") || name.includes("silver") || name.includes("porcelain")) return "#f8fafc";
  if (name.includes("blue") || name.includes("bay")) return "#3b82f6";
  if (name.includes("green")) return "#10b981";
  if (name.includes("red")) return "#ef4444";
  if (name.includes("purple") || name.includes("lavender")) return "#a855f7";
  if (name.includes("gold") || name.includes("beige")) return "#f59e0b";
  return "#64748b";
};

// Condition description helper
const getConditionShortDesc = (cond) => {
  const c = (cond || "").toLowerCase();
  if (c.includes("pristine") || c.includes("like new")) return "Flawless screen & casing. Looks brand new.";
  if (c.includes("excellent")) return "Micro scratches invisible from 20cm away.";
  if (c.includes("very good")) return "Minor cosmetic marks on body, screen pristine.";
  if (c.includes("good")) return "Light scratches on body/screen, 100% functional.";
  return "Professionally tested & restored to 100% working order.";
};

export function ProductDetails({ product, relatedProducts = [] }) {
  const { addItem } = useCart();

  const [selectedCondition, setSelectedCondition] = useState(
    product?.conditionOptions?.[0] || product?.condition || ""
  );
  const [selectedBattery, setSelectedBattery] = useState(
    product?.batteryOptions?.[0] || "Optimal"
  );
  const [selectedStorage, setSelectedStorage] = useState(
    product?.availableStorage?.[0] || product?.storage || ""
  );
  const [selectedColor, setSelectedColor] = useState(
    product?.availableColors?.[0] || product?.color || ""
  );
  const [selectedSim, setSelectedSim] = useState(
    product?.simOptions?.[0] || "Single SIM"
  );
  const [quantity, setQuantity] = useState(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "specs" | "inspection" | "shipping" | "reviews"
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const conditionOptions = useMemo(
    () => getOptionValues(product, "conditionOptions", [product?.condition || ""]).filter(Boolean),
    [product]
  );

  const batteryOptions = useMemo(
    () => getOptionValues(product, "batteryOptions", ["Optimal (85%+)", "New Battery (100%)"]).filter(Boolean),
    [product]
  );

  const storageOptions = useMemo(
    () => getOptionValues(product, "availableStorage", [product?.storage || ""]).filter(Boolean),
    [product]
  );

  const colorOptions = useMemo(
    () => getOptionValues(product, "availableColors", [product?.color || ""]).filter(Boolean),
    [product]
  );

  const simOptions = useMemo(
    () => getOptionValues(product, "simOptions", ["Single SIM", "Dual-SIM (eSIM + Physical)"]).filter(Boolean),
    [product]
  );

  const activeVariant = useMemo(() => {
    const baseProduct = {
      price: Number(product?.price ?? 0),
      originalPrice: Number(product?.originalPrice ?? product?.price ?? 0),
      discountPercentage:
        product?.discountPercentage ??
        (product?.originalPrice && product?.price
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0),
      stock: Number(product?.stock ?? 0),
      deliveryRange: product?.deliveryRange || "2-4 working days",
      warrantyMonths: product?.warrantyMonths || 12,
      shippingIncluded: product?.shippingIncluded ?? true,
      storage: product?.storage || selectedStorage || "",
      color: product?.color || selectedColor || "",
      condition: product?.condition || selectedCondition || "",
      battery: selectedBattery || "Optimal",
      sim: selectedSim || "Single SIM",
    };

    if (!product?.variantPricing || !product.variantPricing.length) {
      return baseProduct;
    }

    const matchedVariant = product.variantPricing.find(
      (variant) =>
        (!variant.storage || variant.storage === selectedStorage) &&
        (!variant.color || variant.color === selectedColor) &&
        (!variant.condition || variant.condition === selectedCondition) &&
        (!variant.battery || variant.battery === selectedBattery) &&
        (!variant.sim || variant.sim === selectedSim)
    );

    if (!matchedVariant) {
      return baseProduct;
    }

    return {
      ...baseProduct,
      ...matchedVariant,
      shippingIncluded: matchedVariant.shippingIncluded ?? baseProduct.shippingIncluded,
      warrantyMonths: matchedVariant.warrantyMonths ?? baseProduct.warrantyMonths,
      deliveryRange: matchedVariant.deliveryRange ?? baseProduct.deliveryRange,
      stock: Number(matchedVariant.stock ?? baseProduct.stock),
      price: Number(matchedVariant.price ?? baseProduct.price),
      originalPrice: Number(matchedVariant.originalPrice ?? baseProduct.originalPrice),
      discountPercentage:
        matchedVariant.originalPrice && matchedVariant.price
          ? Math.round(((matchedVariant.originalPrice - matchedVariant.price) / matchedVariant.originalPrice) * 100)
          : baseProduct.discountPercentage,
    };
  }, [product, selectedBattery, selectedColor, selectedCondition, selectedSim, selectedStorage]);

  const stockLimit = Math.max(1, Number(activeVariant.stock ?? 1));
  const inStock = stockLimit > 0;
  const currentPrice = Number(activeVariant.price ?? 0);
  const currentOriginalPrice = Number(activeVariant.originalPrice ?? currentPrice);
  const currentDiscount =
    activeVariant.discountPercentage ??
    (currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0);

  // Images list with fallbacks for multi-angle thumbnails
  const imagesList = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    const defaultImg = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80";
    return [
      defaultImg,
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
    ];
  }, [product]);

  const currentMainImage = imagesList[activeImageIndex] || imagesList[0];
  const safeQuantity = Math.min(quantity, stockLimit);

  const handleQuantityChange = (delta) => {
    setQuantity((current) => Math.min(stockLimit, Math.max(1, current + delta)));
  };

  const handleAddToCart = () => {
    addItem(
      product,
      {
        condition: selectedCondition,
        battery: selectedBattery,
        storage: selectedStorage,
        color: selectedColor,
        sim: selectedSim,
        stock: activeVariant.stock,
        price: activeVariant.price,
        originalPrice: activeVariant.originalPrice,
        deliveryRange: activeVariant.deliveryRange,
        warrantyMonths: activeVariant.warrantyMonths,
        shippingIncluded: activeVariant.shippingIncluded,
      },
      safeQuantity
    );

    setStatusMessage(
      `✓ Added ${safeQuantity} ${product?.name || "device"} to cart (${selectedStorage || "128GB"}, ${selectedCondition || "Excellent Grade"}).`
    );

    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("wishlist:add", {
          detail: { productId: product?.id, name: product?.name },
        })
      );
    }
    setStatusMessage(isWishlisted ? "Removed from wishlist" : "Saved to your wishlist ❤️");
    setTimeout(() => setStatusMessage(""), 4000);
  };

  return (
    <main className="py-4 py-lg-5 bg-soft">
      <Container>
        {/* Breadcrumb Navigation & Top Trust Strip */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4 pb-2 border-bottom">
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb mb-0 small fw-medium text-secondary">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none text-muted hover-primary">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/shop" className="text-decoration-none text-muted hover-primary">
                  Shop
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href={`/shop?brand=${product?.brand || ""}`} className="text-decoration-none text-muted hover-primary">
                  {product?.brand || "Smartphones"}
                </Link>
              </li>
              <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
                {product?.name || "Product"}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-3 small text-muted">
            <span className="d-flex align-items-center gap-1 text-success fw-semibold">
              <Truck size={14} /> Free Tracked Shipping
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1 text-primary fw-semibold">
              <ShieldCheck size={14} /> 12-Mo Warranty Included
            </span>
          </div>
        </div>

        {/* Main Product Card Panel */}
        <div className="bg-white border rounded-4 overflow-hidden shadow-sm mb-5">
          <div className="row g-0">
            {/* LEFT COLUMN: Gallery & Visual Highlights */}
            <div className="col-12 col-lg-6 border-end border-light p-4 p-md-5 bg-white d-flex flex-column">
              {/* Main Image Container */}
              <div
                className="position-relative rounded-4 overflow-hidden bg-light mb-3 d-flex align-items-center justify-content-center border"
                style={{ height: "460px" }}
              >
                {/* Badges Over Image */}
                <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1.5" style={{ zIndex: 10 }}>
                  {currentDiscount > 0 && (
                    <span className="badge bg-danger text-white px-2.5 py-1.5 fw-bold shadow-sm rounded-pill">
                      SAVE {currentDiscount}% OFF
                    </span>
                  )}
                  {product?.featured && (
                    <span className="badge bg-primary text-white px-2.5 py-1.5 fw-semibold shadow-sm rounded-pill">
                      ⭐ Bestseller
                    </span>
                  )}
                </div>

                <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 10 }}>
                  <button
                    type="button"
                    className="btn btn-light bg-white border rounded-circle p-2 shadow-sm text-success"
                    onClick={() => setIsInspectionModalOpen(true)}
                    title="50-Point Certified"
                  >
                    <Award size={20} />
                  </button>
                </div>

                <Image
                  src={currentMainImage}
                  alt={product?.name || "Product image"}
                  fill
                  sizes="(max-width: 992px) 100vw, 50vw"
                  style={{ objectFit: "contain", padding: "1.5rem" }}
                  priority
                  unoptimized
                />
              </div>

              {/* Thumbnails Gallery Selector */}
              {imagesList.length > 1 && (
                <div className="d-flex align-items-center justify-content-center gap-2.5 mb-4">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-1 rounded-3 border-2 transition-all ${
                        activeImageIndex === idx ? "border-primary bg-light scale-105 shadow-xs" : "border-light bg-white opacity-75"
                      }`}
                      style={{ width: "70px", height: "70px", position: "relative" }}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        sizes="70px"
                        style={{ objectFit: "contain", padding: "4px" }}
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quality & Trust Feature Cards */}
              <div className="mt-auto pt-3 border-top">
                <div className="row g-2 text-start">
                  <div className="col-6 col-md-3">
                    <div className="p-2.5 rounded-3 bg-light text-center border h-100">
                      <ShieldCheck size={20} className="text-primary mb-1" />
                      <div className="fw-bold text-dark" style={{ fontSize: "0.78rem" }}>12-Mo Warranty</div>
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>100% Covered</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2.5 rounded-3 bg-light text-center border h-100">
                      <Award size={20} className="text-success mb-1" />
                      <div className="fw-bold text-dark" style={{ fontSize: "0.78rem" }}>50-Point Checked</div>
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>Fully Functional</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2.5 rounded-3 bg-light text-center border h-100">
                      <BatteryCharging size={20} className="text-info mb-1" />
                      <div className="fw-bold text-dark" style={{ fontSize: "0.78rem" }}>85%+ Battery</div>
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>Health Tested</div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2.5 rounded-3 bg-light text-center border h-100">
                      <RotateCcw size={20} className="text-warning mb-1" />
                      <div className="fw-bold text-dark" style={{ fontSize: "0.78rem" }}>30-Day Returns</div>
                      <div className="text-muted" style={{ fontSize: "0.68rem" }}>No Hassle</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Title, Pricing, Variant Selectors & Add to Cart */}
            <div className="col-12 col-lg-6 p-4 p-md-5 bg-white">
              {/* Product Category & Brand Tag */}
              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 rounded-pill small fw-semibold">
                  {product?.brand || "Apple"} Refurbished
                </span>
                <span className={`badge ${inStock ? "bg-success-subtle text-success border border-success-subtle" : "bg-danger-subtle text-danger border border-danger-subtle"} rounded-pill px-2.5 py-1 small fw-semibold`}>
                  {inStock ? `In Stock (${stockLimit} Available)` : "Out of Stock"}
                </span>
              </div>

              {/* Title */}
              <h1 className="h2 fw-bold text-dark mb-2" style={{ letterSpacing: "-0.02em" }}>
                {product?.name || "Smartphone"}
              </h1>

              {/* Ratings & Reviews Link */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="d-flex align-items-center gap-1 bg-warning bg-opacity-15 px-2.5 py-1 rounded-pill border border-warning border-opacity-25">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="fw-extrabold text-dark small">{product?.rating || 4.8}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-muted text-decoration-none hover-primary small"
                  onClick={() => setActiveTab("reviews")}
                >
                  Based on <strong>{product?.reviewCount || 172} verified buyer reviews</strong>
                </button>
              </div>

              {/* Pricing Box */}
              <div className="p-3.5 rounded-4 bg-light border mb-4">
                <div className="d-flex align-items-baseline gap-3 flex-wrap mb-1">
                  <span className="display-6 fw-extrabold text-primary">{formatPrice(currentPrice)}</span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="text-muted text-decoration-line-through fs-5">
                      {formatPrice(currentOriginalPrice)}
                    </span>
                  )}
                  {currentOriginalPrice > currentPrice && (
                    <span className="badge bg-success text-white px-2 py-1 rounded-pill small">
                      Save £{(currentOriginalPrice - currentPrice).toFixed(0)}
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small mt-2">
                  <CreditCard size={15} className="text-primary" />
                  <span>Or 3 interest-free payments of <strong>£{(currentPrice / 3).toFixed(2)}</strong> with Klarna 0% APR.</span>
                </div>
              </div>

              {/* 50-Point Inspection Report Certificate Banner */}
              <div
                className="p-3 rounded-3 border border-success border-opacity-25 bg-success bg-opacity-10 d-flex align-items-center justify-content-between gap-3 mb-4 cursor-pointer hover-shadow-sm transition-all"
                onClick={() => setIsInspectionModalOpen(true)}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <Award size={22} className="text-success flex-shrink-0" />
                  <div>
                    <div className="fw-bold text-dark small">50-Point Quality Inspection Passed</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Certified diagnostics complete. Guaranteed 100% functional.
                    </div>
                  </div>
                </div>
                <button type="button" className="btn btn-sm btn-success rounded-pill px-3 fw-bold flex-shrink-0">
                  View Cert
                </button>
              </div>

              {/* SELECTOR 1: Condition Grade */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                    <span>1. Select Cosmetic Grade:</span>
                    <strong className="text-primary">{selectedCondition}</strong>
                  </label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 small"
                    onClick={() => setIsConditionModalOpen(true)}
                  >
                    <HelpCircle size={14} /> Condition Guide
                  </button>
                </div>

                <div className="row g-2">
                  {conditionOptions.map((option) => {
                    const isSelected = selectedCondition === option;
                    return (
                      <div key={option} className="col-6 col-sm-4">
                        <button
                          type="button"
                          className={`w-100 btn text-start p-2.5 rounded-3 border transition-all ${
                            isSelected ? "border-primary bg-primary bg-opacity-10 shadow-xs" : "border-light bg-white hover-bg-light"
                          }`}
                          onClick={() => setSelectedCondition(option)}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-0.5">
                            <span className={`fw-bold small ${isSelected ? "text-primary" : "text-dark"}`}>{option}</span>
                            {isSelected && <CheckCircle2 size={15} className="text-primary" />}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.68rem", lineHeight: "1.2" }}>
                            {getConditionShortDesc(option)}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTOR 2: Storage */}
              {storageOptions.length > 0 && (
                <div className="mb-4">
                  <label className="fw-bold text-dark small mb-2 d-block">
                    2. Select Storage: <strong className="text-primary">{selectedStorage}</strong>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {storageOptions.map((option) => {
                      const isSelected = selectedStorage === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`btn rounded-3 px-3 py-2 fw-bold text-center transition-all ${
                            isSelected ? "btn-primary shadow-xs" : "btn-outline-secondary text-dark"
                          }`}
                          onClick={() => setSelectedStorage(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SELECTOR 3: Colour */}
              {colorOptions.length > 0 && (
                <div className="mb-4">
                  <label className="fw-bold text-dark small mb-2 d-block">
                    3. Select Colour: <strong className="text-primary">{selectedColor}</strong>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {colorOptions.map((option) => {
                      const isSelected = selectedColor === option;
                      const dotHex = getColorHex(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`btn rounded-3 px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2 transition-all ${
                            isSelected ? "btn-outline-primary border-2 bg-primary bg-opacity-10 fw-bold" : "btn-outline-light text-dark border"
                          }`}
                          onClick={() => setSelectedColor(option)}
                        >
                          <span
                            className="rounded-circle d-inline-block border"
                            style={{ width: "14px", height: "14px", backgroundColor: dotHex }}
                          />
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Call To Action Buttons */}
              <div className="mb-4 pt-2">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="btn-group border rounded-3 overflow-hidden" role="group" aria-label="Quantity">
                    <button
                      type="button"
                      className="btn btn-light text-dark px-3 py-2 border-end"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={safeQuantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3.5 py-2 fw-bold text-dark bg-white d-flex align-items-center justify-content-center" style={{ minWidth: "50px" }}>
                      {safeQuantity}
                    </span>
                    <button
                      type="button"
                      className="btn btn-light text-dark px-3 py-2 border-start"
                      onClick={() => handleQuantityChange(1)}
                      disabled={safeQuantity >= stockLimit}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`btn px-4 py-2.5 rounded-3 fw-bold d-flex align-items-center gap-2 transition-all ${
                      isWishlisted ? "btn-danger" : "btn-outline-secondary text-dark"
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                    <span>{isWishlisted ? "Saved" : "Wishlist"}</span>
                  </button>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-lg rounded-3 py-3 fw-extrabold fs-5 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <ShoppingCart size={22} />
                    <span>{inStock ? `Add to Cart — ${formatPrice(currentPrice * safeQuantity)}` : "Currently Out of Stock"}</span>
                  </button>
                </div>

                {statusMessage && (
                  <div className="alert alert-success border-0 shadow-xs rounded-3 p-3 mt-3 d-flex align-items-center gap-2" role="status">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                    <span className="small fw-semibold">{statusMessage}</span>
                  </div>
                )}
              </div>

              {/* Delivery Speed Info */}
              <div className="p-3 bg-light rounded-3 border text-secondary small">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="fw-semibold text-dark d-flex align-items-center gap-1.5">
                    <Truck size={16} className="text-primary" /> Delivery Estimate:
                  </span>
                  <strong className="text-primary">{activeVariant.deliveryRange || "2-4 working days"}</strong>
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Dispatched from our London warehouse via Royal Mail Tracked 24. Full online tracking provided.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABBED INFORMATION SECTION (Overview, Specifications, Certificate, Reviews) */}
        <div className="bg-white border rounded-4 overflow-hidden shadow-sm p-4 p-md-5 mb-5">
          {/* Nav Tabs */}
          <ul className="nav nav-tabs border-bottom mb-4 gap-2">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold px-4 py-3 rounded-top-3 border-0 ${
                  activeTab === "overview" ? "active bg-primary text-white" : "text-secondary hover-bg-light"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                📱 Product Overview
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold px-4 py-3 rounded-top-3 border-0 ${
                  activeTab === "specs" ? "active bg-primary text-white" : "text-secondary hover-bg-light"
                }`}
                onClick={() => setActiveTab("specs")}
              >
                ⚙️ Technical Specifications
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold px-4 py-3 rounded-top-3 border-0 ${
                  activeTab === "inspection" ? "active bg-primary text-white" : "text-secondary hover-bg-light"
                }`}
                onClick={() => setActiveTab("inspection")}
              >
                🔬 50-Point Inspection Cert
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold px-4 py-3 rounded-top-3 border-0 ${
                  activeTab === "reviews" ? "active bg-primary text-white" : "text-secondary hover-bg-light"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                ⭐ Reviews ({product?.reviewCount || 172})
              </button>
            </li>
          </ul>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div>
              <h4 className="fw-bold text-primary mb-3">About {product?.name || "This Device"}</h4>
              <p className="text-secondary lead fs-6 mb-4">
                {product?.description ||
                  "This premium refurbished handset has been professionally inspected, cleaned, and tested by certified UK technician team to meet rigorous quality standards."}
              </p>

              <div className="row g-4 mt-2">
                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-4 bg-light h-100">
                    <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                      <Zap size={20} className="text-warning" /> Key Device Features
                    </h5>
                    <ul className="list-unstyled d-flex flex-column gap-2.5 text-secondary mb-0">
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Brand:</strong> {product?.brand}
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Model:</strong> {product?.name}
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Cosmetic Grade:</strong> {selectedCondition}
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Storage Capacity:</strong> {selectedStorage || "128GB"}
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Battery Health:</strong> {selectedBattery || "Optimal (85%+)"}
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <Check size={16} className="text-success" /> <strong>Network Status:</strong> 100% Unlocked for any SIM global network
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="border rounded-3 p-4 bg-light h-100">
                    <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                      <Box size={20} className="text-primary" /> What's Included in the Box
                    </h5>
                    <ul className="list-unstyled d-flex flex-column gap-2.5 text-secondary mb-0">
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> 1x Refurbished {product?.name} ({selectedColor || "Selected Colour"})
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> 1x High-speed MFi/Braided USB-C Charging Cable
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> 1x SIM Ejector Pin Tool
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> 1x 12-Month Official Seller Warranty Certificate
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" /> Eco-friendly recyclable protective packaging
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specs */}
          {activeTab === "specs" && (
            <div>
              <h4 className="fw-bold text-primary mb-3">Hardware Specifications</h4>
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">Brand / Manufacturer</th>
                      <td>{product?.brand || "Apple"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Device Model</th>
                      <td>{product?.name || "iPhone 13"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Display & Resolution</th>
                      <td>Super Retina XDR OLED Display, HDR10, True Tone</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Processor / Chipset</th>
                      <td>High-Performance Bionic / Snapdragon Processor</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Storage Capacity</th>
                      <td>{selectedStorage || "128GB"} Internal Flash Storage</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Camera Configuration</th>
                      <td>Advanced Dual/Triple Camera System with Night Mode & 4K Video</td>
                    </tr>
                    <tr>
                      <th className="bg-light">SIM Card Compatibility</th>
                      <td>{selectedSim || "Single Physical SIM + eSIM"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Cellular / Network</th>
                      <td>5G Ultra-Fast Data, 4G LTE, Wi-Fi 6, Bluetooth 5.3, NFC</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Battery Health Standard</th>
                      <td>{selectedBattery || "Optimal (85%+ guaranteed health)"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Warranty Coverage</th>
                      <td>12 Months Comprehensive Hardware & Battery Guarantee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Inspection Cert */}
          {activeTab === "inspection" && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 className="fw-bold text-primary mb-0">50-Point Quality Diagnostic Inspection</h4>
                <button type="button" className="btn btn-success btn-sm rounded-pill px-3" onClick={() => setIsInspectionModalOpen(true)}>
                  Open Official Certificate
                </button>
              </div>

              <div className="row g-3">
                {[
                  { title: "Screen & Touch Responsiveness", icon: "📱", status: "PASSED 100%" },
                  { title: "Battery Health & Charging Port", icon: "🔋", status: "PASSED 85%+" },
                  { title: "Biometric (Face ID / Fingerprint)", icon: "🔒", status: "VERIFIED" },
                  { title: "Camera Lenses & Flash Output", icon: "📷", status: "PASSED 100%" },
                  { title: "Microphones & Stereo Speakers", icon: "🔊", status: "PASSED 100%" },
                  { title: "Wi-Fi, Bluetooth & GPS Signal", icon: "🌐", status: "PASSED 100%" },
                  { title: "Network Lock & Blacklist Check", icon: "✅", status: "CLEAN IMEI" },
                  { title: "Physical Buttons & Haptics", icon: "🔘", status: "PASSED 100%" },
                ].map((item, idx) => (
                  <div key={idx} className="col-12 col-md-6 col-lg-3">
                    <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fs-5">{item.icon}</span>
                        <span className="fw-semibold text-dark small">{item.title}</span>
                      </div>
                      <span className="badge bg-success">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Customer Reviews */}
          {activeTab === "reviews" && (
            <div>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 p-4 bg-light rounded-4 border">
                <div>
                  <div className="display-5 fw-extrabold text-primary mb-1">
                    {product?.rating || "4.8"} <span className="fs-5 text-muted fw-normal">out of 5</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-warning mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <div className="small text-muted">
                    Based on {product?.reviewCount || 172} verified customer reviews
                  </div>
                </div>

                <button type="button" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                  Write a Review
                </button>
              </div>

              {/* Sample Reviews List */}
              <div className="d-flex flex-column gap-3">
                {[
                  {
                    name: "David K.",
                    date: "2 days ago",
                    rating: 5,
                    title: "Better condition than expected!",
                    comment: "Ordered the iPhone 13 in Excellent grade. Zero scratches on the display and battery health was at 94%. Fast shipping via Royal Mail Tracked 24. Extremely satisfied!",
                  },
                  {
                    name: "Sarah M.",
                    date: "1 week ago",
                    rating: 5,
                    title: "Super fast delivery & perfect phone",
                    comment: "Phone arrived next day in great protective packaging. Battery holds charge very well and saved over £200 compared to buying brand new.",
                  },
                ].map((rev, idx) => (
                  <div key={idx} className="p-3.5 border rounded-3 bg-white shadow-xs">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark">{rev.name}</span>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5 small">
                          Verified Buyer
                        </span>
                      </div>
                      <span className="small text-muted">{rev.date}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1 text-warning mb-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <div className="fw-bold text-dark mb-1">{rev.title}</div>
                    <p className="small text-secondary mb-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      </Container>

      {/* Modals */}
      <ConditionGuideModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        selectedCondition={selectedCondition}
      />

      <InspectionReportModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        productName={product?.name}
        serialOrImei={String(product?.id || "928371")}
      />
    </main>
  );
}
