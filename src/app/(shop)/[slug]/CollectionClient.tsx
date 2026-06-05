"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import { Pagination } from "@/components/shop/Pagination";
import Filter, { FilterState } from "@/components/shop/Fillter";

const PRODUCTS_PER_PAGE = 8;

const COLOR_MAPPING: Record<string, string> = {
  "black": "Đen",
  "dark-brown": "Nâu đậm",
  "brown": "Nâu",
  "tan": "Nâu nhạt",
  "gray": "Xám",
  "white": "Trắng",
  "navy": "Xanh navy",
  "burgundy": "Đỏ đô",
  "olive": "Xanh rêu",
};

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read page from URL, default to 1 if not present or invalid
  const queryPage = searchParams.get("page");
  const initialPage = queryPage ? parseInt(queryPage, 10) : 1;
  const [currentPage, setCurrentPage] = useState(isNaN(initialPage) ? 1 : initialPage);

  // Sync state if URL changes (e.g. going back/forward in browser history)
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      const parsed = parseInt(page, 10);
      if (!isNaN(parsed) && parsed !== currentPage) {
        setCurrentPage(parsed);
      }
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const queryCategory = searchParams.get("category");

  const [filterState, setFilterState] = useState<FilterState>(() => ({
    category: queryCategory || "Tất cả",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  }));

  // Sync state if URL changes (e.g. going back/forward or clicking breadcrumbs)
  useEffect(() => {
    const page = searchParams.get("page");
    if (page) {
      const parsed = parseInt(page, 10);
      if (!isNaN(parsed) && parsed !== currentPage) {
        setCurrentPage(parsed);
      }
    } else {
      setCurrentPage(1);
    }

    const cat = searchParams.get("category");
    if (cat) {
      if (cat !== filterState.category) {
        setFilterState((prev) => ({ ...prev, category: cat }));
        setCurrentPage(1);
      }
    } else {
      if (filterState.category !== "Tất cả" && filterState.category !== "all") {
        setFilterState((prev) => ({ ...prev, category: "Tất cả" }));
        setCurrentPage(1);
      }
    }
  }, [searchParams]);

  // Client-side filtering
  const filteredProducts = initialProducts.filter((product) => {
    // Category filter
    if (
      filterState.category &&
      filterState.category !== "all" &&
      filterState.category !== "Tất cả"
    ) {
      const p = product as Product & { categorySlugs?: string[] };
      if (!p.categorySlugs || !p.categorySlugs.includes(filterState.category)) {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    router.push(`/${slug}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const handleFilterChange = (state: FilterState) => {
    setFilterState(state);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (state.category && state.category !== "Tất cả" && state.category !== "all") {
      params.set("category", state.category);
    } else {
      params.delete("category");
    }

    const queryString = params.toString();
    router.push(`/${slug}${queryString ? `?${queryString}` : ""}`, { scroll: false });
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
          { label: collectionTitle, href: `/${slug}` },
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
              parentSlug={slug}
            />
          </LiquidGlassCard>
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 min-h-[70vh] flex flex-col">
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  );
}
