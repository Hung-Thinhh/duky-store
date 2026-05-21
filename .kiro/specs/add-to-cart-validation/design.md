# Design Document: Add to Cart Validation

## Overview

Tính năng này bổ sung validation phía frontend trước khi thêm sản phẩm vào giỏ hàng hoặc thanh toán nhanh, đồng thời kết nối CartContext với Backend Cart API thông qua sessionId. Thiết kế tập trung vào 4 thay đổi chính:

1. **Validation utility** (`validateAddToCart`) — kiểm tra size, màu, tồn kho trước khi gọi API
2. **CartContext refactoring** — chuyển từ local state sang gọi Backend Cart API, quản lý sessionId
3. **Quick checkout flow** — truyền thông tin sản phẩm qua URL search params đến trang checkout
4. **Error/Toast UX** — hiển thị lỗi inline cạnh selector và toast cho kết quả API

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Product Detail Page                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     InfoSection                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │ Size Select │  │Color Select │  │ Quantity Selector│  │  │
│  │  │ + error msg │  │ + error msg │  │                  │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────────────┘  │  │
│  │                                                           │  │
│  │  ┌──────────────────┐  ┌────────────────────────────┐    │  │
│  │  │ Btn: Thêm giỏ   │  │ Btn: Thanh toán nhanh     │    │  │
│  │  └────────┬─────────┘  └────────────┬───────────────┘    │  │
│  └───────────┼──────────────────────────┼────────────────────┘  │
│              │                          │                        │
│              ▼                          ▼                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              validateAddToCart(params)                      │  │
│  │  - Check size selected (if product has sizes)              │  │
│  │  - Check color selected (if product has colors)            │  │
│  │  - Check variant stock > 0                                 │  │
│  │  - Check quantity <= availableQuantity                     │  │
│  └────────────────────────────┬──────────────────────────────┘  │
│                               │                                  │
│              ┌────────────────┼────────────────┐                │
│              │ valid          │ invalid         │                │
│              ▼                ▼                  │                │
│  ┌──────────────────┐  ┌──────────────────┐    │                │
│  │ CartContext       │  │ Set error state  │    │                │
│  │ .addToCart()      │  │ (inline msgs)    │    │                │
│  └────────┬─────────┘  └──────────────────┘    │                │
│           │                                      │                │
│           ▼                                      │                │
│  ┌──────────────────────────────────────────┐   │                │
│  │ POST /api/v1/cart/items                   │   │                │
│  │ { sessionId, productId, variantId, qty }  │   │                │
│  └────────────────────┬─────────────────────┘   │                │
│                       │                          │                │
│         ┌─────────────┼─────────────┐            │                │
│         │ success     │ error       │            │                │
│         ▼             ▼             │            │                │
│  ┌────────────┐ ┌────────────┐     │            │                │
│  │Toast success│ │Toast error │     │            │                │
│  │+ update cnt│ │(server msg)│     │            │                │
│  └────────────┘ └────────────┘     │            │                │
└─────────────────────────────────────┘────────────┘────────────────┘

Quick Checkout Flow:
  validateAddToCart() → valid → router.push('/checkout?quickBuy=true&productId=X&variantId=Y&quantity=Z')
```

## Components and Interfaces

### 1. Validation Utility — `src/lib/cart-validation.ts`

```typescript
export interface ValidateAddToCartParams {
  selectedSize: number | null;
  selectedColor: string | null;
  availableSizes: number[];    // product.sizes — empty if no size variants
  availableColors: string[];   // product.colors — empty if no color variants
  matchedVariant: VariantData | null;
  quantity: number;
}

export interface ValidationError {
  field: 'size' | 'color' | 'stock';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateAddToCart(params: ValidateAddToCartParams): ValidationResult;
```

**Logic:**
1. If `availableSizes.length > 0` and `selectedSize === null` → error: `{ field: 'size', message: 'Vui lòng chọn size' }`
2. If `availableColors.length > 0` and `selectedColor === null` → error: `{ field: 'color', message: 'Vui lòng chọn màu' }`
3. If `matchedVariant` exists and `availableQuantity === 0` → error: `{ field: 'stock', message: 'Sản phẩm đã hết hàng' }`
4. If `matchedVariant` exists and `quantity > availableQuantity` → error: `{ field: 'stock', message: 'Số lượng yêu cầu vượt quá tồn kho (còn ${availableQuantity} sản phẩm)' }`
5. If no errors → `{ valid: true, errors: [] }`

### 2. Cart API Functions — `src/lib/api.ts` (additions)

```typescript
// ─── Cart API types ──────────────────────────────────────────────────────────
export interface CartItemResponse {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    thumbnailMedia: { url: string; secureUrl: string; altText: string | null } | null;
  };
  variant: {
    id: string;
    name: string | null;
    sku: string;
    sizeLabel: string | null;
    colorName: string | null;
    colorHex: string | null;
  } | null;
}

