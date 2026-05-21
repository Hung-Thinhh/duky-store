# Design Document: Popup Template

## Overview

The PopupTemplate is a reusable, animated modal overlay component for the Duky Store e-commerce application. It provides a configurable popup with smooth enter/exit animations, keyboard accessibility (focus trap, Escape to close), ARIA attributes, responsive sizing, and customizable header/body content.

The component follows the existing CartDrawer pattern (AnimatePresence + motion.div with spring transitions) and integrates with the project's `cn` utility for class merging. It is designed to be the single generic popup primitive that other features (contact info, notifications, alerts, login modals) compose on top of.

### Key Design Decisions

1. **Custom `useFocusTrap` hook** — No external library. A lightweight hook using `MutationObserver` + `keydown` listener handles Tab wrapping and focus restoration.
2. **Spring animation matching CartDrawer** — Reuses `damping: 25, stiffness: 200` for consistency across the app.
3. **Scale + opacity animation** — Unlike CartDrawer's slide (`x: '100%'`), the popup uses scale (95% → 100%) + fade for a centered modal feel.
4. **Body scroll lock via `useEffect`** — Stores and restores `document.body.style.overflow` on open/close/unmount.
5. **Render prop for header** — `headerContent` takes precedence over `headerImage`/`headerTitle`, giving full flexibility without breaking the simple API.

## Architecture

```mermaid
graph TD
    subgraph PopupTemplate Component
        A[AnimatePresence] --> B[Overlay - motion.div]
        A --> C[Panel - motion.div]
        C --> D[CloseButton]
        C --> E[HeaderSection]
        C --> F[BodySection - scrollable]
    end

    subgraph Hooks
        G[useFocusTrap]
        H[useBodyScrollLock]
    end

    C --> G
    A --> H

    subgraph External
        I[motion/react - AnimatePresence, motion]
        J[lucide-react - X icon]
        K[@/lib/utils - cn]
    end
```

### Component Hierarchy

```
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div>  {/* Overlay */}
      <motion.div role="dialog" aria-modal="true">  {/* Panel */}
        <button aria-label="Đóng">  {/* CloseButton */}
        <div>  {/* HeaderSection (conditional) */}
        <div>  {/* BodySection - children */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### File Structure

```
src/
├── components/shop/
│   └── PopupTemplate.tsx      # Main component + sub-components
├── hooks/
│   ├── useFocusTrap.ts        # Custom focus trap hook
│   └── useBodyScrollLock.ts   # Body scroll lock hook
```

## Components and Interfaces

### PopupTemplate Props

```typescript
interface PopupTemplateProps {
  /** Controls popup visibility */
  isOpen: boolean;
  /** Callback fired when popup should close */
  onClose: () => void;
  /** Size variant controlling max-width */
  size?: 'sm' | 'md' | 'lg';
  /** Header image URL */
  headerImage?: string;
  /** Alt text for header image */
  headerImageAlt?: string;
  /** Header title text */
  headerTitle?: string;
  /** Custom header render prop (takes precedence over headerImage/headerTitle) */
  headerContent?: React.ReactNode;
  /** Accessible label for the dialog */
  ariaLabel?: string;
  /** ID of element that labels the dialog */
  ariaLabelledBy?: string;
  /** Additional classes for the popup container */
  className?: string;
  /** Additional classes for the overlay */
  overlayClassName?: string;
  /** Popup body content */
  children?: React.ReactNode;
}
```

### useFocusTrap Hook

```typescript
interface UseFocusTrapOptions {
  /** Whether the trap is active */
  enabled: boolean;
  /** Callback when Escape is pressed */
  onEscape: () => void;
}

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions
): void;
```

**Behavior:**
1. On activation (`enabled` becomes `true`): stores `document.activeElement` as the previously focused element.
2. After a short delay (to allow animation), moves focus to the first focusable element inside the container.
3. Listens for `keydown` on the container:
   - `Tab` → if on last focusable element, wrap to first.
   - `Shift+Tab` → if on first focusable element, wrap to last.
   - `Escape` → call `onEscape`.
4. On deactivation (`enabled` becomes `false`): restores focus to the previously focused element (or `document.body` if it no longer exists in the DOM).

**Focusable element selector:**
```typescript
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');
```

### useBodyScrollLock Hook

```typescript
function useBodyScrollLock(isLocked: boolean): void;
```

**Behavior:**
1. When `isLocked` becomes `true`: stores current `document.body.style.overflow`, sets it to `"hidden"`.
2. When `isLocked` becomes `false` or component unmounts: restores the stored value.
3. Uses a `ref` to persist the stored value across renders without causing re-renders.

### Size Variant Mapping

```typescript
const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[500px]',
  lg: 'max-w-[640px]',
};
```

### Animation Configuration

```typescript
// Overlay
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const overlayTransition = { duration: 0.2 };

