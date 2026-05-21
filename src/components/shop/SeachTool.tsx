"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn, formatCurrency } from "@/lib/utils";
import { Product, getProductImageUrl, getDisplayPrice } from "@/types/product";

// --- Utility Functions ---

/**
 * Normalizes Vietnamese text by converting to lowercase,
 * removing diacritical marks, and replacing đ/Đ with d/D.
 */
export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Filters products by matching normalized query against product name.
 * Returns first 4 products when query is empty, otherwise filters and caps at 4.
 */
export function filterProducts(products: Product[], query: string): Product[] {
  if (query.trim() === "") {
    return products.slice(0, 4);
  }

  const normalizedQuery = normalizeVietnamese(query.trim());

  const filtered = products.filter((product) => {
    const normalizedName = normalizeVietnamese(product.name);

    return normalizedName.includes(normalizedQuery);
  });

  return filtered.slice(0, 4);
}

// --- Component Interface ---

export interface SearchToolProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  popularSearches?: string[];
}

// --- Inline Sub-Components ---

interface SearchHeaderProps {
  onClose: () => void;
}

function SearchHeader({ onClose }: SearchHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="content text-lg font-semibold text-[var(--text-main)]">
        Tìm kiếm sản phẩm
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
        aria-label="Đóng"
      >
        <X size={20} className="text-[var(--text-main)]" />
      </button>
    </div>
  );
}

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function SearchInput({ query, onQueryChange, onKeyDown, inputRef }: SearchInputProps) {
  return (
    <div className="flex items-center gap-3 mb-5 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-4">
      <div className="flex items-center justify-center shrink-0">
        <Search size={18} className="text-[var(--text-label)]" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Bạn cần tìm gì hôm nay?"
        className={cn(
          "flex-1 h-full bg-transparent text-[var(--text-main)]",
          "placeholder:text-[var(--text-label)]",
          "outline-none border-none",
          "text-sm"
        )}
      />
    </div>
  );
}

interface PopularSearchesProps {
  tags: string[];
  onTagClick: (tag: string) => void;
}

function PopularSearches({ tags, onTagClick }: PopularSearchesProps) {
  if (tags.length === 0) return null;

  return (
    <div className="my-4">
      <p className="text-xs font-medium text-[var(--text-label)] uppercase tracking-wide mb-3">
        Tìm kiếm phổ biến
      </p>
      <div className="flex flex-wrap gap-2 py-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag)}
            className={cn(
              "px-4 py-2 rounded-full text-sm",
              "border border-[var(--border-subtle)]",
              "text-[var(--text-main)] bg-transparent",
              "hover:bg-[var(--bg-secondary)] transition-colors",
              "cursor-pointer"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ProductSuggestionsProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

function ProductSuggestions({ products, onProductClick }: ProductSuggestionsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-[var(--text-label)] uppercase tracking-wide mb-3">
        Gợi ý sản phẩm
      </p>
      <div className="py-2 grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onProductClick(product)}
            className={cn(
              "flex flex-row items-stretch gap-3 p-3 rounded-xl",
              "border-2 border-gray-200",
              "hover:shadow-md transition-all",
              "bg-gray-100/60 cursor-pointer text-left"
            )}
          >
            <div className="relative w-[75px] h-[85px] shrink-0 rounded-lg overflow-hidden">
              <Image
                src={getProductImageUrl(product)}
                alt={product.name}
                fill
                sizes="75px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0 h-full self-stretch py-2">
              <span className="text-xs text-[var(--text-main)] font-medium line-clamp-2 leading-tight">
                {product.name}
              </span>
              <span className="text-xs font-bold text-[var(--text-main)]">
                {formatCurrency(getDisplayPrice(product))}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ViewAllFooterProps {
  query: string;
  onViewAll: () => void;
}

function ViewAllFooter({ query, onViewAll }: ViewAllFooterProps) {
  if (!query.trim()) return null;

  return (
    <div className="border-t border-[var(--border-subtle)] pt-3 mt-2">
      <button
        type="button"
        onClick={onViewAll}
        className="w-full flex items-center justify-between py-2 text-sm text-[var(--text-main)] hover:text-black transition-colors cursor-pointer"
      >
        <span>
          Xem tất cả kết quả cho &apos;{query}&apos;
        </span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// --- Main Component ---

export function SearchTool({
  isOpen,
  onClose,
  products,
  popularSearches,
}: SearchToolProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(
    () => filterProducts(products, query),
    [products, query]
  );

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset query and auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.slug}`);
    onClose();
  };

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div data-testid="search-tool">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="search-backdrop"
              className="fixed inset-0 bg-black/10 z-40"
              onClick={onClose}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Dropdown Panel — positioned below header */}
            <motion.div
              key="search-panel"
              className={cn(
                "absolute top-full left-0 right-0 my-2 z-50",
                "mx-auto max-w-[850px] px-6 md:px-10"
              )}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onAnimationComplete={() => {
                inputRef.current?.focus();
              }}
            >
              <div
                className={cn(
                  "w-full rounded-[var(--radius-section)]",
                  "bg-white/70 backdrop-blur-xl border border-white/50",
                  "shadow-[0_18px_50px_rgba(0,0,0,0.12),0_6px_18px_rgba(0,0,0,0.05)]",
                  "p-6 sm:p-8",
                  "max-h-[75vh] overflow-y-auto"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <SearchHeader onClose={onClose} />

                <SearchInput
                  query={query}
                  onQueryChange={setQuery}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef}
                />

                <PopularSearches
                  tags={popularSearches ?? []}
                  onTagClick={handleTagClick}
                />

                <ProductSuggestions
                  products={filteredProducts}
                  onProductClick={handleProductClick}
                />

                <ViewAllFooter
                  query={query}
                  onViewAll={handleViewAll}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
