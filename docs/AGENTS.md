# AI Agent Workspace Skills: Duky Store

Tài liệu này đóng vai trò là "Kỹ năng" (Skill) và Bối cảnh (Context) để bất kỳ AI Agent nào khi tham gia phát triển dự án này đều phải đọc và tuân thủ.

## 1. Project Identity (Định danh dự án)

- **Tên dự án:** Duky Store
- **Lĩnh vực:** E-commerce (Website thương mại điện tử chuyên bán giày cho cả nam và nữ).
- **Mục tiêu cốt lõi:**
  1. Mang lại cảm giác cao cấp (Premium feel), lịch lãm, cá tính và mạnh mẽ.
  2. Tối đa hóa tỷ lệ chuyển đổi (CRO) với UI/UX mượt mà chuẩn SaaS.
  3. Tối ưu hóa SEO thông qua kiến trúc Server-Side Rendering (SSR).

## 2. Tech Stack (Công nghệ lõi)

Agent cần luôn tuân thủ sử dụng các công nghệ sau khi phát triển tính năng:

- **Core Framework:** Next.js (App Router). Luôn ưu tiên Server Components để hỗ trợ SSR/SEO. Chỉ dùng Client Components (`"use client"`) khi thật sự cần state hoặc interactivity.
- **Styling:** Tailwind CSS. Mọi style phải được viết bằng Tailwind utilities.
- **Animation:** Framer Motion (chỉ dùng cho client-side interactions, đảm bảo không chặn quá trình render HTML tĩnh cho SEO).
- **Icons:** Khuyến khích sử dụng bộ icon tối giản như Lucide React.

## 3. Design System (Hệ thống thiết kế)

Agent khi code giao diện (UI) phải tuân thủ nghiêm ngặt ngôn ngữ thiết kế:

- **Màu chủ đạo (Monochrome Edge):** Chỉ sử dụng Đen tuyền (`#000000`), Trắng sứ (`#FFFFFF`) và các dải Xám lạnh/Xám đen. Tương phản cực cao. KHÔNG dùng các màu sắc sặc sỡ (đỏ, xanh, vàng...) trừ những điểm cảnh báo (error) hoặc thành công (success).
- **Typography:** Tiêu đề (Headings) dùng font không chân đậm, góc cạnh. Văn bản (Body text) sắc nét, dễ đọc.
- **Effects:**
  - **Dark Glassmorphism:** Các thẻ nổi (cards), navbar sử dụng kính mờ tối màu (backdrop-blur kết hợp với bg-black/50 hoặc viền trắng 1px).
  - **Crisp Neumorphism:** Đổ bóng (shadow) mảnh, sắc cạnh, ít bo tròn để giữ nét cá tính mạnh mẽ.
  - **Interactions:** Hiệu ứng hover sử dụng nghịch đảo màu (Invert color: nền trắng chữ đen -> nền đen chữ trắng) hoặc trượt/lật dứt khoát.

## 4. Agent Rules & Workflow (Quy tắc phát triển)

- **Kiến trúc mã nguồn:** Component hóa mọi thứ. Tách biệt UI Components (chỉ nhận props) và Feature Components (chứa logic fetch data/state).
- **Responsive:** Luôn xây dựng giao diện theo nguyên tắc Mobile-First bằng cách dùng các utility `sm:`, `md:`, `lg:`, `xl:` của Tailwind.
- **Đọc tài liệu nội bộ:** Trước khi code tính năng nào, Agent BẮT BUỘC phải tham chiếu đến các file trong thư mục `docs/` (ví dụ: `database.md`, `api.md`, `features/auth.md`...) để đồng bộ logic thiết kế.
- **Quản lý Dependencies:** KHÔNG tự ý cài đặt thêm thư viện (npm packages) bên ngoài nếu chưa giải thích rõ lý do và xin phép USER. Tối đa hóa việc dùng công cụ sẵn có của Tailwind và Next.js.
