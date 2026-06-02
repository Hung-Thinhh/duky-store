# Authentication Feature — Duky Store

> Tài liệu đặc tả đầy đủ chức năng **Xác thực & Phân quyền** (Authentication & Authorization) cho hệ thống Duky Store.

---

## 1. Tổng quan (Overview)

Module Authentication là nền tảng bảo mật của toàn hệ thống. Nó chịu trách nhiệm:

- Xác thực danh tính người dùng (Đăng ký / Đăng nhập / Đăng xuất).
- Quản lý phiên làm việc (Session Management) an toàn.
- Phân quyền truy cập (Authorization) giữa các vai trò: **Khách vãng lai**, **Thành viên** và **Admin**.
- Bảo vệ các route nhạy cảm (Checkout, Dashboard, Admin Panel).

**Tech liên quan:** Next.js App Router · NextAuth.js (Auth.js v5) · Prisma ORM · PostgreSQL · Tailwind CSS · Framer Motion

---

## 2. Các luồng chức năng (Feature Flows)

### 2.1. Đăng ký tài khoản (Sign Up)

**Route:** `/auth/register`

**Mô tả:** Người dùng mới tạo tài khoản bằng Email & Mật khẩu.

**Luồng xử lý:**

1. Người dùng điền form: `Họ tên`, `Email`, `Mật khẩu`, `Xác nhận mật khẩu`.
2. Client validate form (React Hook Form + Zod).
3. Gọi Server Action `registerUser()`.
4. Server kiểm tra Email đã tồn tại trong DB chưa.
5. Nếu chưa: hash mật khẩu bằng `bcryptjs`, lưu user mới vào bảng `users` với `role = "CUSTOMER"`.
6. Gửi **Email xác thực** (Verification Email) qua Resend/Nodemailer.
7. Hiển thị thông báo: _"Vui lòng kiểm tra email để xác thực tài khoản."_
8. Sau khi người dùng click link xác thực → cập nhật `emailVerified = true` → tự động đăng nhập.

**Validation rules:**
| Trường | Rule |
|---|---|
| Họ tên | Bắt buộc, 2–50 ký tự |
| Email | Bắt buộc, đúng định dạng email, duy nhất |
| Mật khẩu | Bắt buộc, tối thiểu 8 ký tự, có chữ hoa + số |
| Xác nhận MK | Phải khớp với Mật khẩu |

**Error states:**

- Email đã được sử dụng → `"Email này đã có tài khoản. Vui lòng đăng nhập."`
- Validation thất bại → Hiện lỗi inline bên dưới từng field.

---

### 2.2. Đăng nhập (Sign In)

**Route:** `/auth/login`

**Mô tả:** Người dùng đăng nhập bằng Credentials (Email/Mật khẩu) hoặc OAuth (Google).

#### 2.2.1. Đăng nhập bằng Email & Mật khẩu

**Luồng xử lý:**

1. Người dùng nhập `Email` và `Mật khẩu`.
2. Gọi `signIn("credentials", { email, password })` từ NextAuth.
3. NextAuth chạy `authorize()`: tìm user trong DB, so sánh hash mật khẩu.
4. Nếu khớp → tạo JWT session, redirect về trang trước đó (hoặc `/`).
5. Nếu không khớp → trả về lỗi: `"Email hoặc mật khẩu không đúng."`
6. Nếu email chưa xác thực → `"Tài khoản chưa được xác thực. Kiểm tra hộp thư của bạn."`

#### 2.2.2. Đăng nhập bằng Google (OAuth)

**Luồng xử lý:**

1. Người dùng click "Tiếp tục với Google".
2. Chuyển hướng sang Google OAuth consent screen.
3. Sau khi Google xác nhận → NextAuth callback nhận `profile`.
4. Kiểm tra email trong DB:
   - **Tồn tại:** Link account, tạo session.
   - **Chưa tồn tại:** Tạo user mới với `emailVerified = true` (do Google đã xác thực), `role = "CUSTOMER"`.
5. Redirect về trang trước đó (hoặc `/`).

**"Remember me" (Ghi nhớ đăng nhập):**

- Checkbox tùy chọn.
- Khi checked: `maxAge` của session = 30 ngày.
- Khi unchecked: Session hết hạn khi đóng trình duyệt (`maxAge` = 0).

---

### 2.3. Quên mật khẩu (Forgot Password)

**Route:** `/auth/forgot-password`

**Luồng xử lý:**

