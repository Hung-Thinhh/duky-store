# API Documentation — Duky Store

> Tài liệu đặc tả các API endpoints của hệ thống Duky Store. Phần lớn mutations sử dụng **Server Actions** (không phải REST API). Route Handlers (`/api/*`) chỉ dùng cho các trường hợp đặc biệt cần HTTP endpoint (payment callbacks, webhooks).

---

## 1. Tổng quan (Overview)

### Server Actions vs Route Handlers

| Loại | Dùng khi | Ví dụ |
|---|---|---|
| **Server Actions** | Mutation từ Client Component | Thêm giỏ hàng, đặt hàng, đăng ký |
| **Route Handlers** | Cần HTTP endpoint thực sự | Payment callbacks, Webhooks |
| **Server Components** | Fetch data để render | Trang sản phẩm, danh mục, đơn hàng |

### Authentication

Mọi Server Action và Route Handler xử lý dữ liệu nhạy cảm đều kiểm tra session:

```typescript
import { auth } from "@/auth";

const session = await auth();
if (!session?.user) {
  return { error: "Unauthorized" };
}
```

### Response Format (Server Actions)

```typescript
// Thành công
return { success: true, data: { ... } }

// Thất bại
return { error: "Mô tả lỗi" }
```

---

## 2. Server Actions — Authentication

### `registerUser(formData)`
**File:** `actions/auth/register.ts`

**Input:**
```typescript
{
  name: string;       // 2–50 ký tự
  email: string;      // valid email
  password: string;   // min 8 chars
  confirmPassword: string;
}
```

**Logic:** Validate → Kiểm tra email tồn tại → Hash password → Tạo user → Gửi email xác thực.

**Output:**
```typescript
{ success: true, message: "Vui lòng kiểm tra email xác thực." }
{ error: "Email đã được sử dụng." }
```

---

### `verifyEmail(token)`
**File:** `actions/auth/verify-email.ts`

**Input:** `token: string`

**Logic:** Validate token → Cập nhật `emailVerified` → Xóa token → Tự đăng nhập.

---

### `forgotPassword(email)`
**File:** `actions/auth/forgot-password.ts`

**Input:** `email: string`

**Output:** Luôn trả về `{ success: true }` (tránh User Enumeration).

---

### `resetPassword({ token, password, confirmPassword })`
**File:** `actions/auth/reset-password.ts`

**Logic:** Validate token → Hash password mới → Update DB → Đánh dấu token đã dùng → Tự đăng nhập.

---

## 3. Server Actions — Cart

### `addToCart({ productId, variantId?, quantity })`
**File:** `actions/cart/add-to-cart.ts`

**Auth:** Bắt buộc đăng nhập.

**Input:**
```typescript
{
  productId: string;   // UUID
  variantId?: string;  // UUID, nullable
  quantity: number;    // ≥ 1
}
```

**Logic:** Kiểm tra stock → Tìm cart user → Nếu item đã tồn tại: cộng qty; nếu chưa: tạo mới.

**Output:**
```typescript
{ success: true, cartItem: CartItem }
{ error: "Sản phẩm đã hết hàng." }
{ error: "Chỉ còn <n> sản phẩm trong kho." }
```

---

### `updateCartItemQuantity({ cartItemId, quantity })`
**File:** `actions/cart/update-quantity.ts`

**Auth:** Bắt buộc. Kiểm tra `cartItem.cart.userId === session.user.id`.

---

### `removeCartItem({ cartItemId })`
**File:** `actions/cart/remove-cart-item.ts`

**Auth:** Bắt buộc. Ownership check.

---

### `applyCoupon({ code, cartTotal })`
**File:** `actions/cart/apply-coupon.ts`

**Input:** `{ code: string; cartTotal: number }`

**Output:**
```typescript
{ success: true, discountAmount: number, coupon: Coupon }
{ error: "Mã không hợp lệ hoặc đã hết hạn." }
{ error: "Đơn hàng chưa đạt giá trị tối thiểu." }
```

---

### `mergeGuestCart({ guestItems })`
**File:** `actions/cart/merge-guest-cart.ts`

**Auth:** Bắt buộc. Được gọi ngay sau khi `signIn()`.

**Input:**
```typescript
guestItems: Array<{
  productId: string;
  variantId?: string;
  quantity: number;
}>
```

---

### `getCart()`
**File:** `actions/cart/get-cart.ts`

**Auth:** Bắt buộc.

**Output:** Toàn bộ cart với đầy đủ thông tin product, variant, ảnh, giá hiện tại.

---

## 4. Server Actions — Checkout

### `calculateShippingFee({ province, district, ward, shippingMethod })`
**File:** `actions/checkout/calculate-shipping.ts`

**Output:**
```typescript
{
  methods: Array<{
    id: string;
    name: string;       // "Giao hàng tiêu chuẩn"
    estimatedDays: string; // "3–5 ngày"
    fee: number;        // VNĐ
  }>
}
```

---

