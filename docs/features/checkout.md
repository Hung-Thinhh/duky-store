# Checkout Feature — Duky Store

> Tài liệu đặc tả chức năng **Thanh toán** (Checkout) cho hệ thống Duky Store.

---

## 1. Tổng quan (Overview)

Module Checkout là quy trình chuyển đổi giỏ hàng thành đơn hàng hoàn chỉnh. Đây là bước quan trọng nhất trong funnel mua hàng, cần được tối ưu tối đa để tránh drop-off.

**Yêu cầu truy cập:** Người dùng **bắt buộc phải đăng nhập** để checkout. Khách vãng lai sẽ được redirect về `/auth/login?callbackUrl=/checkout`.

**Luồng tổng quát:**

```
Giỏ hàng (/cart)
  → Thông tin giao hàng
  → Phương thức vận chuyển + Tóm tắt đơn hàng
  → Thanh toán
  → Xác nhận đơn hàng (/orders/[id]/confirmation)
```

**Tech liên quan:** Next.js App Router · Server Actions · Prisma ORM · PostgreSQL · VNPay / Stripe · Tailwind CSS · Framer Motion

---

## 2. Cấu trúc trang Checkout

**Route:** `/checkout`

Trang checkout là **Single-Page Stepper** (3 bước), không chuyển URL giữa các bước để giữ trải nghiệm mượt mà.

| Bước | Tên                  | Mô tả                              |
| ---- | -------------------- | ---------------------------------- |
| 1    | Thông tin giao hàng  | Địa chỉ nhận hàng, SĐT, ghi chú    |
| 2    | Vận chuyển & Xem lại | Chọn đơn vị vận chuyển, review đơn |
| 3    | Thanh toán           | Chọn phương thức và xác nhận       |

---

## 3. Chi tiết từng bước

### Bước 1: Thông tin giao hàng (Shipping Info)

**Các trường thông tin:**
| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| Họ và tên | ✅ | Người nhận |
| Số điện thoại | ✅ | 10 số, định dạng VN |
| Email | ✅ | Auto-fill từ tài khoản |
| Tỉnh/Thành phố | ✅ | Dropdown |
| Quận/Huyện | ✅ | Dropdown động theo Tỉnh |
| Phường/Xã | ✅ | Dropdown động theo Quận |
| Địa chỉ cụ thể | ✅ | Số nhà, tên đường |
| Ghi chú cho shipper | ❌ | Tối đa 255 ký tự |

**Địa chỉ đã lưu (Saved Addresses):**

- Nếu user đã có địa chỉ trong profile → hiển thị danh sách để chọn nhanh.
- Checkbox "Lưu địa chỉ này" để lưu vào profile cho lần sau.
- Nút "Thêm địa chỉ mới" để nhập địa chỉ khác.

