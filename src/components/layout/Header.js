"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  CircleUserRound,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  Phone,
  ShieldCheck,
  Truck,
  Sparkles,
  Award,
  ChevronDown,
  Smartphone,
  Check,
} from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { Badge, Container } from "../ui";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "../cart/CartDrawer";
import { AuthModal } from "../modals/AuthModal";
import { getCurrentUser } from "../../services/authService";
import { Logo } from "../common/Logo";

const defaultNavItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Condition Guide", href: "/#info-condition" },
  { label: "Contact", href: "/support" },
];

const categoryDropdownMap = {
  "iPhone": {
    brand: "Apple",
    items: [
      { label: "iPhone 15 Series", desc: "iPhone 15, 15 Pro, 15 Pro Max", href: "/shop?brand=Apple&search=15" },
      { label: "iPhone 14 Series", desc: "iPhone 14, 14 Pro, 14 Plus", href: "/shop?brand=Apple&search=14" },
      { label: "iPhone 13 Series", desc: "iPhone 13, 13 Mini, 13 Pro", href: "/shop?brand=Apple&search=13" },
      { label: "iPhone 12 & Older", desc: "iPhone 12, SE, 11 Series", href: "/shop?brand=Apple&search=12" },
      { label: "View All iPhones", desc: "Full collection of Apple handsets", href: "/shop?brand=Apple" },
    ],
  },
  "Samsung": {
    brand: "Samsung",
    items: [
      { label: "Galaxy S23 Series", desc: "S23 Ultra, S23+, S23", href: "/shop?brand=Samsung&search=S23" },
      { label: "Galaxy S22 Series", desc: "S22 Ultra, S22+, S22", href: "/shop?brand=Samsung&search=S22" },
      { label: "Galaxy Z Fold & Flip", desc: "Foldable & Flip smartphones", href: "/shop?brand=Samsung&search=Fold" },
      { label: "Galaxy Tab & Watches", desc: "Tab S9, Tab S8 & Smartwatches", href: "/shop?brand=Samsung" },
      { label: "View All Samsung", desc: "Full collection of Samsung tech", href: "/shop?brand=Samsung" },
    ],
  },
  "Google Pixel": {
    brand: "Google",
    items: [
      { label: "Pixel 8 & 8 Pro", desc: "AI Camera & Tensor G3", href: "/shop?brand=Google&search=Pixel%208" },
      { label: "Pixel 7 & 7 Pro / 7a", desc: "Pixel 7, 7 Pro & 7a", href: "/shop?brand=Google&search=Pixel%207" },
      { label: "Pixel 6 & 6a", desc: "Great value Google phones", href: "/shop?brand=Google&search=Pixel%206" },
      { label: "View All Pixels", desc: "Explore all Google Pixel models", href: "/shop?brand=Google" },
    ],
  },
  "OnePlus": {
    brand: "OnePlus",
    items: [
      { label: "OnePlus 11 / 11R", desc: "Flagship 11 & 11R series", href: "/shop?brand=OnePlus&search=11" },
      { label: "OnePlus 10 Pro / 10T", desc: "Hasselblad Camera & Fast Charge", href: "/shop?brand=OnePlus&search=10" },
      { label: "OnePlus Nord Series", desc: "Nord 3, Nord CE & Budget", href: "/shop?brand=OnePlus&search=Nord" },
      { label: "View All OnePlus", desc: "Full OnePlus collection", href: "/shop?brand=OnePlus" },
    ],
  },
  "Xiaomi": {
    brand: "Xiaomi",
    items: [
      { label: "Xiaomi 13 / 13 Pro", desc: "Leica Camera & Snapdragon 8 Gen 2", href: "/shop?brand=Xiaomi&search=13" },
      { label: "Poco F & X Series", desc: "Gaming & High-performance", href: "/shop?brand=Xiaomi&search=Poco" },
      { label: "Redmi Note Series", desc: "Redmi Note 12 & 11", href: "/shop?brand=Xiaomi&search=Redmi" },
      { label: "View All Xiaomi", desc: "Full Xiaomi collection", href: "/shop?brand=Xiaomi" },
    ],
  },
  "Other Brands": {
    brand: "Other",
    items: [
      { label: "Motorola Edge & Razr", desc: "Foldables & Edge series", href: "/shop?brand=Motorola" },
      { label: "Sony Xperia & PlayStation", desc: "PS5, Portal & Xperia", href: "/shop?brand=Sony" },
      { label: "Lenovo ThinkPad", desc: "Business Laptops & X1 Carbon", href: "/shop?brand=Lenovo" },
      { label: "ASUS ROG Gaming", desc: "Gaming Laptops & ROG Strix", href: "/shop?brand=ASUS" },
      { label: "View All Store Products", desc: "Browse full product catalog", href: "/shop" },
    ],
  },
};