1. Người dùng nhập Email.
2. Server kiểm tra email trong DB.
3. Nếu tồn tại → tạo `reset_token` (UUID, hạn 1 giờ), lưu vào bảng `password_reset_tokens`.
4. Gửi email chứa link: `https://dukystore.com/auth/reset-password?token=<token>`.
5. Luôn hiển thị thông báo thành công (để tránh User Enumeration Attack): _"Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."_

---

### 2.4. Đặt lại mật khẩu (Reset Password)

**Route:** `/auth/reset-password?token=<token>`

**Luồng xử lý:**

1. Server validate `token` (tồn tại, chưa hết hạn, chưa dùng).
2. Nếu token không hợp lệ → hiển thị trang lỗi, cung cấp link "Yêu cầu lại".
3. Nếu hợp lệ → hiển thị form nhập mật khẩu mới.
4. Người dùng nhập `Mật khẩu mới` + `Xác nhận mật khẩu mới`.
5. Server hash mật khẩu mới → cập nhật DB → đánh dấu token đã dùng.
6. Tự động đăng nhập → redirect về `/`.

---

### 2.5. Đăng xuất (Sign Out)

**Trigger:** Người dùng click "Đăng xuất" trong dropdown menu của Header.

**Luồng xử lý:**

1. Gọi `signOut()` từ NextAuth.
2. Xóa cookie session.
3. Redirect về trang chủ `/`.
4. Hiển thị toast notification: _"Đã đăng xuất thành công."_

---

### 2.6. Xác thực Email (Email Verification)

**Route:** `/auth/verify-email?token=<token>`

**Luồng xử lý:**

1. Người dùng click link trong email xác thực.
2. Server validate token trong bảng `verification_tokens`.
3. Nếu hợp lệ → cập nhật `emailVerified`, xóa token, tự động đăng nhập.
4. Nếu token hết hạn → hiển thị nút "Gửi lại email xác thực".

---

## 3. Phân quyền (Authorization)

### 3.1. Các vai trò (Roles)

| Role       | Mô tả                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| `CUSTOMER` | Thành viên thường. Có thể mua hàng, xem lịch sử đơn hàng, quản lý profile. |
| `ADMIN`    | Quản trị viên. Có toàn quyền: quản lý sản phẩm, đơn hàng, người dùng.      |

### 3.2. Bảo vệ Routes (Route Protection)

Sử dụng **NextAuth Middleware** (`middleware.ts`) kết hợp `auth()` để bảo vệ route:

| Route Pattern                   | Yêu cầu                                  |
| ------------------------------- | ---------------------------------------- |
| `/user/*`                       | Phải đăng nhập (`CUSTOMER` hoặc `ADMIN`) |
| `/checkout/*`                   | Phải đăng nhập                           |
| `/admin/*`                      | Phải có role `ADMIN`                     |
| `/auth/login`, `/auth/register` | Nếu đã đăng nhập → redirect về `/`       |

**Logic middleware:**

```
Nếu route là /admin/* và user.role !== "ADMIN" → redirect /403
Nếu route là protected và chưa login → redirect /auth/login?callbackUrl=<current_url>
Nếu đã login và vào /auth/login → redirect /
```

### 3.3. Bảo vệ Server Actions & API Routes

Mọi Server Action hoặc Route Handler xử lý dữ liệu nhạy cảm đều phải kiểm tra session:

```typescript
// Ví dụ pattern bảo vệ Server Action
import { auth } from "@/auth";

export async function updateProfile(data: ProfileData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // ...xử lý logic
}
```

---

## 4. Cấu trúc Database (Auth-related Tables)

### Bảng `users`

| Column           | Type           | Ghi chú                |
| ---------------- | -------------- | ---------------------- |
| `id`             | `uuid`         | Primary Key            |
| `name`           | `varchar(100)` | Họ tên hiển thị        |
| `email`          | `varchar(255)` | Unique, Not Null       |
| `emailVerified`  | `timestamp`    | Null nếu chưa xác thực |
| `hashedPassword` | `text`         | Null nếu dùng OAuth    |
| `image`          | `text`         | Avatar URL             |
| `role`           | `enum`         | `CUSTOMER` \| `ADMIN`  |
| `createdAt`      | `timestamp`    |                        |
| `updatedAt`      | `timestamp`    |                        |

### Bảng `accounts` (NextAuth OAuth)

| Column              | Type      | Ghi chú                 |
| ------------------- | --------- | ----------------------- |
| `id`                | `uuid`    | Primary Key             |
| `userId`            | `uuid`    | FK → `users.id`         |
| `provider`          | `varchar` | `google`, `credentials` |
| `providerAccountId` | `varchar` | ID từ provider          |
| `access_token`      | `text`    |                         |
| `refresh_token`     | `text`    |                         |

