"use client";

import React, { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import Filter, { FilterState } from "@/components/shop/Fillter";
import { useProducts } from "@/hooks/useProducts";
import { useProductsByCategories } from "@/hooks/useProductsByCategories";

// Parent categories that need to include children products
const PARENT_CATEGORIES = ["boot-nam", "boot-nu", "phu-kien", "outfit"];

// ─── Collection metadata (hero banners, titles) ─────────────────────────────
const COLLECTION_META: Record<string, { title: string; description: string; heroImage: string; heroTitle: string; heroDescription: string }> = {
  "boot-nam": {
    title: "Giày Boot Nam Cao Cấp",
    description: "Bộ sưu tập giày boot nam cao cấp - Da thật, thiết kế tinh tế.",
    heroImage: "/assets/banner_boot_nam.png",
    heroTitle: "GIÀY BOOT\nNAM CAO CẤP",
    heroDescription: "Thiết kế tinh tế - Da thật cao cấp - Bền bỉ theo thời gian",
  },
  "boot-nu": {
    title: "Giày Boot Nữ Cao Cấp",
    description: "Bộ sưu tập giày boot nữ - Thanh lịch, quyến rũ.",
    heroImage: "/assets/banner_boot_nu.png",
    heroTitle: "GIÀY BOOT\nNỮ CAO CẤP",
    heroDescription: "Tôn dáng trong từng bước đi - Phong cách nữ tính hiện đại",
  },
  "phu-kien": {
    title: "Phụ Kiện",
    description: "Phụ kiện thời trang cao cấp.",
    heroImage: "/assets/phu_kien.png",
    heroTitle: "PHỤ KIỆN\nCAO CẤP",
    heroDescription: "Hoàn thiện phong cách với phụ kiện đẳng cấp",
  },
  "outfit": {
    title: "Outfit",
    description: "Gợi ý phối đồ cùng boot.",
    heroImage: "/assets/out_fit.png",
    heroTitle: "OUTFIT\nPHỐI ĐỒ",
    heroDescription: "Gợi ý phong cách phối đồ cùng boot Duky",
  },
};

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

const PRODUCTS_PER_PAGE = 8;

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params);
  const meta = COLLECTION_META[slug];

  if (!meta) {
    notFound();
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<FilterState>({
    category: "Tất cả",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  // Build API params from filter state
  const isParentCategory = PARENT_CATEGORIES.includes(slug);

  // For parent categories, fetch from parent + all children automatically
  const { products: parentProducts, loading: parentLoading } = useProductsByCategories(
    isParentCategory ? slug : "",
    100
  );

  // For regular categories, use normal hook
  const { products: directProducts, loading: directLoading, pagination } = useProducts(
    !isParentCategory ? {
      categorySlug: slug,
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      minPrice: filterState.priceMin > 0 ? filterState.priceMin : undefined,
      maxPrice: filterState.priceMax < 5_000_000 ? filterState.priceMax : undefined,
    } : undefined
  );

  // Merge results
  const loading = isParentCategory ? parentLoading : directLoading;
  const allProducts = isParentCategory ? parentProducts : directProducts;

  // Client-side pagination for parent categories
  const totalPages = isParentCategory
    ? Math.ceil(allProducts.length / PRODUCTS_PER_PAGE)
    : (pagination?.totalPages ?? 1);
  const products = isParentCategory
    ? allProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
    : allProducts;

  const handleFilterChange = (state: FilterState) => {
    setFilterState(state);
    setCurrentPage(1); // Reset to page 1 when filters change
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
      {/* ═══ SECTION 1: Hero Banner ═══ */}
      <section className="relative w-full h-screen overflow-hidden">
        <Image
          src={meta.heroImage}
          alt={meta.heroTitle}
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* ═══ SECTION 2: Product Showcase ═══ */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-16 mt-8 mb-8">
        {/* Breadcrumb */}
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: meta.title, href: `/collections/${slug}` },
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
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-100 rounded-2xl p-3">
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
    </>
  );
}
