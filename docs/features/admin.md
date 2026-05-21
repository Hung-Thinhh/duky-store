# Admin Dashboard Feature — Duky Store

> Tài liệu đặc tả chức năng **Quản trị viên** (Admin Panel) cho hệ thống Duky Store.

---

## 1. Tổng quan (Overview)

Admin Panel là hệ thống back-office cho phép Admin quản lý toàn bộ hoạt động của cửa hàng. Truy cập tại route `/admin/*`, chỉ dành cho tài khoản có `role = "ADMIN"`.

**Các phân hệ chính:**
1. Dashboard — Thống kê tổng quan
2. Quản lý Sản phẩm — CRUD Products, Categories, Variants
3. Quản lý Đơn hàng — Xử lý, cập nhật trạng thái
4. Quản lý Người dùng — Xem, phân quyền
5. Quản lý Mã giảm giá — CRUD Coupons

**Tech liên quan:** Next.js App Router · Server Actions · Prisma · Tailwind CSS · Recharts (biểu đồ)

---

## 2. Bảo vệ Route Admin

**Middleware** kiểm tra cả session VÀ role:

```typescript
// middleware.ts
if (pathname.startsWith("/admin")) {
  if (!session) return redirect("/auth/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") return redirect("/403");
}
```

**Mọi Server Action admin** đều phải tự kiểm tra lại:

```typescript
const session = await auth();
if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
```

---

## 3. Dashboard (Trang tổng quan)

**Route:** `/admin/dashboard`

### 3.1. Thẻ KPI (Key Performance Indicators)

| Thẻ | Metric | Ghi chú |
|---|---|---|
| Doanh thu tháng này | `Σ orders.total` (status DELIVERED, tháng hiện tại) | So sánh % với tháng trước |
| Tổng đơn hàng | Đếm tất cả đơn trong tháng | Phân nhóm theo status |
| Khách hàng mới | User tạo trong tháng | |
| Đơn chờ xử lý | Đơn có `status = PENDING` | CTA: Xem ngay |

### 3.2. Biểu đồ Doanh thu (Revenue Chart)

- **Loại:** Line chart hoặc Bar chart (dùng **Recharts**).
- **Dữ liệu:** Doanh thu theo ngày trong 30 ngày gần nhất.
- **Màu:** Trắng/xám trên nền tối, phù hợp Design System.

### 3.3. Sản phẩm bán chạy (Top Products)

- Bảng 5 sản phẩm có doanh thu cao nhất tháng.
- Cột: Ảnh · Tên · Số lượng đã bán · Doanh thu.

### 3.4. Đơn hàng gần đây (Recent Orders)

- Bảng 10 đơn mới nhất.
- Cột: Mã đơn · Khách hàng · Tổng tiền · Trạng thái · Ngày đặt.
- Click vào row → chi tiết đơn hàng.

---

## 4. Quản lý Sản phẩm

### 4.1. Danh sách sản phẩm

**Route:** `/admin/products`

**Tính năng:**
- Bảng danh sách với phân trang (20 item/trang).
- Tìm kiếm theo tên, SKU.
- Lọc theo: Danh mục · Trạng thái (`isActive`) · Có giảm giá.
- Sắp xếp theo: Ngày tạo · Giá · Tên.
- Toggle nhanh `isActive` / `isFeatured` ngay trên bảng (không cần vào trang chi tiết).
- Nút: "Thêm sản phẩm mới" + "Xóa" (bulk delete).

**Cột hiển thị:**
| Cột | Mô tả |
|---|---|
| Ảnh | Thumbnail 48×48px |
| Tên + SKU | |
| Danh mục | |
| Giá | Giá gốc / Giá sale |
| Tồn kho | Tổng stock tất cả variants |
| Trạng thái | Toggle Active/Inactive |
| Nổi bật | Toggle Featured |
| Actions | Sửa · Xóa |

### 4.2. Tạo / Sửa sản phẩm

