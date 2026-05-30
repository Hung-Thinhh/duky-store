"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import { Pagination } from "@/components/shop/Pagination";
import Filter, { FilterState } from "@/components/shop/Fillter";
import { useProducts } from "@/hooks/useProducts";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

const PRODUCTS_PER_PAGE = 12;

function SearchResults() {
  const { cartCount } = useCart();
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
    <>
      <Header cartCount={cartCount} />

      {/* Hero Banner */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src="/assets/banner_products.jpg"
          alt="Tìm kiếm sản phẩm - Duky Store"
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-[260px] sm:h-[320px] md:h-auto object-cover"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
            <div className="space-y-2 md:space-y-3 max-w-sm sm:max-w-md">
              <span className="inline-block text-[10px] md:text-xs font-medium tracking-widest text-gray-500 uppercase">
                SEARCH RESULTS
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  KẾT QUẢ TÌM KIẾM
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                    {query ? `"${query.toUpperCase()}"` : "SẢN PHẨM"}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {query
                    ? `Danh sách sản phẩm phù hợp với từ khóa "${query}".`
                    : "Vui lòng nhập từ khóa tìm kiếm."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="products-page">
        {/* Breadcrumb */}
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tìm kiếm", href: "/search" },
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
              {loading ? (
                <div className="products-grid">
                  {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
                    <div key={i} className="product-skeleton">
                      <div className="skeleton-img" />
                      <div className="skeleton-text skeleton-text--long" />
                      <div className="skeleton-text skeleton-text--short" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
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

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .products-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
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
            padding: 24px 1rem 60px;
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh] text-[var(--text-muted)] font-medium">
          Đang tải trang tìm kiếm...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
