# Implementation Plan: Cart Page

## Overview

Implement a full-page cart view at `/cart` that allows customers to review, select, update, and remove items before checkout. The implementation uses the existing `CartContext` for state management, extracts pure computation functions into `cart-utils.ts` for testability, and builds modular UI components following the Duky Store design language (neumorphic cards, serif accent fonts, VNĐ formatting).

## Tasks

- [x] 1. Create cart utility functions module
  - [x] 1.1 Create `src/lib/cart-utils.ts` with pure computation functions
    - Implement `computeCartCount(items: CartItem[]): number` — sum of all item quantities
    - Implement `computeSubtotal(items: CartItem[]): number` — sum of (price × quantity) for each item
    - Implement `computeTotal(subtotal: number, shipping: number, discount: number): number` — subtotal + shipping - discount
    - Implement `applySelectAll(itemIds: string[], selectAll: boolean): Set<string>` — returns full set or empty set
    - Implement `isAllSelected(selectedIds: Set<string>, totalCount: number): boolean` — true iff selectedIds.size === totalCount and totalCount > 0
    - Implement `bulkDelete(items: CartItem[], selectedIds: Set<string>): CartItem[]` — filters out selected items preserving order
    - Implement `clampQuantity(current: number, delta: number, min: number, max: number): number` — clamps result to [min, max]
    - _Requirements: 1.1, 3.3, 3.4, 3.7, 4.2, 4.3, 6.1, 6.3_

  - [ ]* 1.2 Write property test: Cart count equals sum of item quantities
    - **Property 1: Cart count equals sum of item quantities**
    - **Validates: Requirements 1.1, 1.3**

  - [ ]* 1.3 Write property test: Subtotal equals sum of line totals
    - **Property 2: Subtotal equals sum of line totals**
    - **Validates: Requirements 2.1, 6.1, 6.6**

  - [ ]* 1.4 Write property test: Select-all toggles all items to the same selection state
    - **Property 3: Select-all toggles all items to the same selection state**
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 1.5 Write property test: isAllSelected is true iff all items are individually selected
    - **Property 4: isAllSelected is true iff all items are individually selected**
    - **Validates: Requirements 3.5, 3.6**

  - [ ]* 1.6 Write property test: Bulk delete removes exactly the selected items
    - **Property 5: Bulk delete removes exactly the selected items**
    - **Validates: Requirements 3.7, 3.10**

  - [ ]* 1.7 Write property test: Quantity stays within bounds after increment/decrement
    - **Property 6: Quantity stays within bounds after increment/decrement**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [ ]* 1.8 Write property test: Total equals subtotal plus shipping minus discount
    - **Property 8: Total equals subtotal plus shipping minus discount**
    - **Validates: Requirements 6.3**

- [x] 2. Checkpoint - Verify cart utilities
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create QuantitySelector component
  - [x] 3.1 Create `src/components/shop/cart/QuantitySelector.tsx`
    - Implement plus/minus buttons with current quantity display
    - Disable minus button when quantity equals min (default 1)
    - Disable plus button when quantity equals max (default 99)
    - Use `clampQuantity` from cart-utils for logic
    - Style with Tailwind CSS matching existing CartDrawer quantity controls
    - Ensure minimum 44×44px touch targets for mobile
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 11.3_

- [x] 4. Create CartItemRow component
  - [x] 4.1 Create `src/components/shop/cart/CartItemRow.tsx`
    - Render checkbox for selection, product image (80×80px), product name, color/size variants (omit if not present), quantity selector, line total, and delete icon
    - Accept `CartItemRowProps` interface (item, isSelected, onToggleSelect, onUpdateQuantity, onRemove)
    - Use `formatCurrency` from `@/lib/utils` for price display
    - Use Next.js `Image` component for product thumbnail
    - Omit variant labels when color/size not selected on the item
    - _Requirements: 2.1, 2.2, 2.4, 3.1, 4.1, 5.1, 12.3_