**Route:** `/admin/products/new` · `/admin/products/[id]/edit`

**Form sections:**

**Section 1 — Thông tin cơ bản:**
- Tên sản phẩm (auto-generate slug nhưng cho phép sửa).
- Danh mục (dropdown).
- Mô tả ngắn (textarea).
- Nội dung chi tiết (Rich Text Editor — dùng **TipTap** hoặc `@uiw/react-md-editor`).

**Section 2 — Giá & SKU:**
- Giá gốc (bắt buộc).
- Giá sale (tùy chọn).
- SKU tổng (tùy chọn).

**Section 3 — Ảnh sản phẩm:**
- Upload nhiều ảnh (drag & drop).
- Chọn ảnh đại diện (primary).
- Alt text cho mỗi ảnh.
- Upload lên Cloudinary qua Route Handler `/api/upload`.

**Section 4 — Biến thể (Variants):**
- Bảng thêm/sửa/xóa variants.
- Mỗi row: Size · Màu · Mã hex · SKU · Giá riêng (optional) · Số lượng tồn kho.
- Nút "Thêm variant".

**Section 5 — SEO:**
- Meta Title (max 70 ký tự, hiện character count).
- Meta Description (max 160 ký tự).
- Tags (input tự do).

**Section 6 — Cài đặt:**
- Toggle: Hiển thị / Ẩn (`isActive`).
- Toggle: Nổi bật (`isFeatured`).

### 4.3. Quản lý Danh mục

**Route:** `/admin/categories`

**Tính năng:**
- CRUD danh mục.
- Hỗ trợ danh mục cha/con (2 cấp).
- Drag-and-drop sắp xếp thứ tự (`sortOrder`).

---

## 5. Quản lý Đơn hàng

### 5.1. Danh sách đơn hàng

**Route:** `/admin/orders`

**Tính năng:**
- Bảng đơn hàng, phân trang 20/trang.
- Lọc theo: Trạng thái đơn · Trạng thái thanh toán · Ngày đặt (date range picker).
- Tìm kiếm theo: Mã đơn · Email/tên khách.
- Sắp xếp theo ngày đặt, tổng tiền.

**Status badge màu sắc:**
| Status | Màu badge |
|---|---|
| `PENDING` | Xám `text-white/60 border-white/20` |
| `CONFIRMED` | Trắng `text-white border-white/40` |
| `PROCESSING` | Xanh dương `text-blue-400 border-blue-400/30` |
| `SHIPPED` | Vàng `text-amber-400 border-amber-400/30` |
| `DELIVERED` | Xanh lá `text-green-400 border-green-400/30` |
| `CANCELLED` | Đỏ `text-red-400 border-red-400/30` |
| `AWAITING_PAYMENT` | Tím `text-purple-400 border-purple-400/30` |

### 5.2. Chi tiết đơn hàng

**Route:** `/admin/orders/[id]`

**Thông tin hiển thị:**
- Header: Mã đơn · Ngày đặt · Trạng thái hiện tại.
- Thông tin khách: Tên · Email · SĐT.
- Địa chỉ giao hàng.
- Danh sách sản phẩm đặt (tên snapshot, giá snapshot, số lượng).
- Tóm tắt tài chính: Tạm tính · Phí ship · Giảm giá · Tổng.
- Thông tin thanh toán: Phương thức · Trạng thái · Mã giao dịch.

**Panel cập nhật trạng thái:**
- Dropdown chọn status mới.
- Input mã vận đơn (tracking number) khi chọn `SHIPPED`.
- Nút "Cập nhật" → gọi `updateOrderStatus()` → gửi email thông báo cho khách.

**Lịch sử trạng thái (Status Timeline):**
- Hiển thị lịch sử thay đổi status theo timeline dọc.

---

## 6. Quản lý Người dùng

### 6.1. Danh sách người dùng

**Route:** `/admin/users`

**Tính năng:**
- Bảng người dùng, phân trang.
- Tìm kiếm theo tên, email.
- Lọc theo role.
- Xem số đơn hàng của từng user.

