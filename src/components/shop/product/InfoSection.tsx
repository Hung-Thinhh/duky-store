'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Heart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Headphones,
  Minus,
  Plus,
  ShoppingCart,
  Sparkles,
  CreditCard,
  X,
} from 'lucide-react';
import { Navpages } from '@/components/shop/Navpages';
import { validateAddToCart, type ValidationError } from '@/lib/cart-validation';

// ─── Mock Data ──────────────────────────────────────────────────────────────

export interface ProductDetail {
  id: string;
  name: string;
  category: string;
  collection: string;
  breadcrumb: string[];
  rating: number;
  reviewsCount: number;
  soldCount: number;
  price: number;
  originalPrice: number;
  discountPercent: number;
  formattedPrice: string;
  formattedOriginalPrice: string;
  images: string[];
  specs: { label: string; value: string; icon: React.ReactNode }[];
  sizes: (number | string)[];
  colors: string[];
  shortDescription?: string | null;
}

const MOCK_PRODUCT: ProductDetail = {
  id: 'dkb082',
  name: 'Giày Da Nam Cổ Thấp Derby Mũi Tròn DKB082 – DUKY STORE',
  category: 'Giày Da Nam',
  collection: 'Giày Nam',
  breadcrumb: ['Trang chủ', 'Giày Nam', 'Giày Da Nam', 'Derby Mũi Tròn DKB082'],
  rating: 4.9,
  reviewsCount: 123,
  soldCount: 356,
  price: 550000,
  originalPrice: 610000,
  discountPercent: 10,
  formattedPrice: '550.000 ₫',
  formattedOriginalPrice: '610.000 ₫',
  images: [
    '/assets/mau_nam_1.png',
    '/assets/mau_nam_2.png',
    '/assets/mau_nam_3.png',
    '/assets/mau_nam_4.png',
    '/assets/mau_nam_5.png',
  ],
  specs: [],
  sizes: [38, 39, 40, 41, 42, 43, 44],
  colors: ['Đen', 'Nâu'],
};

const PRODUCT_SPECS = [
  { label: 'Chất da', value: 'Da PU cao cấp' },
  { label: 'Chiều cao đế', value: '4cm' },
  { label: 'Màu sắc', value: 'Đen' },
  { label: 'Xuất xứ', value: 'Trung Quốc' },
];

const CATEGORY_URLS: Record<string, string> = {
  "Boot Nam": "/boot-nam",
  "Boot Nữ": "/boot-nu",
  "Phụ kiện": "/phu-kien",
  "Unisex": "/unisex",
  "Sản phẩm": "/san-pham",
};

// ─── Component ──────────────────────────────────────────────────────────────

export interface VariantData {
  id: string;
  sizeLabel: string | null;
  colorName: string | null;
  price: number | null;
  salePrice: number | null;
  inventory: {
    availableQuantity: number;
    soldOut: boolean;
  } | null;
}

interface InfoSectionProps {
  product?: ProductDetail;
  variants?: VariantData[];
  onAddToCart?: (variantId: string, quantity: number) => Promise<void>;
  onQuickBuy?: (variantId: string, quantity: number) => void;
}

function formatVariantPrice(value: number): string {
  return value.toLocaleString('vi-VN') + ' ₫';
}

