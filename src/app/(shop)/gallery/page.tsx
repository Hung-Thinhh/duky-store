"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop/Navpages";
import { useCart } from "@/context/CartContext";
import { fetchGalleryImages, GalleryImage } from "@/lib/api";

interface BannerContent {
  image: string;
  alt: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
}

// TODO: Replace with API call when backend is ready
const MOCK_GALLERY_BANNER: BannerContent = {
  image: "/assets/banner_lookbook.jpg",
  alt: "Lookbook - Duky Store",
  badge: "LOOKBOOK",
  titleLine1: "PHONG CÁCH",
  titleLine2: "DUKY STORE",
  description: "Cảm hứng phối đồ cùng boot – Phong cách riêng, cá tính riêng.",
};

export default function GalleryPage() {
  const { cartCount } = useCart();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerContent>(MOCK_GALLERY_BANNER);
  const [activeTab, setActiveTab] = useState<"all" | "men" | "women">("all");

  // Swipe gesture handlers for fullscreen preview
  const previewTouchStartX = useRef<number | null>(null);
  const previewTouchEndX = useRef<number | null>(null);

  const handlePreviewTouchStart = useCallback((e: React.TouchEvent) => {
    previewTouchEndX.current = null;
    previewTouchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handlePreviewTouchMove = useCallback((e: React.TouchEvent) => {
    previewTouchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handlePreviewTouchEnd = useCallback(() => {
    if (!previewTouchStartX.current || !previewTouchEndX.current) return;

    const distance = previewTouchStartX.current - previewTouchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      setSelectedIndex((prev) =>
        prev === images.length - 1 || prev === null ? 0 : prev + 1,
      );
    } else if (distance < -minSwipeDistance) {
      setSelectedIndex((prev) =>
        prev === 0 || prev === null ? images.length - 1 : prev - 1,
      );
    }
  }, [images.length]);

  // Keyboard navigation for image preview
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev === 0 || prev === null ? images.length - 1 : prev - 1,
        );
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev === images.length - 1 || prev === null ? 0 : prev + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length]);

  // Disable body scroll when preview modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  useEffect(() => {
    // TODO: Fetch banner content from backend API when available
    // fetch("/api/banners/gallery").then(res => res.json()).then(setBanner);
    setBanner(MOCK_GALLERY_BANNER);
  }, []);

  useEffect(() => {
    setLoading(true);
    const forMale = activeTab === "all" ? undefined : activeTab === "men";
    fetchGalleryImages(forMale)
      .then((data) => {
        setImages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);



  return (
    <>
      <Header cartCount={cartCount} />
      {/* Hero Banner */}
      <section
        className="relative w-full"
        style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}
      >
        <Image
          src={banner.image}
          alt={banner.alt}
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
                {banner.badge}
              </span>
              <h1 className="leading-[1.1] tracking-tighter text-gray-900">
                <span className="block text-[24px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-semibold">
                  {banner.titleLine1}
                </span>
                <span className="block text-[20px] sm:text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                  <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">
                    {banner.titleLine2}
                  </span>
                </span>
              </h1>
              <div className="flex items-start gap-2 md:gap-3 max-w-[170px] sm:max-w-sm">
                <div className="w-6 sm:w-8 h-px bg-gray-900 mt-2 shrink-0" />
                <p className="text-[11px] md:text-sm text-gray-500 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
                  {banner.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-page">
        <Navpages
          items={[{ label: "Trang chủ", href: "/" }, { label: "Lookbook" }]}
        />

        {/* Tabs Bar */}
        <div className="gallery-tabs-container">
          <div className="gallery-tabs">
            <button
              className={`gallery-tab-item ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`gallery-tab-item ${activeTab === "men" ? "active" : ""}`}
              onClick={() => setActiveTab("men")}
            >
              Nam
            </button>
            <button
              className={`gallery-tab-item ${activeTab === "women" ? "active" : ""}`}
              onClick={() => setActiveTab("women")}
            >
              Nữ
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="gallery-loading">
            <p>Đang tải hình ảnh...</p>
          </div>
        )}

        {/* Masonry Grid */}
        {!loading && images.length > 0 && (
          <div className="masonry-grid">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="masonry-item"
                onClick={() => setSelectedIndex(idx)}
              >
                <div className="masonry-img-wrap">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={400}
                    height={500}
                    className="masonry-img"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="masonry-overlay">
                  <span className="masonry-caption">{img.alt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && images.length === 0 && (
          <div className="gallery-loading">
            <p>Chưa có hình ảnh nào trong gallery.</p>
          </div>
        )}
      </section>

      {/* Fullscreen Image Preview Modal */}
      {selectedIndex !== null && (
        <div
          className="image-preview-modal"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="preview-close-btn"
            aria-label="Đóng"
            onClick={() => setSelectedIndex(null)}
          >
            <div className="close-icon-wrapper">
              <X size={28} />
              <span className="close-text">Đóng</span>
            </div>
          </button>

          <div
            className="preview-content-container"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handlePreviewTouchStart}
            onTouchMove={handlePreviewTouchMove}
            onTouchEnd={handlePreviewTouchEnd}
          >
            <button
              className="preview-nav-btn preview-nav-prev"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === 0 || prev === null ? images.length - 1 : prev - 1,
                )
              }
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="preview-image-wrapper">
              <img
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                className="preview-main-image"
              />
            </div>

            <button
              className="preview-nav-btn preview-nav-next"
              onClick={() =>
                setSelectedIndex((prev) =>
                  prev === images.length - 1 || prev === null ? 0 : prev + 1,
                )
              }
              aria-label="Ảnh sau"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div
            className="preview-thumbnails-container"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="preview-thumbnails-title">Hình ảnh</p>
            <div className="preview-thumbnails-list">
              {(() => {
                const count = Math.min(5, images.length);
                const list = [];
                for (let offset = 0; offset < count; offset++) {
                  const targetIdx = (selectedIndex + offset) % images.length;
                  list.push({
                    img: images[targetIdx],
                    idx: targetIdx,
                  });
                }
                return list.map(({ img, idx }) => (
                  <button
                    key={`${img.id}-${idx}`}
                    className={`preview-thumbnail-item ${idx === selectedIndex ? "preview-thumbnail-active" : ""}`}
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={`Xem ảnh ${idx + 1}`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="preview-thumbnail-img"
                    />
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .gallery-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 32px 2rem 80px;
        }

        .gallery-tabs-container {
          display: flex;
          justify-content: center;
          margin: 16px 0 16px;
        }

        .gallery-tabs {
          display: flex;
          background: rgba(244, 244, 245, 0.8);
          backdrop-filter: blur(8px);
          padding: 6px;
          border-radius: 9999px;
          border: 1px solid rgba(228, 228, 231, 0.6);
          gap: 4px;
        }

        .gallery-tab-item {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: #71717a;
          padding: 8px 28px;
          border: none;
          background: transparent;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-tab-item:hover {
          color: #18181b;
        }

        .gallery-tab-item.active {
          background: #ffffff;
          color: #18181b;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 1px 3px rgba(0, 0, 0, 0.02);
          font-weight: 600;
        }

        .gallery-loading {
          text-align: center;
          padding: 60px 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        /* Masonry */
        .masonry-grid {
          column-count: 4;
          column-gap: 16px;
          width: 100%;
        }

        .masonry-item {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-fast);
          break-inside: avoid;
          margin-bottom: 16px;
          display: block;
        }

        .masonry-item:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
        }

        .masonry-item:hover .masonry-overlay {
          opacity: 1;
        }

        .masonry-img-wrap {
          position: relative;
          width: 100%;
          background: var(--bg-secondary);
        }

        :global(.masonry-img) {
          width: 100%;
          height: auto;
          object-fit: cover;
          border-radius: 16px;
        }

        .masonry-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.6) 0%,
            transparent 50%
          );
          display: flex;
          align-items: flex-end;
          padding: 16px;
          opacity: 0;
          transition: opacity 300ms ease;
          border-radius: 16px;
        }

        .masonry-caption {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 500;
          color: #fff;
          line-height: 1.4;
        }

        /* Fullscreen Image Preview Modal */
        .image-preview-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(12px);
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .preview-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #ffffff;
          transition:
            transform 0.2s ease,
            color 0.2s ease;
          z-index: 10010;
        }

        .close-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .close-text {
          font-family: var(--font-main);
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .preview-close-btn:hover {
          transform: scale(1.1);
          color: #f3f4f6;
        }

        .preview-content-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1200px;
          position: relative;
          padding: 0 80px;
        }

        .preview-image-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: 60vh;
          user-select: none;
        }

        .preview-main-image {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.9);
          }
          to {
            transform: scale(1);
          }
        }

        .preview-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffffff;
          transition: all 0.2s ease;
          z-index: 10005;
        }

        @media (min-width: 1024px) {
          .preview-nav-btn {
            display: flex;
          }
        }

        .preview-nav-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: #ffffff;
          transform: translateY(-50%) scale(1.05);
        }

        .preview-nav-btn:active {
          transform: translateY(-50%) scale(0.95);
        }

        .preview-nav-prev {
          left: 24px;
        }

        .preview-nav-next {
          right: 24px;
        }

        .preview-thumbnails-container {
          position: absolute;
          bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 10005;
        }

        .preview-thumbnails-title {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }

        .preview-thumbnails-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          max-width: 90vw;
          padding: 8px 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .preview-thumbnails-list::-webkit-scrollbar {
          height: 4px;
        }

        .preview-thumbnails-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }

        .preview-thumbnail-item {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          border: 2px solid transparent;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .preview-thumbnail-item:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }

        .preview-thumbnail-active {
          border-color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .preview-thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 6px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .masonry-grid {
            column-count: 3;
            column-gap: 12px;
          }
          .masonry-item {
            margin-bottom: 12px;
          }
        }

        @media (max-width: 768px) {
          .masonry-grid {
            column-count: 2;
            column-gap: 12px;
          }
          .masonry-item {
            margin-bottom: 12px;
          }
        }

        @media (max-width: 640px) {
          .gallery-page {
            padding: 24px 1rem 60px;
          }
          .masonry-grid {
            column-count: 2;
            column-gap: 12px;
          }
          .masonry-item {
            margin-bottom: 12px;
          }
        }
      `}</style>
    </>
  );
}
