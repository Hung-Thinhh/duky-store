# Database Schema — Duky Store

> Tài liệu thiết kế cơ sở dữ liệu đầy đủ cho hệ thống Duky Store. Mọi thay đổi schema phải được cập nhật vào tài liệu này trước khi chạy migration.

**ORM:** Prisma · **Database:** PostgreSQL · **Convention:** snake_case cho tên bảng/cột, UUID cho Primary Key.

---

## Sơ đồ quan hệ (ERD Overview)

```
users ──< accounts
users ──< carts ──< cart_items
users ──< orders ──< order_items
users ──< addresses
orders ──< shipping_addresses
orders ──< payments
products ──< product_images
products ──< product_variants
categories ──< products
cart_items >── product_variants
order_items >── product_variants
```

---

## 1. Nhóm Authentication

### `users`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK, Default: `gen_random_uuid()` | |
| `name` | `VARCHAR(100)` | NOT NULL | Tên hiển thị |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | |
| `emailVerified` | `TIMESTAMP` | NULLABLE | Null = chưa xác thực |
| `hashedPassword` | `TEXT` | NULLABLE | Null nếu dùng OAuth |
| `image` | `TEXT` | NULLABLE | URL avatar |
| `role` | `ENUM` | NOT NULL, Default: `CUSTOMER` | `CUSTOMER` \| `ADMIN` |
| `createdAt` | `TIMESTAMP` | NOT NULL, Default: `NOW()` | |
| `updatedAt` | `TIMESTAMP` | NOT NULL | Auto-update |

### `accounts` *(NextAuth OAuth)*
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `userId` | `UUID` | NOT NULL, FK → `users.id` ON DELETE CASCADE | |
| `type` | `VARCHAR` | NOT NULL | `oauth` \| `credentials` |
| `provider` | `VARCHAR` | NOT NULL | `google`, ... |
| `providerAccountId` | `VARCHAR` | NOT NULL | |
| `access_token` | `TEXT` | NULLABLE | |
| `refresh_token` | `TEXT` | NULLABLE | |
| `expires_at` | `INTEGER` | NULLABLE | Unix timestamp |

### `verification_tokens`
| Column | Type | Constraint |
|---|---|---|
| `identifier` | `VARCHAR` | NOT NULL (email) |
| `token` | `VARCHAR` | NOT NULL, UNIQUE |
| `expires` | `TIMESTAMP` | NOT NULL |

**PK:** (`identifier`, `token`)

### `password_reset_tokens`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `email` | `VARCHAR` | NOT NULL | |
| `token` | `VARCHAR` | NOT NULL, UNIQUE | |
| `expires` | `TIMESTAMP` | NOT NULL | Hạn 1 giờ |
| `used` | `BOOLEAN` | Default: `false` | |

---

## 2. Nhóm Sản phẩm

### `categories`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | Tên danh mục |
| `slug` | `VARCHAR(120)` | NOT NULL, UNIQUE | URL-friendly |
| `description` | `TEXT` | NULLABLE | |
| `image` | `TEXT` | NULLABLE | URL ảnh danh mục |
| `parentId` | `UUID` | NULLABLE, FK → `categories.id` | Sub-category |
| `sortOrder` | `INTEGER` | Default: `0` | Thứ tự hiển thị |
| `isActive` | `BOOLEAN` | Default: `true` | |
| `createdAt` | `TIMESTAMP` | Default: `NOW()` | |

### `products`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `categoryId` | `UUID` | NOT NULL, FK → `categories.id` | |
| `name` | `VARCHAR(255)` | NOT NULL | Tên sản phẩm |
| `slug` | `VARCHAR(300)` | NOT NULL, UNIQUE | Dùng cho URL SEO |
| `description` | `TEXT` | NULLABLE | Mô tả ngắn |
| `content` | `TEXT` | NULLABLE | Mô tả chi tiết (Markdown/HTML) |
| `basePrice` | `DECIMAL(12,0)` | NOT NULL | Giá gốc (VNĐ, không có xu) |
| `salePrice` | `DECIMAL(12,0)` | NULLABLE | Giá khuyến mãi |
| `sku` | `VARCHAR(100)` | UNIQUE, NULLABLE | Mã sản phẩm tổng |
| `stock` | `INTEGER` | Default: `0` | Dùng khi không có variant |
| `isFeatured` | `BOOLEAN` | Default: `false` | Hiển thị trang chủ |
| `isActive` | `BOOLEAN` | Default: `true` | Ẩn/hiện |
| `tags` | `TEXT[]` | NULLABLE | Array tags |
| `metaTitle` | `VARCHAR(70)` | NULLABLE | SEO |
| `metaDescription` | `VARCHAR(160)` | NULLABLE | SEO |
| `createdAt` | `TIMESTAMP` | Default: `NOW()` | |
| `updatedAt` | `TIMESTAMP` | | |

