"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
import { fbqEvent } from "@/components/analytics/FacebookPixel";

interface ProductDetailPageClientProps {
  slug: string;
  initialProduct: Product;
  initialVariants: ProductVariant[];
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL"];

function sortSizes(a: string, b: string): number {
  const numA = Number(a);
  const numB = Number(b);
  const isANum = !isNaN(numA);
  const isBNum = !isNaN(numB);
  
  if (isANum && isBNum) {
    return numA - numB;
  }
  
  if (isANum) return -1;
  if (isBNum) return 1;
  
  const indexA = SIZE_ORDER.indexOf(a.toUpperCase());
  const indexB = SIZE_ORDER.indexOf(b.toUpperCase());
  
  if (indexA !== -1 && indexB !== -1) {
    return indexA - indexB;
  }
  
  return a.localeCompare(b);
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString("vi-VN")} VND`;
}

function getCategoryInfo(product: Product) {
  const categorySlugs = (product as any).categorySlugs;
  const isAccessory =
    categorySlugs?.includes("phu-kien") ||
    ["Thắt lưng", "Ví da", "Tất", "Chăm sóc giày", "Dây giày"].includes(product.category ?? "") ||
    (product.gender === "unisex" && ["Thắt lưng", "Ví da", "Tất", "Chăm sóc giày", "Dây giày"].some(cat => (product.category || "").includes(cat))) ||
    product.category === "Phụ kiện";

  if (isAccessory) {
    return { name: "Phụ kiện", url: "/phu-kien" };
  }

  if (product.gender === "male") {
    return { name: "Boot Nam", url: "/boot-nam" };
  } else if (product.gender === "female") {
    return { name: "Boot Nữ", url: "/boot-nu" };
  } else if (product.gender === "unisex") {
    return { name: "Unisex", url: "/unisex" };
  }

  return { name: "Sản phẩm", url: "/san-pham" };
}

export default function ProductDetailPageClient({
  slug,
  initialProduct,
  initialVariants,
}: ProductDetailPageClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
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

  useEffect(() => {
    if (product) {
      const price = getDisplayPrice(product);
      fbqEvent("ViewContent", {
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: price,
        currency: "VND",
      });
    }
  }, [product]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 80,
        }}
      >
        <p style={{ color: "#888", fontSize: 16 }}>Dang tai san pham...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 80,
        }}
      >
        <p style={{ color: "#888", fontSize: 16 }}>Khong tim thay san pham.</p>
      </div>
    );
  }

  const displayPrice = getDisplayPrice(product);
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const hasDiscount =
    product.salePrice !== null &&
    product.salePrice !== undefined &&
    product.salePrice > 0 &&
    product.salePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0;

  const images = getAllProductImageUrls(product);

  const sizes = variants
    .filter((variant) => variant.sizeLabel)
    .map((variant) => variant.sizeLabel as string)
    .filter((size, idx, arr) => arr.indexOf(size) === idx)
    .sort(sortSizes);

  const colors = variants
    .filter((variant) => variant.colorName)
    .map((variant) => variant.colorName as string)
    .filter((color, idx, arr) => arr.indexOf(color) === idx);

  const categoryInfo = getCategoryInfo(product);

  const productDetail: ProductDetail = {
    id: product.id,
    name: product.name,
    category: categoryInfo.name,
    collection: "",
    breadcrumb: ["Trang chủ", categoryInfo.name, product.name],
    rating: 4.9,
    reviewsCount: 0,
    soldCount: product.soldCount ?? 0,
    price: displayPrice,
    originalPrice,
    discountPercent,
    formattedPrice: formatCurrency(displayPrice),
    formattedOriginalPrice: formatCurrency(originalPrice),
    images,
    specs: [],
    sizes,
    colors,
    shortDescription: product.shortDescription,
  };

  const handleAddToCart = async (variantId: string, quantity: number) => {
    await addToCart(product.id, variantId, quantity);
  };

  const handleQuickBuy = (variantId: string, quantity: number) => {
    const selectedVariant = variants.find((variant) => variant.id === variantId);
    const variantPrice =
      selectedVariant?.salePrice !== null &&
      selectedVariant?.salePrice !== undefined &&
      selectedVariant.salePrice > 0
        ? selectedVariant.salePrice
        : selectedVariant?.price ?? displayPrice;
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
      <InfoSection
        product={productDetail}
        variants={variants as VariantData[]}
        onAddToCart={handleAddToCart}
        onQuickBuy={handleQuickBuy}
      />
      <DetailSection description={product.description ?? undefined} />
      <RecommendSection productSlug={slug} />
    </>
  );
}