const InfoSection: React.FC<InfoSectionProps> = ({ product = MOCK_PRODUCT, variants = [], onAddToCart, onQuickBuy }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

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
      setPreviewImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    } else if (distance < -minSwipeDistance) {
      setPreviewImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  }, [product.images.length]);

  // Keyboard navigation for image preview
  useEffect(() => {
    if (!isPreviewOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setPreviewImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setPreviewImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen, product.images.length]);

  // Disable body scroll when preview modal is open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreviewOpen]);

  // Helper to check if a size has stock
  const isSizeAvailable = (size: number | string) => {
    if (!variants || variants.length === 0) return true;
    return variants.some((v) => {
      const sizeMatch = v.sizeLabel === String(size);
      const colorMatch = selectedColor === null || v.colorName === selectedColor;
      const hasStock = v.inventory && v.inventory.availableQuantity > 0;
      return sizeMatch && colorMatch && hasStock;
    });
  };

  // Helper to check if a color has stock
  const isColorAvailable = (color: string) => {
    if (!variants || variants.length === 0) return true;
    return variants.some((v) => {
      const sizeMatch = selectedSize === null || v.sizeLabel === String(selectedSize);
      const colorMatch = v.colorName === color;
      const hasStock = v.inventory && v.inventory.availableQuantity > 0;
      return sizeMatch && colorMatch && hasStock;
    });
  };

  // Auto-deselect invalid combinations when size changes
  useEffect(() => {
    if (selectedSize !== null && selectedColor !== null && variants.length > 0) {
      const match = variants.find(
        (v) => v.sizeLabel === String(selectedSize) && v.colorName === selectedColor
      );
      const hasStock = match?.inventory && match.inventory.availableQuantity > 0;
      if (!hasStock) {
        setSelectedColor(null);
      }
    }
  }, [selectedSize, variants]);

  // Auto-deselect invalid combinations when color changes
  useEffect(() => {
    if (selectedSize !== null && selectedColor !== null && variants.length > 0) {
      const match = variants.find(
        (v) => v.sizeLabel === String(selectedSize) && v.colorName === selectedColor
      );
      const hasStock = match?.inventory && match.inventory.availableQuantity > 0;
      if (!hasStock) {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, variants]);

  // Find matched variant based on selected size + color
  const matchedVariant = variants.find((v) => {
    const sizeMatch = selectedSize === null || v.sizeLabel === String(selectedSize);
    const colorMatch = selectedColor === null || v.colorName === selectedColor;
    return sizeMatch && colorMatch;
  });

  const variantPrice =
    matchedVariant?.salePrice !== null &&
    matchedVariant?.salePrice !== undefined &&
    matchedVariant.salePrice > 0
      ? matchedVariant.salePrice
      : matchedVariant?.price ?? null;
  const variantOriginalPrice = matchedVariant?.price ?? null;
  const availableQuantity = matchedVariant?.inventory?.availableQuantity ?? null;

  // Display price: variant price if selected, otherwise product price
  const displayPrice = variantPrice !== null ? variantPrice : product.price;
  const displayOriginalPrice = variantOriginalPrice !== null && variantOriginalPrice > displayPrice
    ? variantOriginalPrice
    : (product.originalPrice ?? 0) > displayPrice ? (product.originalPrice ?? 0) : null;

  const handlePrevImage = useCallback(() => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  }, [product.images.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  }, [product.images.length]);

  // Swipe gesture handlers for main gallery
  const galleryTouchStartX = useRef<number | null>(null);
  const galleryTouchEndX = useRef<number | null>(null);

  const handleGalleryTouchStart = useCallback((e: React.TouchEvent) => {
    galleryTouchEndX.current = null;
    galleryTouchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleGalleryTouchMove = useCallback((e: React.TouchEvent) => {
    galleryTouchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleGalleryTouchEnd = useCallback(() => {
    if (!galleryTouchStartX.current || !galleryTouchEndX.current) return;

    const distance = galleryTouchStartX.current - galleryTouchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
  }, [handleNextImage, handlePrevImage]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomEnabled || !galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Clear validation errors when user changes selection
  useEffect(() => {
    setValidationErrors([]);
  }, [selectedSize, selectedColor, quantity]);

  const handleAddToCart = async () => {
    const result = validateAddToCart({
      selectedSize,
      selectedColor,
      availableSizes: product.sizes,
      availableColors: product.colors,
      matchedVariant: matchedVariant ?? null,
      quantity,
    });
    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    setIsAddingToCart(true);
    try {
      await onAddToCart?.(matchedVariant!.id, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuickBuy = () => {
    const result = validateAddToCart({
      selectedSize,
      selectedColor,
      availableSizes: product.sizes,
      availableColors: product.colors,
      matchedVariant: matchedVariant ?? null,
      quantity,
    });
    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    onQuickBuy?.(matchedVariant!.id, quantity);
  };

  const isOutOfStock = matchedVariant?.inventory?.availableQuantity === 0;

  // Auto-slide every 6 seconds, pause on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [product.images.length, isHovered]);

  return (
    <section className="info-section mt-8">
      {/* Breadcrumb */}
      <Navpages
        items={product.breadcrumb.map((item, index) => {
          if (index === 0) return { label: item, href: '/' };
          if (index === product.breadcrumb.length - 1) return { label: item };
          return { label: item, href: CATEGORY_URLS[item] || '#' };
        })}
      />

      <div className="info-content">
        {/* ─── Left: Image Gallery ─── */}
        <div className="info-gallery">
          <div
            className="gallery-main"
            ref={galleryRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleGalleryTouchStart}
            onTouchMove={handleGalleryTouchMove}
            onTouchEnd={handleGalleryTouchEnd}
          >
            {/* Action Buttons */}
            <div className="gallery-actions">
              <button
                className="gallery-action-btn"
                aria-label="Xem toàn màn hình"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(selectedImage);
                  setIsPreviewOpen(true);
                }}
              >
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Main Image */}
            <div
              className={`gallery-image-wrapper ${zoomEnabled && isHovered ? 'gallery-zoomed' : ''}`}
              style={{
                cursor: 'pointer',
                ...(zoomEnabled && isHovered ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {})
              }}
              onClick={() => {
                setPreviewImage(selectedImage);
                setIsPreviewOpen(true);
              }}
            >
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="gallery-image"
                priority
              />
            </div>

            {/* Navigation Arrows */}
            <button className="gallery-nav gallery-nav-prev" onClick={handlePrevImage} aria-label="Ảnh trước">
              <ChevronLeft size={20} />
            </button>
            <button className="gallery-nav gallery-nav-next" onClick={handleNextImage} aria-label="Ảnh sau">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="gallery-thumbnails">
            <button className="thumbnail-nav" onClick={handlePrevImage} aria-label="Cuộn trái">
              <ChevronLeft size={16} />
            </button>
            <div className="thumbnails-scroll-container">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail-item ${index === selectedImage ? 'thumbnail-active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <Image src={img} alt={`Thumbnail ${index + 1}`} width={80} height={80} className="thumbnail-img" unoptimized />
                </button>
              ))}
            </div>
            <button className="thumbnail-nav" onClick={handleNextImage} aria-label="Cuộn phải">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ─── Right: Product Info ─── */}
        <div className="info-details-wrapper">
        <div className="info-details">
          {/* Product Name */}
          <h1 className="info-product-name">{product.name}</h1>

          {/* Rating & Sold */}
          <div className="info-meta">
            <div className="info-sold">
              <Clock size={14} />
              <span>Đã bán {product.soldCount}</span>
            </div>
          </div>

          {/* Price */}
          <div className="info-price-block">
            <span className="info-price">{formatVariantPrice(displayPrice)}</span>
            {displayOriginalPrice && displayOriginalPrice > displayPrice && (
              <>
                <span className="info-original-price">{formatVariantPrice(displayOriginalPrice)}</span>
                <span className="info-discount-badge">-{Math.round((1 - displayPrice / displayOriginalPrice) * 100)}%</span>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <div 
              className="info-short-desc html-content"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Separator */}
          <div className="info-separator" />

          {/* Size & Color Selector */}
          <div className="info-variant-selectors">
            <div className="info-variant-group">
              <span className="selector-label">
                Chọn size: {selectedSize && <span className="selected-value">{selectedSize}</span>}
              </span>
              <div className="variant-buttons">
                {product.sizes.map((size) => {
                  const available = isSizeAvailable(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      className={`variant-btn ${selectedSize === size ? 'variant-btn-active' : ''}`}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      disabled={!available}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {validationErrors.find(e => e.field === 'size') && (
                <span className="validation-error">{validationErrors.find(e => e.field === 'size')!.message}</span>
              )}
            </div>

            {product.colors.length > 0 && (
              <div className="info-variant-group">
                <span className="selector-label">
                  Màu: {selectedColor && <span className="selected-value">{selectedColor}</span>}
                </span>
                <div className="variant-buttons">
                  {product.colors.map((color) => {
                    const available = isColorAvailable(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`variant-btn ${selectedColor === color ? 'variant-btn-active' : ''}`}
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                        disabled={!available}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
                {validationErrors.find(e => e.field === 'color') && (
                  <span className="validation-error">{validationErrors.find(e => e.field === 'color')!.message}</span>
                )}
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="info-actions-row">
            <div className="quantity-selector">
              <button className="qty-btn" onClick={() => handleQuantityChange(-1)} aria-label="Giảm số lượng">
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button className="qty-btn" onClick={() => handleQuantityChange(1)} aria-label="Tăng số lượng">
                <Plus size={16} />
              </button>
            </div>
            {availableQuantity !== null && (
              <span className="info-stock-label">
                Có sẵn: <strong>{availableQuantity}</strong> sản phẩm
              </span>
            )}
          </div>
          {validationErrors.find(e => e.field === 'stock') && (
            <span className="validation-error">{validationErrors.find(e => e.field === 'stock')!.message}</span>
          )}

          <div className="info-actions-secondary">
            <button className="btn-quick-buy" onClick={handleQuickBuy} disabled={isOutOfStock}>
              <CreditCard size={18} className="flex-shrink-0" />
              <span>THANH TOÁN NHANH</span>
            </button>
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={isOutOfStock || isAddingToCart}>
              <ShoppingCart size={18} className="flex-shrink-0" />
              <span>{isAddingToCart ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ HÀNG'}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {isPreviewOpen && (
        <div className="image-preview-modal" onClick={() => setIsPreviewOpen(false)}>
          <button className="preview-close-btn" aria-label="Đóng" onClick={() => setIsPreviewOpen(false)}>
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
              onClick={() => setPreviewImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={32} />
            </button>

            <div className="preview-image-wrapper">
              <img
                src={product.images[previewImage]}
                alt={product.name}
                className="preview-main-image"
              />
            </div>

            <button
              className="preview-nav-btn preview-nav-next"
              onClick={() => setPreviewImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
              aria-label="Ảnh sau"
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="preview-thumbnails-container" onClick={(e) => e.stopPropagation()}>
            <p className="preview-thumbnails-title">Hình ảnh</p>
            <div className="preview-thumbnails-list">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`preview-thumbnail-item ${idx === previewImage ? 'preview-thumbnail-active' : ''}`}
                  onClick={() => setPreviewImage(idx)}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="preview-thumbnail-img" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .info-section {
          width: 100%;
          max-width: 1440px;
          margin: 32px auto 0;
          padding: 0 2rem 0;
        }

        /* ─── Breadcrumb ─── */
        .info-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .breadcrumb-separator {
          color: var(--text-label);
        }
        .breadcrumb-item {
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .breadcrumb-item:hover {
          color: var(--text-main);
        }
        .breadcrumb-active {
          color: var(--text-main);
          font-weight: 500;
        }

        /* ─── Content Layout ─── */
        .info-content {
          display: flex;
          gap: 40px;
          align-items: flex-start;
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        /* ─── Gallery ─── */
        .info-gallery {
          flex: 1;
          max-width: 55%;
          min-width: 0;
        }

        .gallery-main {
          position: relative;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          overflow: hidden;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-card);
        }

        .gallery-actions {
          position: absolute;
          top: 16px;
          right: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 10;
        }

        .gallery-action-btn {
          width: 40px;
          height: 40px;
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
        }
        .gallery-action-btn:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }
        .gallery-action-btn-active {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }

        .gallery-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms ease;
        }

        .gallery-zoomed {
          transform: scale(2.5);
          cursor: zoom-in;
        }

        :global(.gallery-image) {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }

        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-main);
          transition: var(--transition-fast);
          box-shadow: var(--card-shadow);
          z-index: 10;
        }

        @media (min-width: 1024px) {
          .gallery-nav {
            display: flex;
          }
        }
        .gallery-nav:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }
        .gallery-nav-prev {
          left: 16px;
        }
        .gallery-nav-next {
          right: 16px;
        }

        /* ─── Thumbnails ─── */
        .gallery-thumbnails {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          padding: 0 4px;
          width: 100%;
        }

        .thumbnails-scroll-container {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
          flex: 1;
          min-width: 0;
        }

        .thumbnails-scroll-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .thumbnail-nav {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-fast);
          flex-shrink: 0;
        }
        .thumbnail-nav:hover {
          border-color: var(--text-main);
          color: var(--text-main);
        }

        .thumbnail-item {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          border: 2px solid transparent;
          overflow: hidden;
          cursor: pointer;
          background: var(--bg-secondary);
          transition: var(--transition-fast);
          padding: 4px;
          flex-shrink: 0;
        }
        .thumbnail-item:hover {
          border-color: var(--text-muted);
        }
        .thumbnail-active {
          border-color: var(--text-main);
        }

        :global(.thumbnail-img) {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        /* ─── Product Details (Right) ─── */
        .info-details-wrapper {
          flex: 1;
          max-width: 45%;
          min-width: 0;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 32px;
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        .info-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-product-name {
          font-family: var(--font-accent);
          font-size: 26px;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        /* ─── Meta (Rating & Sold) ─── */
        .info-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-main);
          font-size: 14px;
        }
        .info-rating {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .rating-value {
          font-weight: 600;
          color: var(--text-main);
        }
        .rating-count {
          color: var(--text-muted);
        }
        .info-meta-divider {
          color: var(--border-subtle);
          font-size: 16px;
        }
        .info-sold {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-muted);
        }

        /* ─── Price ─── */
        .info-price-block {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-top: 4px;
        }
        .info-price {
          font-family: var(--font-main);
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
        }
        .info-original-price {
          font-family: var(--font-main);
          font-size: 16px;
          color: var(--text-muted);
          text-decoration: line-through;
        }
        .info-discount-badge {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          color: #16a34a;
          background: var(text-gray-700);
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* ─── Short Description ─── */
        .info-short-desc {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-top: 4px;
        }
        .info-short-desc :global(p) {
          margin-bottom: 8px;
          line-height: 1.6;
        }
        .info-short-desc :global(p:last-child) {
          margin-bottom: 0;
        }

        /* ─── Separator ─── */
        .info-separator {
          height: 1px;
          background: var(--border-subtle);
          margin: 8px 0;
        }

        /* ─── Variant Selectors (Size & Color) ─── */
        .info-variant-selectors {
          display: flex;
          flex-direction: column;
          gap: 18px;
          align-items: flex-start;
          width: 100%;
        }
        .info-variant-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          width: 100%;
        }
        .selector-label {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .selected-value {
          color: var(--text-main);
          font-weight: 600;
        }
        .variant-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
        }
        .variant-btn {
          padding: 8px 18px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          background: var(--bg-card);
          border: 1.5px solid var(--border-subtle);
          border-radius: 999px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .variant-btn:hover {
          border-color: var(--text-muted);
          background: var(--bg-secondary);
        }
        .variant-btn-active {
          border-color: var(--text-main);
          background: var(--bg-card);
          font-weight: 600;
          box-shadow: 0 0 0 1px var(--text-main);
        }
        .variant-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
          background: var(--bg-secondary);
          border-color: var(--border-subtle);
          color: var(--text-muted);
        }

        /* ─── Quantity & Add to Cart ─── */
        .info-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-stock-label {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
        }
        .info-stock-label strong {
          color: var(--text-main);
          font-weight: 600;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-input);
          border-radius: 999px;
          overflow: hidden;
        }
        .qty-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-main);
          transition: var(--transition-fast);
        }
        .qty-btn:hover {
          background: var(--bg-secondary);
        }
        .qty-value {
          width: 36px;
          text-align: center;
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
        }

        .btn-quick-buy {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent-black);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .btn-quick-buy:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        /* ─── Secondary Actions ─── */
        .info-actions-secondary {
          display: flex;
          gap: 12px;
        }

        .btn-add-cart {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          color: var(--text-main);
          border: 1.5px solid var(--text-main);
          border-radius: 999px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .btn-add-cart:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
          transform: translateY(-2px);
        }

        .btn-quick-buy :global(svg),
        .btn-add-cart :global(svg) {
          flex-shrink: 0;
        }

        /* ─── Validation Errors ─── */
        .validation-error {
          display: block;
          font-family: var(--font-main);
          font-size: 12px;
          color: #dc2626;
          margin-top: 4px;
        }

        .btn-add-cart:disabled,
        .btn-quick-buy:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .info-content {
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
          }
          .info-gallery {
            max-width: 100%;
            width: 100%;
          }
          .info-details-wrapper {
            max-width: 100%;
            width: 100%;
          }
          .thumbnail-nav {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .info-section {
            padding: 0 1rem 0;
          }
          .info-details-wrapper {
            padding: 24px 16px;
          }
          .info-product-name {
            font-size: 20px;
          }
          .info-price {
            font-size: 22px;
          }
          .gallery-main {
            aspect-ratio: 1 / 1 !important;
          }
          .gallery-thumbnails {
            gap: 6px;
          }
          .thumbnails-scroll-container {
            gap: 6px;
          }
          .thumbnail-item {
            width: 56px;
            height: 56px;
            padding: 2px;
          }
          .info-actions-secondary {
            flex-direction: column;
            gap: 10px;
          }
          .btn-quick-buy,
          .btn-add-cart {
            width: 100%;
            padding: 14px 20px;
            font-size: 13px;
          }
        }

        /* ─── Fullscreen Image Preview Modal ─── */
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
          transition: var(--transition-fast);
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
          max-height: 65vh;
          user-select: none;
        }

        .preview-main-image {
          max-width: 100%;
          max-height: 65vh;
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
          transition: all var(--transition-fast);
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
          bottom: 40px;
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
          transition: all var(--transition-fast);
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

        @media (max-width: 768px) {
          .preview-content-container {
            padding: 0 48px;
          }
          .preview-nav-btn {
            width: 44px;
            height: 44px;
          }
          .preview-nav-prev {
            left: 12px;
          }
          .preview-nav-next {
            right: 12px;
          }
          .preview-thumbnail-item {
            width: 52px;
            height: 52px;
          }
          .preview-thumbnails-container {
            bottom: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default InfoSection;