### `product_images`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `productId` | `UUID` | NOT NULL, FK → `products.id` ON DELETE CASCADE | |
| `url` | `TEXT` | NOT NULL | URL ảnh |
| `altText` | `VARCHAR(255)` | NULLABLE | Alt text cho SEO |
| `sortOrder` | `INTEGER` | Default: `0` | Ảnh đầu tiên = thumbnail |
| `isPrimary` | `BOOLEAN` | Default: `false` | |

### `product_variants`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `productId` | `UUID` | NOT NULL, FK → `products.id` ON DELETE CASCADE | |
| `size` | `VARCHAR(20)` | NULLABLE | 38, 39, 40, 41, 42... |
| `color` | `VARCHAR(50)` | NULLABLE | Tên màu |
| `colorHex` | `VARCHAR(7)` | NULLABLE | Mã hex màu, VD: `#000000` |
| `sku` | `VARCHAR(100)` | UNIQUE | Mã variant |
| `price` | `DECIMAL(12,0)` | NULLABLE | Nếu null → dùng `products.basePrice` |
| `salePrice` | `DECIMAL(12,0)` | NULLABLE | |
| `stock` | `INTEGER` | Default: `0`, ≥ 0 | |
| `image` | `TEXT` | NULLABLE | Ảnh riêng của variant |
| `isActive` | `BOOLEAN` | Default: `true` | |

---

## 3. Nhóm Giỏ hàng

### `carts`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `userId` | `UUID` | NOT NULL, UNIQUE, FK → `users.id` ON DELETE CASCADE | 1 user = 1 cart |
| `createdAt` | `TIMESTAMP` | Default: `NOW()` | |
| `updatedAt` | `TIMESTAMP` | | |

### `cart_items`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `cartId` | `UUID` | NOT NULL, FK → `carts.id` ON DELETE CASCADE | |
| `productId` | `UUID` | NOT NULL, FK → `products.id` | |
| `variantId` | `UUID` | NULLABLE, FK → `product_variants.id` | |
| `quantity` | `INTEGER` | NOT NULL, ≥ 1 | |
| `updatedAt` | `TIMESTAMP` | | |

**UNIQUE:** (`cartId`, `variantId`) khi variantId NOT NULL; (`cartId`, `productId`) khi variantId NULL.

### `coupons`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `code` | `VARCHAR(50)` | NOT NULL, UNIQUE | Uppercase |
| `type` | `ENUM` | NOT NULL | `PERCENT` \| `FIXED` \| `FREE_SHIP` |
| `value` | `DECIMAL(10,2)` | NOT NULL | % hoặc số tiền |
| `minOrderValue` | `DECIMAL(12,0)` | Default: `0` | Đơn tối thiểu |
| `maxUsage` | `INTEGER` | NULLABLE | Null = không giới hạn |
| `usedCount` | `INTEGER` | Default: `0` | |
| `expiresAt` | `TIMESTAMP` | NULLABLE | Null = không hết hạn |
| `isActive` | `BOOLEAN` | Default: `true` | |
| `createdAt` | `TIMESTAMP` | Default: `NOW()` | |

---

## 4. Nhóm Đơn hàng

### `orders`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `orderNumber` | `VARCHAR(30)` | NOT NULL, UNIQUE | Format: `DK-YYYYMMDD-XXXX` |
| `userId` | `UUID` | NOT NULL, FK → `users.id` | |
| `status` | `ENUM` | NOT NULL, Default: `PENDING` | Xem bên dưới |
| `paymentMethod` | `ENUM` | NOT NULL | `COD` \| `BANK_TRANSFER` \| `VNPAY` \| `MOMO` |
| `paymentStatus` | `ENUM` | Default: `UNPAID` | `UNPAID` \| `PAID` \| `REFUNDED` |
| `subtotal` | `DECIMAL(12,0)` | NOT NULL | Tổng tiền hàng |
| `shippingFee` | `DECIMAL(12,0)` | Default: `0` | |
| `discountAmount` | `DECIMAL(12,0)` | Default: `0` | |
| `total` | `DECIMAL(12,0)` | NOT NULL | = subtotal + shippingFee − discountAmount |
| `couponCode` | `VARCHAR(50)` | NULLABLE | |
| `note` | `TEXT` | NULLABLE | Ghi chú của khách |
| `createdAt` | `TIMESTAMP` | Default: `NOW()` | |
| `updatedAt` | `TIMESTAMP` | | |

