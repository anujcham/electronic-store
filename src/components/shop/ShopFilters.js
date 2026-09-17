"use client";

import { Tag, ShieldCheck, Check } from "lucide-react";

export function ShopFilters({
  brandOptions = [],
  selectedBrands = [],
  onBrandToggle,
  minPrice = "",
  maxPrice = "",
  onMinPriceChange,
  onMaxPriceChange,
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
    <aside className="bg-white border rounded-4 p-4 shadow-sm h-auto align-self-start" style={{ borderColor: "rgba(148, 163, 184, 0.2)" }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
        <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.05rem" }}>
          <Tag size={17} className="text-primary" />
          <span>Filter Devices</span>
        </h5>
      </div>

      {/* Smartphone Brand Filter */}
      <div className="mb-4 pb-3 border-bottom">
        <label className="form-label fw-bold text-dark small text-uppercase mb-2.5 d-block" style={{ letterSpacing: "0.06em", fontSize: "0.72rem" }}>
          Smartphone Brand
        </label>
        <div className="d-flex flex-column" style={{ gap: "3px" }}>
          {brandOptions.map((brand) => {
            const isSelected = selectedBrands.includes(brand);
            return (
              <div
                key={brand}
                className="d-flex align-items-center justify-content-between py-1.5 px-2 rounded-2 transition-all cursor-pointer user-select-none filter-row-item"
                onClick={() => onBrandToggle && onBrandToggle(brand)}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                  {/* Custom Modern Checkbox */}
                  <div
                    className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 transition-all"
                    style={{
                      width: "18px",
                      height: "18px",
                      border: isSelected ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1",
                      backgroundColor: isSelected ? "#2563eb" : "#ffffff",
                      color: "#ffffff",
                      boxShadow: isSelected ? "0 1px 3px rgba(37, 99, 235, 0.25)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>

                  <span
                    className="transition-all"
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: isSelected ? "600" : "500",
                      color: isSelected ? "#2563eb" : "#1e293b",
                    }}
                  >
                    {brand}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Price Ranges */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase mb-2.5 d-block" style={{ letterSpacing: "0.06em", fontSize: "0.72rem" }}>
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
                className={`btn btn-xs rounded-pill px-3 py-1.5 transition-all border ${
                  isPresetActive
                    ? "btn-primary fw-bold shadow-xs text-white border-primary"
                    : "btn-light text-dark border-light-subtle hover-bg-light"
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
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ fontSize: "0.8rem" }}>£</span>
              <input
                type="number"
                min="0"
                className="form-control form-control-sm border-start-0 py-1.5 ps-1"
                placeholder="Min"
                value={minPrice}
                onChange={(event) => onMinPriceChange(event.target.value)}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
          <div className="col-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted" style={{ fontSize: "0.8rem" }}>£</span>
              <input
                type="number"
                min="0"
                className="form-control form-control-sm border-start-0 py-1.5 ps-1"
                placeholder="Max"
                value={maxPrice}
                onChange={(event) => onMaxPriceChange(event.target.value)}
                style={{ fontSize: "0.85rem" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assurance Notice */}
      <div className="bg-light border rounded-3 p-3 text-muted small mt-4" style={{ fontSize: "0.78rem" }}>
        <div className="d-flex align-items-center gap-2 fw-bold text-dark mb-1">
          <ShieldCheck size={15} className="text-success" /> Quality Guarantee
        </div>
        All handsets pass 90-point diagnostics with a 12-month UK warranty and 85%+ battery health.
      </div>

      <style jsx>{`
        .filter-row-item:hover {
          background-color: #f8fafc;
        }
        .filter-row-item:hover span {
          color: #2563eb !important;
        }
      `}</style>
    </aside>
  );
}