### Bảng `verification_tokens`

| Column       | Type        | Ghi chú    |
| ------------ | ----------- | ---------- |
| `identifier` | `varchar`   | Email      |
| `token`      | `varchar`   | UUID token |
| `expires`    | `timestamp` | Thời hạn   |

### Bảng `password_reset_tokens`

| Column    | Type        | Ghi chú               |
| --------- | ----------- | --------------------- |
| `id`      | `uuid`      | Primary Key           |
| `email`   | `varchar`   |                       |
| `token`   | `varchar`   | UUID token, Unique    |
| `expires` | `timestamp` | Hạn 1 giờ sau khi tạo |
| `used`    | `boolean`   | Default: false        |

---

## 5. Cấu trúc File & Component

```
src/
├── auth.ts                          # NextAuth config (providers, callbacks, adapter)
├── middleware.ts                    # Route protection middleware
│
├── app/
│   └── auth/
│       ├── login/
│       │   └── page.tsx             # Server Component: trang đăng nhập
│       ├── register/
│       │   └── page.tsx             # Server Component: trang đăng ký
│       ├── forgot-password/
│       │   └── page.tsx
│       ├── reset-password/
│       │   └── page.tsx
│       └── verify-email/
│           └── page.tsx
│
├── components/
│   └── auth/
│       ├── LoginForm.tsx            # "use client" — form đăng nhập
│       ├── RegisterForm.tsx         # "use client" — form đăng ký
│       ├── ForgotPasswordForm.tsx   # "use client"
│       ├── ResetPasswordForm.tsx    # "use client"
│       ├── OAuthButtons.tsx         # "use client" — nút Google
│       └── AuthCard.tsx             # UI wrapper — glassmorphism card
│
└── actions/
    └── auth/
        ├── register.ts              # Server Action: đăng ký
        ├── forgot-password.ts       # Server Action: quên mật khẩu
        ├── reset-password.ts        # Server Action: đặt lại mật khẩu
        └── verify-email.ts          # Server Action: xác thực email
```

---

## 6. UI/UX Guidelines (theo Design System)

Tuân thủ Design System từ `AGENTS.md`:

- **AuthCard:** Sử dụng Dark Glassmorphism — `backdrop-blur-md bg-black/60 border border-white/10`.
- **Inputs:** Nền tối, border `border-white/20`, focus ring `ring-1 ring-white`. KHÔNG dùng màu sặc sỡ.
- **Primary Button:** Nền trắng, chữ đen (`bg-white text-black`). Hover: invert (`hover:bg-black hover:text-white hover:border hover:border-white`). Transition dứt khoát (`transition-all duration-150`).
- **Error messages:** Chữ đỏ nhạt `text-red-400` — đây là điểm ngoại lệ duy nhất của màu sắc.
- **Success messages:** Chữ xanh lá nhạt `text-green-400`.
- **Animations (Framer Motion):** Form card xuất hiện với `fade-in + slide-up` nhẹ (`y: 16 → 0, opacity: 0 → 1, duration: 0.3s`).
- **Layout:** Trang auth căn giữa màn hình, nền đen tuyền `bg-black`, card chiếm ~400px width.

---

## 7. Bảo mật (Security Checklist)

- [x] Mật khẩu được hash bằng `bcryptjs` (salt rounds = 12) trước khi lưu DB.
- [x] Sử dụng JWT session với `secret` được lưu trong biến môi trường.
- [x] CSRF Protection: NextAuth tích hợp sẵn.
- [x] Rate Limiting: Áp dụng cho các endpoint `/auth/*` (dùng Upstash Rate Limit hoặc middleware tự viết).
- [x] Token một lần (One-time token) cho Reset Password và Verify Email.
- [x] Không tiết lộ thông tin user qua thông báo lỗi (tránh User Enumeration).
- [x] HTTPS only — cookies được set với `secure: true`, `httpOnly: true`, `sameSite: "lax"`.

---

## 8. Biến môi trường cần thiết

```env
# NextAuth
AUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://dukystore.com

# Google OAuth
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>

# Database
DATABASE_URL=<postgresql-connection-string>

# Email (Resend)
RESEND_API_KEY=<resend-api-key>
EMAIL_FROM=no-reply@dukystore.com
```

---

_Tài liệu này cần được cập nhật khi có thay đổi về schema hoặc luồng nghiệp vụ._
