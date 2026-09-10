"use client";

import { Tag, ShieldCheck } from "lucide-react";

export function ShopFilters({
  brandOptions = [],
  selectedBrands = [],
  onBrandToggle,
  minPrice = "",
  maxPrice = "",
  onMinPriceChange,
  onMaxPriceChange,
  conditionOptions = [],
  selectedConditions = [],
  onConditionToggle,
  storageOptions = [],
  selectedStorages = [],
  onStorageToggle,
  inStockOnly = false,
  onInStockToggle,
}) {
  const pricePresets = [
    { label: "Under £300", min: "", max: "300" },
    { label: "£300 – £500", min: "300", max: "500" },
    { label: "£500 – £800", min: "500", max: "800" },
    { label: "£800+", min: "800", max: "" },
  ];

  const handlePricePreset = (preset) => {
    if (String(minPrice || "") === String(preset.min || "") && String(maxPrice || "") === String(preset.max || "")) {
      onMinPriceChange("");
      onMaxPriceChange("");
    } else {
      onMinPriceChange(preset.min);
      onMaxPriceChange(preset.max);
    }
  };

  return (
    <aside className="bg-white border rounded-4 p-4 h-100 shadow-sm" style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
        <h5 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
          <Tag size={18} /> Filter Devices
        </h5>
      </div>

      {/* In-Stock Only Toggle */}
      <div className="bg-light rounded-3 p-3 mb-4 border d-flex align-items-center justify-content-between shadow-xs">
        <span className="small fw-semibold text-dark">In Stock Only</span>
        <div className="form-check form-switch mb-0">
          <input
            className="form-check-input cursor-pointer"
            type="checkbox"
            role="switch"
            id="inStockSwitch"
            checked={inStockOnly}
            onChange={(e) => onInStockToggle && onInStockToggle(e.target.checked)}
          />
        </div>
      </div>

      {/* Phone Brands */}
      <div className="mb-4 pb-4 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2.5">
          Smartphone Brand
        </label>
        <div className="d-flex flex-column gap-2">
          {brandOptions.map((brand) => {
            const isSelected = selectedBrands.includes(brand);
            return (
              <div
                key={brand}
                className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2.5 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm fw-bold text-primary"
                    : "border-light-subtle bg-white text-dark hover-bg-light"
                }`}
                onClick={() => onBrandToggle && onBrandToggle(brand)}
                style={{ cursor: "pointer", fontSize: "0.9rem" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={isSelected}
                    readOnly
                    style={{ pointerEvents: "none" }}
                  />
                  <span>{brand}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Price Ranges */}
      <div className="mb-4 pb-4 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2.5">
          Price Range (£)
        </label>

        {/* Presets */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {pricePresets.map((preset) => {
            const isPresetActive =
              (minPrice !== "" || maxPrice !== "") &&
              String(minPrice || "") === String(preset.min || "") &&
              String(maxPrice || "") === String(preset.max || "");
            return (
              <button
                key={preset.label}
                type="button"
                className={`btn btn-xs rounded-pill px-3 py-1.5 transition-all ${
                  isPresetActive
                    ? "btn-primary fw-bold shadow-xs text-white"
                    : "btn-outline-secondary text-dark hover-bg-light"
                }`}
                style={{ fontSize: "0.78rem" }}
                onClick={() => handlePricePreset(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max Inputs */}
        <div className="row g-2">
          <div className="col-6">
            <input
              type="number"
              min="0"
              className="form-control form-control-sm rounded-3 py-2 px-3"
              placeholder="Min £"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
            />
          </div>
          <div className="col-6">
            <input
              type="number"
              min="0"
              className="form-control form-control-sm rounded-3 py-2 px-3"
              placeholder="Max £"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Cosmetic Condition Tier */}
      <div className="mb-4 pb-4 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2.5">
          Cosmetic Grade
        </label>
        <div className="d-flex flex-column gap-2">
          {conditionOptions.map((condition) => {
            const isSelected = selectedConditions.includes(condition);
            let gradeBadgeClass = "bg-primary-subtle text-primary border-primary";
            if (condition.toLowerCase().includes("pristine") || condition.toLowerCase().includes("excellent") || condition.toLowerCase().includes("like new")) {
              gradeBadgeClass = "bg-success-subtle text-success border-success-subtle";
            } else if (condition.toLowerCase().includes("good")) {
              gradeBadgeClass = "bg-info-subtle text-info border-info-subtle";
            }

            return (
              <div
                key={condition}
                className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2.5 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm"
                    : "border-light-subtle bg-white hover-bg-light"
                }`}
                onClick={() => onConditionToggle && onConditionToggle(condition)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={isSelected}
                    readOnly
                    style={{ pointerEvents: "none" }}
                  />
                  <span className={`small fw-bold ${isSelected ? "text-primary" : "text-dark"}`}>
                    {condition}
                  </span>
                </div>
                <span className={`badge border px-2 py-1 ${gradeBadgeClass}`} style={{ fontSize: "0.65rem" }}>
                  Certified Grade
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Capacity Filter */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2.5">
          Storage Capacity
        </label>
        <div className="d-flex flex-wrap gap-2">
          {storageOptions.map((storage) => {
            const isSelected = selectedStorages.includes(storage);
            return (
              <button
                key={storage}
                type="button"
                className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold transition-all ${
                  isSelected ? "btn-primary shadow-xs" : "btn-light border text-dark hover-bg-light"
                }`}
                style={{ fontSize: "0.8rem" }}
                onClick={() => onStorageToggle && onStorageToggle(storage)}
              >
                {storage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Assurance Notice */}
      <div className="bg-light border rounded-3 p-3 text-muted small mt-4" style={{ fontSize: "0.78rem" }}>
        <div className="d-flex align-items-center gap-1.5 fw-bold text-dark mb-1">
          <ShieldCheck size={16} className="text-success" /> Quality Guarantee
        </div>
        All pre-owned phones pass 50-point diagnostic checks with 12-month seller warranty and 85%+ battery health.
      </div>
    </aside>
  );
}
