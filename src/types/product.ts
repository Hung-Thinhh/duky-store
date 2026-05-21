// ─── Media type from backend ─────────────────────────────────────────────────
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

// ─── Product from API (list endpoint) ────────────────────────────────────────
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

  // ─── Legacy mock data properties (used by static data files) ─────────────
  desc?: string;
  price?: number;
  formattedPrice?: string;
  img?: string;
  category?: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  sizes?: number[];
  colors?: string[];
  gender?: string;
}

// ─── Computed helpers for UI compatibility ───────────────────────────────────
/** Get the best available image URL for a product */
export function getProductImageUrl(product: Product): string {
  return (
    product.thumbnailMedia?.secureUrl ||
    product.thumbnailMedia?.url ||
    product.image?.media?.secureUrl ||
    product.image?.media?.url ||
    product.img ||
    "/assets/placeholder.jpg"
  );
}

/** Get all image URLs for a product (detail page) */
export function getAllProductImageUrls(product: Product): string[] {
  const urls: string[] = [];

  // Add all images from the images array (detail endpoint)
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      const url = img.media?.secureUrl || img.media?.url;
      if (url) urls.push(url);
    }
  }

  // If no images from array, try thumbnail and single image
  if (urls.length === 0) {
    const fallback = getProductImageUrl(product);
    urls.push(fallback);
  }

  return urls;
}

/** Get the display price (sale price if available, otherwise original) */
export function getDisplayPrice(product: Product): number {
  return product.salePrice ?? product.originalPrice ?? product.price ?? 0;
}

/** Check if product has a discount */
export function hasDiscount(product: Product): boolean {
  const original = product.originalPrice ?? product.price ?? 0;
  return product.salePrice != null && product.salePrice < original;
}

// ─── Cart item ───────────────────────────────────────────────────────────────
export interface CartItem extends Product {
  quantity: number;
}
