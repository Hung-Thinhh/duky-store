# Implementation Plan: Search Tool

## Overview

Implement the SearchTool modal component as a single file at `src/components/shop/SeachTool.tsx`. The component provides product search with Vietnamese text normalization, popular tag chips, product suggestion cards, keyboard navigation, and framer-motion animations. All sub-components (SearchHeader, SearchInput, PopularSearches, ProductSuggestions, ViewAllFooter) are defined inline within the same file.

## Tasks

- [x] 1. Implement core search utilities and SearchTool component structure
  - [x] 1.1 Create the SeachTool.tsx file with normalizeVietnamese utility, filterProducts logic, and base component scaffold
    - Add "use client" directive and all imports (React, next/navigation, next/image, lucide-react icons, motion/AnimatePresence, cn, formatCurrency, Product type)
    - Implement `normalizeVietnamese(text: string): string` — lowercase, NFD normalize, strip diacritics regex, replace đ/Đ
    - Implement `filterProducts(products: Product[], query: string): Product[]` — returns first 4 when empty query, otherwise filters by normalized name/category match capped at 4
    - Define the `SearchToolProps` interface (`isOpen`, `onClose`, `products`, `popularSearches?`)
    - Scaffold the main `SearchTool` component with state (`query`), `useRouter`, `inputRef`, `useMemo` for filtered products, and body scroll lock via `useEffect`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 1.4, 1.5_

  - [ ]* 1.2 Write property tests for normalizeVietnamese and filterProducts
    - **Property 1: Normalization idempotence** — `normalizeVietnamese(normalizeVietnamese(x)) === normalizeVietnamese(x)` for arbitrary strings
    - **Property 2: Filter result cap** — `filterProducts(products, query).length <= 4` for any inputs
    - **Property 3: Empty query default suggestions** — returns first min(products.length, 4) items in order
    - **Property 4: Filter correctness and order preservation** — all results match query, relative order preserved
    - **Property 5: No mutation** — original products array unchanged after filtering
    - **Validates: Requirements 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 10.3**

- [x] 2. Build the full modal UI with all inline sub-components
  - [x] 2.1 Implement SearchHeader, SearchInput, PopularSearches, ProductSuggestions, and ViewAllFooter inline sub-components
    - `SearchHeader`: renders title "Tìm kiếm sản phẩm" and X close button (lucide-react `X` icon)
    - `SearchInput`: pill-shaped input with `Search` icon, placeholder "Bạn cần tìm gì hôm nay?", controlled value, onChange and onKeyDown handlers, accepts inputRef
    - `PopularSearches`: section label "Tìm kiếm phổ biến" with flex-wrap row of pill tag chips, onClick sets query
    - `ProductSuggestions`: section label "Gợi ý sản phẩm" with responsive grid (2-4 cols), each card shows next/image square thumbnail, product name (line-clamp-2), formatted price via `formatCurrency`
    - `ViewAllFooter`: conditionally rendered when query is non-empty, shows "Xem tất cả kết quả cho '[query]'" with `ArrowRight` icon, onClick navigates to `/search?q=`
    - Use design tokens from globals.css (--bg-card, --bg-secondary, --text-main, --text-label, --border-subtle, --radius-btn, --radius-section) via Tailwind classes
    - _Requirements: 1.1, 2.2, 2.4, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 9.1, 9.2, 10.1, 10.2_

- [x] 3. Add animations and keyboard navigation
  - [x] 3.1 Integrate motion (framer-motion) animations and keyboard event handling
    - Wrap modal content with `AnimatePresence` keyed on `isOpen`
    - Add `motion.div` for backdrop with opacity fade (initial: 0, animate: 1, exit: 0)
    - Add `motion.div` for modal panel with scale + opacity transition (initial: scale 0.95/opacity 0, animate: scale 1/opacity 1, exit: scale 0.95/opacity 0)
    - Implement `handleKeyDown`: Escape calls `onClose()`, Enter with non-empty query navigates to `/search?q=${encodeURIComponent(query)}` and closes
    - Auto-focus input after modal open animation via `onAnimationComplete` or setTimeout with inputRef
    - _Requirements: 1.2, 1.3, 2.1, 2.3, 8.1, 8.2, 8.3_

  - [ ]* 3.2 Write unit tests for keyboard navigation and modal lifecycle
    - Test Escape key closes modal regardless of query state
    - Test Enter with non-empty query triggers navigation to correct URL
    - Test Enter with empty query does not navigate
    - Test body scroll lock applied on open and removed on close
    - Test auto-focus behavior on modal open
    - _Requirements: 1.4, 1.5, 8.1, 8.2, 8.3_

- [x] 4. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All sub-components are inline within `src/components/shop/SeachTool.tsx` (single file)
- The file name "SeachTool.tsx" is intentional (matches existing project convention)
- Uses existing utilities: `cn()` and `formatCurrency()` from `@/lib/utils`
- Uses existing type: `Product` from `@/types/product`
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific interaction behaviors and edge cases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2"] }
  ]
}
```
