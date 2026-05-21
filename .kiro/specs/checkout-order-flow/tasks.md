# Implementation Plan: Checkout & Order Flow

## Overview

This plan implements the complete checkout-to-order lifecycle for Duky Store's frontend. Tasks are ordered by dependency: independent utility modules first, then page-level integrations that consume them. All changes are frontend-only (Next.js App Router, TypeScript, Tailwind). The backend is not modified.

## Tasks

- [x] 1. Create validation module and order storage utility
  - [x] 1.1 Create `src/lib/checkout-validation.ts` with `validateCheckoutForm` function
    - Implement `CheckoutFormData` and `ValidationErrors` interfaces
    - Validate fullName (required, non-empty after trim)
    - Validate phone (required, length between 8 and 20 characters)
    - Validate email (optional, valid format if provided)
    - Validate province, district, ward (all three required, non-empty)
    - Validate addressLine (required, minimum 5 characters after trim)
    - Return an object with field-specific error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Write property test for validation — invalid inputs produce errors
    - **Property 1: Invalid form inputs produce validation errors**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Use `fast-check` to generate form data with at least one invalid field
    - Assert `validateCheckoutForm` returns a non-empty errors object with the corresponding field key

  - [ ]* 1.3 Write property test for validation — valid inputs pass
    - **Property 2: Valid form inputs pass validation**
    - **Validates: Requirements 1.5**
    - Use `fast-check` to generate form data where all fields are valid
    - Assert `validateCheckoutForm` returns an empty errors object

  - [x] 1.4 Create `src/lib/order-storage.ts` with localStorage order history helpers
    - Implement `StoredOrder` interface (code, phone, date, paymentMethod)
    - Implement `saveOrderToHistory(order)` — appends to JSON array in `localStorage["duky_order_history"]`
    - Implement `getOrderHistory()` — reads and parses the stored array
    - Implement `clearOrderHistory()` — removes the key
    - _Requirements: 6.1_

- [x] 2. Add order lookup API function and enhance CartContext
  - [x] 2.1 Add `orderLookupAPI` function to `src/lib/api.ts`
    - Implement `GET /orders/:code?phone=<phone>` call
    - Return `CheckoutOrder` type (already defined in api.ts)
    - Handle error responses (404, network errors) consistently with existing patterns
    - _Requirements: 6.1, 7.1_

  - [x] 2.2 Add `clearCart` method to `src/context/CartContext.tsx`
    - Add `clearCart: () => void` to `CartContextType` interface
    - Implementation: set cart state to `[]`, generate new UUID via `crypto.randomUUID()`, store in localStorage under `duky_cart_session`, update `sessionIdRef.current`
    - Expose `clearCart` in the context provider value
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 2.3 Write property test for cart clearing — produces empty cart with new session
    - **Property 6: Post-checkout cart reset produces empty cart with new session**
    - **Validates: Requirements 4.1, 4.2**
    - Test that after `clearCart()`, cart items array is empty and sessionId is a valid UUID different from the previous one

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refactor checkout page with validation, error handling, and cart clearing
  - [x] 4.1 Integrate `validateCheckoutForm` into checkout page form submission
    - Import and call `validateCheckoutForm` on submit instead of inline `alert()` calls
    - Display inline error messages below each field (red text, red border)
    - Clear field errors when user modifies the field
    - Only proceed with API call when validation returns empty errors object
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.2 Implement structured API error handling on checkout page
    - Parse error responses from `checkoutAPI` and display contextual messages
    - Handle cart empty error: show message with link to continue shopping
    - Handle out of stock error: show message identifying the product
    - Handle variant inactive error: show informative message
    - Handle network error/timeout: show generic message with retry capability
    - Handle 400 validation error: display the `EM` message from API response
    - Replace `alert()` calls with inline error UI (toast or error banner)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Call `clearCart()` and save order to history on successful checkout
    - After successful `checkoutAPI` response, call `clearCart()` from CartContext
    - Call `saveOrderToHistory` with order code, phone, date, and payment method
    - Then redirect to success page with URL params (orderCode, orderDate, payment)
    - _Requirements: 4.1, 4.2, 2.2, 2.3_

  - [ ]* 4.4 Write property test for checkout payload construction
    - **Property 3: Checkout payload construction preserves all form fields**
    - **Validates: Requirements 2.1**
    - Test that for any valid form state and sessionId, the constructed payload contains all required fields correctly mapped

  - [ ]* 4.5 Write property test for redirect URL construction
    - **Property 4: Successful checkout produces correct redirect URL**
    - **Validates: Requirements 2.2, 2.3**
    - Test that for any successful order response, the redirect URL contains correct orderCode, orderDate, and payment params

