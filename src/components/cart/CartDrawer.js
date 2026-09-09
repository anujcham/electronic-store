"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { useCart } from "../../features/cart/useCart";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isCartDrawerOpen,
    closeCartDrawer,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();

  const FREE_SHIPPING_THRESHOLD = 50;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Close drawer on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="cart-drawer-wrapper">
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{
          zIndex: 1060,
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />

      {/* Slide-Over Off-Canvas Panel */}
      <aside
        className="position-fixed top-0 end-0 h-100 bg-white d-flex flex-column shadow-lg"
        style={{
          width: "100%",
          maxWidth: "450px",
          zIndex: 1070,
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        aria-label="Shopping Cart Drawer"
      >
        {/* Drawer Header */}
        <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold fs-6">Your Shopping Cart</h5>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                {itemCount} {itemCount === 1 ? "item" : "items"} selected
              </small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 border-0"
            onClick={closeCartDrawer}
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-light px-3 py-2.5 border-bottom">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small fw-semibold text-dark d-flex align-items-center gap-1.5" style={{ fontSize: "0.8rem" }}>
              <Truck size={15} className="text-primary" />
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-success fw-bold">Free Express Delivery Unlocked!</span>
              ) : (
                <span>
                  Add <strong className="text-primary">£{amountNeeded.toFixed(2)}</strong> for Free Delivery
                </span>
              )}
            </span>
            <span className="small text-muted fw-medium" style={{ fontSize: "0.75rem" }}>
              {Math.round(shippingProgress)}%
            </span>
          </div>
          <div className="progress" style={{ height: "6px" }}>
            <div
              className={`progress-bar rounded-pill ${
                subtotal >= FREE_SHIPPING_THRESHOLD ? "bg-success" : "bg-primary"
              }`}
              role="progressbar"
              style={{ width: `${shippingProgress}%` }}
              aria-valuenow={shippingProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>

        {/* Items List / Empty State */}
        {items.length === 0 ? (
          <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 text-center">
            <div
              className="bg-light text-muted rounded-circle d-flex align-items-center justify-content-center mb-3"
              style={{ width: "70px", height: "70px" }}
            >
              <ShoppingBag size={32} />
            </div>
            <h6 className="fw-bold text-dark mb-1">Your cart is currently empty</h6>
            <p className="text-muted small mb-4" style={{ maxWidth: "260px" }}>
              Explore our range of certified refurbished phones with 12-month warranties.
            </p>
            <Link
              href="/shop"
              className="btn btn-primary btn-sm px-4 py-2 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
              onClick={closeCartDrawer}
            >
              <Sparkles size={15} /> Browse Deals
            </Link>
          </div>
        ) : (
          <div className="flex-grow-1 overflow-y-auto p-3" style={{ scrollbarWidth: "thin" }}>
            <div className="d-flex flex-column gap-3">
              {items.map((item) => (
                <div
                  key={item.itemKey}
                  className="card border rounded-3 p-2.5 shadow-sm hover-shadow transition-all"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div className="d-flex gap-3">
                    {/* Thumbnail Image */}
                    <div
                      className="position-relative flex-shrink-0 bg-light rounded-2 border d-flex align-items-center justify-content-center p-1"
                      style={{ width: "72px", height: "72px" }}
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name || "Product"}
                          fill
                          className="object-fit-contain p-1"
                          sizes="72px"
                        />
                      ) : (
                        <span style={{ fontSize: "1.8rem" }}>📱</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-start justify-content-between gap-1 mb-1">
                        <h6 className="fw-bold text-dark text-truncate mb-0 fs-6" style={{ fontSize: "0.9rem" }}>
                          {item.name}
                        </h6>
                        <button
                          type="button"
                          className="btn btn-link text-muted p-0 ms-1 border-0 hover-danger"
                          onClick={() => removeItem(item.itemKey)}
                          title="Remove item"
                        >
                          <Trash2 size={15} className="text-secondary opacity-75" />
                        </button>
                      </div>

                      {/* Variant Badges (Condition, Storage, Color) */}
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {item.condition && (
                          <span
                            className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-1.5 py-0.5"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {item.condition}
                          </span>
                        )}
                        {item.storage && (
                          <span
                            className="badge bg-light text-dark border px-1.5 py-0.5"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {item.storage}
                          </span>
                        )}
                        {item.color && (
                          <span
                            className="badge bg-light text-secondary border px-1.5 py-0.5"
                            style={{ fontSize: "0.68rem" }}
                          >
                            {item.color}
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper Controls & Item Pricing */}
                      <div className="d-flex align-items-center justify-content-between mt-auto">
                        <div className="input-group input-group-sm" style={{ width: "96px" }}>
                          <button
                            type="button"
                            className="btn btn-outline-secondary p-1 border rounded-start-pill"
                            onClick={() => decreaseQuantity(item.itemKey)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="form-control text-center px-1 fw-bold bg-light border-start-0 border-end-0" style={{ fontSize: "0.8rem" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary p-1 border rounded-end-pill"
                            onClick={() => increaseQuantity(item.itemKey)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-end">
                          <div className="fw-extrabold text-primary" style={{ fontSize: "0.95rem" }}>
                            £{(item.price * item.quantity).toFixed(2)}
                          </div>
                          {item.originalPrice > item.price && (
                            <small className="text-muted text-decoration-line-through d-block" style={{ fontSize: "0.72rem" }}>
                              £{(item.originalPrice * item.quantity).toFixed(2)}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Seller Assurance Banner */}
            <div className="mt-3 bg-light rounded-3 p-2.5 border d-flex align-items-center justify-content-around text-muted small" style={{ fontSize: "0.75rem" }}>
              <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                <ShieldCheck size={14} className="text-success" /> 12-Mo Warranty
              </span>
              <span>•</span>
              <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                <Truck size={14} className="text-primary" /> Tracked Dispatch
              </span>
            </div>
          </div>
        )}

        {/* Drawer Footer (Subtotal, CTA & Trust Badges) */}
        {items.length > 0 && (
          <div className="p-3 border-top bg-white shadow-lg">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="text-muted small">Subtotal</span>
              <span className="fw-bold text-dark fs-6">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small d-flex align-items-center gap-1">
                Estimated Shipping
              </span>
              <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? "FREE" : "£4.99"}
              </span>
            </div>

            {/* Main Action Buttons */}
            <div className="d-flex flex-column gap-2 mb-3">
              <Link
                href="/checkout"
                className="btn btn-primary btn-lg w-100 fw-bold py-2.5 shadow-sm d-flex align-items-center justify-content-center gap-2 rounded-3"
                onClick={closeCartDrawer}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/cart"
                className="btn btn-outline-secondary btn-sm w-100 fw-semibold py-2 rounded-3 text-center"
                onClick={closeCartDrawer}
              >
                View Full Shopping Cart
              </Link>
            </div>

            {/* Trust Assurances */}
            <div className="pt-2 border-top text-center">
              <div className="d-flex align-items-center justify-content-center gap-3 text-muted" style={{ fontSize: "0.72rem" }}>
                <span className="d-flex align-items-center gap-1">
                  <Lock size={12} className="text-success" /> SSL 256-Bit Encrypted
                </span>
                <span>•</span>
                <span>14-Day Money Back</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Keyframe animation for slide in */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

