'use client';

import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import InfoSection, { ProductDetail, VariantData } from '@/components/shop/product/InfoSection';
import DetailSection from '@/components/shop/product/DetailSection';
import RecommendSection from '@/components/shop/product/RecommendSection';
import { useCart } from '@/context/CartContext';
import { ProductVariant } from '@/lib/api';
import { Product, getDisplayPrice, getAllProductImageUrls } from '@/types/product';

function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN') + ' ₫';
}

interface ProductDetailClientProps {
  product: Product;
  variants: ProductVariant[];
}

export default function ProductDetailClient({ product, variants }: ProductDetailClientProps) {
  const router = useRouter();
  const { cartCount, addToCart } = useCart();

  // Map API data to ProductDetail interface
  const displayPrice = getDisplayPrice(product);
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscountPrice = product.salePrice !== null && product.salePrice !== undefined && product.salePrice < originalPrice;
  const discountPercent = hasDiscountPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;

  // Get all images from product
  const images = getAllProductImageUrls(product);

  // Extract sizes from variants
  const sizes = variants
    .filter((v) => v.sizeLabel)
    .map((v) => Number(v.sizeLabel))
    .filter((s) => !isNaN(s))
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .sort((a, b) => a - b);

  // Extract colors from variants
  const colors = variants
    .filter((v) => v.colorName)
    .map((v) => v.colorName!)
    .filter((c, i, arr) => arr.indexOf(c) === i);

  const productDetail: ProductDetail = {
    id: product.id,
    name: product.name,
    category: '',
    collection: '',
    breadcrumb: ['Trang chủ', product.name],
    rating: 4.9,
    reviewsCount: 0,
    soldCount: 0,
    price: displayPrice,
    originalPrice: originalPrice,
    discountPercent,
    formattedPrice: formatCurrency(displayPrice),
    formattedOriginalPrice: formatCurrency(originalPrice),
    images,
    specs: [],
    sizes,
    colors,
  };

  const handleAddToCart = async (variantId: string, quantity: number) => {
    await addToCart(product.id, variantId, quantity);
  };

  const handleQuickBuy = (variantId: string, quantity: number) => {
    const selectedVariant = variants.find((v) => v.id === variantId);
    const variantPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? displayPrice;
    const variantLabel = [
      selectedVariant?.sizeLabel ? `Size: ${selectedVariant.sizeLabel}` : '',
      selectedVariant?.colorName ? `Màu: ${selectedVariant.colorName}` : '',
    ].filter(Boolean).join(' / ');

    const thumbnailUrl = product.thumbnailMedia?.secureUrl || product.thumbnailMedia?.url || images[0] || '';

    const params = new URLSearchParams({
      quickBuy: 'true',
      slug: product.slug || product.id,
      productId: product.id,
      variantId,
      quantity: String(quantity),
      name: product.name,
      price: String(variantPrice),
      image: thumbnailUrl,
      variantLabel,
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <main>
        <InfoSection product={productDetail} variants={variants as VariantData[]} onAddToCart={handleAddToCart} onQuickBuy={handleQuickBuy} />
        <DetailSection />
        <RecommendSection />
      </main>
      <Footer />
    </>
  );
}
