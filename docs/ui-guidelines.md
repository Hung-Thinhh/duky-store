# UI Guidelines — Duky Store

> Hướng dẫn thiết kế UI/UX chuẩn cho mọi Agent khi phát triển giao diện Duky Store. Mọi component phải tuân thủ tài liệu này để đảm bảo tính nhất quán (visual consistency) trên toàn hệ thống.

---

## 1. Design Philosophy (Triết lý thiết kế)

Duky Store theo đuổi ngôn ngữ thiết kế **"Monochrome Edge"** — tối giản, sắc nét, nam tính, cao cấp. Cảm giác cần đạt được:

> *Như một showroom giày cao cấp: tối, bóng loáng, mọi chi tiết đều có chủ đích.*

**3 nguyên tắc cốt lõi:**
1. **Tương phản cực cao (High Contrast):** Đen - Trắng là vua. Không nhạt nhòa.
2. **Chuyển động có chủ đích (Intentional Motion):** Animation phục vụ UX, không trang trí.
3. **Khoảng trắng là thiết kế (Whitespace is design):** Đừng sợ khoảng trống.

---

## 2. Color System (Bảng màu)

### Màu chủ đạo — Monochrome

| Token | Giá trị | Sử dụng |
|---|---|---|
| `--color-black` | `#000000` | Background chính, text trên nền sáng |
| `--color-white` | `#FFFFFF` | Text chính, nền card sáng, CTA primary |
| `--color-gray-900` | `#0A0A0A` | Background sections tối |
| `--color-gray-800` | `#141414` | Background cards, inputs |
| `--color-gray-700` | `#1F1F1F` | Border, divider |
| `--color-gray-500` | `#525252` | Placeholder text, icon mờ |
| `--color-gray-400` | `#737373` | Secondary text |
| `--color-gray-200` | `#E5E5E5` | Text trên nền tối nhạt |

### Màu trạng thái — Ngoại lệ duy nhất

| Trạng thái | Màu | Tailwind class |
|---|---|---|
| **Error / Danger** | `#EF4444` (Red 500) | `text-red-500`, `border-red-500` |
| **Success** | `#22C55E` (Green 500) | `text-green-500` |
| **Warning** | `#F59E0B` (Amber 500) | `text-amber-500` |
| **Info** | `#3B82F6` (Blue 500) | `text-blue-500` |

> ⚠️ Màu trạng thái **chỉ được dùng cho feedback** (lỗi form, toast, badge trạng thái đơn hàng). KHÔNG dùng cho decoration.

---

## 3. Typography (Chữ)

### Font

```typescript
// src/app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});
```

| Vai trò | Font | Weight | Ghi chú |
|---|---|---|---|
| Heading (H1–H3) | Inter | 700–900 | Uppercase, letter-spacing tight |
| Heading (H4–H6) | Inter | 600–700 | |
| Body text | Inter | 400 | |
| Label, Caption | Inter | 500 | Uppercase, tracking-wide |
| Monospace (price, code) | Inter | 600 | Tabular numbers |

### Typographic Scale

| Tên | Size | Line Height | Dùng cho |
|---|---|---|---|
| `text-xs` | 12px | 16px | Caption, badge |
| `text-sm` | 14px | 20px | Secondary text, label |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Sub-heading |
| `text-xl` | 20px | 28px | Card title |
| `text-2xl` | 24px | 32px | Section heading |
| `text-3xl` | 30px | 36px | Page heading |
| `text-4xl–6xl` | 36–60px | | Hero heading |

---

## 4. Spacing & Layout

