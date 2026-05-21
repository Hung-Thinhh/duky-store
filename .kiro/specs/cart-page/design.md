# Design Document: Cart Page

## Overview

The Cart Page (`/cart`) provides a full-page view of the user's shopping cart, complementing the existing `CartDrawer` slide-over panel. It enables customers to review, select, update, and remove items before proceeding to checkout. The page follows the established Duky Store design language (neumorphic cards, serif accent fonts, VNĐ formatting) and reuses existing infrastructure (`CartContext`, `ProductCard`, `RecommendSection`, `Header`, `Footer`, `formatCurrency`).

Key capabilities:
- Two-column desktop layout (cart items left, order summary right) collapsing to single-column on mobile
- Per-item and bulk selection with "select all" / "delete selected" controls
- Inline quantity adjustment with optimistic updates
- Order summary sidebar with subtotal, shipping, total, checkout/continue buttons, and payment method icons
- Trust badges section communicating store guarantees
- Product recommendations carousel via the existing `RecommendSection` component

## Architecture

```mermaid
graph TD
    subgraph App Router
        A[src/app/(shop)/cart/page.tsx] -->|uses| B[CartContext / useCart]
    end

    A --> C[CartPageContent]
    C --> D[CartItemRow]
    C --> E[OrderSummary]
    C --> F[TrustBadges]
    C --> G[RecommendSection]

    D -->|calls| B
    E -->|reads| B

    A --> H[Header]
    A --> I[Footer]
    A --> J[CartDrawer]
    A --> K[Navpages - breadcrumb]

    style A fill:#f9f,stroke:#333
    style B fill:#bbf,stroke:#333
```

The page is a client component (`"use client"`) because it consumes `useCart()`. It follows the same layout pattern as the existing checkout page: `Header` → page content → `Footer`, with `CartDrawer` available for quick access.

### Component Hierarchy

```
page.tsx (CartPage)
├── Header
├── Navpages (breadcrumb)
├── CartPageContent
│   ├── CartHeader (title + count, select all, delete selected)
│   ├── CartItemList
│   │   └── CartItemRow[] (checkbox, image, info, quantity selector, price, delete)
│   ├── EmptyCartState (conditional)
│   ├── OrderSummary (sidebar)
│   │   ├── Subtotal / Shipping / Total
│   │   ├── Checkout button
│   │   ├── Continue shopping button
│   │   └── PaymentMethodsDisplay
│   └── TrustBadges
├── RecommendSection (title="Bạn có thể thích")
├── CartDrawer
└── Footer
```

## Components and Interfaces

### CartPage (`src/app/(shop)/cart/page.tsx`)

Top-level page component. Renders layout wrappers and delegates to sub-components.

```typescript
// No props - uses useCart() hook internally
export default function CartPage(): JSX.Element
```

### CartItemRow

Renders a single cart item row with selection, image, details, quantity controls, and delete.

```typescript
interface CartItemRowProps {
  item: CartItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}
```

### QuantitySelector

Reusable quantity control with plus/minus buttons and disabled states.

```typescript
interface QuantitySelectorProps {
  quantity: number;
  min?: number;       // default 1
  max?: number;       // default 99
  onChange: (delta: number) => void;
}
```

### OrderSummary

Sidebar showing cost breakdown and action buttons.

```typescript
interface OrderSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  isCartEmpty: boolean;
}
```

### TrustBadges

Static section displaying store commitments.

```typescript
// No props - renders 3 fixed badges
function TrustBadges(): JSX.Element
```

### PaymentMethodsDisplay

Static informational section showing supported payment icons.

```typescript
// No props - renders 6 payment method icons with labels
function PaymentMethodsDisplay(): JSX.Element
```

### Reused Components

| Component | Source | Usage |
|-----------|--------|-------|
| `Header` | `@/components/layout/Header` | Page header with cart badge |
| `Footer` | `@/components/layout/Footer` | Page footer |
| `CartDrawer` | `@/components/shop/CartDrawer` | Slide-over cart panel |
| `Navpages` | `@/components/shop/Navpages` | Breadcrumb navigation |
| `RecommendSection` | `@/components/shop/product/RecommendSection` | Product carousel |
| `ProductCard` | `@/components/shop/ProductCard` | Used inside RecommendSection |

## Data Models

### Existing Types (no changes needed)

```typescript
// src/types/product.ts
interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  formattedPrice: string;
  img: string;
  category: string;
  originalPrice?: number;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  sizes?: number[];
  colors?: string[];
  gender?: "male" | "female" | "unisex";
}

interface CartItem extends Product {
  quantity: number;
}
```

### Local Page State

```typescript
// Selection state managed within CartPage
interface CartPageState {
  selectedIds: Set<string>;       // IDs of selected cart items
  undoStack: CartItem[] | null;   // Items pending undo after delete
  undoTimerId: NodeJS.Timeout | null;
  showUndoToast: boolean;
}
```

### Computed Values

| Value | Derivation |
|-------|-----------|
| `subtotal` | `cart.reduce((acc, item) => acc + item.price * item.quantity, 0)` |
| `shippingFee` | `0` (free shipping — configurable threshold later) |
| `total` | `subtotal + shippingFee` |
| `isAllSelected` | `selectedIds.size === cart.length && cart.length > 0` |
| `hasSelection` | `selectedIds.size > 0` |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cart count equals sum of item quantities

*For any* array of CartItems, the displayed cart count SHALL equal the sum of the `quantity` field of every item in the array.

**Validates: Requirements 1.1, 1.3**

### Property 2: Subtotal equals sum of line totals

