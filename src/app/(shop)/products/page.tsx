"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product } from "@/types/product";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { PackageOpen } from "lucide-react";
import { Navpages } from "@/components/shop/Navpages";
import Filter, { FilterState } from "@/components/shop/Fillter";
import { useProducts } from "@/hooks/useProducts";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

interface BannerContent {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
}

// TODO: Replace with API call when backend is ready
// Example: fetch("/api/banners/products").then(res => res.json())
const MOCK_PRODUCTS_BANNER: BannerContent = {
  image: "/assets/banner_products.jpg",
  alt: "Tất cả sản phẩm - Duky Store",
  badge: "ALL PRODUCTS",
  titleLine1: "BỘ SƯU TẬP",
  titleLine2: "DUKY STORE",
  description: "Khám phá bộ sưu tập giày boot nam nữ cao cấp tại Duky Store.",
};

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const { cartCount } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filterState, setFilterState] = useState<FilterState>({
    category: "Tất cả",
    sizes: [],
    colors: [],
    priceMin: 0,
    priceMax: 5_000_000,
  });

  // Fetch all products (no categorySlug filter)
  const { products, loading, pagination } = useProducts({
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
    minPrice: filterState.priceMin > 0 ? filterState.priceMin : undefined,
    maxPrice: filterState.priceMax < 5_000_000 ? filterState.priceMax : undefined,
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
      <section className="relative w-full" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
        <Image
          src={MOCK_PRODUCTS_BANNER.image}
          alt={MOCK_PRODUCTS_BANNER.alt}
          width={1920}
          height={1080}
          sizes="100vw"
          className="w-full h-auto"
          priority
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="px-12 md:px-16 lg:px-[100px] space-y-3">
            <span className="inline-block text-xs font-medium tracking-widest text-gray-500 uppercase">
              {MOCK_PRODUCTS_BANNER.badge}
            </span>
            <h1 className="leading-[1.1] tracking-tighter text-gray-900">
              <span className="block text-[36px] md:text-[52px] lg:text-[64px] font-semibold">{MOCK_PRODUCTS_BANNER.titleLine1}</span>
              <span className="block text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">{MOCK_PRODUCTS_BANNER.titleLine2}</span>
              </span>
            </h1>
            <div className="flex items-start gap-3 max-w-sm">
              <div className="w-8 h-px bg-gray-900 mt-2.5 shrink-0" />
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {MOCK_PRODUCTS_BANNER.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="products-page">
        {/* Breadcrumb */}
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Tất cả sản phẩm" },
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
              <Filter
                onChange={handleFilterChange}
                className="relative z-30"
              />
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
                  <h3 className="products-empty-title">Không tìm thấy sản phẩm phù hợp</h3>
                  <p className="products-empty-desc">Hãy thử điều chỉnh bộ lọc để xem thêm sản phẩm khác.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="products-pagination">
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="pagination-btn"
                  >
                    &lt;
                  </button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-num ${currentPage === page ? "pagination-num--active" : ""}`}
                  >
                    {page}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="pagination-btn"
                  >
                    &gt;
                  </button>
                )}
              </div>
            )}
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

        .products-header {
          margin-bottom: 32px;
        }

        .products-title {
          font-family: var(--font-accent);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .products-subtitle {
          font-size: 14px;
          color: var(--text-muted);
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
          grid-template-columns: repeat(4, 1fr);
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

        .skeleton-text--long { width: 75%; }
        .skeleton-text--short { width: 50%; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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

        /* Pagination */
        .products-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding-top: 40px;
        }

        .pagination-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-main);
          font-size: 14px;
          transition: var(--transition-fast);
        }

        .pagination-btn:hover { background: var(--bg-secondary); }

        .pagination-num {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .pagination-num:hover { background: var(--bg-secondary); }

        .pagination-num--active {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
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
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .products-page {
            padding: 24px 1rem 60px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .products-title {
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}
