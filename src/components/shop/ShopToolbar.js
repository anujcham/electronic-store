"use client";

import { LayoutGrid, List, Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui";

export function ShopToolbar({
  resultCount,
  sortValue,
  onSortChange,
  searchValue,
  onSearchChange,
  onClearAll,
  showMobileFilters,
  onToggleFilters,
  viewMode = "grid",
  onViewModeChange,
  hasActiveFilters = false,
}) {
  return (
    <div className="bg-white border rounded-4 p-3 mb-4 shadow-sm">
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        {/* Search Bar & Mobile Filter Toggle */}
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "480px" }}>
          <div className="position-relative w-100">
            <input
              type="text"
              className="form-control ps-4 pe-4 bg-light border-0 rounded-pill"
              placeholder="Search by model, brand, or spec (e.g. iPhone 13 256GB)..."
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            <Search size={15} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            {searchValue && (
              <button
                type="button"
                className="btn btn-link btn-sm text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                onClick={() => onSearchChange("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="d-lg-none flex-shrink-0 rounded-pill d-flex align-items-center gap-1.5"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal size={14} />
            <span>{showMobileFilters ? "Hide Filters" : "Filters"}</span>
          </Button>
        </div>

        {/* View Mode Toggle, Result Count & Sort Selector */}
        <div className="d-flex align-items-center justify-content-between justify-content-lg-end gap-3 flex-wrap">
          <div className="small text-muted fw-medium">
            Showing <strong className="text-primary">{resultCount}</strong> {resultCount === 1 ? "device" : "devices"}
          </div>

          {/* Grid vs List View Toggle */}
          <div className="btn-group btn-group-sm bg-light p-1 rounded-pill border" role="group" aria-label="Catalog layout view mode">
            <button
              type="button"
              className={`btn btn-sm rounded-circle p-1.5 d-flex align-items-center justify-content-center border-0 ${
                viewMode === "grid" ? "btn-primary shadow-sm text-white" : "btn-light text-secondary"
              }`}
              onClick={() => onViewModeChange("grid")}
              title="Grid View"
              style={{ width: "32px", height: "32px" }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-circle p-1.5 d-flex align-items-center justify-content-center border-0 ${
                viewMode === "list" ? "btn-primary shadow-sm text-white" : "btn-light text-secondary"
              }`}
              onClick={() => onViewModeChange("list")}
              title="List View"
              style={{ width: "32px", height: "32px" }}
            >
              <List size={16} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <label className="small text-muted fw-semibold mb-0 d-none d-sm-inline" htmlFor="shop-sort">
              Sort:
            </label>
            <select
              id="shop-sort"
              className="form-select form-select-sm rounded-pill bg-light border-0 px-3 fw-medium"
              value={sortValue}
              onChange={(event) => onSortChange(event.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="featured">Featured Deals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-danger fw-semibold p-0 ms-1 d-none d-sm-inline-block"
              onClick={onClearAll}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