export interface CartResponse {
  id: string;
  sessionId: string;
  status: string;
  subtotal: number;
  total: number;
  items: CartItemResponse[];
}

export interface AddToCartPayload {
  sessionId: string;
  productId: string;
  variantId?: string;
  quantity: number;
}

// ─── Cart API functions ──────────────────────────────────────────────────────
export async function getCartAPI(sessionId: string): Promise<CartResponse>;
export async function addToCartAPI(payload: AddToCartPayload): Promise<CartResponse>;
```

**Implementation notes:**
- `getCartAPI` calls `GET /api/v1/cart?sessionId=xxx` using client-side fetch (no ISR cache)
- `addToCartAPI` calls `POST /api/v1/cart/items` with JSON body
- Both use `fetch` without `next.revalidate` (client-side, no caching)
- Error responses from backend have shape `{ EC: number, EM: string }` — extract `EM` for toast

### 3. CartContext Refactoring — `src/context/CartContext.tsx`

**New interface:**

```typescript
interface CartContextType {
  cart: CartItemResponse[];
  cartCount: number;
  isCartOpen: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
  loading: boolean;
  addToCart: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
  getSessionId: () => string;
}
```

**SessionId management:**
- On mount, check `localStorage.getItem('duky_cart_session')`
- If null, generate `crypto.randomUUID()` and store it
- Use `useRef` to hold sessionId (avoids re-renders)
- Expose `getSessionId()` for components that need it

**Cart sync on load:**
- `useEffect` on mount calls `getCartAPI(sessionId)` to hydrate cart state
- Sets `loading = true` during fetch, `false` after

**addToCart flow:**
1. Get sessionId from ref
2. Call `addToCartAPI({ sessionId, productId, variantId, quantity })`
3. On success: update cart state from response, show success toast
4. On error: show error toast with server message

**Toast auto-dismiss:**
- Toast state includes `message` and `type`
- Auto-dismiss after 3 seconds via `setTimeout`

### 4. InfoSection Changes — `src/components/shop/product/InfoSection.tsx`

**New props:**

```typescript
interface InfoSectionProps {
  product?: ProductDetail;
  variants?: VariantData[];
  onAddToCart?: (variantId: string, quantity: number) => Promise<void>;
  onQuickBuy?: (variantId: string, quantity: number) => void;
}
```

**New state:**

```typescript
const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
const [isAddingToCart, setIsAddingToCart] = useState(false);
```

**Button handlers:**

```typescript
const handleAddToCart = async () => {
  const result = validateAddToCart({
    selectedSize, selectedColor,
    availableSizes: product.sizes,
    availableColors: product.colors,
    matchedVariant, quantity,
  });

  if (!result.valid) {
    setValidationErrors(result.errors);
    return;
  }

  setValidationErrors([]);
  setIsAddingToCart(true);
  await onAddToCart?.(matchedVariant!.id, quantity);
  setIsAddingToCart(false);
};

const handleQuickBuy = () => {
  // Same validation as addToCart
  const result = validateAddToCart({ ... });
  if (!result.valid) {
    setValidationErrors(result.errors);
    return;
  }
  setValidationErrors([]);
  onQuickBuy?.(matchedVariant!.id, quantity);
};
```

**Error display (inline):**
- Below size selector: show error if `validationErrors` contains `field: 'size'`
- Below color selector: show error if `validationErrors` contains `field: 'color'`
- Below quantity row: show error if `validationErrors` contains `field: 'stock'`
- Style: red text, font-size 12px, margin-top 4px

**Button disable logic:**
- Disable both buttons when `matchedVariant?.inventory?.availableQuantity === 0`
- Show loading spinner on "Thêm vào giỏ hàng" when `isAddingToCart === true`

### 5. Product Detail Page Changes — `src/app/(shop)/products/[slug]/page.tsx`

```typescript
const router = useRouter();
const { addToCart } = useCart();

const handleAddToCart = async (variantId: string, quantity: number) => {
  await addToCart(product.id, variantId, quantity);
};