**Order Status Flow:**
```
AWAITING_PAYMENT → PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                                                ↘ CANCELLED
```

### `order_items`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `orderId` | `UUID` | NOT NULL, FK → `orders.id` ON DELETE CASCADE | |
| `productId` | `UUID` | NOT NULL, FK → `products.id` | |
| `variantId` | `UUID` | NULLABLE, FK → `product_variants.id` | |
| `productName` | `VARCHAR(255)` | NOT NULL | **Snapshot** lúc đặt |
| `variantName` | `VARCHAR(100)` | NULLABLE | Snapshot: "Size 42 / Đen" |
| `price` | `DECIMAL(12,0)` | NOT NULL | **Snapshot** giá lúc đặt |
| `quantity` | `INTEGER` | NOT NULL, ≥ 1 | |

### `shipping_addresses`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `orderId` | `UUID` | NOT NULL, UNIQUE, FK → `orders.id` | 1 đơn = 1 địa chỉ giao |
| `recipientName` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(15)` | NOT NULL | |
| `province` | `VARCHAR(100)` | NOT NULL | |
| `district` | `VARCHAR(100)` | NOT NULL | |
| `ward` | `VARCHAR(100)` | NOT NULL | |
| `addressLine` | `VARCHAR(255)` | NOT NULL | Số nhà, tên đường |

### `payments`
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `orderId` | `UUID` | NOT NULL, FK → `orders.id` | |
| `provider` | `VARCHAR` | NOT NULL | `vnpay`, `momo`, `bank`, `cod` |
| `transactionId` | `VARCHAR` | NULLABLE | ID từ provider |
| `amount` | `DECIMAL(12,0)` | NOT NULL | |
| `status` | `ENUM` | NOT NULL | `PENDING` \| `SUCCESS` \| `FAILED` |
| `paidAt` | `TIMESTAMP` | NULLABLE | |
| `rawResponse` | `JSONB` | NULLABLE | Raw response từ payment gateway |

---

## 5. Nhóm Người dùng (Profile)

### `addresses` *(Sổ địa chỉ của user)*
| Column | Type | Constraint | Ghi chú |
|---|---|---|---|
| `id` | `UUID` | PK | |
| `userId` | `UUID` | NOT NULL, FK → `users.id` ON DELETE CASCADE | |
| `label` | `VARCHAR(50)` | NULLABLE | VD: "Nhà", "Văn phòng" |
| `recipientName` | `VARCHAR(100)` | NOT NULL | |
| `phone` | `VARCHAR(15)` | NOT NULL | |
| `province` | `VARCHAR(100)` | NOT NULL | |
| `district` | `VARCHAR(100)` | NOT NULL | |
| `ward` | `VARCHAR(100)` | NOT NULL | |
| `addressLine` | `VARCHAR(255)` | NOT NULL | |
| `isDefault` | `BOOLEAN` | Default: `false` | Địa chỉ mặc định |

---

## 6. Index quan trọng

```sql
-- Tìm kiếm sản phẩm theo slug (phổ biến nhất)
CREATE UNIQUE INDEX idx_products_slug ON products(slug);
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);

-- Lọc sản phẩm theo danh mục
CREATE INDEX idx_products_category ON products(categoryId);

-- Lọc sản phẩm active + featured
CREATE INDEX idx_products_active_featured ON products(isActive, isFeatured);

-- Tra cứu đơn hàng theo user
CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);

-- Tra cứu cart theo user
CREATE UNIQUE INDEX idx_carts_user ON carts(userId);

-- Coupon tra cứu theo code
CREATE UNIQUE INDEX idx_coupons_code ON coupons(code);
```

---

## 7. Prisma Schema (Tham khảo)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  AWAITING_PAYMENT
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  COD
  BANK_TRANSFER
  VNPAY
  MOMO
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}

enum CouponType {
  PERCENT
  FIXED
  FREE_SHIP
}
```

---

*Tài liệu này là nguồn sự thật duy nhất (Single Source of Truth) cho database schema. Mọi Agent khi thay đổi schema phải cập nhật file này và tạo Prisma migration tương ứng.*
