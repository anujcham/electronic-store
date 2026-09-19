"use client";

import React from "react";
import { Pagination } from "@heroui/react";

const linkClass = "text-muted hover:bg-surface hover:text-foreground cursor-pointer transition-colors";
const activeClass = "bg-primary text-white hover:bg-primary-dark cursor-pointer fw-bold";

export function CommonPagination({
  page = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 15,
  itemName = "items",
  onPageChange,
  className = "",
}) {
  if (totalCount === 0 && totalPages <= 1) {
    return null;
  }

  const currentPage = Math.max(1, Math.min(Number(page) || 1, Math.max(1, totalPages)));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Helper to generate smart windowed pages with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const showLeftEllipsis = currentPage > 4;
    const showRightEllipsis = currentPage < totalPages - 3;

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push("ellipsis-left");
    }

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (showRightEllipsis) {
      pages.push("ellipsis-right");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  return (
    <div
      className={`d-flex flex-column flex-md-row align-items-center justify-content-between bg-white border rounded-3 p-3 mt-3 shadow-xs gap-3 ${className}`}
      style={{ borderColor: "rgba(226, 232, 240, 0.9)" }}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="small text-muted fw-semibold" style={{ fontSize: "0.82rem" }}>
          Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
          <strong>{totalCount}</strong> {itemName}
          {totalPages > 1 && (
            <span className="text-secondary ms-1 fw-normal">
              (Page {currentPage} of {totalPages})
            </span>
          )}
        </span>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-center m-0">
          <Pagination.Content className="gap-1 rounded-2 bg-light p-1 border">
            {/* Previous Page Button */}
            <Pagination.Item>
              <Pagination.Previous
                className={linkClass}
                isDisabled={currentPage <= 1}
                onPress={() => handlePageClick(currentPage - 1)}
                title="Previous Page"
              >
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>

            {/* Page Number Buttons */}
            {getPageNumbers().map((p, idx) => {
              if (typeof p === "string" && p.startsWith("ellipsis")) {
                return (
                  <Pagination.Item key={`ellipsis-${idx}`}>
                    <span className="px-2 py-1 text-muted user-select-none" style={{ fontSize: "0.85rem" }}>
                      …
                    </span>
                  </Pagination.Item>
                );
              }

              const isCurrent = p === currentPage;
              return (
                <Pagination.Item key={`page-${p}`}>
                  <Pagination.Link
                    className={isCurrent ? activeClass : linkClass}
                    isActive={isCurrent}
                    onPress={() => handlePageClick(p)}
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.82rem",
                      borderRadius: "6px",
                    }}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              );
            })}

            {/* Next Page Button */}
            <Pagination.Item>
              <Pagination.Next
                className={linkClass}
                isDisabled={currentPage >= totalPages}
                onPress={() => handlePageClick(currentPage + 1)}
                title="Next Page"
              >
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
    </div>
  );
}

export default CommonPagination;

