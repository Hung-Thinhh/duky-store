'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  sizes: number[];
  colors: string[];
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
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Find matched variant based on selected size + color
  const matchedVariant = variants.find((v) => {
    const sizeMatch = selectedSize === null || v.sizeLabel === String(selectedSize);
    const colorMatch = selectedColor === null || v.colorName === selectedColor;
    return sizeMatch && colorMatch;
  });

  const variantPrice = matchedVariant?.salePrice ?? matchedVariant?.price ?? null;
  const variantOriginalPrice = matchedVariant?.price ?? null;
  const availableQuantity = matchedVariant?.inventory?.availableQuantity ?? null;

  // Display price: variant price if selected, otherwise product price
  const displayPrice = variantPrice !== null ? variantPrice : product.price;
  const displayOriginalPrice = variantOriginalPrice !== null && variantOriginalPrice > displayPrice
    ? variantOriginalPrice
    : (product.originalPrice ?? 0) > displayPrice ? (product.originalPrice ?? 0) : null;

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

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
    <section className="info-section">
      {/* Breadcrumb */}
      <Navpages
        items={product.breadcrumb.map((item, index) => ({
          label: item,
          ...(index === 0 ? { href: '/' } : {}),
          ...(index > 0 && index < product.breadcrumb.length - 1 ? { href: '#' } : {}),
        }))}
      />

      <div className="info-content">
        {/* ─── Left: Image Gallery ─── */}
        <div className="info-gallery">
          <div className="gallery-main" ref={galleryRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onMouseMove={handleMouseMove}>
            {/* Action Buttons */}
            <div className="gallery-actions">
              <button className="gallery-action-btn" aria-label="Yêu thích">
                <Heart size={20} />
              </button>
              <button className={`gallery-action-btn ${zoomEnabled ? 'gallery-action-btn-active' : ''}`} aria-label="Zoom in" onClick={() => setZoomEnabled(!zoomEnabled)}>
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Main Image */}
            <div className={`gallery-image-wrapper ${zoomEnabled && isHovered ? 'gallery-zoomed' : ''}`} style={zoomEnabled && isHovered ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}>
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={600}
                height={600}
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
            {product.images.map((img, index) => (
              <button
                key={index}
                className={`thumbnail-item ${index === selectedImage ? 'thumbnail-active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`Xem ảnh ${index + 1}`}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} width={80} height={80} className="thumbnail-img" />
              </button>
            ))}
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
            <div className="info-rating">
              <Star size={16} fill="#f4b400" color="#f4b400" />
              <span className="rating-value">{product.rating}</span>
              <span className="rating-count">({product.reviewsCount} đánh giá)</span>
            </div>
            <span className="info-meta-divider">|</span>
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

          {/* Specs */}
          <div className="info-specs">
            {PRODUCT_SPECS.map((spec, index) => (
              <div key={index} className="info-spec-row">
                <ShieldCheck size={16} className="spec-icon" />
                <span className="spec-label">{spec.label}:</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="info-separator" />

          {/* Size & Color Selector */}
          <div className="info-variant-selectors">
            <div className="info-variant-group">
              <span className="selector-label">Chọn size:</span>
              <div className="variant-dropdown">
                <select
                  value={selectedSize ?? ''}
                  onChange={(e) => setSelectedSize(Number(e.target.value))}
                  className="variant-select"
                >
                  <option value="" disabled>Chọn size</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              {validationErrors.find(e => e.field === 'size') && (
                <span className="validation-error">{validationErrors.find(e => e.field === 'size')!.message}</span>
              )}
            </div>

            {product.colors.length > 0 && (
              <div className="info-variant-group">
                <span className="selector-label">Màu:</span>
                <div className="variant-dropdown">
                  <select
                    value={selectedColor ?? ''}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="variant-select"
                  >
                    <option value="" disabled>Chọn màu</option>
                    {product.colors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
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

          {/* Add cart & Quick Checkout */}
          <div className="info-actions-secondary">
            <button className="btn-quick-buy" onClick={handleQuickBuy} disabled={isOutOfStock}>
              <CreditCard size={18} />
              <span>THANH TOÁN NHANH</span>
            </button>
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={isOutOfStock || isAddingToCart}>
              <ShoppingCart size={18} />
              <span>{isAddingToCart ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ HÀNG'}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        .info-section {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px 2rem 0;
          margin-top: 80px;
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
        }

        /* ─── Gallery ─── */
        .info-gallery {
          flex: 1;
          max-width: 55%;
        }

        .gallery-main {
          position: relative;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          overflow: hidden;
          aspect-ratio: 1 / 0.85;
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
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-main);
          transition: var(--transition-fast);
          box-shadow: var(--card-shadow);
          z-index: 10;
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

        /* ─── Specs ─── */
        .info-specs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }
        .info-spec-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-main);
          font-size: 14px;
        }
        :global(.spec-icon) {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .spec-label {
          color: var(--text-muted);
          font-weight: 500;
        }
        .spec-value {
          color: var(--text-main);
          font-weight: 600;
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
          align-items: center;
          gap: 16px;
        }
        .info-variant-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .selector-label {
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
        }
        .variant-dropdown {
          min-width: 120px;
        }
        .variant-select {
          width: 100%;
          padding: 10px 16px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-main);
          background: var(--bg-card);
          cursor: pointer;
          outline: none;
          appearance: auto;
          transition: var(--transition-fast);
        }
        .variant-select:focus {
          border-color: var(--text-main);
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
          }
          .info-gallery {
            max-width: 100%;
          }
          .info-details-wrapper {
            max-width: 100%;
          }
        }

        @media (max-width: 640px) {
          .info-section {
            padding: 16px 1rem 0;
          }
          .info-product-name {
            font-size: 20px;
          }
          .info-price {
            font-size: 22px;
          }
          .gallery-thumbnails {
            gap: 6px;
          }
          .thumbnail-item {
            width: 56px;
            height: 56px;
          }
        }
      `}</style>
    </section>
  );
};

export default InfoSection;
