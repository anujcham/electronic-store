"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { Pagination } from "@heroui/react";

import { getProducts } from "../../services/productService";
import { ProductGrid } from "../product/ProductGrid";
import { ProductListCard } from "../product/ProductListCard";
import { ProductSkeletonGrid } from "../product/ProductSkeletonGrid";
import { Button, Container } from "../ui";
import { ShopFilters } from "./ShopFilters";
import { ShopToolbar } from "./ShopToolbar";

const linkClass = "text-muted hover:bg-surface hover:text-foreground";
const activeClass = "bg-accent text-accent-foreground hover:bg-accent-hover";

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

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [sortValue, setSortValue] = useState(() => searchParams.get("sortBy") || searchParams.get("sort") || "featured");
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Persistent View Mode (List vs Grid) backed by URL param and localStorage
  const [viewMode, setViewMode] = useState(() => {
    const urlView = searchParams.get("view") || initialSearchParams?.view;
    if (urlView === "list" || urlView === "grid") return urlView;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("shop_view_mode");
        if (saved === "list" || saved === "grid") return saved;
      } catch (e) {}
    }
    return "grid";
  });

  // Client hydration check for saved viewMode
  useEffect(() => {
    const urlView = searchParams.get("view");
    if (urlView === "list" || urlView === "grid") {
      setViewMode(urlView);
      try {
        localStorage.setItem("shop_view_mode", urlView);
      } catch (e) {}
    } else {
      try {
        const saved = localStorage.getItem("shop_view_mode");
        if (saved === "list" || saved === "grid") {
          setViewMode(saved);
        }
      } catch (e) {}
    }
  }, [searchParams]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("shop_view_mode", mode);
      } catch (e) {}
    }
  }, []);

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
  }, [selectedBrands, debouncedSearch, minPrice, maxPrice, sortValue, page]);

  // Trigger backend API fetch on filter updates
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchProductsFromBackend();
  }, [fetchProductsFromBackend]);

  // Track current URL query string so we don't clobber external navigation with stale state
  const prevQueryStringRef = useRef(searchParams.toString());

  // Synchronize state when URL searchParams changes externally (e.g., clicking Header dropdown "View All")
  useEffect(() => {
    const currentQueryString = searchParams.toString();
    if (currentQueryString !== prevQueryStringRef.current) {
      prevQueryStringRef.current = currentQueryString;

      const brandParam = searchParams.get("brand") || searchParams.get("category");
      const nextBrands = brandParam ? brandParam.split(",").map((s) => s.trim()).filter(Boolean) : [];
      setSelectedBrands(nextBrands);

      const nextSearch = searchParams.get("search") || "";
      setSearchTerm(nextSearch);
      setDebouncedSearch(nextSearch);

      const nextMinPrice = searchParams.get("minPrice") || "";
      setMinPrice(nextMinPrice);

      const nextMaxPrice = searchParams.get("maxPrice") || "";
      setMaxPrice(nextMaxPrice);

      const nextSort = searchParams.get("sortBy") || searchParams.get("sort") || "featured";
      setSortValue(nextSort);

      const nextView = searchParams.get("view");
      if (nextView === "list" || nextView === "grid") {
        setViewMode(nextView);
      }

      const nextPage = parseInt(searchParams.get("page"), 10) || 1;
      setPage(nextPage);
    }
  }, [searchParams]);

  // Synchronize filter state into URL parameters for in-page filter interactions
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sortValue && sortValue !== "featured") params.set("sortBy", sortValue);
    if (page > 1) params.set("page", String(page));
    if (viewMode === "list") params.set("view", "list");

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    if (newQueryString !== currentQueryString) {
      prevQueryStringRef.current = newQueryString;
      const newURL = newQueryString ? `${pathname}?${newQueryString}` : pathname;
      router.replace(newURL, { scroll: false });
    }
  }, [selectedBrands, debouncedSearch, minPrice, maxPrice, sortValue, page, viewMode, pathname, router, searchParams]);

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

  const handleClearAll = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setSortValue("featured");
    setPage(1);
    setShowMobileFilters(false);
  }, []);

  const hasActiveFilters =
    debouncedSearch !== "" ||
    selectedBrands.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    sortValue !== "featured";

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
          onViewModeChange={handleViewModeChange}
          hasActiveFilters={hasActiveFilters}
          debouncedSearch={debouncedSearch}
          selectedBrands={selectedBrands}
          onRemoveBrand={(b) => {
            setSelectedBrands((current) => current.filter((item) => item !== b));
            setPage(1);
          }}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onClearPrice={() => {
            setMinPrice("");
            setMaxPrice("");
            setPage(1);
          }}
        />

        {/* Main Content Layout */}
        <div className="row g-4">
          {/* Desktop Sidebar Filters Column - Height fits content */}
          <div className="d-none d-lg-block col-lg-3 align-self-start">
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
                      <ProductListCard
                        key={product.id || product._id || product.slug}
                        product={product}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-between bg-white border rounded-4 p-3 mt-4 shadow-sm gap-3">
                    <span className="small text-muted fw-semibold">
                      Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total devices)
                    </span>

                    <Pagination className="justify-center">
                      <Pagination.Content className="gap-1 rounded-xl bg-default p-1">
                        <Pagination.Item>
                          <Pagination.Previous
                            className={linkClass}
                            isDisabled={page <= 1}
                            onPress={() => {
                              setPage((p) => Math.max(1, p - 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <Pagination.PreviousIcon />
                          </Pagination.Previous>
                        </Pagination.Item>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <Pagination.Item key={p}>
                            <Pagination.Link
                              className={p === Number(page) ? activeClass : linkClass}
                              isActive={p === Number(page)}
                              onPress={() => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {p}
                            </Pagination.Link>
                          </Pagination.Item>
                        ))}

                        <Pagination.Item>
                          <Pagination.Next
                            className={linkClass}
                            isDisabled={page >= totalPages}
                            onPress={() => {
                              setPage((p) => Math.min(totalPages, Number(page) + 1));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <Pagination.NextIcon />
                          </Pagination.Next>
                        </Pagination.Item>
                      </Pagination.Content>
                    </Pagination>
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
