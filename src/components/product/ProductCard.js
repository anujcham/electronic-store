"use client";

import { memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star, Flame } from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { Badge, Button } from "../ui";

export const ProductCard = memo(function ProductCard({ product, onWishlistClick, onAddToCart }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const isSaved = isWishlisted(product);

  const imageUrl = product?.images?.[0] || product?.image || "https://placehold.co/800x800/EEF2F7/0F172A?text=Product";

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
      color: product?.availableColors?.[0] || product?.color,
      price: product?.price,
      originalPrice: product?.originalPrice,
      stock: product?.stock,
      warrantyMonths: product?.warrantyMonths,
      deliveryRange: product?.deliveryRange,
      shippingIncluded: product?.shippingIncluded,
    });
  };

  const handleCardClick = () => {
    if (product?.slug) {
      router.push(`/product/${product.slug}`);
    }
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
      <div className="position-relative bg-light">
        <div className="position-relative" style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
          <Image
            src={imageUrl}
            alt={product?.name || "Product image"}
            fill
            sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 25vw"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>

        <button
          type="button"
          className="btn btn-light btn-sm position-absolute top-0 end-0 m-2.5 rounded-circle d-flex align-items-center justify-content-center p-2 shadow-sm border"
          style={{ width: "2.35rem", height: "2.35rem" }}
          onClick={handleWishlistClick}
          aria-label={product?.name ? `Add ${product.name} to wishlist` : "Add item to wishlist"}
          suppressHydrationWarning
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-danger" : "text-primary"} />
        </button>

        {product?.isHotDeal ? (
          <div className="position-absolute bottom-0 start-0 m-2.5">
            <span
              className="badge bg-danger text-white fw-bold d-inline-flex align-items-center gap-1 shadow-sm px-2.5 py-1.5 rounded-pill"
              style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
            >
              <Flame size={12} className="text-warning" />
              <span>Hot Deal</span>
            </span>
          </div>
        ) : product?.featured ? (
          <div className="position-absolute bottom-0 start-0 m-2.5">
            <Badge variant="success">Featured</Badge>
          </div>
        ) : null}
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

        <div className="d-flex align-items-center gap-1.5">
          <div className="d-flex align-items-center gap-1 text-warning">
            <Star size={13} fill="currentColor" />
            <span className="small fw-bold text-dark" style={{ fontSize: "0.82rem" }}>
              {product?.rating || "0.0"}
            </span>
          </div>
          <span className="text-muted" style={{ fontSize: "0.76rem" }}>
            ({product?.reviewCount || 0})
          </span>
        </div>

        <div className="d-flex align-items-end justify-content-between gap-2 mt-auto pt-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-primary mb-0" style={{ fontSize: "1.2rem" }}>
                £{product?.price ?? 0}
              </span>
              {product?.originalPrice && product.originalPrice > product.price ? (
                <span className="text-muted small text-decoration-line-through">
                  £{product.originalPrice}
                </span>
              ) : null}
            </div>

            {product?.originalPrice && product.originalPrice > product.price ? (
              <div className="small text-success fw-bold mt-0.5" style={{ fontSize: "0.74rem" }}>
                Save {product.discountPercentage || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            ) : null}
          </div>
        </div>

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
      </div>
    </article>
  );
});
