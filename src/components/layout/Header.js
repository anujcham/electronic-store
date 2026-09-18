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
  Package,
  MapPin,
  KeyRound,
  LogOut,
} from "lucide-react";

import { useCart } from "../../features/cart/useCart";
import { useWishlist } from "../../features/wishlist/useWishlist";
import { useDebounce } from "../../hooks/useDebounce";
import { apiGet } from "../../services/apiClient";
import { products as fallbackProducts } from "../../data/products.js";
import { Badge, Container } from "../ui";
import { MobileMenu } from "./MobileMenu";
import { CartDrawer } from "../cart/CartDrawer";
import { AuthModal } from "../modals/AuthModal";
import { getCurrentUser, logoutUser } from "../../services/authService";
import { Logo } from "../common/Logo";
import { useToast } from "../common/Toast";

const defaultNavItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Condition Guide", href: "/#info-condition" },
  { label: "Contact", href: "/support" },
];

const categoryConfigs = {
  iPhone: {
    brand: "Apple",
    title: "In-Stock iPhone Models",
    allHref: "/shop?brand=Apple",
    filter: (p) => {
      const b = (p.brand || "").toLowerCase();
      const n = (p.name || "").toLowerCase();
      return b === "apple" && (n.includes("iphone") || p.category?.toLowerCase() === "smartphones");
    },
  },
  Samsung: {
    brand: "Samsung",
    title: "In-Stock Samsung Galaxy",
    allHref: "/shop?brand=Samsung",
    filter: (p) => (p.brand || "").toLowerCase() === "samsung",
  },
  "Google Pixel": {
    brand: "Google",
    title: "In-Stock Google Pixel",
    allHref: "/shop?brand=Google",
    filter: (p) => (p.brand || "").toLowerCase() === "google" || (p.name || "").toLowerCase().includes("pixel"),
  },
  OnePlus: {
    brand: "OnePlus",
    title: "In-Stock OnePlus Models",
    allHref: "/shop?brand=OnePlus",
    filter: (p) => (p.brand || "").toLowerCase() === "oneplus",
  },
  Xiaomi: {
    brand: "Xiaomi",
    title: "In-Stock Xiaomi Models",
    allHref: "/shop?brand=Xiaomi",
    filter: (p) => (p.brand || "").toLowerCase() === "xiaomi",
  },
  "Other Brands": {
    brand: "Other",
    title: "Other In-Stock Tech",
    allHref: "/shop",
    filter: (p) => !["apple", "samsung", "google", "oneplus", "xiaomi"].includes((p.brand || "").toLowerCase()),
  },
};

const getMinPrice = (product) => {
  if (Array.isArray(product?.variantPricing) && product.variantPricing.length > 0) {
    const validPrices = product.variantPricing
      .filter((v) => Number(v.stock) > 0 || v.isAvailable !== false)
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0);
    if (validPrices.length > 0) return Math.min(...validPrices);
  }
  return Number(product?.price || 0);
};

