"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  SlidersHorizontal,
  ShieldCheck,
  Award,
  Battery,
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { getProducts } from "../../services/productService";
import { ProductGrid } from "../product/ProductGrid";
import { ProductSkeletonGrid } from "../product/ProductSkeletonGrid";
import { Button, Container } from "../ui";
import { ShopFilters } from "./ShopFilters";
import { ShopToolbar } from "./ShopToolbar";
import { useCart } from "../../features/cart/useCart";

const toggleMultiSelection = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export function ShopPage({
  initialProducts = [],
  totalCount: initialTotal = 0,
  page: initialPage = 1,
  totalPages: initialTotalPages = 1,
  initialSearchParams = {},
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCart();
  const isFirstMount = useRef(true);

  // States initialized from initial search params
  const [products, setProducts] = useState(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const b = searchParams.get("brand") || searchParams.get("category");
    return b ? b.split(",").map((item) => item.trim()).filter(Boolean) : [];
  });

  const [selectedConditions, setSelectedConditions] = useState(() => {
    const c = searchParams.get("condition");
    return c ? c.split(",").map((item) => item.trim()).filter(Boolean) : [];
  });

  const [selectedStorages, setSelectedStorages] = useState(() => {
    const s = searchParams.get("storage");
    return s ? s.split(",").map((item) => item.trim()).filter(Boolean) : [];
  });

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [sortValue, setSortValue] = useState(() => searchParams.get("sortBy") || searchParams.get("sort") || "featured");
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [inStockOnly, setInStockOnly] = useState(false);

  // 300ms Debounce for Search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Live Backend API Fetcher whenever any filter/sort/page changes
  const fetchProductsFromBackend = useCallback(async () => {
    setIsLoading(true);

    const query = {};
    if (selectedBrands.length > 0) query.brand = selectedBrands.join(",");
    if (selectedConditions.length > 0) query.condition = selectedConditions.join(",");
    if (selectedStorages.length > 0) query.storage = selectedStorages.join(",");
    if (debouncedSearch) query.search = debouncedSearch;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    if (sortValue) query.sortBy = sortValue;
    query.page = page;
    query.limit = 12;

    try {
      const result = await getProducts(query);
      if (result && Array.isArray(result.products)) {
        setProducts(result.products);
        setTotalCount(result.total || result.products.length);
        setTotalPages(result.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch products from backend API:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBrands, selectedConditions, selectedStorages, debouncedSearch, minPrice, maxPrice, sortValue, page]);

  // Trigger backend API fetch on filter updates
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchProductsFromBackend();
  }, [fetchProductsFromBackend]);

  // Synchronize filter state into URL parameters for deep-linking
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
    if (selectedConditions.length > 0) params.set("condition", selectedConditions.join(","));
    if (selectedStorages.length > 0) params.set("storage", selectedStorages.join(","));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortValue && sortValue !== "featured") params.set("sortBy", sortValue);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newURL, { scroll: false });
  }, [selectedBrands, selectedConditions, selectedStorages, debouncedSearch, minPrice, maxPrice, sortValue, page, pathname, router]);

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

  const brandOptions = useMemo(() => ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Other"], []);
  const conditionOptions = useMemo(() => ["Like New", "Excellent", "Very Good", "Good", "Fair"], []);
  const storageOptions = useMemo(() => ["64GB", "128GB", "256GB", "512GB", "1TB"], []);

  const handleClearAll = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedStorages([]);
    setMinPrice("");
    setMaxPrice("");
    setSortValue("featured");
    setInStockOnly(false);
    setPage(1);
    setShowMobileFilters(false);
  }, []);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    selectedBrands.length > 0 ||
    selectedConditions.length > 0 ||
    selectedStorages.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    inStockOnly ||
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
          resultCount={totalCount}
          sortValue={sortValue}
          onSortChange={(val) => { setSortValue(val); setPage(1); }}
          searchValue={searchTerm}
          onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
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
                <X size={14} className="cursor-pointer text-muted hover-danger ms-1" onClick={() => { setSearchTerm(""); setPage(1); }} />
              </span>
            )}

            {selectedBrands.map((b) => (
              <span key={b} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Brand: {b}
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => { setSelectedBrands((c) => c.filter((item) => item !== b)); setPage(1); }} />
              </span>
            ))}

            {selectedConditions.map((cond) => (
              <span key={cond} className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Grade: {cond}
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => { setSelectedConditions((c) => c.filter((item) => item !== cond)); setPage(1); }} />
              </span>
            ))}

            {selectedStorages.map((stg) => (
              <span key={stg} className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Storage: {stg}
                <X size={14} className="cursor-pointer hover-danger ms-1" onClick={() => { setSelectedStorages((c) => c.filter((item) => item !== stg)); setPage(1); }} />
              </span>
            ))}

            {(minPrice || maxPrice) && (
              <span className="badge bg-light text-dark border rounded-pill px-3 py-1.5 fs-7 d-inline-flex align-items-center gap-2 shadow-xs">
                Price: £{minPrice || "0"} – £{maxPrice || "Max"}
                <X size={14} className="cursor-pointer text-muted hover-danger ms-1" onClick={() => { setMinPrice(""); setMaxPrice(""); setPage(1); }} />
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

        {/* Main Content Layout */}
        <div className="row g-4">
          {/* Desktop Sidebar Filters Column */}
          <div className="d-none d-lg-block col-lg-3">
            <ShopFilters
              brandOptions={brandOptions}
              selectedBrands={selectedBrands}
              onBrandToggle={(brand) => {
                setSelectedBrands((current) => toggleMultiSelection(current, brand));
                setPage(1);
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={(val) => { setMinPrice(val); setPage(1); }}
              onMaxPriceChange={(val) => { setMaxPrice(val); setPage(1); }}
              conditionOptions={conditionOptions}
              selectedConditions={selectedConditions}
              onConditionToggle={(condition) => {
                setSelectedConditions((current) => toggleMultiSelection(current, condition));
                setPage(1);
              }}
              storageOptions={storageOptions}
              selectedStorages={selectedStorages}
              onStorageToggle={(storage) => {
                setSelectedStorages((current) => toggleMultiSelection(current, storage));
                setPage(1);
              }}
              inStockOnly={inStockOnly}
              onInStockToggle={(val) => { setInStockOnly(val); setPage(1); }}
            />
          </div>

          {/* Catalog List / Grid Column */}
          <div className="col-12 col-lg-9">
            {isLoading ? (
              /* Shimmering Skeleton Cards while fetching live from Backend API */
              <ProductSkeletonGrid count={6} viewMode={viewMode} />
            ) : products.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <ProductGrid products={products} columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} />
                ) : (
                  /* Horizontal List View Mode */
                  <div className="d-flex flex-column gap-3">
                    {products.map((product) => (
                      <div
                        key={product.id || product._id || product.slug}
                        className="card border rounded-4 shadow-sm overflow-hidden hover-shadow transition-all bg-white"
                        style={{ contentVisibility: "auto", containIntrinsicSize: "200px" }}
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
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex align-items-center justify-content-between bg-white border rounded-4 p-3 mt-4 shadow-sm">
                    <span className="small text-muted fw-semibold">
                      Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total devices)
                    </span>

                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                        style={{ width: "36px", height: "36px" }}
                        disabled={page <= 1}
                        onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                        <button
                          key={pNum}
                          type="button"
                          className={`btn btn-sm rounded-circle fw-bold ${
                            pNum === Number(page) ? "btn-primary shadow-sm" : "btn-outline-secondary"
                          }`}
                          style={{ width: "36px", height: "36px" }}
                          onClick={() => { setPage(pNum); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        >
                          {pNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm rounded-circle p-2"
                        style={{ width: "36px", height: "36px" }}
                        disabled={page >= totalPages}
                        onClick={() => { setPage((p) => Math.min(totalPages, Number(page) + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        aria-label="Next Page"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
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

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="mobile-filter-drawer-wrapper d-lg-none">
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
              <div className="p-3.5 border-bottom bg-white d-flex align-items-center justify-content-between sticky-top">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark fs-6">Filter Devices</h6>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {totalCount} {totalCount === 1 ? "device" : "devices"} match
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

              <div className="flex-grow-1 overflow-y-auto p-3.5">
                <ShopFilters
                  brandOptions={brandOptions}
                  selectedBrands={selectedBrands}
                  onBrandToggle={(brand) => {
                    setSelectedBrands((current) => toggleMultiSelection(current, brand));
                    setPage(1);
                  }}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={(val) => { setMinPrice(val); setPage(1); }}
                  onMaxPriceChange={(val) => { setMaxPrice(val); setPage(1); }}
                  conditionOptions={conditionOptions}
                  selectedConditions={selectedConditions}
                  onConditionToggle={(condition) => {
                    setSelectedConditions((current) => toggleMultiSelection(current, condition));
                    setPage(1);
                  }}
                  storageOptions={storageOptions}
                  selectedStorages={selectedStorages}
                  onStorageToggle={(storage) => {
                    setSelectedStorages((current) => toggleMultiSelection(current, storage));
                    setPage(1);
                  }}
                  inStockOnly={inStockOnly}
                  onInStockToggle={(val) => { setInStockOnly(val); setPage(1); }}
                />
              </div>

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
                  <Check size={16} /> Show {totalCount} Devices
                </button>
              </div>
            </aside>

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
