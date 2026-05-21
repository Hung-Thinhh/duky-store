# Cart Feature — Duky Store

> Tài liệu đặc tả chức năng **Giỏ hàng** (Shopping Cart) cho hệ thống Duky Store.

---

## 1. Tổng quan (Overview)

Module Cart quản lý toàn bộ vòng đời giỏ hàng, từ lúc thêm sản phẩm đến khi tiến hành thanh toán. Hoạt động liền mạch cho cả **Khách vãng lai (Guest)** và **Thành viên đã đăng nhập**.

**Nguyên tắc lưu trữ:**
- **Guest Cart:** Lưu tạm trên `localStorage` (client-side).
- **User Cart:** Lưu trong Database (server-side), đồng bộ theo thời gian thực.
- **Merge Cart:** Khi khách đăng nhập, Guest Cart tự động merge vào User Cart trong DB.

**Tech liên quan:** Next.js App Router · Zustand · Prisma ORM · PostgreSQL · Server Actions

---

## 2. Các luồng chức năng (Feature Flows)

### 2.1. Thêm sản phẩm vào giỏ (Add to Cart)

**Trigger:** Click nút "Thêm vào giỏ" trên trang sản phẩm.

**Điều kiện:** Sản phẩm còn hàng. Nếu có biến thể (size, màu) → bắt buộc chọn trước.

**Luồng:**
1. Người dùng chọn variant + số lượng (mặc định = 1).
2. **Guest:** Ghi vào `localStorage` + Zustand store.
3. **Đã đăng nhập:** Gọi Server Action `addToCart()` → lưu vào DB.
4. Nếu item đã tồn tại (cùng variant): cộng dồn `quantity`.
5. Hiển thị toast: *"Đã thêm vào giỏ hàng ✓"*. Badge Header cập nhật.

**Lỗi:**
- Hết hàng → *"Sản phẩm này đã hết hàng."*
- Vượt tồn kho → *"Chỉ còn `<n>` sản phẩm trong kho."*

---

### 2.2. Xem giỏ hàng (View Cart)

**Route:** `/cart`

**Mỗi cart item hiển thị:** Thumbnail · Tên + variant · Đơn giá · Bộ điều chỉnh số lượng · Nút xóa · Thành tiền.

**Sidebar tóm tắt:**
| Mục | Giá trị |
|---|---|
| Tạm tính | Tổng giá các sản phẩm |
| Giảm giá | Hiển thị nếu áp coupon |
| Phí vận chuyển | Tính ở bước Checkout |
| **Tổng cộng** | **Tạm tính − Giảm giá** |

**Giỏ trống:** Icon + *"Giỏ hàng của bạn đang trống."* + CTA "Tiếp tục mua sắm" → `/products`.

---

### 2.3. Cập nhật số lượng (Update Quantity)

**Rule:** `1 ≤ quantity ≤ stock`. Quantity = 0 → tự động xóa item.

**Luồng:**
1. Optimistic update UI ngay lập tức.
2. **Guest:** Cập nhật `localStorage` + Zustand.
3. **Đã đăng nhập:** Gọi `updateCartItemQuantity()` sau debounce 500ms.
4. Thất bại → revert UI + toast lỗi.

---

### 2.4. Xóa sản phẩm (Remove Item)

**Luồng:**
1. Slide-out animation ngay lập tức (optimistic).
2. **Guest:** Xóa `localStorage` + Zustand.
3. **Đã đăng nhập:** Gọi `removeCartItem()`.
4. Hiển thị **Undo toast** 5 giây để hoàn tác.

> Không dùng confirm dialog — dùng Undo toast thay thế.

---

### 2.5. Áp mã giảm giá (Apply Coupon)

**Vị trí:** Form input trong sidebar trang `/cart`.

**Luồng:**
1. Người dùng nhập mã → click "Áp dụng".
2. Gọi `applyCoupon({ code, cartTotal })`.
3. Server kiểm tra: tồn tại, còn hạn, chưa hết lượt, đạt `minOrderValue`.
4. Hợp lệ → trả `discountAmount`, cập nhật sidebar.
5. Không hợp lệ → Toast: *"Mã không hợp lệ hoặc đã hết hạn."*

**Loại coupon:**
- `PERCENT` — Giảm theo % đơn hàng.
- `FIXED` — Giảm số tiền cố định.
- `FREE_SHIP` — Miễn phí vận chuyển (áp dụng ở Checkout).

---

### 2.6. Merge Cart khi đăng nhập

