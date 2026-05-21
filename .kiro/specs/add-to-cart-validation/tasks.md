# Implementation Plan: Add to Cart Validation

## Overview

Triển khai validation phía frontend trước khi thêm sản phẩm vào giỏ hàng hoặc thanh toán nhanh, kết nối CartContext với Backend Cart API qua sessionId, và hiển thị phản hồi lỗi/thành công qua inline messages và toast. Sử dụng TypeScript, Next.js App Router, và React Context.

## Tasks

- [x] 1. Create validation utility
  - [x] 1.1 Create `src/lib/cart-validation.ts` with interfaces and validation function
    - Define `ValidateAddToCartParams`, `ValidationError`, `ValidationResult` interfaces
    - Implement `validateAddToCart` pure function with logic:
      - Check size selected when product has sizes
      - Check color selected when product has colors
      - Check variant stock > 0
      - Check quantity <= availableQuantity
    - Return `{ valid: true, errors: [] }` when all checks pass
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Write property tests for `validateAddToCart`
    - Use `fast-check` library
    - **Property 1: Validation rejects missing size**
    - **Property 2: Validation rejects missing color**
    - **Property 3: Validation rejects zero-stock variant**
    - **Property 4: Validation rejects over-quantity requests**
    - **Property 5: Valid inputs produce valid result**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 2. Add Cart API functions
  - [x] 2.1 Add Cart API types and functions to `src/lib/api.ts`
    - Define `CartItemResponse`, `CartResponse`, `AddToCartPayload` interfaces
    - Implement `getCartAPI(sessionId: string)` — calls `GET /api/v1/cart?sessionId=xxx` with no cache
    - Implement `addToCartAPI(payload: AddToCartPayload)` — calls `POST /api/v1/cart/items` with JSON body
    - Handle error responses with shape `{ EC: number, EM: string }` — extract `EM` for error messages
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 3. Refactor CartContext to use Backend API
  - [x] 3.1 Add sessionId management to `src/context/CartContext.tsx`
    - On mount, read `localStorage.getItem('duky_cart_session')`
    - If null, generate `crypto.randomUUID()` and store in localStorage
    - Use `useRef` to hold sessionId (avoid re-renders)
    - Expose `getSessionId()` method
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Refactor `addToCart` to call Backend API
    - Call `addToCartAPI({ sessionId, productId, variantId, quantity })`
    - On success: update cart state from response, show success toast
    - On error: show error toast with server message (`EM` field)
    - _Requirements: 3.4, 3.5, 1.5, 1.6_

  - [x] 3.3 Add `refreshCart` on mount
    - Call `getCartAPI(sessionId)` in `useEffect` on mount
    - Set `loading = true` during fetch, `false` after
    - Hydrate cart state from response
    - _Requirements: 3.3_

  - [x] 3.4 Add toast state with auto-dismiss
    - Add `toast: { message: string; type: 'success' | 'error' } | null` to context state
    - Auto-dismiss after 3 seconds via `setTimeout`
    - Expose `dismissToast()` method
    - _Requirements: 4.4, 4.5_

  - [ ]* 3.5 Write property test for sessionId persistence
    - **Property 6: SessionId persistence round-trip**
    - **Validates: Requirements 3.1, 3.2**

- [x] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update InfoSection with validation
  - [x] 5.1 Update `src/components/shop/product/InfoSection.tsx` props and state
    - Add `onAddToCart` and `onQuickBuy` props to interface
    - Add `validationErrors` state (`ValidationError[]`)
    - Add `isAddingToCart` loading state
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.2 Implement button handlers with validation
    - `handleAddToCart`: call `validateAddToCart`, set errors if invalid, call `onAddToCart` if valid
    - `handleQuickBuy`: same validation, call `onQuickBuy` if valid
    - Clear validation errors when user changes size, color, or quantity
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

  - [x] 5.3 Add inline error messages and button disable logic
    - Show red error text below size selector when `field: 'size'` error exists
    - Show red error text below color selector when `field: 'color'` error exists
    - Show red error text below quantity when `field: 'stock'` error exists
    - Disable both buttons when `matchedVariant?.inventory?.availableQuantity === 0`
    - Show loading spinner on "Thêm vào giỏ hàng" button when `isAddingToCart === true`
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Update Product Detail Page
  - [x] 6.1 Wire handlers in `src/app/(shop)/products/[slug]/page.tsx`
    - Import `useCart` from CartContext
    - Implement `handleAddToCart(variantId, quantity)` — calls `addToCart(product.id, variantId, quantity)`
    - Implement `handleQuickBuy(variantId, quantity)` — builds URL params and navigates to `/checkout?quickBuy=true&productId=X&variantId=Y&quantity=Z`
    - Pass both handlers to InfoSection component
    - _Requirements: 1.5, 1.6, 2.3_

- [x] 7. Update Checkout Page for Quick Buy
  - [x] 7.1 Add quick buy mode to `src/app/(shop)/checkout/page.tsx`
    - Read `quickBuy`, `productId`, `variantId`, `quantity` from URL search params
    - When `isQuickBuy === true`, fetch product/variant details
    - Display single product in order summary instead of cart items
    - Calculate subtotal from quick buy product price × quantity
    - _Requirements: 2.3, 2.4_

- [x] 8. Add Toast component
  - [x] 8.1 Create Toast UI component rendered from CartContext
    - Render toast from CartContext `toast` state
    - Fixed position bottom-right, z-index 9999
    - Success variant (green) and error variant (red)
    - Auto-dismiss after 3 seconds with fade animation
    - Render in CartProvider wrapper or root layout
    - _Requirements: 4.4, 4.5_

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify full flow: select size → select color → click "Thêm vào giỏ hàng" → toast appears → cart count updates
  - Verify quick buy flow: select options → click "Thanh toán nhanh" → navigates to checkout with correct params

## Task Dependency Graph

```json
{
  "waves": [
    {"tasks": ["1", "2"]},
    {"tasks": ["3", "5"]},
    {"tasks": ["6", "7", "8"]},
    {"tasks": ["4"]},
    {"tasks": ["9"]}
  ]
}
```

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Task 1 and Task 2 have no dependencies and can be implemented in parallel
- Task 3 depends on Task 2 (Cart API functions)
- Task 5 depends on Task 1 (validation utility)
- Task 6 depends on Task 3 and Task 5
- Task 7 depends on Task 2
- Task 8 depends on Task 3 (toast state in CartContext)
- Property tests use `fast-check` library — install with `npm install -D fast-check`
- All error messages are in Vietnamese as per design
- The validation utility is a pure function with no side effects, making it ideal for property-based testing
