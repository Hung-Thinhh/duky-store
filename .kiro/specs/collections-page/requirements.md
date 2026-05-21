# Requirements Document

## Introduction

Product collections page using dynamic routes (`/collections/[slug]`) for Duky Store. Supports "boot-nam" and "boot-nu" slugs with hero banner, filter sidebar, and product grid.

## Requirements

### Requirement 1: Dynamic Route & Data Resolution
- Page at `/collections/boot-nam` and `/collections/boot-nu`
- Invalid slugs return 404
- Each slug maps to collection-specific banner content and products

### Requirement 2: Collection Hero Banner
- Full-width glassmorphism banner with label, title, description, product image
- CTA buttons: "Mua ngay" (black) and "Xem bộ sưu tập" (outline)
- Trust badges card (Da bò thật, Bảo hành, Đổi trả, Giao hàng)
- Social proof section

### Requirement 3: Product Grid with Filter
- Two-column layout: Filter sidebar (left) + Product grid (right, 4 cols desktop)
- Uses existing Filter component for category/size/color/price filtering
- Uses existing ProductCard with badges, ratings, favorites, cart button
- Client-side filtering updates grid without page reload

### Requirement 4: Layout with Header/Footer
- Layout includes Header with cart and Footer
- Proper spacing for fixed header
- Cart drawer functionality

### Requirement 5: Empty State
- When filters yield no results, show "Không tìm thấy sản phẩm phù hợp" message
