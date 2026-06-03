"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { Navpages } from "@/components/shop/Navpages";
import Filter, { FilterState } from "@/components/shop/Fillter";
import { useProducts } from "@/hooks/useProducts";
import { useProductsByCategories } from "@/hooks/useProductsByCategories";
import { Product } from "@/types/product";
import type { CollectionSeo } from "@/lib/collection-seo";

const PARENT_CATEGORIES = ["boot-nam", "boot-nu", "phu-kien", "outfit"];
const PRODUCTS_PER_PAGE = 8;

interface CollectionPageClientProps {
  slug: string;
  meta: CollectionSeo;
}

export default function CollectionPageClient({
  slug,
  meta,
}: CollectionPageClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<FilterState>({
    category: "Tat ca",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  const isParentCategory = PARENT_CATEGORIES.includes(slug);
  const { products: parentProducts, loading: parentLoading } =
    useProductsByCategories(isParentCategory ? slug : "", 100);

  const {
    products: directProducts,
    loading: directLoading,
    pagination,
  } = useProducts(
    !isParentCategory
      ? {
          categorySlug: slug,
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          minPrice: filterState.priceMin > 0 ? filterState.priceMin : undefined,
          maxPrice:
            filterState.priceMax < 5_000_000 ? filterState.priceMax : undefined,
        }
      : undefined,
    { enabled: !isParentCategory },
  );

  const loading = isParentCategory ? parentLoading : directLoading;
  const allProducts = isParentCategory ? parentProducts : directProducts;
  const totalPages = isParentCategory
    ? Math.max(1, Math.ceil(allProducts.length / PRODUCTS_PER_PAGE))
    : (pagination?.totalPages ?? 1);
  const products = isParentCategory
    ? allProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE,
      )
    : allProducts;

  const handleFilterChange = (state: FilterState) => {
    setFilterState(state);
    setCurrentPage(1);
  };

  const toggleFavorite = (product: Product) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });
  };

  return (
    <>
      <section className="relative w-full h-screen overflow-hidden">
        <Image
          src={meta.heroImage}
          alt={meta.heroTitle}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/15 to-transparent">
          <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 pb-16 md:pb-24 text-white">
            <h1 className="max-w-3xl text-4xl md:text-6xl font-serif font-bold leading-tight">
              {meta.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base md:text-lg text-white/90">
              {meta.heroDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 mt-8 mb-8">
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: meta.title, href: `/${slug}` },
            { label: `Trang ${currentPage}` },
          ]}
        />

        <div className="mb-8 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-black">
            {meta.title}
          </h2>
          <p className="mt-3 text-sm md:text-base leading-7 text-gray-600">
            {meta.contentIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          <aside className="md:sticky md:top-28 md:self-start">
            <LiquidGlassCard
              draggable={false}
              blurIntensity="xl"
              glowIntensity="lg"
              shadowIntensity="lg"
              borderRadius="20px"
            >
              <Filter onChange={handleFilterChange} className="relative z-30" />
            </LiquidGlassCard>
          </aside>

          <div className="min-w-0 min-h-[70vh] flex flex-col">
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse bg-gray-100 rounded-2xl p-3"
                    >
                      <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
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
                    Khong tim thay san pham phu hop
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Hay thu dieu chinh bo loc de xem them san pham khac.
                  </p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    &lt;
                  </button>
                )}
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
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
                  ),
                )}
                {currentPage < totalPages && (
                  <button
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
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
    </>
  );
}