**Trigger:** Sau `signIn()` thành công, kiểm tra `localStorage`.

**Luồng:**
1. Gọi `mergeGuestCart({ guestItems })`.
2. Mỗi item Guest: đã có trong DB → cộng `quantity`; chưa có → tạo mới.
3. Xóa `localStorage`. Cập nhật Zustand từ DB Cart mới.

---

### 2.7. Mini Cart Drawer

**Trigger:** Click icon giỏ hàng trên Header.

**Mô tả:** Slide-in drawer từ phải, hiển thị tối đa 5 item gần nhất, tổng tiền tạm tính, nút "Xem giỏ hàng" và "Thanh toán ngay".

---

## 3. Cấu trúc Database

### Bảng `carts`
| Column | Type | Ghi chú |
|---|---|---|
| `id` | `uuid` | PK |
| `userId` | `uuid` | FK → `users.id`, Unique |
| `createdAt` | `timestamp` | |

### Bảng `cart_items`
| Column | Type | Ghi chú |
|---|---|---|
| `id` | `uuid` | PK |
| `cartId` | `uuid` | FK → `carts.id` |
| `productId` | `uuid` | FK → `products.id` |
| `variantId` | `uuid` | FK → `product_variants.id`, Nullable |
| `quantity` | `integer` | ≥ 1 |
| `updatedAt` | `timestamp` | |

### Bảng `coupons`
| Column | Type | Ghi chú |
|---|---|---|
| `id` | `uuid` | PK |
| `code` | `varchar(50)` | Unique, uppercase |
| `type` | `enum` | `PERCENT` \| `FIXED` \| `FREE_SHIP` |
| `value` | `decimal` | % hoặc số tiền |
| `minOrderValue` | `decimal` | Đơn tối thiểu |
| `maxUsage` | `integer` | Null = không giới hạn |
| `usedCount` | `integer` | Default: 0 |
| `expiresAt` | `timestamp` | Null = không hết hạn |
| `isActive` | `boolean` | Default: true |

---

## 4. Zustand Cart Store

```typescript
// store/cart.store.ts
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  size?: string;
  color?: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  coupon: { code: string; discountAmount: number } | null;
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  // Computed
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}
```

---

## 5. Cấu trúc File & Component

```
src/
├── store/cart.store.ts
├── app/cart/page.tsx
├── components/cart/
│   ├── CartPage.tsx          # "use client" — container
│   ├── CartItem.tsx          # "use client" — 1 dòng sản phẩm
│   ├── CartSummary.tsx       # "use client" — sidebar + coupon
│   ├── CartDrawer.tsx        # "use client" — mini cart drawer
│   ├── CartBadge.tsx         # "use client" — badge Header
│   ├── QuantitySelector.tsx  # "use client" — điều chỉnh số lượng
│   └── EmptyCart.tsx         # UI component
└── actions/cart/
    ├── add-to-cart.ts
    ├── remove-cart-item.ts
    ├── update-quantity.ts
    ├── merge-guest-cart.ts
    ├── apply-coupon.ts
    └── get-cart.ts
```

---

## 6. UI/UX Guidelines (theo Design System)

- **CartItem:** Layout ngang, ảnh 64×64px. Phân cách bằng `border-b border-white/10`.
- **QuantitySelector:** Nút vuông, border `border-white/20`. Không bo tròn nhiều.
- **Nút Xóa:** Icon `Trash2` (Lucide), `text-white/40` → hover `text-red-400`, transition 150ms.
- **CartSummary:** Glassmorphism — `bg-white/5 backdrop-blur-sm border border-white/10`.
- **CartDrawer:** Framer Motion slide từ phải (`x: 400→0`), overlay `bg-black/60`.
- **CTA "Thanh toán":** Full-width, nền trắng chữ đen, hover invert, uppercase.
- **Badge Header:** Nền trắng chữ đen, hình tròn `w-5 h-5`.

---

## 7. Business Rules

- Giỏ hàng **không lưu giá** — giá tính động từ DB khi load, đảm bảo luôn dùng giá hiện tại.
- Sản phẩm bị ẩn/xóa khỏi catalog → vẫn hiển thị trong cart với badge *"Không còn kinh doanh"*, không cho checkout.
- User Cart trong DB không có expiry — tồn tại vĩnh viễn cho đến khi đặt hàng thành công hoặc user tự xóa.
- Số lượng tối đa mỗi variant = `min(99, stock_available)`.

---

*Xem thêm: `features/checkout.md` để biết quy trình tiếp theo sau giỏ hàng.*
