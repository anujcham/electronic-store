"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ShieldCheck,
  Award,
  Battery,
  ShoppingCart,
  Star,
  Eye,
  Check,
  Filter,
} from "lucide-react";

import { getProducts } from "../../services/productService";
import { ProductGrid } from "../product/ProductGrid";
import { Button, Container, Badge } from "../ui";
import { ShopFilters } from "./ShopFilters";
import { ShopToolbar } from "./ShopToolbar";
import { useCart } from "../../features/cart/useCart";

const DEFAULT_DEBOUNCE_MS = 250;

const CATEGORY_BRAND_MAP = {
  iphone: "Apple",
  samsung: "Samsung",
  "google-pixel": "Google",
  oneplus: "OnePlus",
  xiaomi: "Xiaomi",
  "other-phones": "Other",
};

const normalizeCategory = (category) => {
  if (!category) return "all";

  const lower = category.toLowerCase();
  if (lower === "iphone" || lower === "apple") return "iphone";
  if (lower === "samsung") return "samsung";
  if (lower === "google-pixel" || lower === "pixel" || lower === "google") return "google-pixel";
  if (lower === "oneplus") return "oneplus";
  if (lower === "xiaomi") return "xiaomi";
  if (lower === "other-phones" || lower === "otherphones" || lower === "other phones") return "other-phones";

  return "all";
};

const getInitialCategories = (categoryParam) => {
  const normalized = normalizeCategory(categoryParam);
  return normalized === "all" ? [] : [normalized];
};

const toggleMultiSelection = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const getInitialProducts = async () => {
  const products = await getProducts();
  return products.filter((product) => product.category === "Smartphones");
};

