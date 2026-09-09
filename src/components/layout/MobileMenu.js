"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CircleUserRound, Heart, Menu, ShoppingCart, X } from "lucide-react";

import { Badge, Button } from "../ui";
import { Logo } from "../common/Logo";

export function MobileMenu({
  isOpen,
  onClose,
  navItems,
  categories,
  wishlistCount,
  cartCount,
  brandName = "ElectroVault",
}) {
  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" style={{ zIndex: 1050 }}>
      {/* Backdrop with Blur */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease-in-out",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Aligned Smooth Slide-In Sidebar Panel */}
      <aside
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg p-3 overflow-auto d-flex flex-column"
        style={{
          width: "85%",
          maxWidth: "360px",
          zIndex: 1060,
          animation: "slideInRightNav 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
          <Logo theme="dark" size="sm" href="/" />

          <button
            type="button"
            className="btn btn-link p-0 text-primary"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Mobile navigation" className="mb-4">
          <ul className="list-unstyled d-flex flex-column gap-1 m-0">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="d-flex align-items-center justify-content-between text-decoration-none text-dark fw-semibold px-3 py-2.5 rounded-3 hover-bg-light border-bottom border-light"
                  onClick={onClose}
                >
                  <span className="d-flex align-items-center gap-2">
                    {item.label}
                  </span>
                  {item.isExternal ? <ArrowUpRight size={16} /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Shop Brands & Categories */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <span className="fw-bold text-primary small text-uppercase" style={{ letterSpacing: "0.05em" }}>
              Explore By Brand
            </span>
          </div>
          <div className="d-flex flex-column gap-1.5">
            {categories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="text-decoration-none text-dark small fw-medium px-3 py-2 rounded-3 border bg-light d-flex align-items-center justify-content-between hover-border-primary"
                onClick={onClose}
              >
                <span>{category.label}</span>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>View →</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-grid gap-2 mt-auto">
          <Link
            href="/wishlist"
            className="btn btn-outline-primary w-100 justify-content-center"
            onClick={onClose}
            aria-label="Open wishlist"
          >
            <span className="d-flex align-items-center gap-2">
              <Heart size={16} />
              <span>Wishlist</span>
            </span>
            {wishlistCount > 0 ? (
              <Badge variant="primary" className="ms-2">
                {wishlistCount}
              </Badge>
            ) : null}
          </Link>

          <Link
            href="/cart"
            className="btn btn-primary w-100 justify-content-center"
            onClick={onClose}
            aria-label="Open cart"
          >
            <span className="d-flex align-items-center gap-2">
              <ShoppingCart size={16} />
              <span>Cart</span>
            </span>
            {cartCount > 0 ? (
              <Badge variant="secondary" className="ms-2">
                {cartCount}
              </Badge>
            ) : null}
          </Link>

          <Link
            href="/account"
            className="btn btn-light w-100 justify-content-center"
            onClick={onClose}
            aria-label="Open account"
          >
            <span className="d-flex align-items-center gap-2">
              <CircleUserRound size={16} />
              <span>Account</span>
            </span>
          </Link>
        </div>
      </aside>

      {/* Keyframe Animation for Right Slide-In */}
      <style jsx global>{`
        @keyframes slideInRightNav {
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
