"use client";

import { memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { Badge, Button } from "../ui";

export const ProductCard = memo(function ProductCard({ product, onWishlistClick, onAddToCart }) {
  const router = useRouter();
  const { addItem } = useCart();
  const imageUrl = product?.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Product";

  const handleWishlistClick = (event) => {
    event.stopPropagation();

    if (onWishlistClick) {
      onWishlistClick(product);
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
      className="card h-100 border-0 shadow-sm overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        transition: "transform var(--transition-fast), box-shadow var(--transition-normal)",
        cursor: "pointer",
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
      <div className="position-relative">
        <div className="position-relative" style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
          <Image
            src={imageUrl}
            alt={product?.name || "Product image"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>

        <button
          type="button"
          className="btn btn-light btn-sm position-absolute top-0 end-0 m-3 rounded-circle d-flex align-items-center justify-content-center p-2"
          style={{ width: "2.5rem", height: "2.5rem" }}
          onClick={handleWishlistClick}
          aria-label={product?.name ? `Add ${product.name} to wishlist` : "Add item to wishlist"}
          suppressHydrationWarning
        >
          <Heart size={16} className="text-primary" />
        </button>

        {product?.featured ? (
          <div className="position-absolute bottom-0 start-0 m-3">
            <Badge variant="success">Featured</Badge>
          </div>
        ) : null}
      </div>

      <div className="card-body d-flex flex-column gap-3 p-3">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span className="text-muted small fw-medium">{product?.brand || "Brand"}</span>
          {product?.condition ? <Badge variant="outline">{product.condition}</Badge> : null}
        </div>

        <div>
          <h3 className="h5 mb-2" style={{ color: "var(--color-primary-text)" }}>
            {product?.name || "Product name"}
          </h3>
          <p className="text-muted small mb-0">
            {product?.shortDescription || "Premium refurbished product from our expert checked range."}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center gap-1 text-warning">
            <Star size={14} fill="currentColor" />
            <span className="small fw-medium text-primary">{product?.rating || "0.0"}</span>
          </div>
          <span className="small text-muted">({product?.reviewCount || 0} reviews)</span>
        </div>

        <div className="d-flex align-items-end justify-content-between gap-2 mt-auto">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="h5 mb-0 text-primary">£{product?.price ?? 0}</span>
              {product?.originalPrice && product.originalPrice > product.price ? (
                <span className="small text-muted text-decoration-line-through">
                  £{product.originalPrice}
                </span>
              ) : null}
            </div>

            {product?.originalPrice && product.originalPrice > product.price ? (
              <div className="small text-success fw-medium mt-1">
                Save {product.discountPercentage || 0}%
              </div>
            ) : null}
          </div>
        </div>

        <Button
          variant="primary"
          className="w-100"
          startIcon={<ShoppingCart size={16} />}
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
});