const defaultCategories = [
  { label: "iPhone", href: "/shop?brand=Apple" },
  { label: "Samsung", href: "/shop?brand=Samsung" },
  { label: "Google Pixel", href: "/shop?brand=Google" },
  { label: "OnePlus", href: "/shop?brand=OnePlus" },
  { label: "Xiaomi", href: "/shop?brand=Xiaomi" },
  { label: "Other Brands", href: "/shop" },
];

export function Header({
  brandName = "Electronic Store",
  wishlistCount = 0,
  navItems = defaultNavItems,
  categories = defaultCategories,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, openCartDrawer } = useCart();

  useEffect(() => {
    const syncUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    syncUser();

    window.addEventListener("electroVault-user-changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("electroVault-user-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleAccountClick = () => {
    if (currentUser) {
      router.push("/account");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isNavActive = (href, hasDropdown) => {
    if (href === "/") return pathname === "/";
    if (hasDropdown) return pathname.startsWith("/shop");
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <header className="sticky-top bg-white shadow-sm" style={{ zIndex: 1040 }}>
      {/* Top Announcement Bar */}
      <div
        className="bg-dark text-white py-1.5 border-bottom border-secondary border-opacity-25"
        style={{ fontSize: "0.8125rem", backgroundColor: "#0f172a" }}
      >
        <Container>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3 text-white-50">
              <span className="d-flex align-items-center gap-1.5 text-white">
                <Truck size={14} className="text-info" /> Free UK Tracked Shipping
              </span>
              <span className="d-none d-md-inline text-white-50">•</span>
              <span className="d-none d-md-flex align-items-center gap-1.5 text-white">
                <ShieldCheck size={14} className="text-success" /> 12-Month Seller Warranty
              </span>
              <span className="d-none d-lg-inline text-white-50">•</span>
              <span className="d-none d-lg-flex align-items-center gap-1.5 text-white">
                <Award size={14} className="text-warning" /> 50-Point Quality Checked
              </span>
            </div>

            <div className="d-none d-sm-flex align-items-center gap-3 text-white-50">
              <a
                href="tel:+442079460912"
                className="text-white-50 text-decoration-none d-flex align-items-center gap-1 hover-white"
              >
                <Phone size={13} className="text-primary" /> +44 (0) 20 7946 0912
              </a>
              <span>•</span>
              <Link href="/support" className="text-white-50 text-decoration-none hover-white">
                Help & Support
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Header Bar */}
      <div className="py-3 border-bottom bg-white">
        <Container>
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Mobile Menu Button & Brand Logo */}
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-light p-2 d-lg-none rounded-3 border"
                onClick={() => setMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <Menu size={22} />
              </button>

              <Logo theme="dark" size="md" href="/" />
            </div>

            {/* Primary Navigation Links */}
            <nav aria-label="Main Navigation" className="d-none d-lg-flex align-items-center gap-1 mx-auto">
              {navItems.map((item) => {
                const active = isNavActive(item.href, false);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-decoration-none px-3 py-2 fw-semibold transition-all ${
                      active ? "text-primary fw-bold" : "text-dark"
                    }`}
                    style={{
                      fontSize: "0.95rem",
                      borderBottom: active ? "3px solid #2563eb" : "3px solid transparent",
                      borderRadius: active ? 0 : "0.375rem",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Search Form & User Actions */}
            <div className="d-flex align-items-center gap-2">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="d-none d-md-flex align-items-center me-2">
                <div className="input-group input-group-sm" style={{ width: "240px" }}>
                  <input
                    type="search"
                    className="form-control bg-light border-end-0 rounded-start-pill ps-3"
                    placeholder="Search phones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-secondary border-start-0 rounded-end-pill px-3">
                    <Search size={14} />
                  </button>
                </div>
              </form>

              {/* Account Button (Triggers AuthModal if logged out) */}
              <button
                type="button"
                className="btn btn-outline-light text-dark p-2 border-0 rounded-3 d-flex align-items-center gap-2"
                onClick={handleAccountClick}
                title={currentUser ? `Account (${currentUser.name})` : "Log In / Register"}
              >
                <div className="position-relative">
                  <CircleUserRound size={22} className="text-primary" />
                  {currentUser && (
                    <span
                      className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                      style={{ width: "8px", height: "8px" }}
                    />
                  )}
                </div>
                <span className="d-none d-xl-inline small fw-medium text-dark">
                  {currentUser ? currentUser.name.split(" ")[0] : "Account"}
                </span>
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="btn btn-outline-light text-dark p-2 border-0 rounded-3 position-relative"
                title="Wishlist"
              >
                <Heart size={22} className="text-primary" />
                {wishlistCount > 0 && (
                  <Badge
                    variant="primary"
                    className="position-absolute top-0 start-100 translate-middle rounded-pill px-1.5 py-0.5"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Link>

              {/* Cart Drawer Trigger Button */}
              <button
                type="button"
                className="btn btn-primary px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm border-0"
                onClick={openCartDrawer}
                title="Shopping Cart"
              >
                <div className="position-relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                      style={{
                        fontSize: "0.6rem",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {itemCount}
                    </Badge>
                  )}
                </div>
                <span className="fw-semibold small d-none d-sm-inline">
                  Cart {itemCount > 0 ? `(${itemCount})` : ""}
                </span>
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Sub-Header Categories Bar with Interactive Category Dropdowns */}
      <div className="bg-light border-bottom py-2 d-none d-lg-block">
        <Container>
          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-4 flex-wrap">
              <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.75rem" }}>
                Phone Categories:
              </span>
              {categories.map((category) => {
                const dropdownData = categoryDropdownMap[category.label];
                const isHovered = hoveredCategory === category.label;

                return (
                  <div
                    key={category.label}
                    className="position-relative py-1"
                    onMouseEnter={() => setHoveredCategory(category.label)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={category.href}
                      className={`text-decoration-none small fw-semibold transition-all d-inline-flex align-items-center gap-1 ${
                        isHovered ? "text-primary" : "text-secondary hover-primary"
                      }`}
                    >
                      <span>{category.label}</span>
                      <ChevronDown
                        size={13}
                        style={{
                          transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                        className={isHovered ? "text-primary" : "text-muted"}
                      />
                    </Link>

                    {/* Interactive Category Dropdown Popover */}
                    {isHovered && dropdownData && (
                      <div
                        className="position-absolute start-0 top-100 bg-white border rounded-4 shadow-lg p-2.5 mt-1"
                        style={{
                          width: "270px",
                          zIndex: 1060,
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div
                          className="small fw-bold text-muted text-uppercase mb-2 px-2"
                          style={{ letterSpacing: "0.05em", fontSize: "0.68rem" }}
                        >
                          {category.label} Models & Series
                        </div>
                        <div className="d-flex flex-column gap-1">
                          {dropdownData.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className="p-2 rounded-3 text-decoration-none hover-bg-light transition-all d-block"
                              onClick={() => setHoveredCategory(null)}
                            >
                              <div className="fw-bold text-dark" style={{ fontSize: "0.82rem" }}>
                                {subItem.label}
                              </div>
                              <div className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {subItem.desc}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Link
              href="/shop"
              className="btn btn-sm btn-primary px-3 py-1.5 rounded-2 fw-semibold d-inline-flex align-items-center gap-1.5"
            >
              <Sparkles size={14} /> Browse Deals
            </Link>
          </div>
        </Container>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        categories={categories}
        wishlistCount={wishlistCount}
        cartCount={itemCount}
        brandName={brandName}
      />

      {/* Interactive Cart Drawer */}
      <CartDrawer />

      {/* Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          router.push("/account");
        }}
      />
    </header>
  );
}