// Panel
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const panelTransition = {
  type: 'spring' as const,
  damping: 25,
  stiffness: 200,
};
```

## Data Models

This component is purely presentational — it has no data models or persistence layer. All state is managed via props (`isOpen`, `onClose`) from the parent component.

**Internal state (within hooks):**

| State | Location | Purpose |
|-------|----------|---------|
| `previouslyFocusedElement` | `useFocusTrap` (ref) | Element to restore focus to on close |
| `previousOverflow` | `useBodyScrollLock` (ref) | Original body overflow value to restore |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Body scroll lock round-trip

*For any* initial value of `document.body.style.overflow`, opening the popup SHALL set overflow to `"hidden"`, and subsequently closing the popup (or unmounting while open) SHALL restore overflow to the original value.

**Validates: Requirements 1.3, 1.4, 1.5**

### Property 2: Size variant resolution

*For any* value passed as the `size` prop, the component SHALL apply `max-w-[400px]` for `"sm"`, `max-w-[500px]` for `"md"`, `max-w-[640px]` for `"lg"`, and `max-w-[500px]` (the `"md"` default) for any other value including `undefined`.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.6**

### Property 3: Focus trap Tab wrapping

*For any* set of N focusable elements (N ≥ 1) inside the popup, pressing Tab while the last focusable element has focus SHALL move focus to the first focusable element, and pressing Shift+Tab while the first focusable element has focus SHALL move focus to the last focusable element.

**Validates: Requirements 8.2**

### Property 4: Focus restoration on close

*For any* element that held focus before the popup opened, closing the popup SHALL return focus to that element. If that element is no longer in the DOM, focus SHALL move to `document.body`.

**Validates: Requirements 8.4, 9.8**

### Property 5: headerContent takes precedence

*For any* combination of `headerContent`, `headerImage`, and `headerTitle` props where `headerContent` is provided, the Header_Section SHALL render only the `headerContent` node and SHALL NOT render the default image or title elements.

**Validates: Requirements 5.4**

### Property 6: aria-labelledby precedence

*For any* pair of `ariaLabel` and `ariaLabelledBy` prop values where both are provided, the popup container SHALL have `aria-labelledby` set and SHALL NOT have `aria-label` set.

**Validates: Requirements 9.5**

### Property 7: Custom className merging

*For any* `className` or `overlayClassName` string containing Tailwind utility classes that conflict with the component's defaults, the `cn` utility SHALL produce a merged class string where the custom classes override the conflicting defaults.

**Validates: Requirements 11.1, 11.2**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid `size` prop value | Falls back to `"md"` variant silently (no console warning) |
| Missing `headerImageAlt` when `headerImage` provided | Defaults alt to `""` (decorative image) |
| Both `ariaLabel` and `ariaLabelledBy` provided | `ariaLabelledBy` wins, `ariaLabel` is ignored |
| No focusable elements inside popup | Focus stays on the dialog container itself (which has `tabIndex={-1}`) |
| Previously focused element removed from DOM on close | Focus moves to `document.body` |
| Component unmounts while open | Cleanup effect restores body overflow |
| `onClose` throws an error | Not caught by the component — propagates to React error boundary |
| `headerImage` URL fails to load | Next/Image handles with its default error behavior; no component-level fallback |

## Testing Strategy

### Unit Tests (Example-Based)

Focus on specific scenarios and edge cases:

- **Rendering**: Popup renders when `isOpen=true`, not when `false`
- **Overlay click**: Calls `onClose` on overlay click, not on panel click (event propagation)
- **Close button**: Renders X icon, calls `onClose` on click, has `aria-label="Đóng"`
- **Keyboard**: Escape key calls `onClose`
- **ARIA**: `role="dialog"`, `aria-modal="true"` present on container
- **Header rendering**: Image above title when both provided; no header when none provided
- **Body**: Children rendered, padding applied, scrollable overflow
- **Animation props**: Correct initial/animate/exit values on motion.div elements
- **Responsive**: `max-h-[90vh]`, vertical centering classes, `min-w-[280px]`

### Property-Based Tests

Using a property-based testing library (e.g., `fast-check`) with minimum 100 iterations per property:

1. **Body scroll lock round-trip** — Generate random overflow strings, verify open/close restores them
2. **Size variant resolution** — Generate random strings + valid sizes, verify correct class output
3. **Focus trap Tab wrapping** — Generate varying numbers of focusable elements, verify wrap behavior
4. **Focus restoration** — Generate scenarios with/without previously focused element in DOM
5. **headerContent precedence** — Generate combinations of header props, verify precedence
6. **aria-labelledby precedence** — Generate pairs of label strings, verify only labelledby applied
7. **className merging** — Generate conflicting Tailwind classes, verify cn output

Each property test tagged with:
```
// Feature: popup-template, Property {N}: {property_text}
```

### Integration Tests

- Full open → interact → close lifecycle with real DOM
- Focus trap with dynamically added/removed focusable elements
- Animation completion callbacks (using motion/react test utilities)

