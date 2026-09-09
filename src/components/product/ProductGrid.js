"use client";

import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products = [],
  columns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  },
  emptyMessage = "No products available at the moment.",
}) {
  if (!products.length) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">{emptyMessage}</p>
      </div>
    );
  }

  const getColumnClass = (size, count) => {
    if (count === 1) {
      return `col-${size}-12`;
    }

    if (count === 2) {
      return `col-${size}-6`;
    }

    if (count === 3) {
      return `col-${size}-4`;
    }

    return `col-${size}-3`;
  };

  return (
    <div className="row g-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={[
            getColumnClass("xs", columns.xs ?? 1),
            getColumnClass("sm", columns.sm ?? 2),
            getColumnClass("md", columns.md ?? 2),
            getColumnClass("lg", columns.lg ?? 3),
            getColumnClass("xl", columns.xl ?? 4),
          ].join(" ")}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