### `createOrder(checkoutData)`
**File:** `actions/checkout/create-order.ts`

**Auth:** Bắt buộc.

**Input:**
```typescript
{
  shippingAddress: {
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    addressLine: string;
  };
  shippingMethod: string;  // ID phương thức vận chuyển
  paymentMethod: "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";
  couponCode?: string;
  note?: string;
  saveAddress?: boolean;
}
```

**Logic (trong 1 Prisma Transaction):**
1. Validate session + input.
2. Load cart từ DB + kiểm tra lại stock.
3. Tính tổng tiền phía server.
4. Tạo `orders` + `order_items` + `shipping_addresses`.
5. Trừ stock (`product_variants.stock`).
6. Xóa `cart_items`.
7. Cập nhật `coupons.usedCount`.
8. (Async) Gửi email xác nhận.

**Output:**
```typescript
{ success: true, orderId: string, orderNumber: string }
{ error: "Sản phẩm <tên> đã hết hàng." }
```

---

## 5. Route Handlers — Payment

### `POST /api/payment/vnpay/create`

**Mô tả:** Tạo VNPay payment URL.

**Auth:** Kiểm tra session.

**Body:**
```json
{ "orderId": "uuid" }
```

**Response:**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/..."
}
```

---

### `GET /api/payment/vnpay/callback`

**Mô tả:** Nhận callback từ VNPay sau khi giao dịch hoàn tất.

**Query params:** Theo chuẩn VNPay (`vnp_TxnRef`, `vnp_ResponseCode`, `vnp_SecureHash`, ...).

**Logic:**
1. Verify `vnp_SecureHash` bằng `vnp_HashSecret`.
2. Nếu `vnp_ResponseCode === "00"` (thành công):
   - Cập nhật `orders.paymentStatus = PAID`, `orders.status = CONFIRMED`.
   - Tạo record `payments`.
3. Nếu thất bại → `orders.status = CANCELLED`.
4. Redirect về `/orders/[id]/confirmation` hoặc `/checkout?error=payment_failed`.

---

### `POST /api/payment/momo/create`

**Body:** `{ "orderId": "uuid" }`

**Response:** `{ "payUrl": "https://..." }`

---

### `POST /api/payment/momo/callback`

**Mô tả:** IPN (Instant Payment Notification) từ Momo.

**Logic:** Verify signature → Cập nhật trạng thái đơn hàng.

---

## 6. Server Actions — Admin

### `createProduct(productData)`
**File:** `actions/admin/product/create.ts`

**Auth:** Role `ADMIN` only.

**Input:**
```typescript
{
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  basePrice: number;
  salePrice?: number;
  sku?: string;
  isFeatured: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  images: Array<{ url: string; altText?: string; isPrimary: boolean }>;
  variants?: Array<{
    size?: string;
    color?: string;
    colorHex?: string;
    sku: string;
    price?: number;
    stock: number;
  }>;
}
```

---

### `updateProduct({ id, ...data })`
**File:** `actions/admin/product/update.ts`

---

### `deleteProduct(id)`
**File:** `actions/admin/product/delete.ts`

**Logic:** Soft delete — set `isActive = false`. Không xóa khỏi DB để giữ lịch sử đơn hàng.

---

### `updateOrderStatus({ orderId, status })`
**File:** `actions/admin/order/update-status.ts`

**Auth:** Role `ADMIN` only.

**Input:**
```typescript
{
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string; // Khi status = SHIPPED
}
```

**Side effects:** Gửi email thông báo cho khách khi status thay đổi sang `CONFIRMED`, `SHIPPED`, `DELIVERED`.

---

### `getAdminStats()`
**File:** `actions/admin/stats.ts`

**Auth:** Role `ADMIN` only.

**Output:**
```typescript
{
  totalRevenue: number;        // Tổng doanh thu tháng này
  totalOrders: number;         // Tổng đơn hàng
  newCustomers: number;        // Khách mới trong tháng
  pendingOrders: number;       // Đơn chờ xử lý
  revenueChart: Array<{ date: string; revenue: number }>;
  topProducts: Array<{ name: string; sold: number; revenue: number }>;
}
```

---

## 7. Data Fetching — Server Components

Các hàm này được gọi trực tiếp trong Server Components (không phải Server Actions):

```typescript
// lib/data/products.ts
export async function getProducts(params: {
  categorySlug?: string;
  search?: string;
  sort?: "price_asc" | "price_desc" | "newest" | "popular";
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; total: number; totalPages: number }>

export async function getProductBySlug(slug: string): Promise<Product | null>

export async function getFeaturedProducts(): Promise<Product[]>

// lib/data/categories.ts
export async function getCategories(): Promise<Category[]>
export async function getCategoryBySlug(slug: string): Promise<Category | null>

// lib/data/orders.ts (user)
export async function getUserOrders(userId: string): Promise<Order[]>
export async function getOrderById(id: string, userId: string): Promise<Order | null>
```

---

*Tài liệu này cần cập nhật khi thêm Server Action hoặc Route Handler mới.*