- **Base unit:** 4px (Tailwind's default spacing scale).
- **Container max-width:** `max-w-7xl` (1280px) với padding `px-4 sm:px-6 lg:px-8`.
- **Section padding:** `py-16 lg:py-24`.
- **Card padding:** `p-6` (24px).
- **Grid:** Dùng CSS Grid qua Tailwind `grid-cols-*`. Ưu tiên `gap-6` (24px) giữa các items.
- **Breakpoints:** `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px` — Mobile-first.

---

## 5. Component Patterns

### 5.1. Buttons

#### Primary Button
```
Nền: #FFFFFF | Chữ: #000000 | Border: 1px solid #FFFFFF
Hover: Nền #000000 | Chữ #FFFFFF | Border: 1px solid #FFFFFF
Transition: all 150ms ease
Padding: px-6 py-3 | Font: font-semibold text-sm uppercase tracking-wider
```
```html
<button class="bg-white text-black border border-white px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-150 hover:bg-black hover:text-white">
  Thêm vào giỏ
</button>
```

#### Secondary Button (Ghost)
```
Nền: transparent | Chữ: #FFFFFF | Border: 1px solid rgba(255,255,255,0.2)
Hover: Border: 1px solid #FFFFFF | Nền: rgba(255,255,255,0.05)
```

#### Danger Button
```
Nền: transparent | Chữ: text-red-400 | Border: border-red-400/30
Hover: Nền: bg-red-500/10 | Border: border-red-400
```

### 5.2. Inputs & Form Fields

```
Nền: bg-white/5
Border: border border-white/20
Focus: ring-1 ring-white border-white/60
Placeholder: text-white/30
Text: text-white
Border-radius: rounded-none (không bo tròn — giữ nét sắc cạnh)
Padding: px-4 py-3
```

**Label pattern:**
```html
<label class="block text-xs font-medium uppercase tracking-widest text-white/50 mb-2">
  Email
</label>
<input class="w-full bg-white/5 border border-white/20 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white transition-all" />
```

**Error state:**
```
border-red-500/50 | focus:ring-red-500
```
```html
<p class="mt-1 text-xs text-red-400">Email không hợp lệ.</p>
```

### 5.3. Cards

#### Standard Card
```
bg-white/5 backdrop-blur-sm
border border-white/10
Hover: border-white/30
transition-all duration-200
```

#### Glassmorphism Card (nổi bật)
```
bg-black/60 backdrop-blur-md
border border-white/10
box-shadow: 0 0 0 1px rgba(255,255,255,0.05)
```

#### Product Card
```
group cursor-pointer
overflow-hidden
Ảnh: aspect-[3/4] object-cover, scale-100 → group-hover:scale-105, duration-500
Tên SP: font-semibold text-white group-hover:text-white/80
Giá: tabular-nums font-bold
```

### 5.4. Badges & Tags

```
Inline-flex items-center
px-2.5 py-0.5
text-xs font-medium uppercase tracking-wider
border

Ví dụ trạng thái:
- Mới: bg-white text-black
- Sale: bg-white/10 text-white border-white/20
- Hết hàng: bg-white/5 text-white/40 border-white/10
```

### 5.5. Modals & Drawers

```
Overlay: bg-black/70 backdrop-blur-sm
Panel: bg-[#0A0A0A] border-l border-white/10 (drawer) hoặc bg-[#0A0A0A] border border-white/10 rounded-none (modal)
Close button: absolute top-4 right-4, icon X, text-white/50 hover:text-white
```

### 5.6. Navigation / Header

```
Position: fixed top-0, w-full, z-50
Background: bg-black/80 backdrop-blur-md border-b border-white/10
Logo: Font bold, uppercase, tracking-tightest
Nav links: text-sm text-white/70 hover:text-white, transition-colors
Active link: text-white font-medium
```

---

## 6. Effects & Animations

### 6.1. Dark Glassmorphism

Dùng cho: Header, Cards nổi, Modal, Drawer, Cart Summary.

```css
background: rgba(0, 0, 0, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

```html
<!-- Tailwind equivalent -->
<div class="bg-black/60 backdrop-blur-md border border-white/10">
```

### 6.2. Crisp Neumorphism (Subtle Shadow)

Dùng cho: Buttons secondary, input focus state, separators.

```css
/* Light neumorphism trên nền tối */
box-shadow: 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(255,255,255,0.03);
```

### 6.3. Hover Invert (Interaction chính)

Mọi CTA primary dùng color invert khi hover:
```
Nền trắng + chữ đen → hover: Nền đen + chữ trắng
transition-all duration-150
```

### 6.4. Framer Motion Patterns

**Page / Section fade-in:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>
```

**Staggered list (product grid):**
```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

**Drawer slide-in:**
```tsx
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
/>
```

**Modal scale-in:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.96 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.96 }}
  transition={{ duration: 0.2 }}
/>
```

> **Rule:** Tất cả animation `duration` ≤ 350ms. Không dùng animation lâu hơn — cảm giác chậm chạp.

---

## 7. Icons

Dùng **Lucide React** — tree-shakable, consistent stroke width.

```tsx
import { ShoppingCart, Search, User, X, ChevronRight } from "lucide-react";

// Standard usage
<ShoppingCart className="w-5 h-5 text-white" strokeWidth={1.5} />
```

**Kích thước chuẩn:**
- Inline với text: `w-4 h-4`
- Navigation / Action: `w-5 h-5`
- Hero / Feature section: `w-6 h-6` trở lên
- `strokeWidth`: `1.5` cho look mảnh, cao cấp. Không dùng `2` (quá đậm).

---

## 8. Responsive Design Rules

- **Mobile-first:** Luôn code cho mobile trước, rồi mở rộng với `sm:`, `md:`, `lg:`.
- **Touch targets:** Mọi element có thể click tối thiểu `44×44px` trên mobile.
- **Typography:** Heading scale nhỏ hơn trên mobile (ví dụ: `text-3xl md:text-5xl lg:text-6xl`).
- **Grid:** Mobile = 1 cột, tablet = 2 cột, desktop = 3–4 cột.
- **Navigation:** Desktop = horizontal nav. Mobile = hamburger menu → drawer.
- **Product images:** Luôn dùng `aspect-[3/4]` (portrait) để nhất quán.

---

## 9. Loading & Empty States

### Skeleton Loading
```html
<!-- Dùng cho product card skeleton -->
<div class="animate-pulse">
  <div class="aspect-[3/4] bg-white/10"></div>
  <div class="mt-3 h-4 bg-white/10 rounded-none w-3/4"></div>
  <div class="mt-2 h-4 bg-white/10 rounded-none w-1/2"></div>
</div>
```

### Empty States
- Icon lớn, `opacity-20`, căn giữa.
- Text mô tả ngắn gọn (`text-white/40`).
- CTA button rõ ràng.

### Error States
- Icon `AlertCircle` màu `text-red-400`.
- Message mô tả vấn đề và hướng giải quyết.
- Nút "Thử lại" (ghost button).

---

## 10. Do's and Don'ts

| ✅ DO | ❌ DON'T |
|---|---|
| Dùng màu đen/trắng/xám | Dùng màu sắc sặc sỡ ngoài trạng thái |
| Bo tròn ít (`rounded-sm` hoặc `rounded-none`) | Dùng `rounded-full` cho buttons lớn |
| Transition `duration-150` cho interactions | Animation > 350ms |
| Uppercase + tracking-wide cho labels | Chữ thường cho labels quan trọng |
| `strokeWidth={1.5}` cho Lucide icons | `strokeWidth={2}` hoặc filled icons |
| Optimistic UI update | Chờ server response mới cập nhật UI |
| `next/image` cho mọi ảnh sản phẩm | `<img>` tag thuần |
| Framer Motion chỉ trong Client Components | Import Framer Motion trong Server Components |

---

*Mọi component mới phải được review dựa trên tài liệu này trước khi merge vào nhánh chính.*
