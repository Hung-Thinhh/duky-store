# Architecture — Duky Store

> Tài liệu mô tả kiến trúc tổng thể của hệ thống Duky Store, cách tổ chức mã nguồn và các nguyên tắc thiết kế hệ thống.

---

## 1. Tổng quan kiến trúc

Duky Store là một ứng dụng **Full-Stack** xây dựng trên nền tảng **Next.js App Router** theo mô hình **Monorepo** đơn giản. Kiến trúc ưu tiên:

- **SSR-first:** Mọi trang đều render phía server để tối ưu SEO và hiệu năng tải lần đầu.
- **Server Components by default:** Client Components chỉ dùng khi cần interactivity.
- **Server Actions over REST:** Mutation dữ liệu qua Server Actions (type-safe, không cần API layer riêng).
- **Edge-ready:** Middleware chạy ở Edge Runtime để bảo vệ route với độ trễ thấp nhất.

---

## 2. Tech Stack chi tiết

| Layer         | Công nghệ                | Ghi chú                             |
| ------------- | ------------------------ | ----------------------------------- |
| **Framework** | Next.js 14+ (App Router) | SSR, SSG, ISR                       |
| **Language**  | TypeScript               | Strict mode                         |
| **Database**  | PostgreSQL               | Managed (Neon / Supabase / Railway) |
| **ORM**       | Prisma                   | Type-safe DB client                 |
| **Auth**      | Auth.js v5 (NextAuth)    | JWT session + OAuth                 |
| **Styling**   | Tailwind CSS v3          | Utility-first, JIT                  |
| **Animation** | Framer Motion            | Client-side only                    |
| **Icons**     | Lucide React             | Tree-shakable                       |
| **State**     | Zustand                  | Cart, UI global state               |
| **Form**      | React Hook Form + Zod    | Validation                          |
| **Email**     | Resend                   | Transactional email                 |
| **Payment**   | VNPay SDK / Momo API     | Cổng thanh toán VN                  |
| **Storage**   | Cloudinary / Vercel Blob | Upload ảnh sản phẩm                 |
| **Hosting**   | Vercel                   | Auto-deploy từ GitHub               |

---

## 3. Cấu trúc thư mục (Folder Structure)

```
duky-store/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
│
├── public/
│   ├── fonts/                 # Self-hosted fonts
│   └── images/                # Static assets
│
├── src/
│   ├── app/                   # Next.js App Router (pages + layouts)
│   │   ├── (marketing)/       # Route group: trang public (SEO)
│   │   │   ├── page.tsx       # Homepage /
│   │   │   ├── products/      # /products, /products/[slug]
│   │   │   └── categories/    # /categories/[slug]
│   │   ├── (shop)/            # Route group: trang mua hàng
│   │   │   ├── cart/          # /cart
│   │   │   └── checkout/      # /checkout
│   │   ├── user/           # /user/* (protected)
│   │   │   ├── profile/
│   │   │   ├── orders/
│   │   │   └── addresses/
│   │   ├── admin/             # /admin/* (ADMIN role only)
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   └── users/
│   │   ├── auth/              # /auth/*
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── orders/
│   │   │   └── [id]/confirmation/
│   │   ├── api/               # Route Handlers
│   │   │   └── payment/
│   │   │       ├── vnpay/
│   │   │       └── momo/
│   │   ├── layout.tsx         # Root layout
│   │   ├── not-found.tsx      # 404 page
│   │   └── error.tsx          # Error boundary
│   │
│   ├── components/            # Tái sử dụng components
│   │   ├── ui/                # Primitive UI: Button, Input, Modal, Badge...
│   │   ├── layout/            # Header, Footer, Sidebar, Breadcrumb
│   │   ├── auth/              # LoginForm, RegisterForm, AuthCard...
│   │   ├── product/           # ProductCard, ProductGrid, ProductDetail...
│   │   ├── cart/              # CartItem, CartDrawer, CartSummary...
│   │   ├── checkout/          # CheckoutStepper, PaymentStep...
│   │   └── admin/             # AdminSidebar, DataTable, StatsCard...
│   │
│   ├── actions/               # Server Actions (mutations)
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── product/
│   │   └── admin/
│   │
│   ├── lib/                   # Utilities & helpers
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── utils.ts           # Helpers chung (cn, formatPrice...)
│   │   ├── validations/       # Zod schemas
│   │   └── email/             # Email templates
│   │
│   ├── store/                 # Zustand stores
│   │   ├── cart.store.ts
│   │   └── ui.store.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-cart.ts
│   │   └── use-debounce.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   │
│   └── middleware.ts          # Route protection (Edge Runtime)
│
├── docs/                      # Tài liệu dự án (file này)
├── .env.local                 # Biến môi trường (không commit)
├── .env.example               # Template biến môi trường
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Luồng dữ liệu (Data Flow)

### 4.1. Read (Đọc dữ liệu)

```
Browser Request
  → Next.js Router (Edge)
  → middleware.ts (kiểm tra auth/role)
  → Server Component (page.tsx)
  → Prisma → PostgreSQL
  → Render HTML → Browser
