"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";

/**
 * Reusable Admin Search Input Component
 * Features:
 * - Clean modern design with subtle focus ring
 * - Responsive sizing: Compact (~280-320px) on laptop/desktop, 100% on mobile
 * - Search icon on left and 1-click Clear (X) button on right
 * - Optional loading spinner while backend API request is debouncing/fetching
 */
export default function AdminSearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search records...",
  isLoading = false,
  className = "",
  maxWidth = 310,
  disabled = false,
  id,
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onChange) onChange("");
    if (onClear) onClear();
  };

  return (
    <div
      className={`admin-search-wrapper w-100 ${className}`}
      style={{
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      }}
    >
      <div
        className={`d-flex align-items-center gap-2 px-3 py-1.5 rounded-3 bg-white transition-all ${
          isFocused ? "border-primary shadow-xs" : "border-secondary-subtle"
        }`}
        style={{
          border: isFocused ? "1px solid #2563eb" : "1px solid #cbd5e1",
          boxShadow: isFocused ? "0 0 0 3px rgba(37, 99, 235, 0.12)" : "0 1px 2px rgba(0, 0, 0, 0.04)",
          minHeight: "38px",
          height: "38px",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {/* Search Icon or Loading Spinner */}
        {isLoading ? (
          <Loader2 size={15} className="text-primary flex-shrink-0 animate-spin" />
        ) : (
          <Search size={15} className="text-muted flex-shrink-0" style={{ opacity: 0.75 }} />
        )}

        {/* Input Element */}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className="form-control form-control-sm border-0 bg-transparent p-0 shadow-none text-dark"
          style={{
            fontSize: "0.84rem",
            fontWeight: "400",
            outline: "none",
          }}
        />

        {/* Clear Button (X) */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-sm p-0 border-0 flex-shrink-0 d-flex align-items-center justify-content-center text-muted transition-all"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
              lineHeight: 1,
            }}
            title="Clear search"
          >
            <X size={11} className="text-secondary" />
          </button>
        )}
      </div>
    </div>
  );
}

