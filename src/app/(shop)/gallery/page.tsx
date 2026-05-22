"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop/Navpages";
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
const MOCK_GALLERY_BANNER: BannerContent = {
  image: "/assets/banner_lookbook.jpg",
  alt: "Lookbook - Duky Store",
  badge: "LOOKBOOK",
  titleLine1: "PHONG CÁCH",
  titleLine2: "DUKY STORE",
  description: "Cảm hứng phối đồ cùng boot – Phong cách riêng, cá tính riêng.",
};

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export default function GalleryPage() {
  const { cartCount } = useCart();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<BannerContent>(MOCK_GALLERY_BANNER);

  useEffect(() => {
    // TODO: Fetch banner content from backend API when available
    // fetch("/api/banners/gallery").then(res => res.json()).then(setBanner);
    setBanner(MOCK_GALLERY_BANNER);
  }, []);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data: GalleryImage[]) => {
        setImages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Split images into columns for masonry layout
  const columns = 4;
  const columnImages: GalleryImage[][] = Array.from({ length: columns }, () => []);
  images.forEach((img, idx) => {
    columnImages[idx % columns].push(img);
  });

  return (
    <>
      <Header cartCount={cartCount} />
      {/* Hero Banner */}
      <section className="relative w-full" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
        <Image
          src={banner.image}
          alt={banner.alt}
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
              {banner.badge}
            </span>
            <h1 className="leading-[1.1] tracking-tighter text-gray-900">
              <span className="block text-[36px] md:text-[52px] lg:text-[64px] font-semibold">{banner.titleLine1}</span>
              <span className="block text-[30px] md:text-[44px] lg:text-[56px] font-medium italic -mt-1 md:-mt-2">
                <span className="font-montserrat not-italic font-semibold tracking-wide bg-gradient-to-br from-zinc-500 via-zinc-300 to-zinc-700 bg-clip-text text-transparent inline-block ml-1 md:ml-2">{banner.titleLine2}</span>
              </span>
            </h1>
            <div className="flex items-start gap-3 max-w-sm">
              <div className="w-8 h-px bg-gray-900 mt-2.5 shrink-0" />
              <p className="text-sm text-gray-500 leading-relaxed font-light">
                {banner.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-page">
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Lookbook" },
          ]}
        />

        {/* Loading state */}
        {loading && (
          <div className="gallery-loading">
            <p>Đang tải hình ảnh...</p>
          </div>
        )}

        {/* Masonry Grid */}
        {!loading && images.length > 0 && (
          <div className="masonry-grid">
            {columnImages.map((col, colIdx) => (
              <div key={colIdx} className="masonry-column">
                {col.map((img) => (
                  <div
                    key={img.id}
                    className="masonry-item"
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="masonry-img-wrap">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={400}
                        height={500}
                        className="masonry-img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="masonry-overlay">
                      <span className="masonry-caption">{img.alt}</span>
                    </div>
                  </div>
                ))}
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

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={800}
              height={800}
              className="lightbox-img"
            />
            <p className="lightbox-caption">{selectedImage.alt}</p>
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

        .gallery-loading {
          text-align: center;
          padding: 60px 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        /* Masonry */
        .masonry-grid {
          display: flex;
          gap: 16px;
        }

        .masonry-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .masonry-item {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-fast);
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
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
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

        /* Lightbox */
        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          backdrop-filter: blur(8px);
        }

        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .lightbox-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lightbox-content {
          max-width: 80vw;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        :global(.lightbox-img) {
          max-height: 75vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 12px;
        }

        .lightbox-caption {
          font-family: var(--font-main);
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .masonry-grid {
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .masonry-grid {
            flex-wrap: wrap;
          }

          .masonry-column {
            flex: 1 1 calc(50% - 8px);
          }

          .masonry-column:nth-child(n+3) {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .gallery-page {
            padding: 24px 1rem 60px;
          }

          .masonry-column {
            flex: 1 1 100%;
          }

          .masonry-column:nth-child(n+2) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
