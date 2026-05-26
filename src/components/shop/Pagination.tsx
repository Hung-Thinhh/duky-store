"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    let left = Math.max(2, currentPage - 1);
    let right = Math.min(totalPages - 1, currentPage + 1);

    // Adjust boundaries to show a reasonable block of pages
    if (currentPage <= 3) {
      right = 4;
    }
    if (currentPage >= totalPages - 2) {
      left = totalPages - 3;
    }

    // Add left ellipsis or page 2
    if (left > 2) {
      if (left === 3) {
        pages.push(2);
      } else {
        pages.push("...");
      }
    }

    // Add middle pages
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    // Add right ellipsis or second to last page
    if (right < totalPages - 1) {
      if (right === totalPages - 2) {
        pages.push(totalPages - 1);
      } else {
        pages.push("...");
      }
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex items-center justify-center gap-1 md:gap-2 pt-10", className)}>
      {/* Previous Page Button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black disabled:text-gray-300 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="w-10 h-10 flex items-center justify-center text-gray-400 select-none text-sm font-medium"
            >
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page as number)}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors cursor-pointer",
              isCurrent
                ? "bg-black/5 text-black"
                : "text-gray-500 hover:text-black hover:bg-gray-50"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-10 h-10 flex items-center justify-center text-black hover:text-gray-600 disabled:text-gray-300 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default Pagination;