```

> Server Components **gọi thẳng Prisma** — không qua API layer. Nhanh hơn, type-safe hơn.

### 4.2. Write (Ghi dữ liệu - Server Actions)

```
User Action (click, submit form)
  → Client Component gọi Server Action
  → Server Action validate session + input (Zod)
  → Prisma mutation → PostgreSQL
  → revalidatePath() / revalidateTag()
  → Return result → Client cập nhật UI
```

### 4.3. External Payment Flow

```
Client → Server Action → Tạo đơn tạm → Tạo Payment URL
  → Redirect sang VNPay/Momo
  → User thanh toán
  → Provider callback → /api/payment/[provider]/callback
  → Verify signature → Cập nhật order status
  → Redirect về /orders/[id]/confirmation
```

---

## 5. Rendering Strategy

| Trang                | Strategy                   | Lý do                              |
| -------------------- | -------------------------- | ---------------------------------- |
| Homepage `/`         | **ISR** (revalidate 1h)    | Content thay đổi, cần SEO          |
| `/products`          | **SSR**                    | Filter/sort động theo query params |
| `/products/[slug]`   | **ISR** (revalidate 30m)   | SEO quan trọng, stock thay đổi     |
| `/categories/[slug]` | **ISR** (revalidate 1h)    |                                    |
| `/cart`              | **CSR** (Client Component) | Real-time, không cần SEO           |
| `/checkout`          | **SSR**                    | Auth check + load cart từ DB       |
| `/user/*`            | **SSR**                    | Auth protected, data cá nhân       |
| `/admin/*`           | **SSR**                    | Auth + Role check                  |
| `/auth/*`            | **SSC** (Static)           | Không có data dynamic              |

---

## 6. Bảo mật (Security Architecture)

```
Internet
  │
  ▼
Vercel Edge Network (DDoS protection, TLS)
  │
  ▼
middleware.ts (Route protection, Role-based access)
  │
  ├── Public routes: / , /products, /categories, /auth
  ├── Protected routes: /user, /checkout → yêu cầu session
  └── Admin routes: /admin → yêu cầu role = ADMIN
  │
  ▼
Server Components / Server Actions
  │
  ├── Luôn validate session với auth()
  ├── Validate input bằng Zod
  └── Prisma (parameterized queries → chống SQL Injection)
  │
  ▼
PostgreSQL (Private network, không expose ra ngoài)
```

---

## 7. Performance Strategy

- **Image Optimization:** Dùng `next/image` với `sizes` và `priority` phù hợp. Upload lên Cloudinary.
- **Font Optimization:** Dùng `next/font` với self-hosted hoặc Google Fonts subset.
- **Code Splitting:** Tự động qua Next.js App Router. Lazy load heavy components.
- **Caching:**
  - Server Components: React cache + `unstable_cache` cho DB queries.
  - Static assets: Cache-Control max-age dài trên Vercel Edge.
  - Revalidation: `revalidatePath()` sau mutation, `revalidateTag()` cho granular control.
- **Bundle Size:** Lucide React (tree-shakable), Framer Motion lazy import.

---

_Tài liệu kiến trúc này cần được review khi có thay đổi lớn về tech stack hoặc cấu trúc hệ thống._
