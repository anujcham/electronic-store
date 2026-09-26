"use client";

import { memo, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Flame, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { Badge, Button } from "../ui";

// Color dot mapping helper
const getColorHex = (colorName) => {
  if (!colorName) return "#64748b";
  const name = colorName.toLowerCase();
  if (name.includes("black") || name.includes("midnight") || name.includes("graphite") || name.includes("dark") || name.includes("onyx")) return "#0f172a";
  if (name.includes("white") || name.includes("starlight") || name.includes("silver") || name.includes("porcelain") || name.includes("pearl")) return "#f8fafc";
  if (name.includes("blue") || name.includes("bay") || name.includes("pacific") || name.includes("sierra") || name.includes("titanium blue")) return "#3b82f6";
  if (name.includes("green") || name.includes("emerald") || name.includes("mint") || name.includes("alpine") || name.includes("olive")) return "#10b981";
  if (name.includes("red") || name.includes("product(red)")) return "#ef4444";
  if (name.includes("purple") || name.includes("lavender") || name.includes("violet") || name.includes("deep purple")) return "#a855f7";
  if (name.includes("gold") || name.includes("beige") || name.includes("yellow") || name.includes("champagne") || name.includes("desert")) return "#f59e0b";
  if (name.includes("pink") || name.includes("rose")) return "#ec4899";
  if (name.includes("titanium natural") || name.includes("natural titanium")) return "#9ca3af";
  if (name.includes("gray") || name.includes("grey") || name.includes("space") || name.includes("titanium")) return "#64748b";
  return "#94a3b8";
};

export const ProductCard = memo(function ProductCard({ product, onWishlistClick, onAddToCart }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const isSaved = isWishlisted(product);

  // Derive available colors with their hex code and dedicated preview photos array
  const colorsList = useMemo(() => {
    // 1. If admin added structured colorVariants with separate photos & hex codes
    if (Array.isArray(product?.colorVariants) && product.colorVariants.length > 0) {
      return product.colorVariants.map((c, idx) => {
        const variantImages =
          Array.isArray(c.images) && c.images.length > 0
            ? c.images.filter(Boolean)
            : [product?.images?.[idx] || product?.images?.[0] || product?.image].filter(Boolean);

        return {
          name: c.colorName || `Color ${idx + 1}`,
          hex: c.hexCode || getColorHex(c.colorName),
          images: variantImages.length > 0 ? variantImages : ["https://placehold.co/800x800/EEF2F7/0F172A?text=Product"],
        };
      });
    }

    // 2. If product has availableColors array
    if (Array.isArray(product?.availableColors) && product.availableColors.length > 0) {
      const allImgs =
        Array.isArray(product?.images) && product.images.length > 0
          ? product.images.filter(Boolean)
          : [product?.image].filter(Boolean);

      return product.availableColors.map((colName) => ({
        name: colName,
        hex: getColorHex(colName),
        images: allImgs.length > 0 ? allImgs : ["https://placehold.co/800x800/EEF2F7/0F172A?text=Product"],
      }));
    }

    // 3. Single default color
    const fallbackImgs =
      Array.isArray(product?.images) && product.images.length > 0
        ? product.images.filter(Boolean)
        : [product?.image].filter(Boolean);

    if (product?.color || fallbackImgs.length > 0) {
      return [
        {
          name: product?.color || "Standard",
          hex: getColorHex(product?.color || "Standard"),
          images: fallbackImgs.length > 0 ? fallbackImgs : ["https://placehold.co/800x800/EEF2F7/0F172A?text=Product"],
        },
      ];
    }

    return [];
  }, [product]);

  const [selectedColor, setSelectedColor] = useState(colorsList[0]?.name || product?.color || "");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Synchronize when product or color options change
  useEffect(() => {
    setSelectedColor(colorsList[0]?.name || product?.color || "");
    setActiveImageIndex(0);
  }, [product, colorsList]);

  // Find active color object
  const activeColorObj = useMemo(() => {
    if (!colorsList.length) return null;
    return (
      colorsList.find(
        (c) => (c.name || "").toLowerCase().trim() === (selectedColor || "").toLowerCase().trim()
      ) || colorsList[0]
    );
  }, [colorsList, selectedColor]);

  // Available images for currently selected color
  const currentImages = useMemo(() => {
    if (activeColorObj?.images && activeColorObj.images.length > 0) {
      return activeColorObj.images;
    }
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    return [product?.image || "https://placehold.co/800x800/EEF2F7/0F172A?text=Product"];
  }, [activeColorObj, product]);

  const displayedImage = currentImages[activeImageIndex] || currentImages[0];

  const handleColorClick = (event, colorItem) => {
    event.stopPropagation();
    setSelectedColor(colorItem.name);
    setActiveImageIndex(0); // Reset to first photo of newly selected color
  };

  const handlePrevImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : currentImages.length - 1));
  };

  const handleNextImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev < currentImages.length - 1 ? prev + 1 : 0));
  };

  // Calculate minimum price from variant inventory matrix or base product
  const { minPrice, minOriginalPrice, hasVariants } = useMemo(() => {
    // 1. If product has variantPricing matrix configured
    if (Array.isArray(product?.variantPricing) && product.variantPricing.length > 0) {
      const validVariants = product.variantPricing.filter((v) => Number(v.price) > 0);
      const inStockVariants = validVariants.filter((v) => Number(v.stock) > 0);
      const pool = inStockVariants.length > 0 ? inStockVariants : validVariants;

      if (pool.length > 0) {
        const sorted = [...pool].sort((a, b) => Number(a.price) - Number(b.price));
        const cheapest = sorted[0];
        return {
          minPrice: Number(cheapest.price),
          minOriginalPrice: Number(cheapest.originalPrice || cheapest.price),
          hasVariants: product.variantPricing.length > 1,
        };
      }
    }

    // 2. Base pricing fallback
    const basePrice = Number(product?.price ?? 0);
    const baseOrig = Number(product?.originalPrice ?? basePrice);
    const hasMultipleOptions =
      (Array.isArray(product?.availableStorage) && product.availableStorage.length > 1) ||
      (Array.isArray(product?.conditionOptions) && product.conditionOptions.length > 1) ||
      (Array.isArray(product?.colorVariants) && product.colorVariants.length > 1) ||
      (Array.isArray(product?.availableColors) && product.availableColors.length > 1);

    return {
      minPrice: basePrice,
      minOriginalPrice: baseOrig,
      hasVariants: hasMultipleOptions,
    };
  }, [product]);

  const isOutOfStock = useMemo(() => {
    if (product?.isAvailable === false) return true;
    if (product?.stock !== undefined && Number(product.stock) <= 0) return true;
    if (Array.isArray(product?.variantPricing) && product.variantPricing.length > 0) {
      return !product.variantPricing.some((v) => Number(v.stock) > 0);
    }
    return Number(product?.stock ?? 1) <= 0;
  }, [product]);

  const handleWishlistClick = (event) => {
    event.stopPropagation();
    if (onWishlistClick) {
      onWishlistClick(product);
    } else {
      toggleWishlist(product);
    }
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    addItem(product, {
      condition: product?.condition,
      storage: product?.availableStorage?.[0] || product?.storage,
      color: selectedColor || product?.availableColors?.[0] || product?.color,
      image: displayedImage,
      price: minPrice,
      originalPrice: minOriginalPrice,
      stock: product?.stock,
      warrantyMonths: product?.warrantyMonths,
      deliveryRange: product?.deliveryRange,
      shippingIncluded: product?.shippingIncluded,
    });
  };

  const handleCardClick = () => {
    if (product?.slug) {
      const colorQuery = selectedColor ? `?color=${encodeURIComponent(selectedColor)}` : "";
      router.push(`/product/${product.slug}${colorQuery}`);
    }
  };

  const handleSelectOptions = (event) => {
    event.stopPropagation();
    handleCardClick();
  };

  return (
    <article
      className="card h-100 border rounded-4 shadow-sm overflow-hidden bg-white transition-all"
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && product?.slug) {
          event.preventDefault();
          handleCardClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={product?.name ? `View product details for ${product.name}` : "View product details"}
    >
      {/* Product Image Area with Multi-Photo Slider */}
      <div className="position-relative bg-light">
        <div className="position-relative" style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
          <Image
            src={displayedImage}
            alt={product?.name ? `${product.name} - ${selectedColor}` : "Product image"}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className="btn btn-light btn-sm position-absolute top-0 end-0 m-2.5 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm border"
          style={{ width: "2.35rem", height: "2.35rem", zIndex: 3 }}
          onClick={handleWishlistClick}
          aria-label={product?.name ? `Add ${product.name} to wishlist` : "Add item to wishlist"}
          suppressHydrationWarning
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-danger" : "text-primary"} />
        </button>

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="position-absolute top-0 start-0 m-2.5" style={{ zIndex: 3 }}>
            <span
              className="badge bg-danger text-white fw-bold shadow-sm px-2.5 py-1.5 rounded-pill"
              style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
            >
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges Row (Same row on either sides with space between) */}
        {(product?.isHotDeal || product?.featured) && (
          <div
            className="position-absolute bottom-0 start-0 end-0 p-2.5 d-flex align-items-center justify-content-between pointer-events-none"
            style={{ zIndex: 3 }}
          >
            {/* Left Side Badge */}
            <div>
              {product?.isHotDeal ? (
                <span
                  className="badge bg-danger text-white fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5 rounded-pill pointer-events-auto"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
                >
                  <Flame size={12} className="text-warning" />
                  <span>Hot Deal</span>
                </span>
              ) : product?.featured ? (
                <span
                  className="badge bg-success text-white fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5 rounded-pill pointer-events-auto"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
                >
                  <Star size={12} className="text-warning fill-warning" />
                  <span>Featured</span>
                </span>
              ) : null}
            </div>

            {/* Right Side Badge (Only when both are marked) */}
            <div>
              {product?.isHotDeal && product?.featured ? (
                <span
                  className="badge bg-success text-white fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5 rounded-pill pointer-events-auto"
                  style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
                >
                  <Star size={12} className="text-warning fill-warning" />
                  <span>Featured</span>
                </span>
              ) : null}
            </div>
          </div>
        )}

        {/* Slide Ahead / Back Buttons & Pill Indicators (When selected color has > 1 image) */}
        {currentImages.length > 1 && (
          <>
            {/* Prev Image Button */}
            <button
              type="button"
              className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm border opacity-75 hover-opacity-100"
              style={{
                width: "28px",
                height: "28px",
                zIndex: 3,
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Next Image Button */}
            <button
              type="button"
              className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm border opacity-75 hover-opacity-100"
              style={{
                width: "28px",
                height: "28px",
                zIndex: 3,
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>

            {/* Pill & Dots Indicator (Exact match to modern slide indicator) */}
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x mb-2.5 d-inline-flex align-items-center gap-1.5 px-2 py-1 rounded-pill"
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(4px)",
                zIndex: 3,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentImages.map((_, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    className="border-0 p-0"
                    style={{
                      width: isActive ? "20px" : "6px",
                      height: "6px",
                      borderRadius: isActive ? "3px" : "50%",
                      backgroundColor: isActive ? "#2563eb" : "#ffffff",
                      opacity: isActive ? 1 : 0.8,
                      cursor: "pointer",
                      transition: "all 0.25s ease-in-out",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(idx);
                    }}
                    aria-label={`View photo ${idx + 1}`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="card-body d-flex flex-column gap-2 p-3">
        <div className="d-flex align-items-center justify-content-between gap-1">
          <span className="text-muted small fw-medium" style={{ fontSize: "0.82rem" }}>
            {product?.brand || "Brand"}
          </span>
          {product?.condition ? (
            <span className="badge bg-light text-dark border px-2 py-0.5" style={{ fontSize: "0.72rem" }}>
              {product.condition}
            </span>
          ) : null}
        </div>

        {/* Round Color Swatches */}
        {colorsList.length > 0 && (
          <div
            className="d-flex align-items-center gap-1.5 flex-wrap"
            onClick={(e) => e.stopPropagation()}
            style={{ minHeight: "22px" }}
          >
            {colorsList.map((col, idx) => {
              const isSelected = (selectedColor || "").toLowerCase().trim() === col.name.toLowerCase().trim();
              return (
                <button
                  key={col.name || idx}
                  type="button"
                  title={col.name}
                  className="rounded-circle border p-0 position-relative transition-all"
                  style={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: col.hex,
                    cursor: "pointer",
                    outline: isSelected ? "2px solid #2563eb" : "1px solid rgba(0,0,0,0.15)",
                    outlineOffset: isSelected ? "2px" : "0px",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.15)" : "none",
                  }}
                  onClick={(e) => handleColorClick(e, col)}
                  aria-label={`Select ${col.name} color`}
                />
              );
            })}
            <span className="text-muted ms-1 small text-truncate" style={{ fontSize: "0.72rem", maxWidth: "120px" }}>
              {selectedColor || colorsList[0]?.name}
            </span>
          </div>
        )}

        <div>
          <h3
            className="fw-bold text-dark mb-1 text-truncate"
            style={{ fontSize: "0.98rem", lineHeight: 1.35 }}
            title={product?.name}
          >
            {product?.name || "Product name"}
          </h3>
          <p className="text-muted small mb-0 text-truncate" style={{ fontSize: "0.8rem" }}>
            {product?.shortDescription || "Certified refurbished handset."}
          </p>
        </div>

        {/* Price on Left & Rating on Right in same row */}
        <div className="d-flex align-items-center justify-content-between gap-2 mt-auto pt-2">
          <div>
            <div className="d-flex align-items-baseline gap-1.5 flex-wrap">
              <span className="fw-extrabold text-primary mb-0" style={{ fontSize: "1.18rem" }}>
                £{minPrice}
              </span>
              {hasVariants ? (
                <span className="text-muted small fw-medium" style={{ fontSize: "0.78rem" }}>
                  onwards
                </span>
              ) : (
                minOriginalPrice > minPrice && (
                  <span className="text-muted small text-decoration-line-through ms-0.5" style={{ fontSize: "0.78rem" }}>
                    £{minOriginalPrice}
                  </span>
                )
              )}
            </div>

            {!hasVariants && minOriginalPrice > minPrice && (
              <div className="small text-success fw-bold" style={{ fontSize: "0.74rem" }}>
                Save {Math.round(((minOriginalPrice - minPrice) / minOriginalPrice) * 100)}%
              </div>
            )}
          </div>

          {product?.reviewCount > 0 && product?.rating > 0 ? (
            <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-pill border border-light-subtle flex-shrink-0">
              <div className="d-flex align-items-center gap-1 text-warning">
                <Star size={12} fill="currentColor" />
                <span className="small fw-bold text-dark" style={{ fontSize: "0.78rem" }}>
                  {Number(product.rating).toFixed(1)}
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                ({product.reviewCount})
              </span>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-pill border border-light-subtle flex-shrink-0">
              <Star size={12} className="text-muted" />
              <span className="text-muted fw-medium" style={{ fontSize: "0.72rem" }}>
                No reviews
              </span>
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <Button
            variant="secondary"
            className="w-100 mt-2 py-2 rounded-3 fw-bold opacity-75 d-flex align-items-center justify-content-center gap-1.5"
            size="sm"
            style={{ fontSize: "0.85rem", cursor: "not-allowed" }}
            disabled
          >
            Out of Stock
          </Button>
        ) : hasVariants ? (
          <Button
            variant="primary"
            className="w-100 mt-2 py-2 rounded-3 fw-bold shadow-xs d-flex align-items-center justify-content-center gap-1.5"
            size="sm"
            style={{ fontSize: "0.85rem" }}
            endIcon={<ArrowRight size={15} />}
            onClick={handleSelectOptions}
          >
            Select Options
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-100 mt-2 py-2 rounded-3 fw-bold shadow-xs d-flex align-items-center justify-content-center gap-1.5"
            size="sm"
            style={{ fontSize: "0.85rem" }}
            startIcon={<ShoppingCart size={15} />}
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        )}
      </div>
    </article>
  );
});
