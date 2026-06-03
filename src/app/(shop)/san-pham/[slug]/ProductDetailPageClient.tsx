"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import InfoSection, {
  ProductDetail,
  VariantData,
} from "@/components/shop/product/InfoSection";
import DetailSection from "@/components/shop/product/DetailSection";
import RecommendSection from "@/components/shop/product/RecommendSection";
import { useCart } from "@/context/CartContext";
import {
  fetchProductBySlug,
  fetchProductVariants,
  ProductVariant,
} from "@/lib/api";
import {
  Product,
  getDisplayPrice,
  getAllProductImageUrls,
} from "@/types/product";

interface ProductDetailPageClientProps {
  slug: string;
  initialProduct: Product;
  initialVariants: ProductVariant[];
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

export default function ProductDetailPageClient({
  slug,
  initialProduct,
  initialVariants,
}: ProductDetailPageClientProps) {
  const router = useRouter();
  const { cartCount, addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setVariants(initialVariants);
      setLoading(false);
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);
        const [productData, variantsData] = await Promise.all([
          fetchProductBySlug(slug),
          fetchProductVariants(slug),
        ]);
        setProduct(productData);
        setVariants(variantsData.data);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [initialProduct, initialVariants, slug]);

  if (loading) {
    return (
      <>
        <Header cartCount={cartCount} />
        <main
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <p style={{ color: "#888", fontSize: 16 }}>Dang tai san pham...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header cartCount={cartCount} />
        <main
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <p style={{ color: "#888", fontSize: 16 }}>Khong tim thay san pham.</p>
        </main>
        <Footer />
      </>
    );
  }

  const displayPrice = getDisplayPrice(product);
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  const images = getAllProductImageUrls(product);

  const sizes = variants
    .filter((variant) => variant.sizeLabel)
    .map((variant) => Number(variant.sizeLabel))
    .filter((size) => !Number.isNaN(size))
    .filter((size, idx, arr) => arr.indexOf(size) === idx)
    .sort((a, b) => a - b);

  const colors = variants
    .filter((variant) => variant.colorName)
    .map((variant) => variant.colorName as string)
    .filter((color, idx, arr) => arr.indexOf(color) === idx);

  const productDetail: ProductDetail = {
    id: product.id,
    name: product.name,
    category: "",
    collection: "",
    breadcrumb: ["Trang chủ", product.name],
    rating: 4.9,
    reviewsCount: 0,
    soldCount: 0,
    price: displayPrice,
    originalPrice,
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
    const selectedVariant = variants.find((variant) => variant.id === variantId);
    const variantPrice =
      selectedVariant?.salePrice ?? selectedVariant?.price ?? displayPrice;
    const variantLabel = [
      selectedVariant?.sizeLabel ? `Size: ${selectedVariant.sizeLabel}` : "",
      selectedVariant?.colorName ? `Mau: ${selectedVariant.colorName}` : "",
    ]
      .filter(Boolean)
      .join(" / ");

    const thumbnailUrl =
      product.thumbnailMedia?.secureUrl ||
      product.thumbnailMedia?.url ||
      images[0] ||
      "";

    const params = new URLSearchParams({
      quickBuy: "true",
      slug,
      productId: product.id,
      variantId,
      quantity: String(quantity),
      name: product.name,
      price: String(variantPrice),
      image: thumbnailUrl,
      variantLabel,
    });

    router.push(`/thanh-toan?${params.toString()}`);
  };

  return (
    <>
      <Header cartCount={cartCount} />
      <main>
        <InfoSection
          product={productDetail}
          variants={variants as VariantData[]}
          onAddToCart={handleAddToCart}
          onQuickBuy={handleQuickBuy}
        />
        <DetailSection />
        <RecommendSection />
      </main>
      <Footer />
    </>
  );
}