**API tỉnh/huyện/xã:** Sử dụng [provinces.open-api.vn](https://provinces.open-api.vn) để load dữ liệu địa chính VN.

---

### Bước 2: Phương thức vận chuyển & Xem lại đơn hàng

**Chọn đơn vị vận chuyển:**

Dựa vào địa chỉ nhận hàng ở Bước 1, hệ thống tính và hiển thị các tùy chọn vận chuyển:

| Tùy chọn             | Thời gian  | Phí (ước tính)        |
| -------------------- | ---------- | --------------------- |
| Giao hàng tiêu chuẩn | 3–5 ngày   | Tính theo khoảng cách |
| Giao hàng nhanh      | 1–2 ngày   | Cao hơn tiêu chuẩn    |
| Giao hàng hỏa tốc    | Trong ngày | Chỉ áp dụng nội thành |

> Phí vận chuyển tích hợp API GHN (Giao Hàng Nhanh) hoặc GHTK để tính thực tế.

**Miễn phí vận chuyển:**

- Áp dụng khi đơn hàng ≥ ngưỡng miễn phí ship (cấu hình trong Admin).
- Coupon `FREE_SHIP` từ bước Cart cũng miễn phí hoàn toàn.

**Tóm tắt đơn hàng (Order Review):**

- Danh sách sản phẩm (tên, variant, số lượng, thành tiền).
- Tạm tính · Phí vận chuyển · Giảm giá (nếu có) · **Tổng cộng**.
- Nút "Quay lại" (bước 1) và "Tiếp tục thanh toán" (bước 3).

---

### Bước 3: Thanh toán (Payment)

**Phương thức thanh toán hỗ trợ:**

| Phương thức                | Mô tả                                    |
| -------------------------- | ---------------------------------------- |
| **COD**                    | Thanh toán khi nhận hàng                 |
| **Chuyển khoản ngân hàng** | Hiển thị thông tin tài khoản + QR code   |
| **VNPay**                  | Redirect sang cổng VNPay (ATM, Visa, QR) |
| **Momo**                   | Redirect sang app Momo                   |

**Luồng thanh toán COD:**

1. Người dùng chọn COD → click "Đặt hàng".
2. Server Action `createOrder()` tạo đơn với `status = "PENDING"`, `paymentStatus = "UNPAID"`.
3. Gửi email xác nhận đơn hàng.
4. Redirect về `/orders/[id]/confirmation`.

**Luồng thanh toán VNPay:**

1. Người dùng chọn VNPay → click "Đặt hàng".
2. Server tạo đơn tạm `status = "AWAITING_PAYMENT"`.
3. Tạo VNPay payment URL, redirect người dùng.
4. VNPay gọi `GET /api/payment/vnpay/callback` sau khi người dùng thanh toán.
5. Server xác thực chữ ký VNPay (`vnp_SecureHash`).
6. Thành công → cập nhật `paymentStatus = "PAID"`, `status = "CONFIRMED"`, gửi email.
7. Thất bại → cập nhật `status = "CANCELLED"`, redirect về `/cart` với toast lỗi.

**Luồng thanh toán Chuyển khoản:**

1. Tạo đơn `status = "AWAITING_PAYMENT"`.
2. Hiển thị trang xác nhận với QR code ngân hàng + thông tin chuyển khoản.
3. Admin xác nhận thanh toán thủ công trong Admin Panel → cập nhật `paymentStatus`.

---

## 4. Tạo đơn hàng (Create Order)

**Server Action:** `createOrder(checkoutData)`

**Luồng xử lý phía Server:**

1. Validate session (phải đăng nhập).
2. Validate `checkoutData` bằng Zod schema.
3. Lấy cart items từ DB, kiểm tra lại tồn kho từng sản phẩm lần cuối.
4. Nếu có sản phẩm hết hàng → trả lỗi, không tạo đơn.
5. Tính lại tổng tiền phía server (không tin client) = `Σ (price × quantity)`.
6. Áp dụng coupon (nếu có), tính phí vận chuyển.
7. Tạo record trong bảng `orders` + `order_items` trong 1 transaction.
8. Trừ `stock` trong bảng `product_variants` / `products`.
9. Xóa cart items trong DB.
10. Xóa coupon đã dùng (tăng `usedCount`).
11. Gửi email xác nhận đơn hàng (async, không block response).
12. Trả về `orderId` cho client.

> **Tất cả bước 7–10 phải nằm trong 1 Prisma Transaction** để đảm bảo tính toàn vẹn dữ liệu (ACID).

---

## 5. Cấu trúc Database

### Bảng `orders`

| Column           | Type            | Ghi chú                                                                                                   |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| `id`             | `uuid`          | PK                                                                                                        |
| `orderNumber`    | `varchar`       | Mã đơn hiển thị: `DK-YYYYMMDD-XXXX`                                                                       |
| `userId`         | `uuid`          | FK → `users.id`                                                                                           |
| `status`         | `enum`          | `PENDING` \| `CONFIRMED` \| `PROCESSING` \| `SHIPPED` \| `DELIVERED` \| `CANCELLED` \| `AWAITING_PAYMENT` |
| `paymentMethod`  | `enum`          | `COD` \| `BANK_TRANSFER` \| `VNPAY` \| `MOMO`                                                             |
| `paymentStatus`  | `enum`          | `UNPAID` \| `PAID` \| `REFUNDED`                                                                          |
| `subtotal`       | `decimal(12,0)` | Tổng tiền hàng (VNĐ)                                                                                      |
| `shippingFee`    | `decimal(12,0)` | Phí vận chuyển                                                                                            |
| `discountAmount` | `decimal(12,0)` | Số tiền giảm giá                                                                                          |
| `total`          | `decimal(12,0)` | Tổng thanh toán                                                                                           |
| `couponCode`     | `varchar`       | Nullable                                                                                                  |
| `note`           | `text`          | Ghi chú của khách                                                                                         |
| `createdAt`      | `timestamp`     |                                                                                                           |
| `updatedAt`      | `timestamp`     |                                                                                                           |

### Bảng `order_items`

| Column        | Type            | Ghi chú                              |
| ------------- | --------------- | ------------------------------------ |
| `id`          | `uuid`          | PK                                   |
| `orderId`     | `uuid`          | FK → `orders.id`                     |
| `productId`   | `uuid`          | FK → `products.id`                   |
| `variantId`   | `uuid`          | FK → `product_variants.id`, Nullable |
| `productName` | `varchar`       | **Snapshot** tên sản phẩm lúc đặt    |
| `variantName` | `varchar`       | Snapshot variant (size, màu)         |
| `price`       | `decimal(12,0)` | **Snapshot** giá lúc đặt             |
| `quantity`    | `integer`       |                                      |

### Bảng `shipping_addresses` (lưu lịch sử địa chỉ giao hàng của đơn)

| Column          | Type          | Ghi chú                  |
| --------------- | ------------- | ------------------------ |
| `id`            | `uuid`        | PK                       |
| `orderId`       | `uuid`        | FK → `orders.id`, Unique |
| `recipientName` | `varchar`     |                          |
| `phone`         | `varchar(15)` |                          |
| `province`      | `varchar`     |                          |
| `district`      | `varchar`     |                          |
| `ward`          | `varchar`     |                          |
| `addressLine`   | `varchar`     |                          |

---

## 6. Trang xác nhận đơn hàng

**Route:** `/orders/[id]/confirmation`

**Nội dung hiển thị:**

- Icon thành công + tiêu đề _"Đặt hàng thành công!"_
- Mã đơn hàng `DK-YYYYMMDD-XXXX`.
- Tóm tắt sản phẩm, địa chỉ giao hàng, phương thức thanh toán, tổng tiền.
- Thông báo: _"Email xác nhận đã được gửi đến `<email>`."_
- CTA: "Theo dõi đơn hàng" → `/user/orders/[id]` và "Tiếp tục mua sắm" → `/`.

---

## 7. Cấu trúc File & Component

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx                  # Redirect nếu chưa login / giỏ trống
│   └── orders/[id]/confirmation/
│       └── page.tsx
│
├── components/checkout/
│   ├── CheckoutStepper.tsx           # "use client" — stepper container
│   ├── ShippingInfoStep.tsx          # "use client" — bước 1
│   ├── ShippingMethodStep.tsx        # "use client" — bước 2
│   ├── PaymentStep.tsx               # "use client" — bước 3
│   ├── OrderSummary.tsx              # UI — tóm tắt đơn hàng (sidebar)
│   ├── SavedAddressList.tsx          # "use client" — danh sách địa chỉ đã lưu
│   └── OrderConfirmation.tsx         # UI — trang thành công
│
├── actions/checkout/
│   ├── create-order.ts               # Server Action chính
│   ├── calculate-shipping.ts         # Server Action: tính phí ship
│   └── validate-coupon-at-checkout.ts
│
└── app/api/payment/
    ├── vnpay/
    │   ├── create/route.ts           # Tạo VNPay URL
    │   └── callback/route.ts         # Xử lý callback từ VNPay
    └── momo/
        ├── create/route.ts
        └── callback/route.ts
```

---

## 8. UI/UX Guidelines (theo Design System)

- **Stepper Header:** Các bước hiển thị dạng thanh ngang, bước hiện tại `bg-white text-black`, bước chưa đến `border border-white/20 text-white/40`.
- **Form fields:** Nền tối `bg-white/5`, border `border-white/20`, focus `ring-1 ring-white`. Label nhỏ uppercase tracking-wide.
- **Payment options:** Radio cards, khi chọn → border `border-white`, nền `bg-white/10`.
- **Order Summary Sidebar:** Glassmorphism — `bg-white/5 backdrop-blur-sm border border-white/10`. Sticky trên desktop.
- **CTA "Đặt hàng":** Full-width, nền trắng chữ đen, uppercase, font đậm. Hover invert.
- **Step transitions:** Framer Motion `AnimatePresence` — slide-left khi tiến, slide-right khi lùi.
- **Loading state khi đặt hàng:** Button disabled + spinner, overlay mờ toàn form.

---

## 9. Xử lý lỗi & Edge Cases

| Tình huống                              | Xử lý                                                    |
| --------------------------------------- | -------------------------------------------------------- |
| Sản phẩm hết hàng khi checkout          | Thông báo lỗi chi tiết, redirect về `/cart` để chỉnh sửa |
| Timeout khi thanh toán VNPay            | Đơn ở trạng thái `AWAITING_PAYMENT`, user có thể thử lại |
| Người dùng nhấn Back sau redirect VNPay | Kiểm tra trạng thái đơn qua `orderId`, không tạo đơn mới |
| Mất kết nối giữa chừng                  | Transaction rollback, giỏ hàng và tồn kho không thay đổi |
| Coupon hết hạn ngay khi checkout        | Revalidate coupon phía server, từ chối + thông báo       |

---

_Xem thêm: `features/cart.md` cho quy trình trước checkout. `features/auth.md` cho bảo vệ route._