export function ShopPage() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(() =>
    getInitialCategories(searchParams.get("category") || searchParams.get("brand"))
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortValue, setSortValue] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [under300Only, setUnder300Only] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      const loadedProducts = await getInitialProducts();

      if (isMounted) {
        setProducts(loadedProducts);
        setIsLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, DEFAULT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  // Close mobile filter drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showMobileFilters) {
        setShowMobileFilters(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMobileFilters]);

  const categoryOptions = useMemo(
    () => [
      { value: "iphone", label: "iPhone" },
      { value: "samsung", label: "Samsung" },
      { value: "google-pixel", label: "Google Pixel" },
      { value: "oneplus", label: "OnePlus" },
      { value: "xiaomi", label: "Xiaomi" },
      { value: "other-phones", label: "Other Phones" },
    ],
    []
  );

  const brandOptions = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map((product) => product.brand))).sort((a, b) =>
      a.localeCompare(b)
    );
    return uniqueBrands;
  }, [products]);

  const conditionOptions = useMemo(() => {
    const uniqueConditions = Array.from(new Set(products.map((product) => product.condition))).sort((a, b) =>
      a.localeCompare(b)
    );
    return uniqueConditions;
  }, [products]);

  const storageOptions = useMemo(() => {
    const uniqueStorages = Array.from(
      new Set(
        products.flatMap((product) =>
          product.availableStorage && product.availableStorage.length > 0
            ? product.availableStorage
            : [product.storage].filter(Boolean)
        )
      )
    ).sort((a, b) => a.localeCompare(b));
    return uniqueStorages;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let minPriceFilter = minPrice === "" ? null : Number(minPrice);
    let maxPriceFilter = maxPrice === "" ? null : Number(maxPrice);

    if (under300Only) {
      maxPriceFilter = 300;
    }

    const nextProducts = products.filter((product) => {
      const matchesSearch =
        debouncedSearch.length === 0 ||
        product.name.toLowerCase().includes(debouncedSearch) ||
        product.brand.toLowerCase().includes(debouncedSearch);

      const matchesCategories =
        selectedCategories.length === 0
          ? true
          : selectedCategories.some((category) => {
              if (category === "other-phones") {
                return !["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"].includes(product.brand);
              }
              return product.brand === CATEGORY_BRAND_MAP[category];
            });

      const matchesBrands = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesConditions =
        selectedConditions.length === 0 || selectedConditions.includes(product.condition);
      const matchesStorages =
        selectedStorages.length === 0 ||
        (product.availableStorage && product.availableStorage.length > 0
          ? product.availableStorage.some((storage) => selectedStorages.includes(storage))
          : selectedStorages.includes(product.storage));

      const matchesMinPrice = minPriceFilter === null || product.price >= minPriceFilter;
      const matchesMaxPrice = maxPriceFilter === null || product.price <= maxPriceFilter;
      const matchesInStock = !inStockOnly || product.stock > 0;

      return (
        matchesSearch &&
        matchesCategories &&
        matchesBrands &&
        matchesConditions &&
        matchesStorages &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesInStock
      );
    });

    switch (sortValue) {
      case "price-asc":
        nextProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        nextProducts.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        nextProducts.sort((a, b) => b.rating - a.rating);
        break;
      case "featured":
      default:
        nextProducts.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
        break;
    }

    return nextProducts;
  }, [
    products,
    debouncedSearch,
    selectedCategories,
    selectedBrands,
    selectedConditions,
    selectedStorages,
    minPrice,
    maxPrice,
    sortValue,
    inStockOnly,
    under300Only,
  ]);

  const handleClearAll = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedStorages([]);
    setMinPrice("");
    setMaxPrice("");
    setSortValue("featured");
    setInStockOnly(false);
    setUnder300Only(false);
    setShowMobileFilters(false);
  };

  const hasActiveFilters =
    debouncedSearch !== "" ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedConditions.length > 0 ||
    selectedStorages.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    inStockOnly ||
    under300Only ||
    sortValue !== "featured";

  const handleAddToCart = (product, event) => {
    if (event) event.stopPropagation();
    addItem(product, {
      condition: product?.condition,
      storage: product?.availableStorage?.[0] || product?.storage,
      color: product?.availableColors?.[0] || product?.color,
      price: product?.price,
      originalPrice: product?.originalPrice,
      stock: product?.stock,
    });
  };

  return (
    <main className="py-5 py-lg-6 bg-soft">
      <Container>
        {/* Breadcrumb Nav */}
        <nav aria-label="Breadcrumb" className="mb-3">
          <div className="small text-primary">
            <Link href="/" className="text-decoration-none text-primary fw-medium">
              Home
            </Link>
            <span className="mx-2 text-muted">/</span>
            <span className="text-secondary fw-medium">Shop Refurbished Phones</span>
          </div>
        </nav>

        {/* Page Title */}
        <div className="mb-4">
          <h1 className="display-6 fw-bold mb-1 text-primary">Certified Refurbished Phones</h1>
          <p className="mb-0 text-secondary">
            100% Quality Checked with 12-Month Seller Warranty, 85%+ Battery Guarantee & Free Express Delivery.
          </p>
        </div>

        {/* Toolbar Bar */}
        <ShopToolbar
          resultCount={filteredProducts.length}
          sortValue={sortValue}
          onSortChange={setSortValue}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onClearAll={handleClearAll}
          showMobileFilters={showMobileFilters}
          onToggleFilters={() => setShowMobileFilters((current) => !current)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="bg-white border rounded-3 p-3 mb-4 d-flex align-items-center flex-wrap gap-2.5 shadow-sm">
            <span className="small text-muted fw-bold me-1" style={{ fontSize: "0.8rem" }}>
              Active Filters:
            </span>

            {debouncedSearch && (
              <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Search: "{debouncedSearch}"
                <X size={14} className="cursor-pointer text-muted hover-danger ms-1" onClick={() => setSearchTerm("")} />
              </span>
            )}

            {selectedCategories.map((cat) => {
              const label = categoryOptions.find((c) => c.value === cat)?.label || cat;
              return (
                <span key={cat} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                  Category: {label}
                  <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => setSelectedCategories((current) => current.filter((c) => c !== cat))} />
                </span>
              );
            })}

            {selectedConditions.map((cond) => (
              <span key={cond} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Grade: {cond}
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => setSelectedConditions((current) => current.filter((c) => c !== cond))} />
              </span>
            ))}

            {selectedStorages.map((stg) => (
              <span key={stg} className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Storage: {stg}
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => setSelectedStorages((current) => current.filter((s) => s !== stg))} />
              </span>
            ))}

            {(minPrice || maxPrice) && (
              <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Price: £{minPrice || "0"} – £{maxPrice || "Max"}
                <X size={14} className="cursor-pointer text-muted hover-danger ms-1" onClick={() => { setMinPrice(""); setMaxPrice(""); }} />
              </span>
            )}

            {under300Only && (
              <span className="badge bg-success text-white rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Under £300
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => setUnder300Only(false)} />
              </span>
            )}

            <button
              type="button"
              className="btn btn-link btn-sm text-danger text-decoration-none fw-bold ms-auto p-0 border-0"
              style={{ fontSize: "0.82rem" }}
              onClick={handleClearAll}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Main Content Layout (Desktop Sidebar + Mobile Off-Canvas Drawer + Catalog Grid/List) */}
        <div className="row g-4">
          {/* Desktop Sidebar Filters Column (d-none d-lg-block) */}
          <div className="d-none d-lg-block col-lg-3">
            <ShopFilters
              categoryOptions={categoryOptions}
              selectedCategories={selectedCategories}
              onCategoryToggle={(nextCategory) =>
                setSelectedCategories((current) => toggleMultiSelection(current, nextCategory))
              }
              brandOptions={brandOptions}
              selectedBrands={selectedBrands}
              onBrandToggle={(nextBrand) =>
                setSelectedBrands((current) => toggleMultiSelection(current, nextBrand))
              }
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={setMinPrice}
              onMaxPriceChange={setMaxPrice}
              conditionOptions={conditionOptions}
              selectedConditions={selectedConditions}
              onConditionToggle={(nextCondition) =>
                setSelectedConditions((current) => toggleMultiSelection(current, nextCondition))
              }
              storageOptions={storageOptions}
              selectedStorages={selectedStorages}
              onStorageToggle={(nextStorage) =>
                setSelectedStorages((current) => toggleMultiSelection(current, nextStorage))
              }
              inStockOnly={inStockOnly}
              onInStockToggle={setInStockOnly}
            />
          </div>

          {/* Catalog List / Grid Column */}
          <div className="col-12 col-lg-9">
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading certified refurbished devices...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              viewMode === "grid" ? (
                <ProductGrid products={filteredProducts} columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} />
              ) : (
                /* Horizontal List View Mode */
                <div className="d-flex flex-column gap-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="card border rounded-4 shadow-sm overflow-hidden hover-shadow transition-all bg-white"
                    >
                      <div className="row g-0 align-items-center">
                        {/* Thumbnail Image */}
                        <div className="col-12 col-sm-4 col-md-3 p-3 text-center bg-light">
                          <div className="position-relative mx-auto" style={{ width: "140px", height: "140px" }}>
                            <Image
                              src={product.images?.[0] || "https://placehold.co/800x800/EEF2F7/0F172A?text=Phone"}
                              alt={product.name}
                              fill
                              sizes="140px"
                              style={{ objectFit: "contain" }}
                              unoptimized
                            />
                          </div>
                        </div>

                        {/* Specs & Info */}
                        <div className="col-12 col-sm-8 col-md-6 p-4 border-end-md">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5">
                              {product.brand}
                            </span>
                            {product.condition && (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5">
                                {product.condition} Grade
                              </span>
                            )}
                          </div>

                          <h5 className="fw-bold text-dark mb-1">
                            <Link href={`/product/${product.slug}`} className="text-dark text-decoration-none hover-primary">
                              {product.name}
                            </Link>
                          </h5>

                          <p className="small text-muted mb-2 line-clamp-2" style={{ fontSize: "0.85rem" }}>
                            {product.shortDescription || "50-Point diagnostic checked refurbished phone with full warranty."}
                          </p>

                          <div className="d-flex flex-wrap gap-2 text-muted small" style={{ fontSize: "0.78rem" }}>
                            <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                              <Battery size={13} className="text-success" /> 85%+ Battery Health
                            </span>
                            <span>•</span>
                            <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                              <ShieldCheck size={13} className="text-primary" /> 12-Mo Warranty
                            </span>
                            <span>•</span>
                            <span className="d-flex align-items-center gap-1 text-dark fw-medium">
                              <Award size={13} className="text-warning" /> 50-Pt Checked
                            </span>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="col-12 col-md-3 p-4 bg-light bg-opacity-50 h-100 d-flex flex-column justify-content-center text-md-end border-top border-top-md-0">
                          <div className="mb-2">
                            <div className="fw-extrabold text-primary display-7">
                              £{product.price}
                            </div>
                            {product.originalPrice > product.price && (
                              <small className="text-muted text-decoration-line-through d-block" style={{ fontSize: "0.78rem" }}>
                                RRP £{product.originalPrice}
                              </small>
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn btn-primary btn-sm rounded-pill fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-1.5 w-100"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCart size={15} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Empty Search Results State */
              <div
                className="bg-white border rounded-4 p-5 text-center shadow-sm"
                style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}
              >
                <div className="bg-light text-muted rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: "64px", height: "64px" }}>
                  <SlidersHorizontal size={28} />
                </div>
                <h3 className="h5 fw-bold mb-2 text-primary">No devices match your criteria</h3>
                <p className="mb-4 text-secondary small" style={{ maxWidth: "400px", margin: "0 auto" }}>
                  Try resetting your price range, clearing storage filters, or browsing all device categories.
                </p>
                {hasActiveFilters ? (
                  <Button type="button" variant="primary" className="rounded-pill px-4 fw-bold" onClick={handleClearAll}>
                    Clear All Filters
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Smooth Slide-In Filter Drawer (d-lg-none) */}
        {showMobileFilters && (
          <div className="mobile-filter-drawer-wrapper d-lg-none">
            {/* Backdrop Blur */}
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{
                zIndex: 1060,
                backdropFilter: "blur(4px)",
                transition: "opacity 0.3s ease-in-out",
              }}
              onClick={() => setShowMobileFilters(false)}
              aria-hidden="true"
            />

            {/* Slide-In Left Drawer */}
            <aside
              className="position-fixed top-0 start-0 h-100 bg-white d-flex flex-column shadow-lg"
              style={{
                width: "85%",
                maxWidth: "350px",
                zIndex: 1070,
                animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              }}
              aria-label="Mobile Filters Sidebar"
            >
              {/* Drawer Sticky Header */}
              <div className="p-3.5 border-bottom bg-white d-flex align-items-center justify-content-between sticky-top">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark fs-6">Filter Devices</h6>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {filteredProducts.length} {filteredProducts.length === 1 ? "device" : "devices"} match
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-circle p-2 border-0"
                  onClick={() => setShowMobileFilters(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-grow-1 overflow-y-auto p-3.5">
                <ShopFilters
                  categoryOptions={categoryOptions}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={(nextCategory) =>
                    setSelectedCategories((current) => toggleMultiSelection(current, nextCategory))
                  }
                  brandOptions={brandOptions}
                  selectedBrands={selectedBrands}
                  onBrandToggle={(nextBrand) =>
                    setSelectedBrands((current) => toggleMultiSelection(current, nextBrand))
                  }
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
                  conditionOptions={conditionOptions}
                  selectedConditions={selectedConditions}
                  onConditionToggle={(nextCondition) =>
                    setSelectedConditions((current) => toggleMultiSelection(current, nextCondition))
                  }
                  storageOptions={storageOptions}
                  selectedStorages={selectedStorages}
                  onStorageToggle={(nextStorage) =>
                    setSelectedStorages((current) => toggleMultiSelection(current, nextStorage))
                  }
                  inStockOnly={inStockOnly}
                  onInStockToggle={setInStockOnly}
                />
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3 border-top bg-white shadow-lg d-flex gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill fw-semibold px-3"
                    onClick={handleClearAll}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill fw-bold py-2.5 flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <Check size={16} /> Show {filteredProducts.length} Devices
                </button>
              </div>
            </aside>

            {/* Keyframe animation for slide in from left */}
            <style jsx global>{`
              @keyframes slideInLeft {
                from {
                  transform: translateX(-100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>
          </div>
        )}
      </Container>
    </main>
  );
}
