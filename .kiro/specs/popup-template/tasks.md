# Implementation Plan: Popup Template

## Overview

Implement a reusable, animated modal overlay component (PopupTemplate) for the Duky Store. The implementation follows an incremental approach: first building the custom hooks (body scroll lock, focus trap), then the core component structure with animations, and finally layering in header support, size variants, accessibility, and barrel exports.

## Tasks

- [x] 1. Create custom hooks
  - [x] 1.1 Create useBodyScrollLock hook
    - Create `src/hooks/useBodyScrollLock.ts`
    - Implement hook that accepts `isLocked: boolean` parameter
    - Store current `document.body.style.overflow` in a ref when locking
    - Set `document.body.style.overflow` to `"hidden"` when `isLocked` is true
    - Restore original overflow value when `isLocked` becomes false or on unmount
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ]* 1.2 Write property test for useBodyScrollLock
    - **Property 1: Body scroll lock round-trip**
    - **Validates: Requirements 1.3, 1.4, 1.5**

  - [x] 1.3 Create useFocusTrap hook
    - Create `src/hooks/useFocusTrap.ts`
    - Define `UseFocusTrapOptions` interface with `enabled: boolean` and `onEscape: () => void`
    - Accept a `containerRef: React.RefObject<HTMLElement | null>` and options
    - Store `document.activeElement` as previously focused element on activation
    - After a short delay, move focus to first focusable element inside container
    - Handle `Tab` key: wrap from last to first focusable element
    - Handle `Shift+Tab`: wrap from first to last focusable element
    - Handle `Escape`: call `onEscape` callback
    - On deactivation: restore focus to previously focused element, or `document.body` if removed from DOM
    - Use focusable selector: `a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 1.4 Write property test for useFocusTrap Tab wrapping
    - **Property 3: Focus trap Tab wrapping**
    - **Validates: Requirements 8.2**

  - [ ]* 1.5 Write property test for focus restoration on close
    - **Property 4: Focus restoration on close**
    - **Validates: Requirements 8.4, 9.8**

- [x] 2. Implement PopupTemplate core structure
  - [x] 2.1 Create PopupTemplate component with overlay and panel
    - Create `src/components/shop/PopupTemplate.tsx` with `"use client"` directive
    - Define `PopupTemplateProps` interface with all props from design
    - Implement `AnimatePresence` wrapper with conditional rendering based on `isOpen`
    - Implement overlay as `motion.div` with `fixed inset-0 bg-black/50 backdrop-blur-[4px] z-[60]`
    - Implement panel as `motion.div` with `role="dialog"`, `aria-modal="true"`, centered positioning
    - Wire `useBodyScrollLock(isOpen)` for scroll prevention
    - Wire `useFocusTrap(panelRef, { enabled: isOpen, onEscape: onClose })`
    - Handle overlay click → call `onClose`; stop propagation on panel click
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.2 Add close button and animations
    - Add close button in top-right corner with `X` icon from lucide-react
    - Set `aria-label="Đóng"` on close button
    - Ensure minimum 44×44px click target with padding
    - Add hover state with background opacity change
    - Configure overlay animation: `opacity 0→1` enter, `1→0` exit, duration 200ms
    - Configure panel animation: `scale 0.95→1 + opacity 0→1` enter, reverse on exit
    - Use spring transition: `type: 'spring', damping: 25, stiffness: 200`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3. Checkpoint - Ensure core component works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add header section and body content
  - [x] 4.1 Implement header section rendering
    - Add conditional header section inside the panel
    - If `headerContent` is provided, render it exclusively (takes precedence)
    - If `headerImage` is provided, render `next/image` with `object-contain`, max-height 120px, centered
    - Set image alt to `headerImageAlt` or empty string if not provided
    - If `headerTitle` is provided, render with `font-serif`, single-line truncation
    - If both `headerImage` and `headerTitle` provided (without `headerContent`), render image above title
    - If none provided, render no header markup
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.2 Write property test for headerContent precedence
    - **Property 5: headerContent takes precedence**
    - **Validates: Requirements 5.4**

  - [x] 4.3 Implement body section
    - Render `children` inside a scrollable body container
    - Apply 24px padding on all sides (`p-6`)
    - Enable vertical scrolling with `overflow-y-auto` and hide horizontal overflow
    - Render empty container with padding when no children provided
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. Add size variants and responsive design
  - [x] 5.1 Implement size variant system
    - Define `SIZE_CLASSES` map: `sm → max-w-[400px]`, `md → max-w-[500px]`, `lg → max-w-[640px]`
    - Default to `"md"` when `size` prop is undefined or invalid
    - Apply the resolved size class to the panel container
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [ ]* 5.2 Write property test for size variant resolution
    - **Property 2: Size variant resolution**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6**

  - [x] 5.3 Implement responsive design
    - Set `w-full` so popup fills viewport when narrower than max-width
    - Apply `mx-4` (16px each side = 32px total horizontal margin)
    - Set `min-w-[280px]` minimum width
    - Vertically center with flexbox (`items-center justify-center` on fixed container)
    - Constrain max height to `max-h-[90vh]` with vertical scroll in body section
    - _Requirements: 7.5, 10.1, 10.2, 10.3, 10.4_

- [x] 6. Add ARIA accessibility and custom styling
  - [x] 6.1 Implement ARIA attributes and label logic
    - Set `role="dialog"` and `aria-modal="true"` on panel
    - If `ariaLabelledBy` is provided, set `aria-labelledby` (ignore `ariaLabel`)
    - If only `ariaLabel` is provided, set `aria-label`
    - Add `tabIndex={-1}` on panel for fallback focus when no focusable elements exist
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ]* 6.2 Write property test for aria-labelledby precedence
    - **Property 6: aria-labelledby precedence**
    - **Validates: Requirements 9.5**

  - [x] 6.3 Implement custom className support
    - Use `cn()` utility to merge default panel classes with `className` prop
    - Use `cn()` utility to merge default overlay classes with `overlayClassName` prop
    - Default container style: white background, `rounded-2xl`
    - Ensure custom Tailwind classes override conflicting defaults via `cn`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 6.4 Write property test for className merging
    - **Property 7: Custom className merging**
    - **Validates: Requirements 11.1, 11.2**

- [x] 7. Export and final integration
  - [x] 7.1 Export PopupTemplate from barrel index
    - Add `export * from './PopupTemplate'` to `src/components/shop/index.ts`
    - Verify the component can be imported from `@/components/shop`
    - _Requirements: All (integration)_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The component uses TypeScript with the `"use client"` directive for Next.js client components
- Animation parameters (damping: 25, stiffness: 200) match the existing CartDrawer pattern
- The `cn` utility from `@/lib/utils` handles Tailwind class merging (uses `tailwind-merge`)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.3"] },
    { "id": 1, "tasks": ["1.2", "1.4", "1.5", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1", "4.3", "5.1", "5.3", "6.1", "6.3"] },
    { "id": 4, "tasks": ["4.2", "5.2", "6.2", "6.4"] },
    { "id": 5, "tasks": ["7.1"] }
  ]
}
```