*For any* array of CartItems, the computed subtotal SHALL equal the sum of `(item.price × item.quantity)` for every item in the array. When the array is empty, the subtotal SHALL be 0.

**Validates: Requirements 2.1, 6.1, 6.6**

### Property 3: Select-all toggles all items to the same selection state

*For any* non-empty cart array and any initial selection state, toggling select-all to `true` SHALL result in every item being selected, and toggling select-all to `false` SHALL result in no items being selected.

**Validates: Requirements 3.3, 3.4**

### Property 4: isAllSelected is true if and only if all items are individually selected

*For any* non-empty cart array and any subset of selected item IDs, the derived `isAllSelected` value SHALL be `true` if and only if the size of the selected set equals the size of the cart array.

**Validates: Requirements 3.5, 3.6**

### Property 5: Bulk delete removes exactly the selected items

*For any* cart array and any non-empty subset of selected item IDs, after performing a bulk delete, the remaining cart SHALL contain exactly those items whose IDs were NOT in the selected set, preserving their original order and quantities.

**Validates: Requirements 3.7, 3.10**

### Property 6: Quantity stays within bounds after increment/decrement

*For any* CartItem with quantity `q` and maximum `max` (default 99), applying a `+1` delta SHALL yield `min(q + 1, max)` and applying a `-1` delta SHALL yield `max(q - 1, 1)`. The resulting quantity is always in the range `[1, max]`.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 7: Remove then undo restores original cart state (round-trip)

*For any* cart array and any item in that array, removing the item and then immediately undoing the removal SHALL produce a cart array identical to the original (same items, same order, same quantities).

**Validates: Requirements 5.2, 5.4**

### Property 8: Total equals subtotal plus shipping minus discount

*For any* non-negative subtotal, non-negative shipping fee, and non-negative discount where discount ≤ subtotal + shipping, the computed total SHALL equal `subtotal + shippingFee - discount`.

**Validates: Requirements 6.3**

## Error Handling

| Scenario | Behavior | User Feedback |
|----------|----------|---------------|
| Cart context unavailable | Component throws via `useCart()` — caught by Next.js error boundary | Generic error page |
| Quantity update fails (server) | Revert quantity to previous value optimistically | Toast: "Không thể cập nhật số lượng" |
| Item removal fails (server) | Restore item to cart list | Toast: "Không thể xóa sản phẩm" |
| Bulk delete fails | Restore all selected items | Toast: "Xóa không thành công" |
| Image load failure | Next.js `Image` shows placeholder via `onError` | Fallback gray box |
| Recommendations fetch fails | Hide `RecommendSection` entirely | No visible error |
| Unavailable item in cart | Show "Hết hàng" badge on item, disable checkout button | Visual indicator on item row |

### Undo Mechanism

- After single or bulk delete, a toast notification appears for 5 seconds
- Toast contains an "Hoàn tác" button
- If clicked within 5 seconds, deleted items are restored to their original positions
- After 5 seconds, the toast auto-dismisses and the deletion is finalized
- Implementation: store deleted items in `undoStack` state, use `setTimeout` for auto-dismiss

## Testing Strategy

### Unit Tests (Example-Based)

Focus on specific scenarios and UI rendering:

- Empty cart renders empty state with correct message and link
- Breadcrumb renders with "Trang chủ" and "Giỏ hàng"
- Cart items render in correct order (most recent first)
- Variant labels omitted when color/size not present
- Delete button disabled when no items selected
- Checkout button disabled when cart is empty
- Payment methods section shows 6 methods with icons
- Trust badges render 3 badges with correct labels
- RecommendSection hidden when no products available
- Sticky sidebar behavior at ≥1024px viewport

### Property-Based Tests

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript/TypeScript PBT library)

**Configuration**: Minimum 100 iterations per property test.

Each property test references its design document property:

| Property | Tag |
|----------|-----|
| Property 1 | `Feature: cart-page, Property 1: Cart count equals sum of item quantities` |
| Property 2 | `Feature: cart-page, Property 2: Subtotal equals sum of line totals` |
| Property 3 | `Feature: cart-page, Property 3: Select-all toggles all items to the same selection state` |
| Property 4 | `Feature: cart-page, Property 4: isAllSelected is true iff all items are individually selected` |
| Property 5 | `Feature: cart-page, Property 5: Bulk delete removes exactly the selected items` |
| Property 6 | `Feature: cart-page, Property 6: Quantity stays within bounds after increment/decrement` |
| Property 7 | `Feature: cart-page, Property 7: Remove then undo restores original cart state` |
| Property 8 | `Feature: cart-page, Property 8: Total equals subtotal plus shipping minus discount` |

### Integration Tests

- Cart state changes propagate to Header badge and CartDrawer
- Navigation to `/checkout` works when cart has items
- Navigation to `/collections` from continue shopping button
- Login redirect when unauthenticated user clicks checkout

### Testing Approach

To enable property-based testing of the cart logic without coupling to React rendering, extract pure computation functions into a separate utility module (`src/lib/cart-utils.ts`):

```typescript
// src/lib/cart-utils.ts
export function computeCartCount(items: CartItem[]): number;
export function computeSubtotal(items: CartItem[]): number;
export function computeTotal(subtotal: number, shipping: number, discount: number): number;
export function applySelectAll(itemIds: string[], selectAll: boolean): Set<string>;
export function isAllSelected(selectedIds: Set<string>, totalCount: number): boolean;
export function bulkDelete(items: CartItem[], selectedIds: Set<string>): CartItem[];
export function clampQuantity(current: number, delta: number, min: number, max: number): number;
```

This separation allows property tests to run against pure functions without needing React test utilities, keeping tests fast and focused.
