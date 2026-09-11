"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Loader2,
  ArrowRight,
} from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { useDebounce } from "../../hooks/useDebounce";
import { apiGet } from "../../services/apiClient";
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
      { label: "iPhone 14 Series", desc: "iPhone 14, 14 Pro, 14 Pro Max", href: "/shop?brand=Apple&search=14" },
      { label: "iPhone 13 Series", desc: "iPhone 13, 13 Mini, 13 Pro", href: "/shop?brand=Apple&search=13" },
      { label: "iPhone 12 & SE", desc: "iPhone 12, SE 3rd Gen", href: "/shop?brand=Apple&search=12" },
      { label: "View All iPhones", desc: "Full collection of pre-owned Apple handsets", href: "/shop?brand=Apple" },
    ],
  },
  "Samsung": {
    brand: "Samsung",
    items: [
      { label: "Galaxy S24 Series", desc: "S24 Ultra, S24+, S24", href: "/shop?brand=Samsung&search=S24" },
      { label: "Galaxy S23 Series", desc: "S23 Ultra, S23+, S23", href: "/shop?brand=Samsung&search=S23" },
      { label: "Galaxy S22 Series", desc: "S22 Ultra, S22+, S22", href: "/shop?brand=Samsung&search=S22" },
      { label: "Galaxy Z Fold & Flip", desc: "Foldable Z Fold 5 & Z Flip 5", href: "/shop?brand=Samsung&search=Fold" },
      { label: "View All Samsung", desc: "Full collection of Samsung smartphones", href: "/shop?brand=Samsung" },
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
      { label: "OnePlus 12 Series", desc: "Flagship 12 & Snapdragon 8 Gen 3", href: "/shop?brand=OnePlus&search=12" },
      { label: "OnePlus 11 / 11R", desc: "Fast charge 11 & 11R series", href: "/shop?brand=OnePlus&search=11" },
      { label: "OnePlus Nord Series", desc: "Nord 3 & Budget models", href: "/shop?brand=OnePlus&search=Nord" },
      { label: "View All OnePlus", desc: "Full OnePlus phone collection", href: "/shop?brand=OnePlus" },
    ],
  },
  "Xiaomi": {
    brand: "Xiaomi",
    items: [
      { label: "Xiaomi 13 / 13 Pro", desc: "Leica Camera & Snapdragon 8 Gen 2", href: "/shop?brand=Xiaomi&search=13" },
      { label: "Poco F & X Series", desc: "Gaming & High-performance", href: "/shop?brand=Xiaomi&search=Poco" },
      { label: "Redmi Note Series", desc: "Redmi Note 12 & 11", href: "/shop?brand=Xiaomi&search=Redmi" },
      { label: "View All Xiaomi", desc: "Full Xiaomi smartphone catalog", href: "/shop?brand=Xiaomi" },
    ],
  },
  "Other Brands": {
    brand: "Other",
    items: [
      { label: "Nothing Phone Series", desc: "Nothing Phone (2) & (1) Glyph LEDs", href: "/shop?search=Nothing" },
      { label: "Motorola Edge & Razr", desc: "Edge 40 Pro & Foldables", href: "/shop?search=Motorola" },
      { label: "Sony Xperia Series", desc: "Xperia 1 V & 5 V", href: "/shop?search=Sony" },
      { label: "View All Refurbished Phones", desc: "Browse full phone catalog", href: "/shop" },
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
  wishlistCount: propWishlistCount,
  navItems = defaultNavItems,
  categories = defaultCategories,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount: contextWishlistCount } = useWishlist();
  const wishlistCount = propWishlistCount !== undefined ? propWishlistCount : contextWishlistCount;

  // 300ms Debounce for live search API queries
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const syncUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);

      const hasAdminRole = user?.role === "admin";
      const hasAdminSession =
        typeof window !== "undefined" &&
        (window.sessionStorage.getItem("electroVault.adminSession") === "authenticated" ||
          window.localStorage.getItem("electroVault.adminSession") === "authenticated");

      setIsAdminSession(hasAdminRole || hasAdminSession);
    };

    syncUser();

    window.addEventListener("electroVault-user-changed", syncUser);
    window.addEventListener("electroVault-admin-changed", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("electroVault-user-changed", syncUser);
      window.removeEventListener("electroVault-admin-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  // Fetch live search results when debounced query changes
  useEffect(() => {
    async function performSearch() {
      const query = debouncedSearchQuery.trim();
      if (query.length < 2) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowSearchDropdown(true);

      try {
        const res = await apiGet(`/products?search=${encodeURIComponent(query)}`);
        if (res?.success && Array.isArray(res.products)) {
          setSearchResults(res.products.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Live search API error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery]);

  // Click outside to close search popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
      setShowSearchDropdown(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSearchResult = (slug) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    router.push(`/product/${slug}`);
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
                suppressHydrationWarning
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
              {/* Live Debounced Search Bar */}
              <div ref={searchContainerRef} className="position-relative d-none d-md-block me-2">
                <form onSubmit={handleSearchSubmit} className="d-flex align-items-center">
                  <div className="input-group input-group-sm" style={{ width: "260px" }}>
                    <input
                      type="search"
                      className="form-control bg-light border-end-0 rounded-start-pill ps-3"
                      placeholder="Search phones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-outline-secondary border-start-0 rounded-end-pill px-3"
                      aria-label="Search"
                      suppressHydrationWarning
                    >
                      {isSearching ? (
                        <Loader2 size={14} className="spinner-border spinner-border-sm p-0 border-2" />
                      ) : (
                        <Search size={14} />
                      )}
                    </button>
                  </div>
                </form>

                {/* Instant Search Results Autocomplete Dropdown Popover */}
                {showSearchDropdown && (
                  <div
                    className="position-absolute start-0 top-100 bg-white border rounded-4 shadow-lg mt-2 overflow-hidden"
                    style={{
                      width: "340px",
                      zIndex: 1060,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                      <span className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.7rem" }}>
                        Matching Products ({searchResults.length})
                      </span>
                      {isSearching && <span className="spinner-border spinner-border-sm text-primary" style={{ width: "12px", height: "12px" }} />}
                    </div>

                    <div className="p-1">
                      {isSearching && searchResults.length === 0 ? (
                        <div className="p-3 text-center text-muted small">
                          Searching live catalog...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-muted small">
                          No phones matching "<strong>{searchQuery}</strong>" found.
                        </div>
                      ) : (
                        searchResults.map((product) => (
                          <div
                            key={product._id || product.slug}
                            className="p-2 rounded-3 hover-bg-light cursor-pointer transition-all d-flex align-items-center gap-2.5 border-bottom border-light"
                            onClick={() => handleSelectSearchResult(product.slug)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="position-relative border rounded-2 overflow-hidden flex-shrink-0 bg-white" style={{ width: "42px", height: "42px" }}>
                              <Image
                                src={product.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone"}
                                alt={product.name}
                                fill
                                sizes="42px"
                                style={{ objectFit: "cover" }}
                                unoptimized
                              />
                            </div>

                            <div className="flex-fill overflow-hidden">
                              <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                                {product.name}
                              </div>
                              <div className="d-flex align-items-center gap-1.5 small text-muted" style={{ fontSize: "0.72rem" }}>
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span className="text-primary fw-semibold">£{product.price}</span>
                                {product.condition && (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-1 py-0" style={{ fontSize: "0.62rem" }}>
                                    {product.condition}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {searchQuery.trim().length >= 2 && (
                      <div className="bg-light p-2 text-center border-top">
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-primary fw-bold text-decoration-none p-0 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: "0.78rem" }}
                          onClick={handleSearchSubmit}
                          suppressHydrationWarning
                        >
                          <span>View all results for "{searchQuery}"</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Account Button (Triggers AuthModal if logged out) */}
              <button
                type="button"
                className="btn btn-outline-light text-dark p-2 border-0 rounded-3 d-flex align-items-center gap-2"
                onClick={handleAccountClick}
                title={currentUser ? `Account (${currentUser.name})` : "Log In / Register"}
                suppressHydrationWarning
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

              {/* Admin Portal Shortcut (Visible when logged in as Admin or Staff Passkey authenticated) */}
              {isAdminSession && (
                <Link
                  href="/admin"
                  className="btn btn-warning text-dark btn-sm fw-bold rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1 shadow-xs border border-warning ms-1"
                  title="Admin Store Operations Portal"
                >
                  <ShieldCheck size={14} />
                  <span className="d-none d-md-inline" style={{ fontSize: "0.75rem" }}>Admin Portal</span>
                </Link>
              )}

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
                suppressHydrationWarning
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
