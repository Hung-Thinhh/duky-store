"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import Filter, { FilterState } from "@/components/shop/Fillter";
import { useProducts } from "@/hooks/useProducts";
import { CatalogBannerSlots } from "@/lib/api";

const PRODUCTS_PER_PAGE = 12;

interface SearchClientProps {
  bannerSlot?: CatalogBannerSlots | null;
}

export function SearchClient({ bannerSlot }: SearchClientProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<FilterState>({
    category: "all",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  const [accumulatedProducts, setAccumulatedProducts] = useState<Product[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch products by search query + selected category + price range
  const { products, loading, pagination } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    search: query,
    categorySlug:
      filterState.category !== "all" ? filterState.category : undefined,
    minPrice: filterState.priceMin > 0 ? filterState.priceMin : undefined,
    maxPrice:
      filterState.priceMax < 5_000_000 ? filterState.priceMax : undefined,
  });

  const totalPages = pagination?.totalPages ?? 1;

  // Reset accumulated products and page when query changes
  useEffect(() => {
    setCurrentPage(1);
    setAccumulatedProducts([]);
  }, [query]);

  // Reset accumulated products when filter state changes
  useEffect(() => {
    setAccumulatedProducts([]);
  }, [filterState]);

  // Accumulate products as pages load
  useEffect(() => {
    if (products && products.length > 0) {
      setAccumulatedProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = products.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
    }
  }, [products]);

  // IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages && !loading) {
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
  }, [currentPage, totalPages, loading]);

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

  const hasBanner = !!(bannerSlot?.desktop?.image || bannerSlot?.tablet?.image || bannerSlot?.mobile?.image);

  return (
    <>

      {/* Hero Banner */}
      {hasBanner && (
        <section
          className="relative w-full"
          style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
        >
          {/* Desktop image layout */}
          {bannerSlot?.desktop?.image && (
            <div className="hidden md:block w-full relative">
              <Image
                src={bannerSlot.desktop.image}
                alt={bannerSlot.desktop.titleLine1 || "Tìm kiếm sản phẩm - Duky Store"}
                width={1920}
                height={1080}
                sizes="100vw"
                className="w-full h-auto object-cover"
                priority
              />
              {/* Desktop Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
                  <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
                    {bannerSlot.desktop.badge && (
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                        {bannerSlot.desktop.badge}
                      </span>
                    )}
                    {(bannerSlot.desktop.titleLine1 || bannerSlot.desktop.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {bannerSlot.desktop.titleLine1 && (
                          <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                            {bannerSlot.desktop.titleLine1}
                          </span>
                        )}
                        {bannerSlot.desktop.titleLine2 && (
                          <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                              {bannerSlot.desktop.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {bannerSlot.desktop.description && (
                      <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                        <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                          {bannerSlot.desktop.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tablet image layout */}
          {bannerSlot?.tablet?.image && (
            <div className="hidden sm:block md:hidden w-full relative">
              <Image
                src={bannerSlot.tablet.image}
                alt={bannerSlot.tablet.titleLine1 || "Tìm kiếm sản phẩm - Duky Store"}
                width={1024}
                height={576}
                sizes="100vw"
                className="w-full h-[320px] object-cover"
                priority
              />
              {/* Tablet Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[1024px] mx-auto px-6 md:px-20">
                  <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
                    {bannerSlot.tablet.badge && (
                      <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                        {bannerSlot.tablet.badge}
                      </span>
                    )}
                    {(bannerSlot.tablet.titleLine1 || bannerSlot.tablet.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {bannerSlot.tablet.titleLine1 && (
                          <span className="block text-[24px] sm:text-[36px] font-semibold">
                            {bannerSlot.tablet.titleLine1}
                          </span>
                        )}
                        {bannerSlot.tablet.titleLine2 && (
                          <span className="block text-[20px] sm:text-[30px] font-medium italic -mt-1">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1">
                              {bannerSlot.tablet.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {bannerSlot.tablet.description && (
                      <div className="flex items-start gap-2 max-w-[170px] sm:max-w-sm">
                        <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                          {bannerSlot.tablet.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile image layout */}
          {bannerSlot?.mobile?.image && (
            <div className="block sm:hidden w-full relative">
              <Image
                src={bannerSlot.mobile.image}
                alt={bannerSlot.mobile.titleLine1 || "Tìm kiếm sản phẩm - Duky Store"}
                width={640}
                height={360}
                sizes="100vw"
                className="w-full h-[260px] object-cover"
                priority
              />
              {/* Mobile Text Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full max-w-[640px] mx-auto px-6">
                  <div className="space-y-2 max-w-[170px]">
                    {bannerSlot.mobile.badge && (
                      <span className="inline-block text-[10px] font-medium tracking-widest text-gray-500 uppercase">
                        {bannerSlot.mobile.badge}
                      </span>
                    )}
                    {(bannerSlot.mobile.titleLine1 || bannerSlot.mobile.titleLine2) && (
                      <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                        {bannerSlot.mobile.titleLine1 && (
                          <span className="block text-[24px] font-semibold">
                            {bannerSlot.mobile.titleLine1}
                          </span>
                        )}
                        {bannerSlot.mobile.titleLine2 && (
                          <span className="block text-[20px] font-medium italic -mt-1">
                            <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1">
                              {bannerSlot.mobile.titleLine2}
                            </span>
                          </span>
                        )}
                      </h1>
                    )}
                    {bannerSlot.mobile.description && (
                      <div className="flex items-start gap-2 max-w-[170px]">
                        <div className="w-6 h-px bg-gray-900 mt-2 shrink-0" />
                        <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-3">
                          {bannerSlot.mobile.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="products-page mt-8">
          {/* Breadcrumb */}
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tìm kiếm", href: "/tim-kiem" },
            { label: query ? `Kết quả cho "${query}"` : "Tất cả sản phẩm" },
          ]}
        />

        <div className="products-layout">
          {/* Filter Sidebar */}
          <aside className="products-filter">
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

          {/* Product Grid */}
          <div className="products-grid-wrap">
            <div className="products-grid-inner">
              {currentPage === 1 && loading && accumulatedProducts.length === 0 ? (
                <div className="products-grid">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                    <div key={i} className="product-skeleton">
                      <div className="skeleton-img" />
                      <div className="skeleton-text skeleton-text--long" />
                      <div className="skeleton-text skeleton-text--short" />
                    </div>
                  ))}
                </div>
              ) : accumulatedProducts.length > 0 ? (
                <>
                  <div className="products-grid">
                    {accumulatedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favoriteIds.has(product.id)}
                        onToggleFavorite={toggleFavorite}
                        priority={index < 4}
                      />
                    ))}
                  </div>
                  {currentPage > 1 && loading && (
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
                    {query
                      ? `Không tìm thấy sản phẩm nào khớp với từ khóa "${query}"`
                      : "Không tìm thấy sản phẩm phù hợp"}
                  </h3>
                  <p className="products-empty-desc">
                    Hãy thử tìm kiếm từ khóa khác hoặc điều chỉnh bộ lọc.
                  </p>
                </div>
              )}
            </div>

            {/* Loader for Infinite Scroll */}
            {currentPage < totalPages && (
              <div ref={loaderRef} className="flex justify-center items-center py-8">
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

        /* Skeleton */
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

        /* Empty */
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

        /* Responsive */
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
