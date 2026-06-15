"use client";

import React, { useState, useEffect, useRef } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import dynamic from "next/dynamic";
import type { FilterState } from "@/components/shop/Fillter";

const Filter = dynamic(() => import("@/components/shop/Fillter"), {
  loading: () => (
    <div className="animate-pulse h-[400px] bg-gray-50 rounded-2xl" />
  ),
  ssr: false,
});

const PRODUCTS_PER_PAGE = 12;

const COLOR_MAPPING: Record<string, string> = {
  black: "Đen",
  "dark-brown": "Nâu đậm",
  brown: "Nâu",
  tan: "Nâu nhạt",
  gray: "Xám",
  white: "Trắng",
  navy: "Xanh navy",
  burgundy: "Đỏ đô",
  olive: "Xanh rêu",
};

interface ProductsClientProps {
  initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  const [filterState, setFilterState] = useState<FilterState>({
    category: "all",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  // Client-side filtering
  const filteredProducts = initialProducts.filter((product) => {
    // Category filter
    if (
      filterState.category &&
      filterState.category !== "all" &&
      filterState.category !== "Tất cả"
    ) {
      const p = product as Product & { categorySlugs?: string[] };
      if (
        !p.categorySlugs ||
        !p.categorySlugs.includes(filterState.category)
      ) {
        return false;
      }
    }

    // Size filter
    if (filterState.sizes && filterState.sizes.length > 0) {
      const hasMatchingSize = product.variants?.some((variant: any) => {
        if (!variant.sizeLabel) return false;
        const sizeNum = parseInt(variant.sizeLabel, 10);
        return !isNaN(sizeNum) && filterState.sizes.includes(sizeNum);
      });
      if (!hasMatchingSize) return false;
    }

    // Color filter
    if (filterState.colors && filterState.colors.length > 0) {
      const selectedColorNames = filterState.colors
        .map((c) => COLOR_MAPPING[c])
        .filter(Boolean);

      const hasMatchingColor = product.variants?.some((variant: any) => {
        if (!variant.colorName) return false;
        const normalizedColor = variant.colorName.trim().toLowerCase();
        return selectedColorNames.some(
          (name) => name.toLowerCase() === normalizedColor
        );
      });
      if (!hasMatchingColor) return false;
    }

    // Price filter
    const price =
      product.salePrice != null && product.salePrice > 0
        ? product.salePrice
        : product.originalPrice ?? product.price ?? 0;
    if (filterState.priceMin > 0 && price < filterState.priceMin) return false;
    if (filterState.priceMax < 5_000_000 && price > filterState.priceMax)
      return false;

    return true;
  });

  // Client-side pagination -> infinite scroll slice
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const products = filteredProducts.slice(0, currentPage * PRODUCTS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [currentPage, totalPages]);

  const handleFilterChange = (state: FilterState) => {
    setFilterState(state);
  };

  const toggleFavorite = (product: Product) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
  };

  return (
    <>
      <section className="products-page mt-8">
          <Navpages
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Tất cả sản phẩm" },
            ]}
          />

          <div className="products-layout">
            <aside className="products-filter">
              <LiquidGlassCard
                draggable={false}
                blurIntensity="xl"
                glowIntensity="lg"
                shadowIntensity="lg"
                borderRadius="20px"
              >
                <Filter
                  onChange={handleFilterChange}
                  className="relative z-30"
                />
              </LiquidGlassCard>
            </aside>

            <div className="products-grid-wrap">
              <div className="products-grid-inner">
                {products.length > 0 ? (
                  <>
                    <div className="products-grid">
                      {products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isFavorite={favoriteIds.has(product.id)}
                          onToggleFavorite={toggleFavorite}
                          priority={index < 4}
                        />
                      ))}
                    </div>
                    {currentPage > 1 && currentPage < totalPages && (
                      <div className="products-grid mt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="product-skeleton">
                            <div className="skeleton-img" />
                            <div className="skeleton-text skeleton-text--long" />
                            <div className="skeleton-text skeleton-text--short" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="products-empty">
                    <PackageOpen size={64} className="products-empty-icon" />
                    <h3 className="products-empty-title">
                      Không tìm thấy sản phẩm phù hợp
                    </h3>
                    <p className="products-empty-desc">
                      Hãy thử điều chỉnh bộ lọc để xem thêm sản phẩm khác.
                    </p>
                  </div>
                )}
              </div>

              {currentPage < totalPages && (
                <div
                  ref={loaderRef}
                  className="flex justify-center items-center py-8"
                >
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-black rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </section>

      <style jsx>{`
        .products-page {
          max-width: 1440px;
          margin: 32px auto 0;
          padding: 0 2rem 80px;
        }

        .products-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
        }

        .products-filter {
          position: sticky;
          top: 112px;
          align-self: start;
        }

        .products-grid-wrap {
          min-width: 0;
          min-height: 70vh;
          display: flex;
          flex-direction: column;
        }

        .products-grid-inner {
          flex: 1;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .product-skeleton {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 12px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-img {
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          background: var(--bg-secondary);
          margin-bottom: 12px;
        }

        .skeleton-text {
          height: 14px;
          border-radius: 6px;
          background: var(--bg-secondary);
          margin-bottom: 8px;
        }

        .skeleton-text--long {
          width: 75%;
        }
        .skeleton-text--short {
          width: 50%;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .products-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          text-align: center;
        }

        :global(.products-empty-icon) {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .products-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .products-empty-desc {
          font-size: 13px;
          color: var(--text-muted);
          max-width: 300px;
        }

        @media (max-width: 1024px) {
          .products-layout {
            grid-template-columns: 1fr;
          }

          .products-filter {
            position: static;
          }

          .products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .products-page {
             padding: 0 1rem 60px;
          }

          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
