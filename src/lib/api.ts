import { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// ─── API Response types ──────────────────────────────────────────────────────
interface ApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Query params for product listing ────────────────────────────────────────
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json: ApiResponse<T> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

// ─── Product API ─────────────────────────────────────────────────────────────
export async function fetchProducts(params?: ProductListParams): Promise<PaginatedData<Product>> {
  return apiFetch<PaginatedData<Product>>("/products", params as Record<string, string | number | boolean | undefined>);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`);
}

// ─── Product Variant types ───────────────────────────────────────────────────
export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  sku: string;
  sizeLabel: string | null;
  sizeGender: string | null;
  colorName: string | null;
  colorHex: string | null;
  price: number | null;
  salePrice: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  inventory: {
    id: string;
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
    soldOut: boolean;
    createdAt: string;
    updatedAt: string;
    availableQuantity: number;
    isLowStock: boolean;
  } | null;
}

export async function fetchProductVariants(slug: string): Promise<{ data: ProductVariant[] }> {
  return apiFetch<{ data: ProductVariant[] }>(`/products/${slug}/variants`);
}

// ─── Cart API types ──────────────────────────────────────────────────────────
export interface CartItemResponse {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    thumbnailMedia: { id: string; url: string; secureUrl: string | null; altText: string | null } | null;
  };
  variant: {
    id: string;
    name: string | null;
    sku: string;
    sizeLabel: string | null;
    sizeGender: string | null;
    colorName: string | null;
    colorHex: string | null;
    isActive: boolean;
  } | null;
}

export interface CartResponse {
  id: string;
  sessionId: string;
  status: string;
  currency: string;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: CartItemResponse[];
}

export interface AddToCartPayload {
  sessionId: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

// ─── Cart API functions ──────────────────────────────────────────────────────
export async function getCartAPI(sessionId: string): Promise<CartResponse> {
  const url = `${API_URL}/cart?sessionId=${encodeURIComponent(sessionId)}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CartResponse> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

export async function addToCartAPI(payload: AddToCartPayload): Promise<CartResponse> {
  const url = `${API_URL}/cart/items`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CartResponse> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

export async function updateCartItemAPI(itemId: string, quantity: number, sessionId?: string): Promise<CartResponse> {
  const sid = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('duky_cart_session') || '' : '');
  const url = `${API_URL}/cart/items/${itemId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: sid, quantity }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CartResponse> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

export async function removeCartItemAPI(itemId: string, sessionId?: string): Promise<CartResponse> {
  const sid = sessionId || (typeof window !== 'undefined' ? localStorage.getItem('duky_cart_session') || '' : '');
  const url = `${API_URL}/cart/items/${itemId}?sessionId=${encodeURIComponent(sid)}`;

  const res = await fetch(url, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CartResponse> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

// ─── Blog API ────────────────────────────────────────────────────────────────
import { BlogPost, BlogCategory as BlogCategoryType, BlogListParams } from "@/types/blog";

interface PaginatedBlogData {
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchBlogPosts(params?: BlogListParams): Promise<PaginatedBlogData> {
  return apiFetch<PaginatedBlogData>("/blog", params as Record<string, string | number | boolean | undefined>);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/blog/${slug}`);
}

export async function fetchBlogCategories(): Promise<{ data: BlogCategoryType[] }> {
  return apiFetch<{ data: BlogCategoryType[] }>("/blog/categories");
}

// ─── Checkout API ────────────────────────────────────────────────────────────
export interface CheckoutPayload {
  sessionId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
  addressLine: string;
  ward?: string;
  district?: string;
  province?: string;
  country?: string;
  customerNote?: string;
  shippingNote?: string;
}

export interface CheckoutOrder {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  customerNote: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  payments: Array<{
    id: string;
    method: string;
    status: string;
    amount: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    ward: string | null;
    district: string | null;
    province: string | null;
    country: string;
  } | null;
  shipments: Array<{
    id: string;
    carrier: string | null;
    trackingCode: string | null;
    status: string;
    shippingFee: number | null;
    note: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
  }>;
  statusHistories: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: string;
  }>;
}

export async function orderLookupAPI(code: string, phone: string): Promise<CheckoutOrder> {
  const url = `${API_URL}/orders/${code}?phone=${encodeURIComponent(phone)}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CheckoutOrder> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

export async function checkoutAPI(payload: CheckoutPayload): Promise<CheckoutOrder> {
  const url = `${API_URL}/checkout`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const message = errorJson?.EM || `API error: ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  const json: ApiResponse<CheckoutOrder> = await res.json();

  if (json.EC !== 0) {
    throw new Error(json.EM || "Unknown API error");
  }

  return json.DT;
}

// ─── Gallery API ─────────────────────────────────────────────────────────────
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  forMale?: boolean | null;
}

export async function fetchGalleryImages(forMale?: boolean): Promise<GalleryImage[]> {
  try {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (forMale !== undefined) {
      params.forMale = forMale;
    }
    return await apiFetch<GalleryImage[]>("/gallery", params);
  } catch (error) {
    // Fallback to local Next.js API route /api/gallery
    const baseUrl = typeof window !== "undefined" ? "" : "http://localhost:3000";
    const query = forMale !== undefined ? `?forMale=${forMale}` : "";
    const res = await fetch(`${baseUrl}/api/gallery${query}`);
    if (!res.ok) {
      throw new Error("Failed to fetch gallery from both backend and local fallback");
    }
    return res.json();
  }
}
