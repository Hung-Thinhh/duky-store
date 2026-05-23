'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/shop/ProductCard';
import { useProducts } from '@/hooks/useProducts';

// ─── Component ──────────────────────────────────────────────────────────────

interface RecommendSectionProps {
  products?: Product[];
  title?: string;
}

const RecommendSection: React.FC<RecommendSectionProps> = ({
  products: propProducts,
  title = 'SẢN PHẨM TƯƠNG TỰ',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products: fetchedProducts } = useProducts({ limit: 8, sort: "newest" });

  const products = propProducts ?? fetchedProducts;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="recommend-section">
      <div className="recommend-container">
        {/* Header */}
        <div className="recommend-header">
          <h2 className="recommend-title">{title}</h2>
        </div>

        {/* Carousel */}
        <div className="recommend-carousel-wrapper">
          <button
            className="recommend-nav recommend-nav-prev"
            onClick={() => scroll('left')}
            aria-label="Cuộn trái"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="recommend-carousel" ref={scrollRef}>
            {products.map((product) => (
              <div key={product.id} className="recommend-card-slot">
                <ProductCard
                  product={product}
                  href={`/san-pham/${product.slug}`}
                />
              </div>
            ))}
          </div>

          <button
            className="recommend-nav recommend-nav-next"
            onClick={() => scroll('right')}
            aria-label="Cuộn phải"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .recommend-section {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 2rem 60px;
        }

        .recommend-container {
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 32px;
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        /* ─── Header ─── */
        .recommend-header {
          margin-bottom: 24px;
        }

        .recommend-title {
          font-family: var(--font-accent);
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        /* ─── Carousel ─── */
        .recommend-carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .recommend-carousel {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 4px 0;
        }
        .recommend-carousel::-webkit-scrollbar {
          display: none;
        }

        .recommend-card-slot {
          min-width: 240px;
          max-width: 240px;
          scroll-snap-align: start;
          flex-shrink: 0;
        }

        .recommend-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-main);
          transition: var(--transition-fast);
          box-shadow: var(--card-shadow);
          z-index: 10;
          opacity: 0;
          pointer-events: none;
        }
        .recommend-carousel-wrapper:hover .recommend-nav {
          opacity: 1;
          pointer-events: auto;
        }
        .recommend-nav:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }
        .recommend-nav-prev {
          left: -18px;
        }
        .recommend-nav-next {
          right: -18px;
        }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .recommend-section {
            padding: 0 1rem 40px;
          }
          .recommend-container {
            padding: 20px 16px;
          }
          .recommend-card-slot {
            min-width: 200px;
            max-width: 200px;
          }
          .recommend-nav-prev {
            left: -8px;
          }
          .recommend-nav-next {
            right: -8px;
          }
        }
      `}</style>
    </section>
  );
};

export default RecommendSection;