- [x] 5. Enhance success page with real order data
  - [x] 5.1 Update `src/app/(shop)/checkout/success/page.tsx` to display real order data
    - Read `orderCode`, `orderDate`, `payment` from URL search params (already partially done)
    - Ensure copy-to-clipboard button works for order code
    - Display formatted order date from param
    - Map payment param to Vietnamese label (COD → "Thanh toán khi nhận hàng", bank → "Chuyển khoản ngân hàng")
    - Ensure "Xem đơn hàng" button links to `/user/order`
    - Ensure "Tiếp tục mua sắm" button links to `/`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property test for success page URL parameter rendering
    - **Property 7: Success page renders all URL parameters**
    - **Validates: Requirements 5.1, 5.2**
    - Test that for any orderCode and orderDate params, the page renders both values

- [x] 6. Connect order history page to API
  - [x] 6.1 Refactor `src/app/(auth)/user/order/page.tsx` to use real API data
    - On mount, read stored order codes from localStorage via `getOrderHistory()`
    - For each stored order, call `orderLookupAPI(code, phone)` using phone from AuthContext
    - Display each order with code, date, status, item count, and grand total
    - Implement status filter tabs (client-side filtering on fetched data)
    - Implement search by order code (client-side filter, case-insensitive)
    - Show empty state with "Tiếp tục mua sắm" link when no orders
    - Show error state with retry button on API failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 6.2 Write property test for order history status filter
    - **Property 9: Order history status filter shows only matching orders**
    - **Validates: Requirements 6.3**
    - Test that for any list of orders and selected status, only matching orders are displayed

  - [ ]* 6.3 Write property test for order history search filter
    - **Property 10: Order history search filter matches order codes**
    - **Validates: Requirements 6.4**
    - Test that for any list of orders and search query, displayed orders all contain the query in their code

- [x] 7. Connect order detail page to API
  - [x] 7.1 Refactor `src/app/(auth)/user/order/[id]/page.tsx` to use real API data
    - Extract order code from URL params
    - Call `orderLookupAPI(code, phone)` using customer phone from AuthContext
    - Display order info card: status, payment method, shipping method, grand total
    - Display order items: product name, SKU, variant info, quantity, unit price, line total
    - Display status timeline from `statusHistories` array
    - Display full shipping address (fullName, phone, addressLine, ward, district, province)
    - Show error state with link back to order history on API failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 7.2 Write property test for order detail rendering
    - **Property 11: Order detail renders info card and shipping address**
    - **Property 12: Order detail renders items and timeline**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - Test that for any valid order data, all info card fields and item fields are rendered

- [x] 8. Handle quick buy checkout flow
  - [x] 8.1 Refactor quick buy logic in checkout page to use Cart API
    - When `quickBuy=true` URL param is present, call `addToCart` via CartContext with productId, variantId, and quantity from URL params
    - Wait for cart addition to succeed before displaying checkout form
    - On success, proceed with standard checkout flow (cart already has the item)
    - On failure (out of stock, inactive), display error message with link back to product page
    - Remove the local quick buy product state — use cart state instead
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 8.2 Write unit tests for quick buy error handling
    - Test that out-of-stock error shows correct message and product link
    - Test that inactive variant error shows correct message
    - Test that successful add proceeds to standard checkout
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All file paths are relative to the `src/` directory of the Next.js project
- The backend at `c:\duky_store_be` is NOT modified — only frontend changes
- `fast-check` should be used for property-based tests (standard TypeScript PBT library)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4", "2.1", "2.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.3"] },
    { "id": 2, "tasks": ["4.1", "4.2", "4.3", "5.1"] },
    { "id": 3, "tasks": ["4.4", "4.5", "5.2", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.1", "8.1"] },
    { "id": 5, "tasks": ["7.2", "8.2"] }
  ]
}
```
