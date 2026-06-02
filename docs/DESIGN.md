# 🎨 Design Document — Duky Store Website

> Tài liệu thiết kế UX/UI cho website thương mại điện tử **Duky Store** — Giày boot da nam nữ tại Cần Thơ.

---

## 1. Tổng quan thương hiệu

| Thuộc tính          | Chi tiết                                         |
| ------------------- | ------------------------------------------------ |
| **Tên thương hiệu** | Duky Store                                       |
| **Sản phẩm**        | Giày boot da nam nữ, phụ kiện, outfit            |
| **Địa chỉ**         | 122 Nguyễn Hiến, KDC 91B, P. Tân An, TP. Cần Thơ |
| **Hotline / Zalo**  | 0939.654.574                                     |
| **Email**           | duky.seoweb@gmail.com                            |
| **Giờ mở cửa**      | 09:00 – 21:00                                    |
| **Copyright**       | © 2026 Duky Store. All rights reserved.          |

---

## 2. Định hướng thiết kế

### Phong cách tổng thể

- **Style:** Minimalist Fashion / Luxury Editorial
- **Tone:** Sang trọng, hiện đại, nam tính / nữ tính tùy section
- **Cảm giác:** Clean, premium, tối giản nhưng có chiều sâu

### Taglines & Messaging

- _"Bứt phá phong cách – Khẳng định chất riêng"_
- _"Bản lĩnh trong từng bước đi"_ (Boot Nam)
- _"Tôn dáng trong từng bước đi"_ (Boot Nữ)
- _"Chọn đúng size giày chỉ trong 30 giây"_

---

## 3. Màu sắc (Color Palette)

| Tên màu                    | Mã màu    | Vai trò                                 |
| -------------------------- | --------- | --------------------------------------- |
| **Primary Black**          | `#0A0A0A` | Text chính, CTA button, nền footer dark |
| **Off White / Light Gray** | `#F4F4F4` | Nền trang chủ, card background          |
| **Pure White**             | `#FFFFFF` | Card, input field, badge                |
| **Mid Gray**               | `#888888` | Subtext, caption, icon phụ              |
| **Light Gray Border**      | `#E0E0E0` | Viền card, divider                      |
| **Gold / Amber**           | `#F5A623` | Icon ngôi sao rating                    |
| **Accent (dark)**          | `#1A1A1A` | Hover state, tag BEST/NEW               |

> **Nguyên tắc màu:** Bộ màu chủ đạo là white + black (80%), xám trung tính (15%), accent vàng chỉ xuất hiện ở đánh giá sao (5%).

---

## 4. Typography

| Vai trò                | Font                                     | Weight  | Size (approx.)               |
| ---------------------- | ---------------------------------------- | ------- | ---------------------------- |
| **Display / Hero**     | Serif (dạng Playfair Display / DM Serif) | 700–900 | 72–96px                      |
| **Section Title**      | Serif                                    | 600–700 | 40–56px                      |
| **Sub-heading**        | Sans-serif                               | 500–600 | 18–24px                      |
| **Body Text**          | Sans-serif                               | 400     | 14–16px                      |
| **Caption / Label**    | Sans-serif                               | 400     | 12px                         |
| **CTA Button**         | Sans-serif                               | 600–700 | 14–16px, letter-spacing rộng |
| **Badge (BEST / NEW)** | Sans-serif                               | 700     | 10–11px, uppercase           |

> **Ghi chú:** Tiêu đề lớn (Hero section) dùng font serif để tạo cảm giác cao cấp. Body và UI elements dùng sans-serif để dễ đọc.

---

## 5. Cấu trúc trang (Page Structure)

### 5.1 Navigation (Header)

- **Logo:** Duky Store (icon hình thoi + chữ)
- **Menu chính:** Boot Nam | Boot Nữ | Phụ kiện | Outfit | Kinh nghiệm | Liên hệ
- **Icons phải:** 🔍 Tìm kiếm | 👤 Tài khoản | 🛒 Giỏ hàng (badge số) | 📞 Hotline / Zalo
- **Style:** Nền trắng, viền dưới nhẹ, sticky

---

### 5.2 Hero Section (Trang chủ)

- **Layout:** Full-width, nền xám nhạt
- **Content trái:** Label nhỏ + Tiêu đề lớn serif + Tagline + 2 CTA button
- **Content phải:** Ảnh model + sản phẩm nổi bật
- **CTA buttons:**
  - Primary: "KHÁM PHÁ NGAY →" (nền đen, chữ trắng, bo tròn)
  - Secondary: "Xem Thêm" (viền đen, nền trắng, bo tròn)
- **Badge phía dưới:** 4 trust badges ngang (giao hàng, đổi size, bảo hành, tư vấn)

---

### 5.3 Featured Collection (Danh mục nổi bật)

- **Layout:** 4 card ngang, mỗi card có ảnh sản phẩm + tên danh mục + "Xem ngay →"
- **Danh mục:** Boot nam | Boot nữ | Outfit | Phụ kiện
- **Card style:** Bo góc lớn (~16px), nền trắng/xám nhạt, shadow nhẹ
- **Navigation:** Mũi tên ← → ở góc phải trên