**Cột:**
| Cột | |
|---|---|
| Avatar + Tên | |
| Email | |
| Role | Badge với toggle |
| Số đơn hàng | |
| Ngày tham gia | |
| Actions | Xem đơn · Đổi role |

### 6.2. Phân quyền

- Admin có thể đổi `role` của user giữa `CUSTOMER` và `ADMIN`.
- Hộp thoại xác nhận trước khi cấp quyền ADMIN.
- Không thể tự hạ quyền của chính mình.

---

## 7. Quản lý Mã giảm giá (Coupons)

**Route:** `/admin/coupons`

### 7.1. Danh sách coupon

- Bảng: Mã · Loại · Giá trị · Đã dùng/Tối đa · Hết hạn · Trạng thái · Actions.
- Toggle `isActive` nhanh.

### 7.2. Tạo/Sửa coupon

**Form:**
- Mã (auto uppercase khi nhập).
- Loại: `PERCENT` / `FIXED` / `FREE_SHIP`.
- Giá trị: % hoặc số tiền.
- Đơn tối thiểu.
- Giới hạn lượt dùng (để trống = không giới hạn).
- Ngày hết hạn (date picker, để trống = không hết hạn).
- Toggle kích hoạt.

---

## 8. Cấu trúc File & Component

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx               # Admin layout: Sidebar + Header
│       ├── dashboard/page.tsx
│       ├── products/
│       │   ├── page.tsx             # Danh sách
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── categories/page.tsx
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── users/page.tsx
│       └── coupons/page.tsx
│
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx          # "use client" — sidebar navigation
│       ├── AdminHeader.tsx           # "use client" — top bar
│       ├── StatsCard.tsx             # UI — KPI card
│       ├── RevenueChart.tsx          # "use client" — Recharts line/bar
│       ├── DataTable.tsx             # "use client" — generic sortable table
│       ├── ProductForm.tsx           # "use client" — form tạo/sửa SP
│       ├── ImageUploader.tsx         # "use client" — drag & drop upload
│       ├── VariantEditor.tsx         # "use client" — bảng quản lý variant
│       ├── OrderStatusPanel.tsx      # "use client" — cập nhật trạng thái
│       ├── StatusTimeline.tsx        # UI — lịch sử trạng thái
│       └── CouponForm.tsx            # "use client"
│
└── actions/
    └── admin/
        ├── product/
        │   ├── create.ts
        │   ├── update.ts
        │   └── delete.ts
        ├── category/
        │   ├── create.ts
        │   ├── update.ts
        │   └── delete.ts
        ├── order/
        │   └── update-status.ts
        ├── user/
        │   └── update-role.ts
        ├── coupon/
        │   ├── create.ts
        │   ├── update.ts
        │   └── delete.ts
        └── stats.ts
```

---

## 9. UI/UX Guidelines (Admin-specific)

Admin Panel kế thừa Design System của `ui-guidelines.md` nhưng có một số điều chỉnh:

- **Layout:** Sidebar cố định bên trái (240px), content area chiếm phần còn lại. Mobile: sidebar ẩn → icon menu.
- **Sidebar:** `bg-black border-r border-white/10`. Nav items: hover `bg-white/5`. Active: `bg-white/10 border-l-2 border-white`.
- **DataTable:** Header `bg-white/5 text-xs uppercase tracking-widest text-white/50`. Row hover `bg-white/3`. Borders `border-white/5`.
- **Form layout:** 2 cột trên desktop (content trái, settings sidebar phải). 1 cột trên mobile.
- **Nút Save:** Sticky bottom-right trên mobile. Fixed position trong form panel trên desktop.
- **Số liệu/KPI:** Font monospace, chữ lớn, màu trắng. Percentage change: xanh lá nếu tăng, đỏ nếu giảm.

---

*Tham khảo thêm: `docs/api.md` cho danh sách Server Actions Admin. `docs/database.md` cho schema.*