- [x] 5. Create OrderSummary component
  - [x] 5.1 Create `src/components/shop/cart/OrderSummary.tsx`
    - Display subtotal ("Tạm tính"), shipping fee ("Phí giao hàng"), and total ("Tổng tiền") formatted in VNĐ
    - Show "Miễn phí" text for free shipping with badge
    - Include "TIẾN HÀNH THANH TOÁN" primary button linking to `/checkout`
    - Include "TIẾP TỤC MUA HÀNG" secondary button linking to `/collections`
    - Disable checkout button when cart is empty
    - Show empty state message with 0₫ values when cart is empty
    - Make sidebar sticky on viewports ≥1024px
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3_

- [x] 6. Create TrustBadges component
  - [x] 6.1 Create `src/components/shop/cart/TrustBadges.tsx`
    - Render heading "DUKY STORE cam kết"
    - Display 3 badges: "Miễn phí giao hàng", "Đổi trả dễ dàng", "Hỗ trợ 24/7" with distinct icons
    - Horizontal row on viewports ≥768px, vertical stack below 768px
    - Ensure no horizontal scrolling on viewports 320px–1280px
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7. Create PaymentMethodsDisplay component
  - [x] 7.1 Create `src/components/shop/cart/PaymentMethodsDisplay.tsx`
    - Display "Phương thức thanh toán" heading
    - Show 6 payment method icons with labels: COD, bank transfer, Visa, MasterCard, JCB, Momo
    - Render as static, informational-only section (no interactive controls)
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 8. Checkpoint - Verify sub-components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement main Cart Page with selection and undo logic
  - [x] 9.1 Create `src/app/(shop)/cart/page.tsx` as the main cart page component
    - Mark as `"use client"` component consuming `useCart()` hook
    - Render Header (with cartCount and onCartClick), Navpages breadcrumb ("Trang chủ" → "Giỏ hàng"), CartDrawer, and Footer
    - Implement local state for `selectedIds: Set<string>`, `undoStack`, `undoTimerId`, `showUndoToast`
    - Display page title "Giỏ hàng của bạn (N)" where N is computed cart count
    - Render "Chọn tất cả" checkbox using `applySelectAll` and `isAllSelected` from cart-utils
    - Render "Xóa đã chọn" button, disabled when no items selected
    - Map cart items to CartItemRow components
    - Show empty cart state when cart is empty with "Giỏ hàng của bạn đang trống" message and link to `/collections`
    - Include OrderSummary, TrustBadges, PaymentMethodsDisplay, and RecommendSection (title="Bạn có thể thích")
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8, 10.1, 10.4, 12.1, 12.2, 12.4, 12.5_

  - [x] 9.2 Implement bulk delete with undo mechanism
    - On "Xóa đã chọn" click: store selected items in undoStack, remove them from cart via `removeFromCart`, clear selection, show undo toast
    - Start 5-second timer; on expiry, clear undoStack and hide toast
    - On "Hoàn tác" click: restore items from undoStack to cart (re-add via `addToCart` or direct state manipulation), clear timer, hide toast
    - Handle single item delete with same undo pattern
    - _Requirements: 3.7, 3.9, 3.10, 5.2, 5.3, 5.4, 5.6_

  - [ ]* 9.3 Write property test: Remove then undo restores original cart state
    - **Property 7: Remove then undo restores original cart state (round-trip)**
    - **Validates: Requirements 5.2, 5.4**

- [x] 10. Implement responsive layout
  - [x] 10.1 Add responsive styles to cart page
    - Two-column grid layout (cart items left, order summary right) at ≥1024px
    - Single-column stacked layout at <1024px (items above summary)
    - Ensure all interactive elements have minimum 44×44px touch targets on mobile
    - Ensure body text minimum 16px on mobile
    - Prevent horizontal scrolling at all breakpoints
    - Smooth transition between layouts on resize across 1024px breakpoint
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- The cart-utils module enables property-based testing of pure functions without React rendering overhead
- All monetary values must use `formatCurrency` from `@/lib/utils` for consistent VNĐ formatting
- The page follows the same layout pattern as the existing checkout page (Header → content → Footer)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "3.1"] },
    { "id": 2, "tasks": ["4.1", "5.1", "6.1", "7.1"] },
    { "id": 3, "tasks": ["9.1"] },
    { "id": 4, "tasks": ["9.2", "10.1"] },
    { "id": 5, "tasks": ["9.3"] }
  ]
}
```