---

### 5.4 Best Seller Section

- **Layout:** 5 product card ngang, có thể scroll
- **Product Card:**
  - Badge "BEST" góc trên trái (pill shape, nền trắng)
  - Icon tim ❤ góc trên phải
  - Ảnh sản phẩm trên nền trắng/xám
  - Tên sản phẩm
  - Giá (bold, font lớn hơn)
  - Rating ⭐ + số đánh giá
  - Nút giỏ hàng 🛒 (nền đen, góc dưới phải, hình tròn)

---

### 5.5 BST Boot Nam (Men's Collection)

- **Layout:** 2 cột — Thông tin trái + Featured product card phải
- **Thông tin trái:**
  - Label "MEN'S COLLECTION"
  - Tiêu đề lớn "BST Boot Nam"
  - Mô tả ngắn
  - 2 CTA: "Xem BST" (filled) + "Xem tất cả" (text link)
  - 3 stat badges: 50+ mẫu | 100% da thật | 12 tháng bảo hành
- **Featured card phải:** Ảnh lớn, tên model, mô tả, "Khám phá chi tiết" + dots pagination
- **Product grid phía dưới:** 4 card sản phẩm mới (badge "NEW")

---

### 5.6 BST Boot Nữ (Women's Collection)

- **Layout:** Tương tự BST Boot Nam, đối xứng
- **Thông tin trái:**
  - Label "WOMEN'S COLLECTION" + icon thoi
  - Tiêu đề lớn "BST Boot Nữ"
  - 3 stat badges: 40+ mẫu | Da đẹp chọn lọc | 12 tháng bảo hành
- **Featured card phải:** Elegant High Boot + dots pagination
- **Product grid phía dưới:** 4 card sản phẩm mới

---

### 5.7 Size Guide Section

- **Layout:** 1 row ngang — Text trái + 3 step cards
- **Content:** "Chọn đúng size giày chỉ trong 30 giây"
- **3 bước:**
  1. Đo chiều dài bàn chân
  2. Đối chiều bằng size Duky
  3. Nhận size đề xuất
- **Icon style:** Line art, minimalist

---

### 5.8 Lookbook / Phối đồ Section

- **Layout:** Tiêu đề + 6 ảnh gallery ngang (dạng Instagram feed)
- **Tiêu đề:** "Phối đồ cùng Duky" + "Xem thêm →"
- **Ảnh:** Bo góc lớn, ratio 1:1 hoặc portrait

---

### 5.9 Customer Reviews

- **Layout:** 3 review card ngang
- **Card content:** Avatar tròn + Tên + Thành phố + Rating ⭐ + Nội dung + Ảnh sản phẩm nhỏ bên phải
- **Rating:** Full 5 sao màu vàng/cam

---

### 5.10 Blog / Tin tức & Lookbook

- **Layout:** Text trái + 3 blog cards ngang
- **Card:** Ảnh nền full + overlay tối + date badge + category tag + tiêu đề + "ĐỌC NGAY →"
- **Danh mục bài:** Xu hướng | Phối đồ | Sản phẩm

---

### 5.11 Newsletter / Ưu đãi Section

- **Layout:** Text trái + 4 benefit cards phải
- **Tiêu đề:** "Ưu đãi dành riêng cho bạn"
- **Form:** Input email + Button "ĐĂNG KÝ"
- **4 benefits:** Ưu đãi độc quyền | Sản phẩm mới | Miễn phí giao hàng | Đổi trả dễ dàng
- **Note:** "Chúng tôi cam kết bảo mật thông tin của bạn." + icon khóa

---

### 5.12 Store Location

- **Layout:** 2 cột — Info trái + Google Maps phải
- **Info:** Địa chỉ | Giờ mở cửa | Hotline | Zalo | Google Maps link | Chính sách đổi trả
- **CTA:** "Chỉ đường đến cửa hàng →"

---

### 5.13 FAQ Section

- **Layout:** Tiêu đề trái + 7 câu hỏi chia 2 cột (accordion)
- **Style:** Nền tối (dark), text trắng, icon "+" để expand
- **FAQ topics:** Size | Giao hàng | Địa chỉ | Bảo hành | Cách chọn size | Form | Thanh toán

---

### 5.14 CTA Banner (Pre-footer)

- **Layout:** Full-width, nền xám nhạt, ảnh sản phẩm phải
- **Tiêu đề:** "Sẵn sàng tìm đôi boot hợp phong cách của bạn?"
- **2 CTA:** "Mua ngay →" (filled) + "Nhắn Zalo" (outlined với icon)

---

### 5.15 Footer

- **Layout:** 5 cột
  - Col 1: Logo + mô tả ngắn
  - Col 2: Danh mục (Boot nam, Boot nữ, Outfit, Phụ kiện)
  - Col 3: Hỗ trợ (Chọn size, Giao hàng, Đổi trả, Bảo hành)
  - Col 4: Liên hệ (Địa chỉ, SĐT, Email)
  - Col 5: Theo dõi (Facebook, Instagram, Zalo, TikTok) + Social proof card