const isProductInStock = (product) => {
  if (Array.isArray(product?.variantPricing) && product.variantPricing.length > 0) {
    return product.variantPricing.some((v) => Number(v.stock) > 0);
  }
  return Number(product?.stock ?? 0) > 0;
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const toast = useToast();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, openCartDrawer } = useCart();
  const { wishlistCount: contextWishlistCount } = useWishlist();
  const wishlistCount = propWishlistCount !== undefined ? propWishlistCount : contextWishlistCount;

  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);

  // Live dynamic fetch for in-stock catalog products
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await apiGet("/products?limit=100");
        if (isMounted && res?.success && Array.isArray(res.products) && res.products.length > 0) {
          setCatalogProducts(res.products);
        }
      } catch (err) {
        // Fallback products already initialized in state
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Click outside to close search popover and user dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserMouseEnter = () => {
    if (currentUser && typeof window !== "undefined" && window.innerWidth >= 768) {
      if (userDropdownTimeoutRef.current) clearTimeout(userDropdownTimeoutRef.current);
      setShowUserDropdown(true);
    }
  };

  const handleUserMouseLeave = () => {
    if (currentUser) {
      userDropdownTimeoutRef.current = setTimeout(() => {
        setShowUserDropdown(false);
      }, 220);
    }
  };

  const handleDropdownLogout = async () => {
    setShowUserDropdown(false);
    await logoutUser();
    setCurrentUser(null);
    toast.info("Logged Out", "You have been logged out successfully.");
    if (pathname === "/account" || pathname.startsWith("/account")) {
      router.push("/");
    }
  };

  const handleAccountClick = () => {
    if (currentUser) {
      setShowUserDropdown(false);
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

  // Hide Customer Header on Admin Portal routes
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/staff-portal"))) {
    return null;
  }

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
                <form onSubmit={handleSearchSubmit} className="d-flex align-items-center m-0">
                  <div
                    className="d-flex align-items-center rounded-pill px-3 py-1 transition-all"
                    style={{
                      width: "270px",
                      height: "38px",
                      border: "1px solid",
                      borderColor: isSearchFocused ? "#2563eb" : "#e2e8f0",
                      backgroundColor: isSearchFocused ? "#ffffff" : "#f8fafc",
                      boxShadow: isSearchFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "none",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <input
                      type="search"
                      className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none text-dark"
                      placeholder="Search phones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        if (searchQuery.trim().length >= 2) setShowSearchDropdown(true);
                      }}
                      onBlur={() => {
                        setIsSearchFocused(false);
                      }}
                      style={{
                        fontSize: "0.85rem",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-link p-0 border-0 ms-2 d-flex align-items-center justify-content-center flex-shrink-0 text-decoration-none"
                      aria-label="Search"
                      style={{
                        color: isSearchFocused ? "#2563eb" : "#64748b",
                        transition: "color 0.15s ease",
                      }}
                      suppressHydrationWarning
                    >
                      {isSearching ? (
                        <Loader2 size={15} className="spinner-border spinner-border-sm p-0 border-2 text-primary" />
                      ) : (
                        <Search size={15} />
                      )}
                    </button>
                  </div>
                </form>

                {/* Instant Search Results Autocomplete Dropdown Popover */}
                {showSearchDropdown && (
                  <div
                    className="position-absolute start-0 top-100 bg-white border rounded-4 shadow-lg mt-2 overflow-hidden"
                    style={{
                      width: "350px",
                      zIndex: 1060,
                      boxShadow: "0 12px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                      animation: "dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }}
                  >
                    <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                      <span className="small fw-bold text-muted text-uppercase" style={{ letterSpacing: "0.06em", fontSize: "0.68rem" }}>
                        Matching Products ({searchResults.length})
                      </span>
                      {isSearching && <span className="spinner-border spinner-border-sm text-primary" style={{ width: "12px", height: "12px" }} />}
                    </div>

                    <div className="p-2 d-flex flex-column gap-1">
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
                            className="p-2 px-2.5 rounded-3 hover-bg-light cursor-pointer transition-all d-flex align-items-center gap-2.5"
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
                              <div className="fw-semibold text-dark text-truncate" style={{ fontSize: "0.85rem" }}>
                                {product.name}
                              </div>
                              <div className="d-flex align-items-center gap-1.5 small text-muted" style={{ fontSize: "0.72rem" }}>
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span className="text-primary fw-semibold">£{product.price}</span>
                                {product.condition && (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-1 py-0 ms-1" style={{ fontSize: "0.62rem" }}>
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

              {/* Account Button & Hover Dropdown */}
              <div
                className="position-relative d-inline-block"
                ref={userDropdownRef}
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <button
                  type="button"
                  className="btn btn-outline-light text-dark p-0 border-0 rounded-3 d-flex align-items-center justify-content-center transition-all"
                  onClick={handleAccountClick}
                  title={currentUser ? `Account (${currentUser.name})` : "Log In / Register"}
                  style={{ width: "40px", height: "40px" }}
                  suppressHydrationWarning
                >
                  <div className="position-relative d-inline-flex align-items-center justify-content-center">
                    <CircleUserRound size={22} className="text-primary" />
                    {currentUser && (
                      <span
                        className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"
                        style={{
                          width: "8px",
                          height: "8px",
                          transform: "translate(15%, 15%)",
                        }}
                      />
                    )}
                  </div>
                </button>

                {/* Hover Dropdown Menu for Logged In Customer */}
                {currentUser && showUserDropdown && (
                  <div
                    className="d-none d-md-block position-absolute end-0 top-100 mt-2 bg-white rounded-4 shadow-lg border overflow-hidden"
                    style={{
                      width: "270px",
                      zIndex: 1060,
                      animation: "dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }}
                  >
                    {/* User Name Section at Top */}
                    <div className="p-3 bg-light border-bottom">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
                          style={{ width: "38px", height: "38px", fontSize: "1rem" }}
                        >
                          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="overflow-hidden">
                          <div className="fw-bold text-dark text-truncate" style={{ fontSize: "0.9rem" }}>
                            {currentUser.name || "Customer"}
                          </div>
                          <div className="text-muted text-truncate small" style={{ fontSize: "0.75rem" }}>
                            {currentUser.email || currentUser.phone || "Verified Customer"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Page Navigation Items */}
                    <div className="p-2 d-flex flex-column gap-1">
                      <Link
                        href="/account?tab=orders"
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 text-dark text-decoration-none hover-bg-light transition-all"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <Package size={16} className="text-primary flex-shrink-0" />
                        <span className="fw-medium">My Orders</span>
                      </Link>

                      <Link
                        href="/account?tab=warranties"
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 text-dark text-decoration-none hover-bg-light transition-all"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <ShieldCheck size={16} className="text-primary flex-shrink-0" />
                        <span className="fw-medium">Warranties &amp; Reports</span>
                      </Link>

                      <Link
                        href="/account?tab=addresses"
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 text-dark text-decoration-none hover-bg-light transition-all"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <MapPin size={16} className="text-primary flex-shrink-0" />
                        <span className="fw-medium">Saved Addresses</span>
                      </Link>

                      <Link
                        href="/account?tab=security"
                        onClick={() => setShowUserDropdown(false)}
                        className="dropdown-item d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 text-dark text-decoration-none hover-bg-light transition-all"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <KeyRound size={16} className="text-primary flex-shrink-0" />
                        <span className="fw-medium">Profile &amp; Security</span>
                      </Link>
                    </div>

                    {/* Logout Button Section */}
                    <div className="p-2 border-top bg-light">
                      <button
                        type="button"
                        onClick={handleDropdownLogout}
                        className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 py-1.5 rounded-3 fw-semibold transition-all border-0 bg-danger-subtle text-danger"
                        style={{ fontSize: "0.82rem" }}
                        suppressHydrationWarning
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="btn btn-outline-light text-dark p-0 border-0 rounded-3 d-flex align-items-center justify-content-center transition-all"
                title="Wishlist"
                style={{ width: "40px", height: "40px" }}
              >
                <div className="position-relative d-inline-flex align-items-center justify-content-center">
                  <Heart size={22} className="text-primary" />
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger text-white d-flex align-items-center justify-content-center"
                      style={{
                        top: "-6px",
                        right: "-8px",
                        fontSize: "0.62rem",
                        minWidth: "16px",
                        height: "16px",
                        padding: "0 4px",
                        lineHeight: 1,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Cart Drawer Trigger Button */}
              <button
                type="button"
                className="btn btn-primary p-0 rounded-3 d-flex align-items-center justify-content-center shadow-sm border-0 transition-all"
                onClick={openCartDrawer}
                title={itemCount > 0 ? `Shopping Cart (${itemCount} item${itemCount === 1 ? "" : "s"})` : "Shopping Cart"}
                style={{ width: "40px", height: "40px" }}
                suppressHydrationWarning
              >
                <div className="position-relative d-inline-flex align-items-center justify-content-center">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span
                      className="position-absolute badge rounded-pill bg-danger text-white d-flex align-items-center justify-content-center"
                      style={{
                        top: "-7px",
                        right: "-9px",
                        fontSize: "0.62rem",
                        minWidth: "16px",
                        height: "16px",
                        padding: "0 4px",
                        lineHeight: 1,
                        border: "1.5px solid #ffffff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </div>
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
                const config = categoryConfigs[category.label];
                const inStockItems = config
                  ? catalogProducts.filter((p) => config.filter(p) && isProductInStock(p))
                  : [];
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

                    {/* Dynamic In-Stock Category Dropdown Popover */}
                    {isHovered && config && (
                      <div
                        className="position-absolute start-0 top-100 bg-white border rounded-4 shadow-lg mt-2 overflow-hidden"
                        style={{
                          width: "300px",
                          zIndex: 1060,
                          boxShadow: "0 14px 30px -4px rgba(0, 0, 0, 0.12), 0 8px 12px -6px rgba(0, 0, 0, 0.08)",
                          animation: "dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                        }}
                      >
                        <div className="bg-light px-3 py-2 border-bottom d-flex align-items-center justify-content-between">
                          <span
                            className="small fw-bold text-muted text-uppercase"
                            style={{ letterSpacing: "0.06em", fontSize: "0.68rem" }}
                          >
                            {config.title || `In-Stock ${category.label}`}
                          </span>
                          <span className="badge bg-white text-primary border px-1.5 py-0.5 fw-bold" style={{ fontSize: "0.65rem" }}>
                            {inStockItems.length} in stock
                          </span>
                        </div>

                        {inStockItems.length > 0 ? (
                          <div className="p-2 d-flex flex-column gap-1" style={{ maxHeight: "360px", overflowY: "auto" }}>
                            {inStockItems.map((prod) => {
                              const variantList = prod.availableStorage?.length
                                ? prod.availableStorage.join(" / ")
                                : prod.storage || (prod.availableColors?.length ? prod.availableColors.join(" / ") : null);

                              return (
                                <Link
                                  key={prod.slug || prod.id || prod._id}
                                  href={`/product/${prod.slug}`}
                                  className="category-dropdown-item px-3 py-2 rounded-3 text-decoration-none d-block transition-all"
                                  onClick={() => setHoveredCategory(null)}
                                >
                                  <div
                                    className="fw-semibold text-dark category-item-title text-truncate"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    {prod.name}
                                  </div>
                                  {variantList && (
                                    <div
                                      className="text-muted text-truncate mt-0.5"
                                      style={{ fontSize: "0.74rem", lineHeight: 1.35 }}
                                    >
                                      {variantList}
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 text-center text-muted small">
                            <p className="mb-0 fw-medium">No models currently in stock</p>
                            <span className="text-secondary small">Check back soon for new arrivals</span>
                          </div>
                        )}

                        {/* View all link at bottom */}
                        <div className="p-2 border-top bg-light">
                          <Link
                            href={config.allHref || category.href}
                            className="btn btn-outline-primary btn-sm w-100 py-1.5 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                            style={{ fontSize: "0.78rem" }}
                            onClick={() => setHoveredCategory(null)}
                          >
                            <span>View All {category.label} ({inStockItems.length} in stock)</span>
                            <ArrowRight size={13} />
                          </Link>
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
        }}
      />

      {/* Keyframes and dropdown utilities */}
      <style jsx global>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hover-bg-light:hover {
          background-color: #f8fafc !important;
          color: #2563eb !important;
        }
        .category-dropdown-item {
          transition: background-color 0.15s ease;
        }
        .category-dropdown-item:hover {
          background-color: #f8fafc !important;
        }
        .category-dropdown-item:hover .category-item-title {
          color: #2563eb !important;
        }
      `}</style>
    </header>
  );
}