const handleQuickBuy = (variantId: string, quantity: number) => {
  const params = new URLSearchParams({
    quickBuy: 'true',
    productId: product.id,
    variantId,
    quantity: String(quantity),
  });
  router.push(`/checkout?${params.toString()}`);
};
```

### 6. Checkout Page Changes — `src/app/(shop)/checkout/page.tsx`

**Quick buy detection:**

```typescript
const searchParams = useSearchParams();
const isQuickBuy = searchParams.get('quickBuy') === 'true';
const quickBuyProductId = searchParams.get('productId');
const quickBuyVariantId = searchParams.get('variantId');
const quickBuyQuantity = Number(searchParams.get('quantity')) || 1;
```

**Quick buy product loading:**
- If `isQuickBuy && quickBuyProductId`, fetch product details and variant info
- Display single product in order summary instead of cart items
- Calculate subtotal from quick buy product price × quantity

### 7. Toast Component

Reuse existing toast state in CartContext. Render a fixed-position toast in the CartProvider or a layout component:

```typescript
// Rendered inside CartProvider children wrapper or layout
{toast && (
  <div className={`toast toast--${toast.type}`}>
    {toast.message}
  </div>
)}
```

**Positioning:** fixed bottom-right, z-index 9999, auto-dismiss 3s with fade animation.

## Data Models

### ValidationError

| Field   | Type                        | Description                    |
|---------|-----------------------------|--------------------------------|
| field   | `'size' \| 'color' \| 'stock'` | Which selector has the error   |
| message | `string`                    | Vietnamese error message       |

### ValidationResult

| Field  | Type                | Description                     |
|--------|---------------------|---------------------------------|
| valid  | `boolean`           | Whether all checks passed       |
| errors | `ValidationError[]` | List of validation failures     |

### AddToCartPayload

| Field     | Type                | Description                          |
|-----------|---------------------|--------------------------------------|
| sessionId | `string`            | UUID from localStorage               |
| productId | `string`            | Product ID                           |
| variantId | `string \| undefined` | Variant ID (if product has variants) |
| quantity  | `number`            | Requested quantity (≥ 1)             |

### CartResponse (from backend)

| Field    | Type                | Description              |
|----------|---------------------|--------------------------|
| id       | `string`            | Cart ID                  |
| sessionId| `string`            | Session identifier       |
| status   | `string`            | Cart status (ACTIVE)     |
| subtotal | `number`            | Sum of line totals       |
| total    | `number`            | Final total              |
| items    | `CartItemResponse[]`| Cart items with product info |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Validation rejects missing size

*For any* product that has multiple sizes and any state where no size is selected, `validateAddToCart` SHALL return an invalid result containing a 'size' field error.

**Validates: Requirements 1.1**

### Property 2: Validation rejects missing color

*For any* product that has multiple colors and any state where no color is selected, `validateAddToCart` SHALL return an invalid result containing a 'color' field error.

**Validates: Requirements 1.2**

### Property 3: Validation rejects zero-stock variant

*For any* matched variant with `availableQuantity === 0`, `validateAddToCart` SHALL return an invalid result containing a 'stock' field error indicating out of stock.

**Validates: Requirements 1.3**

### Property 4: Validation rejects over-quantity requests

*For any* matched variant with `availableQuantity > 0` and any requested quantity exceeding `availableQuantity`, `validateAddToCart` SHALL return an invalid result containing a 'stock' field error.

**Validates: Requirements 1.4**

### Property 5: Valid inputs produce valid result

*For any* product where size is selected (or no sizes exist), color is selected (or no colors exist), matched variant has `availableQuantity >= quantity`, and `quantity >= 1`, `validateAddToCart` SHALL return `{ valid: true, errors: [] }`.

**Validates: Requirements 1.5**

### Property 6: SessionId persistence round-trip

*For any* generated sessionId, storing it in localStorage and then retrieving it SHALL produce the same UUID string.

**Validates: Requirements 3.1, 3.2**

## Error Handling

| Scenario | Source | Handling |
|----------|--------|----------|
| Size not selected | Frontend validation | Inline error below size selector |
| Color not selected | Frontend validation | Inline error below color selector |
| Variant out of stock | Frontend validation | Inline error + disable buttons |
| Quantity exceeds stock | Frontend validation | Inline error below quantity |
| Backend: product not found | API 404 | Toast error with server message |
| Backend: out of stock | API 400 | Toast error with server message |
| Backend: variant not active | API 400 | Toast error with server message |
| Network error | fetch failure | Toast error "Lỗi kết nối, vui lòng thử lại" |
| Invalid sessionId | API 400 | Regenerate sessionId, retry once |

**Error clearing:** Validation errors are cleared when user changes size, color, or quantity selection (via `useEffect` watching those states).

## Testing Strategy

### Unit Tests (example-based)
- Test `validateAddToCart` with specific edge cases (empty sizes array, single variant product)
- Test sessionId generation and retrieval from localStorage mock
- Test CartContext addToCart flow with mocked API responses
- Test quick checkout URL parameter construction

### Property-Based Tests
- Use `fast-check` library for TypeScript property-based testing
- Minimum 100 iterations per property
- Test `validateAddToCart` function with generated inputs covering all combinations of:
  - Products with/without sizes
  - Products with/without colors
  - Variants with various stock levels
  - Quantities from 1 to large numbers

**Tag format:** Feature: add-to-cart-validation, Property {N}: {title}

### Integration Tests (example-based)
- Test full add-to-cart flow: select size → select color → click button → verify API called
- Test quick checkout navigation with correct URL params
- Test toast display on success/error
- Test cart count update in header after successful add
