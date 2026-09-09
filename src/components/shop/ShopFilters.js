"use client";

import { Check, RotateCcw, ShieldCheck, Tag, Zap } from "lucide-react";

export function ShopFilters({
  categoryOptions,
  selectedCategories,
  onCategoryToggle,
  brandOptions,
  selectedBrands,
  onBrandToggle,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  conditionOptions,
  selectedConditions,
  onConditionToggle,
  storageOptions,
  selectedStorages,
  onStorageToggle,
  inStockOnly = false,
  onInStockToggle,
}) {
  const pricePresets = [
    { label: "Under £200", min: "", max: "200" },
    { label: "£200 – £400", min: "200", max: "400" },
    { label: "£400 – £600", min: "400", max: "600" },
    { label: "£600+", min: "600", max: "" },
  ];

  const handlePricePreset = (preset) => {
    onMinPriceChange(preset.min);
    onMaxPriceChange(preset.max);
  };

  return (
    <aside className="bg-white border rounded-4 p-4 h-100 shadow-sm" style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}>
      {/* Title */}
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

      {/* Phone Categories */}
      <div className="mb-4 pb-4 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2">
          Brand Category
        </label>
        <div className="d-flex flex-column gap-2">
          {categoryOptions.map((option) => {
            const isSelected = selectedCategories.includes(option.value);
            return (
              <div
                key={option.value}
                className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2.5 border transition-all cursor-pointer ${
                  isSelected ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm fw-bold text-primary" : "border-light-subtle bg-white text-dark hover-bg-light"
                }`}
                onClick={() => onCategoryToggle(option.value)}
                style={{ cursor: "pointer", fontSize: "0.9rem" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={isSelected}
                    onChange={() => onCategoryToggle(option.value)}
                  />
                  <span>{option.label}</span>
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
            const isPresetActive = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                className={`btn btn-xs rounded-pill px-3 py-1.5 transition-all ${
                  isPresetActive ? "btn-primary fw-bold shadow-xs text-white" : "btn-outline-secondary text-dark hover-bg-light"
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

      {/* Refurbished Cosmetic Condition Grade */}
      <div className="mb-4 pb-4 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase tracking-wider mb-2.5">
          Cosmetic Condition Tier
        </label>
        <div className="d-flex flex-column gap-2">
          {conditionOptions.map((condition) => {
            const isSelected = selectedConditions.includes(condition);
            let gradeBadgeClass = "bg-primary-subtle text-primary border-primary";
            if (condition.toLowerCase().includes("pristine") || condition.toLowerCase().includes("excellent")) {
              gradeBadgeClass = "bg-success-subtle text-success border-success-subtle";
            } else if (condition.toLowerCase().includes("good")) {
              gradeBadgeClass = "bg-info-subtle text-info border-info-subtle";
            }

            return (
              <div
                key={condition}
                className={`d-flex align-items-center justify-content-between rounded-3 px-3 py-2.5 border transition-all cursor-pointer ${
                  isSelected ? "border-primary bg-primary-subtle bg-opacity-10 shadow-sm" : "border-light-subtle bg-white hover-bg-light"
                }`}
                onClick={() => onConditionToggle(condition)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <input
                    type="checkbox"
                    className="form-check-input mt-0"
                    checked={isSelected}
                    onChange={() => onConditionToggle(condition)}
                  />
                  <span className={`small fw-bold ${isSelected ? "text-primary" : "text-dark"}`}>
                    {condition}
                  </span>
                </div>
                <span className={`badge border px-2 py-1 ${gradeBadgeClass}`} style={{ fontSize: "0.65rem" }}>
                  Verified Grade
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
                onClick={() => onStorageToggle(storage)}
              >
                {storage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Notice */}
      <div className="bg-light border rounded-3 p-3 text-muted small mt-4" style={{ fontSize: "0.78rem" }}>
        <div className="d-flex align-items-center gap-1.5 fw-bold text-dark mb-1">
          <ShieldCheck size={16} className="text-success" /> Quality Assured
        </div>
        Every refurbished phone includes a 12-Month Seller Warranty, 85%+ Battery Guarantee, and 50-Point Diagnostic Certificate.
      </div>
    </aside>
  );
}

