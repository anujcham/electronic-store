"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  Award,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  HelpCircle,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { Badge, Container } from "../ui";
import { RelatedProducts } from "./RelatedProducts";
import { ConditionGuideModal } from "./ConditionGuideModal";
import { InspectionReportModal } from "./InspectionReportModal";
import { apiGet, apiPost } from "../../services/apiClient";

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
  if (name.includes("green") || name.includes("emerald") || name.includes("mint")) return "#10b981";
  if (name.includes("red")) return "#ef4444";
  if (name.includes("purple") || name.includes("lavender") || name.includes("violet")) return "#a855f7";
  if (name.includes("gold") || name.includes("beige") || name.includes("yellow")) return "#f59e0b";
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

const SPEC_KEY_LABELS = {
  display: "Display & Screen",
  processor: "Processor / Chipset",
  camera: "Camera Optics",
  battery: "Battery & Power",
  batterySpec: "Battery & Power",
  os: "Operating System",
  network: "Network & Connectivity",
  waterResistance: "Water & Dust Protection",
};

export function ProductDetails({ product, relatedProducts = [] }) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const isProductWishlisted = isWishlisted(product);

  // Available color variants (with dedicated photos and hex colors) from Admin
  const colorVariantsList = useMemo(() => {
    return Array.isArray(product?.colorVariants) ? product.colorVariants : [];
  }, [product]);

  const colorOptions = useMemo(() => {
    if (colorVariantsList.length > 0) {
      return colorVariantsList.map((c) => c.colorName).filter(Boolean);
    }
    return getOptionValues(product, "availableColors", [product?.color || "Midnight"]).filter(Boolean);
  }, [colorVariantsList, product]);

  const conditionOptions = useMemo(
    () => getOptionValues(product, "conditionOptions", [product?.condition || "Good"]).filter(Boolean),
    [product]
  );

  const batteryOptions = useMemo(
    () => getOptionValues(product, "batteryOptions", ["Optimal (85%+)", "New Replacement Battery (100%)"]).filter(Boolean),
    [product]
  );

  const storageOptions = useMemo(
    () => getOptionValues(product, "availableStorage", [product?.storage || "128GB"]).filter(Boolean),
    [product]
  );

  const simOptions = useMemo(
    () => getOptionValues(product, "simOptions", ["Single SIM", "Dual-SIM (physical SIM + eSIM)"]).filter(Boolean),
    [product]
  );

  const [selectedCondition, setSelectedCondition] = useState(
    conditionOptions[0] || product?.condition || "Good"
  );
  const [selectedBattery, setSelectedBattery] = useState(
    batteryOptions[0] || "Optimal"
  );
  const [selectedStorage, setSelectedStorage] = useState(
    storageOptions[0] || product?.storage || "128GB"
  );
  const [selectedColor, setSelectedColor] = useState(
    colorOptions[0] || product?.color || "Midnight"
  );
  const [selectedSim, setSelectedSim] = useState(
    simOptions[0] || "Single SIM"
  );
  const [quantity, setQuantity] = useState(1);
  const [statusMessage, setStatusMessage] = useState("");
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "specs" | "inspection" | "reviews"
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Active color variant object (for hexCode and color-specific photos)
  const activeColorVariant = useMemo(() => {
    if (!colorVariantsList.length) return null;
    return (
      colorVariantsList.find(
        (c) => c.colorName?.toLowerCase().trim() === (selectedColor || "").toLowerCase().trim()
      ) || colorVariantsList[0]
    );
  }, [colorVariantsList, selectedColor]);

  // When user switches color, reset image index to first photo of that color
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // Dynamic Images list: Color-specific photos have top priority, falling back to product.images
  const imagesList = useMemo(() => {
    if (activeColorVariant?.images && activeColorVariant.images.length > 0) {
      return activeColorVariant.images;
    }
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    return ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"];
  }, [activeColorVariant, product]);

  // Reviews State (MongoDB Atlas API Sync)
  const [reviewsList, setReviewsList] = useState(product?.reviews || []);
  const [currentRating, setCurrentRating] = useState(product?.rating || 4.8);
  const [currentReviewCount, setCurrentReviewCount] = useState(product?.reviewCount || 0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ userName: "", rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFormMessage, setReviewFormMessage] = useState("");

  // Dynamic Variant Calculation from Inventory Matrix or Synthetic Rules
  const activeVariant = useMemo(() => {
    const baseProduct = {
      price: Number(product?.price ?? 0),
      originalPrice: Number(product?.originalPrice ?? product?.price ?? 0),
      discountPercentage:
        product?.discountPercentage ??
        (product?.originalPrice && product?.price
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0),
      stock: Number(product?.stock ?? 10),
      deliveryRange: product?.deliveryRange || "2-4 working days",
      warrantyMonths: product?.warrantyMonths || 12,
      shippingIncluded: product?.shippingIncluded ?? true,
      storage: selectedStorage || product?.storage || "",
      color: selectedColor || product?.color || "",
      condition: selectedCondition || product?.condition || "",
      battery: selectedBattery || "Optimal",
      sim: selectedSim || "Single SIM",
    };

    // If exact variant pricing matrix is defined by admin
    if (Array.isArray(product?.variantPricing) && product.variantPricing.length > 0) {
      const matchedVariant = product.variantPricing.find((v) => {
        const matchColor = !v.color || v.color.toLowerCase().trim() === (selectedColor || "").toLowerCase().trim();
        const matchStorage = !v.storage || v.storage.toLowerCase().trim() === (selectedStorage || "").toLowerCase().trim();
        const matchCondition = !v.condition || v.condition.toLowerCase().trim() === (selectedCondition || "").toLowerCase().trim();
        return matchColor && matchStorage && matchCondition;
      });

      if (!matchedVariant) {
        // Combination not stocked in matrix
        return {
          ...baseProduct,
          stock: 0,
        };
      }

      const variantStock = Number(matchedVariant.stock ?? 0);
      const variantPrice = Number(matchedVariant.price ?? baseProduct.price);
      const variantOrigPrice = Number(matchedVariant.originalPrice ?? baseProduct.originalPrice);

      return {
        ...baseProduct,
        ...matchedVariant,
        stock: variantStock,
        price: variantPrice,
        originalPrice: variantOrigPrice,
        discountPercentage:
          variantOrigPrice > variantPrice
            ? Math.round(((variantOrigPrice - variantPrice) / variantOrigPrice) * 100)
            : baseProduct.discountPercentage,
      };
    }

    // Fallback if no variantPricing array exists: apply sensible offsets
    let storageOffset = 0;
    if (selectedStorage === "256GB") storageOffset = 50;
    if (selectedStorage === "512GB") storageOffset = 120;
    if (selectedStorage === "1TB") storageOffset = 200;

    let conditionOffset = 0;
    if (selectedCondition.includes("Pristine") || selectedCondition.includes("Like New")) conditionOffset = 60;
    if (selectedCondition.includes("Excellent")) conditionOffset = 30;

    const finalPrice = baseProduct.price + storageOffset + conditionOffset;
    const finalOriginal = baseProduct.originalPrice + storageOffset + conditionOffset;

    return {
      ...baseProduct,
      price: finalPrice,
      originalPrice: finalOriginal,
      discountPercentage: Math.round(((finalOriginal - finalPrice) / finalOriginal) * 100),
    };
  }, [product, selectedBattery, selectedColor, selectedCondition, selectedSim, selectedStorage]);

  const stockCount = Number(activeVariant.stock ?? 0);
  const inStock = stockCount > 0;
  const stockLimit = inStock ? stockCount : 0;
  const currentPrice = Number(activeVariant.price ?? 0);
  const currentOriginalPrice = Number(activeVariant.originalPrice ?? currentPrice);
  const currentDiscount =
    activeVariant.discountPercentage ??
    (currentOriginalPrice > currentPrice
      ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
      : 0);

  const currentMainImage = imagesList[activeImageIndex] || imagesList[0];
  const safeQuantity = Math.max(1, Math.min(quantity, Math.max(1, stockLimit)));

  // Dynamic Specifications object parsing
  const dynamicSpecs = useMemo(() => {
    if (product?.specifications && typeof product.specifications === "object") {
      return Object.entries(product.specifications).filter(([_, val]) => Boolean(val));
    }
    return [
      ["display", "Super Retina XDR OLED Display, 120Hz ProMotion"],
      ["processor", `${product?.brand || "Flagship"} High-Performance Processor`],
      ["camera", "Advanced Multi-Lens Camera System with Night Mode"],
      ["batterySpec", "All-day battery life (85%+ guaranteed health)"],
      ["network", "5G Data, Wi-Fi 6, Bluetooth 5.3, NFC"],
      ["waterResistance", "IP68 Dust & Water Resistant"],
    ];
  }, [product]);

  // Fetch real reviews from MongoDB Atlas backend API
  const fetchReviewsFromMongoDB = useCallback(async () => {
    if (!product?.slug) return;
    try {
      const res = await apiGet(`/products/${product.slug}/reviews`);
      if (res?.success) {
        setReviewsList(res.reviews || []);
        if (res.rating) setCurrentRating(res.rating);
        if (res.reviewCount !== undefined) setCurrentReviewCount(res.reviewCount);
      }
    } catch (err) {
      console.error("Error fetching product reviews:", err);
    }
  }, [product?.slug]);

  useEffect(() => {
    fetchReviewsFromMongoDB();
  }, [fetchReviewsFromMongoDB]);

  const handleQuantityChange = (delta) => {
    setQuantity((current) => Math.min(stockLimit, Math.max(1, current + delta)));
  };

  const handleAddToCart = () => {
    if (!inStock) return;
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
        image: currentMainImage,
      },
      safeQuantity
    );

    setStatusMessage(
      `✓ Added ${safeQuantity} ${product?.name || "device"} to cart (${selectedStorage || "128GB"}, ${selectedCondition || "Excellent Grade"}).`
    );

    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    setStatusMessage(!isProductWishlisted ? "Saved to your wishlist ❤️" : "Removed from wishlist");
    setTimeout(() => setStatusMessage(""), 4000);
  };

  // Submit review to MongoDB Atlas backend API
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.userName.trim() || !newReview.comment.trim()) {
      setReviewFormMessage("Please enter your name and comment.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewFormMessage("");

    try {
      const res = await apiPost(`/products/${product.slug}/reviews`, {
        userName: newReview.userName,
        rating: Number(newReview.rating),
        comment: newReview.comment,
      });

      if (res?.success) {
        setReviewsList(res.reviews || []);
        setCurrentRating(res.rating);
        setCurrentReviewCount(res.reviewCount);
        setNewReview({ userName: "", rating: 5, comment: "" });
        setShowReviewForm(false);
        setReviewFormMessage("Thank you! Your review has been saved.");
        setTimeout(() => setReviewFormMessage(""), 5000);
      } else {
        setReviewFormMessage(res?.error || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setReviewFormMessage("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="py-4 py-lg-5 bg-soft">
      <Container>
        {/* Breadcrumb Navigation & Top Trust Bar */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="small text-primary">
              <Link href="/" className="text-decoration-none text-primary fw-medium">
                Home
              </Link>
              <span className="mx-2 text-muted">/</span>
              <Link href="/shop" className="text-decoration-none text-primary fw-medium">
                Shop Refurbished
              </Link>
              <span className="mx-2 text-muted">/</span>
              <span className="text-secondary fw-medium">{product?.name || "Device Details"}</span>
            </div>

            <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: "0.8rem" }}>
              <span className="d-flex align-items-center gap-1 text-success fw-semibold">
                <ShieldCheck size={15} /> 12-Month Seller Warranty
              </span>
              <span className="d-none d-sm-inline">•</span>
              <span className="d-none d-sm-flex align-items-center gap-1 text-primary fw-semibold">
                <Truck size={15} /> Free UK Tracked Delivery
              </span>
            </div>
          </div>
        </nav>

        {/* Primary Product Details Card */}
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden p-4 p-md-5 mb-4">
          <div className="row g-4 g-lg-5">
            {/* Left Column: Multi-Angle Gallery */}
            <div className="col-12 col-lg-6">
              {/* Main Preview Image */}
              <div
                className="position-relative bg-light rounded-4 overflow-hidden mb-3 border shadow-xs d-flex align-items-center justify-content-center"
                style={{ aspectRatio: "1 / 1" }}
              >
                <Image
                  src={currentMainImage}
                  alt={product?.name || "Refurbished Smartphone"}
                  fill
                  sizes="(max-width: 992px) 100vw, 50vw"
                  style={{ objectFit: "contain" }}
                  priority
                  unoptimized
                />

                {/* Badges Overlay */}
                <div className="position-absolute top-0 start-0 m-3 d-flex flex-column gap-1">
                  <Badge variant="primary" className="shadow-xs">
                    {product?.brand || "Apple"}
                  </Badge>
                  {selectedCondition && (
                    <Badge variant="success" className="shadow-xs">
                      {selectedCondition} Grade
                    </Badge>
                  )}
                </div>

                {currentDiscount > 0 && (
                  <span className="position-absolute top-0 end-0 m-3 badge bg-danger text-white rounded-pill px-2.5 py-1.5 fw-bold shadow-xs">
                    Save {currentDiscount}%
                  </span>
                )}
              </div>

              {/* Thumbnails Swatch Bar: ONLY renders if product has MULTIPLE pictures (> 1) */}
              {imagesList.length > 1 && (
                <div className="d-flex align-items-center gap-2 overflow-x-auto pb-1">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-1 rounded-3 border transition-all position-relative bg-light ${
                        activeImageIndex === idx ? "border-primary border-2 shadow-xs" : "opacity-75 hover-opacity-100"
                      }`}
                      style={{ width: "70px", height: "70px", flexShrink: 0 }}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <Image
                        src={img}
                        alt={`Angle ${idx + 1}`}
                        fill
                        sizes="70px"
                        style={{ objectFit: "cover" }}
                        className="rounded-2"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Title, Dynamic Variant Selector, Pricing & CTAs */}
            <div className="col-12 col-lg-6">
              <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                <span className="text-muted small fw-bold text-uppercase tracking-wider">
                  {product?.brand} Certified Refurbished
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-primary fw-semibold text-decoration-none d-flex align-items-center gap-1"
                  onClick={() => setIsConditionModalOpen(true)}
                >
                  <HelpCircle size={14} /> Condition Guide
                </button>
              </div>

              <h1 className="h2 fw-extrabold text-primary mb-2">{product?.name || "Refurbished Smartphone"}</h1>

              {/* Rating & Review Counter */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-1 text-warning">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} fill={s <= Math.round(currentRating) ? "currentColor" : "none"} />
                  ))}
                  <span className="fw-bold text-dark ms-1 small">{currentRating}</span>
                </div>
                <span className="text-muted small">•</span>
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-secondary text-decoration-none small"
                  onClick={() => setActiveTab("reviews")}
                >
                  {currentReviewCount} Verified Customer Reviews
                </button>
              </div>

              {/* Dynamic Price Display */}
              <div className="p-3.5 bg-light rounded-3 border mb-4">
                <div className="d-flex align-items-baseline gap-3 mb-1">
                  <span className="display-6 fw-extrabold text-primary">{formatPrice(currentPrice)}</span>
                  {currentOriginalPrice > currentPrice && (
                    <span className="h5 text-muted text-decoration-line-through mb-0">
                      {formatPrice(currentOriginalPrice)}
                    </span>
                  )}
                  {currentDiscount > 0 && (
                    <span className="badge bg-danger text-white rounded-pill px-2.5 py-1">
                      Save £{(currentOriginalPrice - currentPrice).toFixed(2)} ({currentDiscount}%)
                    </span>
                  )}
                </div>

                {/* Live Stock Status Indicator */}
                <div className="mb-2">
                  {!inStock ? (
                    <span className="badge bg-danger text-white rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs">
                      <AlertTriangle size={14} /> Currently Out of Stock for this variant
                    </span>
                  ) : stockCount <= 5 ? (
                    <span className="badge bg-warning text-dark rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs">
                      <Zap size={14} className="text-danger" /> Only {stockCount} left in stock — order soon!
                    </span>
                  ) : (
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5">
                      <CheckCircle2 size={14} /> In Stock ({stockCount} units available)
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 text-muted small" style={{ fontSize: "0.78rem" }}>
                  <span>VAT Included</span>
                  <span>•</span>
                  <span className="text-success fw-semibold">✓ Free UK Shipping</span>
                  <span>•</span>
                  <span className="text-primary fw-semibold">✓ 12-Month Seller Warranty</span>
                </div>
              </div>

              {/* SELECTOR 1: Cosmetic Grade */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label className="fw-bold text-dark small mb-0">
                    1. Choose Cosmetic Grade: <strong className="text-primary">{selectedCondition}</strong>
                  </label>
                </div>

                <div className="row g-2">
                  {conditionOptions.map((option) => {
                    const isSelected = selectedCondition === option;
                    return (
                      <div key={option} className="col-6 col-sm-3">
                        <button
                          type="button"
                          className={`btn w-100 p-2.5 rounded-3 text-start border transition-all h-100 ${
                            isSelected ? "border-primary bg-primary-subtle bg-opacity-10 shadow-xs" : "bg-white hover-bg-light"
                          }`}
                          onClick={() => setSelectedCondition(option)}
                        >
                          <div className="fw-bold text-dark small mb-0.5">{option}</div>
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
                          className={`btn rounded-3 px-3.5 py-2 fw-bold text-center transition-all ${
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
                      const isSelected = (selectedColor || "").toLowerCase().trim() === option.toLowerCase().trim();
                      const matchedColorVar = colorVariantsList.find(
                        (c) => c.colorName?.toLowerCase().trim() === option.toLowerCase().trim()
                      );
                      const dotHex = matchedColorVar?.hexCode || getColorHex(option);
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
                            className="rounded-circle d-inline-block border shadow-xs"
                            style={{ width: "16px", height: "16px", backgroundColor: dotHex }}
                          />
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart Action */}
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
                      isProductWishlisted ? "btn-danger" : "btn-outline-secondary text-dark"
                    }`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart size={18} fill={isProductWishlisted ? "currentColor" : "none"} />
                    <span>{isProductWishlisted ? "Saved" : "Wishlist"}</span>
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

              {/* Delivery Speed Estimate */}
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
                ⚙️ Dynamic Technical Specifications
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
                ⭐ Reviews ({currentReviewCount})
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

          {/* Tab 2: Dynamic Specifications */}
          {activeTab === "specs" && (
            <div>
              <h4 className="fw-bold text-primary mb-3">Dynamic Hardware Specifications</h4>
              <p className="text-muted small mb-3">
                Entered and maintained dynamically in MongoDB Atlas backend for {product?.name}:
              </p>
              <div className="table-responsive">
                <table className="table table-striped table-bordered align-middle">
                  <tbody>
                    <tr>
                      <th className="bg-light w-25">Brand / Manufacturer</th>
                      <td className="fw-bold text-dark">{product?.brand || "Apple"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Device Model Name</th>
                      <td className="fw-bold text-dark">{product?.name || "iPhone"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Selected Storage Variant</th>
                      <td className="fw-bold text-primary">{selectedStorage || product?.storage || "128GB"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Selected Colour Finish</th>
                      <td className="fw-bold text-primary">{selectedColor || product?.color || "Midnight"}</td>
                    </tr>

                    {/* Dynamic Specifications Key-Value Rows from MongoDB */}
                    {dynamicSpecs.map(([specKey, specVal]) => {
                      const label = SPEC_KEY_LABELS[specKey] || specKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <tr key={specKey}>
                          <th className="bg-light">{label}</th>
                          <td>{String(specVal)}</td>
                        </tr>
                      );
                    })}

                    <tr>
                      <th className="bg-light">SIM Compatibility</th>
                      <td>{selectedSim || "Single Physical SIM + eSIM"}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">Seller Warranty Guarantee</th>
                      <td>12 Months Full Hardware & Battery Replacement Warranty</td>
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

          {/* Tab 4: MongoDB Customer Reviews */}
          {activeTab === "reviews" && (
            <div>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 p-4 bg-light rounded-4 border">
                <div>
                  <div className="display-5 fw-extrabold text-primary mb-1">
                    {currentRating} <span className="fs-5 text-muted fw-normal">out of 5</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-warning mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill={s <= Math.round(currentRating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <div className="small text-muted">
                    Based on {currentReviewCount} verified customer reviews
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  {showReviewForm ? "Cancel Review" : "Write a Review"}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-light border rounded-4 p-4 mb-4 shadow-xs">
                  <h5 className="fw-bold text-primary mb-3">Write Your Device Review</h5>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. John D."
                        value={newReview.userName}
                        onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-dark">Star Rating</label>
                      <select
                        className="form-select"
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 - Average)</option>
                        <option value={2}>⭐⭐ (2 - Below Expectation)</option>
                        <option value={1}>⭐ (1 - Poor)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Review Details</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Share your experience with phone condition, battery life, and delivery..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between">
                    {reviewFormMessage ? (
                      <span className="small fw-semibold text-danger">{reviewFormMessage}</span>
                    ) : <span />}

                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 fw-bold"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="d-flex flex-column gap-3">
                {reviewsList.length > 0 ? (
                  reviewsList.map((rev, idx) => (
                    <div key={rev._id || idx} className="p-3.5 border rounded-3 bg-white shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark">{rev.userName}</span>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-0.5 small">
                            Verified Buyer
                          </span>
                        </div>
                        <span className="small text-muted">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-GB") : "Recently"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-1 text-warning mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= (rev.rating || 5) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <p className="small text-secondary mb-0">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-light rounded-3 border">
                    <p className="text-muted small mb-0">No customer reviews yet. Be the first to leave a review!</p>
                  </div>
                )}
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