- **Bottom bar:** Nền đen | Copyright trái | Logo + "Designed by Duky Agency" phải

---

## 6. Components & UI Patterns

### Buttons

| Loại            | Style                                                         |
| --------------- | ------------------------------------------------------------- |
| **Primary**     | Nền đen, chữ trắng, bo tròn full (pill), padding 14–20px 32px |
| **Secondary**   | Viền đen 1.5px, nền trắng, chữ đen, bo tròn full              |
| **Text Link**   | Chữ đen, gạch chân hoặc mũi tên →, không có border            |
| **Icon Button** | Nền đen hình tròn, icon trắng (dùng cho add to cart)          |

### Cards

- Bo góc: `border-radius: 16px`
- Shadow: nhẹ `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- Nền: trắng hoặc `#F4F4F4`

### Badges / Tags

- **BEST / NEW:** Pill shape, nền trắng, chữ đen nhỏ uppercase, font-weight 700
- **Date badge:** Nền trắng mờ, hiển thị ngày + tháng, trên ảnh blog

### Trust Badges (4 icons)

- Icon outline trên nền trắng
- Layout: icon + tiêu đề in đậm + mô tả nhỏ
- Phân cách nhau bằng divider dọc

### Stat Badges

- Nền trắng/xám, bo góc
- Icon nhỏ + con số lớn in đậm + label nhỏ bên dưới

---

## 7. Spacing & Layout

| Thuộc tính                 | Giá trị                |
| -------------------------- | ---------------------- |
| **Container max-width**    | ~1440px                |
| **Horizontal padding**     | 48–80px                |
| **Section gap**            | 80–120px               |
| **Card gap**               | 16–24px                |
| **Border radius (card)**   | 12–20px                |
| **Border radius (button)** | 9999px (pill) hoặc 8px |

---

## 8. Iconography

- **Style:** Line icons, stroke weight đều nhau, minimal
- **Dùng cho:** Navigation (search, user, cart), Trust badges, FAQ (dấu +), Social media, Contact info (location pin, phone, chat, shield)
- **Kích thước:** 20–24px cho UI icon, 40–48px cho feature icon

---

## 9. Imagery Guidelines

- **Sản phẩm:** Nền trắng/xám nhạt, góc chụp 3/4 hoặc side view, ánh sáng studio
- **Model:** Chụp ngoại cảnh hoặc studio, trang phục dark/monochrome để sản phẩm nổi bật
- **Lookbook:** Đa dạng góc chụp, street style, lifestyle
- **Tỉ lệ ảnh hero:** 16:9 hoặc full-bleed
- **Tỉ lệ ảnh product card:** 1:1 hoặc 4:3

---

## 10. Responsive Notes

- Desktop first design (1440px base)
- Navigation collapse thành hamburger menu trên mobile
- Product grid: 4 col → 2 col → 1 col
- Hero layout: 2 col → single col (ảnh ẩn hoặc xuống dưới)
- Lookbook gallery: 6 col → 3 col → 2 col

---

## 11. Danh sách sản phẩm (mẫu)

### Best Sellers

| Sản phẩm                 | Giá        | Rating       |
| ------------------------ | ---------- | ------------ |
| Giày Oxford Da Bò Thật   | 2.590.000đ | ⭐ 4.9 (128) |
| Boot Nữ Mũi Nhọn Da Thật | 2.890.000đ | ⭐ 4.9 (96)  |
| Boot Nam Chelsea Classic | 2.990.000đ | ⭐ 4.8 (87)  |
| Boot Nữ Biker Cá Tính    | 2.990.000đ | ⭐ 4.9 (74)  |
| Giày Lười Da Bò Thật     | 2.390.000đ | ⭐ 4.8 (63)  |

### Boot Nam (New)

| Sản phẩm                   | Giá        |
| -------------------------- | ---------- |
| Boot Nam Cổ Cao Dây Buộc   | 2.590.000đ |
| Giày Derby Nam Chunky      | 2.890.000đ |
| Boot Nam Harness Chain     | 2.990.000đ |
| Giày Nam Derby Đế Răng Cưa | 2.790.000đ |

### Boot Nữ (New)

| Sản phẩm                | Giá        |
| ----------------------- | ---------- |
| Boot Nữ Cao Cổ Platform | 1.590.000đ |
| Boot Nữ Mũi Nhọn Bóng   | 1.290.000đ |
| Giày Mary Jane Bóng     | 1.190.000đ |
| Boot Nữ Chunky Dây Buộc | 1.490.000đ |

---

## 12. Kênh liên hệ & Mạng xã hội

- 📘 Facebook
- 📸 Instagram
- 💬 Zalo: 0939.654.574
- 🎵 TikTok
- 📧 dukystore.info@gmail.com

---

_Tài liệu được tổng hợp từ file UX/UI design Duky Store — Phiên bản 2026_
