"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop/Navpages";
import { useCart } from "@/context/CartContext";

// ─── Mock gallery data (replace with API later) ─────────────────────────────
const GALLERY_IMAGES = [
  { id: "1", src: "/assets/mau_nam_1.png", alt: "Boot nam phối đồ công sở", height: 380 },
  { id: "2", src: "/assets/mau_nam_2.png", alt: "Boot Chelsea phối quần jean", height: 280 },
  { id: "3", src: "/assets/mau_nam_3.png", alt: "Boot cao cổ phối áo khoác", height: 450 },
  { id: "4", src: "/assets/mau_nam_4.png", alt: "Boot nữ phối váy", height: 320 },
  { id: "5", src: "/assets/mau_nam_5.png", alt: "Boot đế vuông phối quần ống rộng", height: 400 },
  { id: "6", src: "/assets/mau_nam_1.png", alt: "Boot mũi nhọn phối đầm", height: 300 },
  { id: "7", src: "/assets/mau_nam_2.png", alt: "Boot combat phối streetwear", height: 420 },
  { id: "8", src: "/assets/mau_nam_3.png", alt: "Boot da phối suit", height: 350 },
  { id: "9", src: "/assets/mau_nam_4.png", alt: "Boot nữ phối chân váy xếp ly", height: 280 },
  { id: "10", src: "/assets/mau_nam_5.png", alt: "Boot cổ thấp phối quần kaki", height: 380 },
  { id: "11", src: "/assets/mau_nam_1.png", alt: "Boot zip phối áo blazer", height: 440 },
  { id: "12", src: "/assets/mau_nam_2.png", alt: "Boot platform phối quần skinny", height: 320 },
  { id: "13", src: "/assets/mau_nam_3.png", alt: "Boot Chelsea nữ phối trench coat", height: 400 },
  { id: "14", src: "/assets/mau_nam_4.png", alt: "Boot viền phối đồ casual", height: 300 },
  { id: "15", src: "/assets/mau_nam_5.png", alt: "Boot da bóng phối tuxedo", height: 360 },
  { id: "16", src: "/assets/mau_nam_1.png", alt: "Boot nữ phối jumpsuit", height: 420 },
];

export default function GalleryPage() {
  const { cartCount } = useCart();
  const [selectedImage, setSelectedImage] = useState<typeof GALLERY_IMAGES[0] | null>(null);

  // Split images into columns for masonry layout
  const columns = 4;
  const columnImages: typeof GALLERY_IMAGES[] = Array.from({ length: columns }, () => []);
  GALLERY_IMAGES.forEach((img, idx) => {
    columnImages[idx % columns].push(img);
  });

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="gallery-page">
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Lookbook" },
          ]}
        />

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {columnImages.map((col, colIdx) => (
            <div key={colIdx} className="masonry-column">
              {col.map((img) => (
                <div
                  key={img.id}
                  className="masonry-item"
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="masonry-img-wrap" style={{ height: img.height }}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
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
          padding: 8px 2rem 80px;
          margin-top: 80px;
        }

        .gallery-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .gallery-title {
          font-family: var(--font-accent);
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .gallery-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto;
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

          .gallery-title {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  );
}
