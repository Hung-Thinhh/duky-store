"use client";

import React, { useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import Filter, { FilterState } from "@/components/shop/Fillter";

const PRODUCTS_PER_PAGE = 8;

interface CollectionClientProps {
  initialProducts: Product[];
  slug: string;
  collectionTitle: string;
}

export default function CollectionClient({
  initialProducts,
  slug,
  collectionTitle,
}: CollectionClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<FilterState>({
    category: "Tất cả",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  // Client-side filtering
  const filteredProducts = initialProducts.filter((product) => {
    // Price filter
    const price = product.salePrice ?? product.originalPrice ?? product.price ?? 0;
    if (filterState.priceMin > 0 && price < filterState.priceMin) return false;
    if (filterState.priceMax < 5_000_000 && price > filterState.priceMax) return false;
    return true;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const products = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleFilterChange = (state: FilterState) => {
    setFilterState(state);
    setCurrentPage(1);
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
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 mt-8 mb-8">
      {/* Breadcrumb */}
      <Navpages
        items={[
          { label: "Trang chủ", href: "/" },
          { label: collectionTitle, href: `/collections/${slug}` },
          { label: `Trang ${currentPage}` },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Filter Sidebar */}
        <aside className="md:sticky md:top-28 md:self-start">
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

        {/* Product Grid */}
        <div className="min-w-0 min-h-[70vh] flex flex-col">
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Không tìm thấy sản phẩm phù hợp
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Hãy thử điều chỉnh bộ lọc để xem thêm sản phẩm khác.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-10">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  &lt;
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-black text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  &gt;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
