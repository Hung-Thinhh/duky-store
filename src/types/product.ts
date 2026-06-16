export interface ProductMedia {
  id: string;
  url: string;
  secureUrl: string | null;
  fileName: string;
  altText: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string | null;
  type?: string;
  status?: string;
  catalogVisibility?: string;
  originalPrice?: number;
  salePrice?: number | null;
  contactForPrice?: boolean;
  thumbnailMediaId?: string | null;
  thumbnailMedia?: ProductMedia | null;
  image?: {
    id: string;
    mediaId: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
    media: ProductMedia;
  } | null;
  images?: {
    id: string;
    mediaId: string;
    altText: string | null;
    sortOrder: number;
    isPrimary: boolean;
    media: ProductMedia;
  }[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    noIndex?: boolean | null;
    noFollow?: boolean | null;
    schemaJson?: Record<string, unknown> | null;
  } | null;
  variants?: any[];
  inventory?: {
    id: string;
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    soldOut: boolean;
    createdAt: string;
    updatedAt: string;
  } | null;
  stockSummary?: {
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    soldOut: boolean;
    isLowStock: boolean;
  } | null;
  allVariantsSoldOut?: boolean;

  desc?: string;
  description?: string | null;
  shortDescription?: string | null;
  price?: number;
  formattedPrice?: string;
  img?: string;
  category?: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  soldCount?: number;
  sizes?: number[];
  colors?: string[];
  gender?: string;
}

export function getProductImageUrl(product: Product): string {
  return (
    product.thumbnailMedia?.secureUrl ||
    product.thumbnailMedia?.url ||
    product.image?.media?.secureUrl ||
    product.image?.media?.url ||
    product.img
  );
}

export function getAllProductImageUrls(product: Product): string[] {
  const urls: string[] = [];

  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      const url = img.media?.secureUrl || img.media?.url;
      if (url) urls.push(url);
    }
  }

  if (urls.length === 0) {
    urls.push(getProductImageUrl(product));
  }

  return urls;
}

export function getDisplayPrice(product: Product): number {
  if (product.salePrice != null && product.salePrice > 0) {
    return product.salePrice;
  }
  return product.originalPrice ?? product.price ?? 0;
}

export function hasDiscount(product: Product): boolean {
  const original = product.originalPrice ?? product.price ?? 0;
  return (
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.salePrice < original
  );
}

export interface CartItem extends Product {
  quantity: number;
}
