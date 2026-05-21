# Implementation Plan: Product Filter

## Overview

Build the `Filter` component as a single-file client component at `src/components/shop/Fillter.tsx`. The implementation proceeds incrementally: first the exported interface and constants, then the skeleton with header, followed by each filter sub-component (collapsible sections, category, size, color, price), and finally the clear-all logic, onChange integration, and accessibility polish.

## Tasks

- [x] 1. Create FilterState interface, constants, and component skeleton
  - [x] 1.1 Define the FilterState interface, FilterProps interface, constants (CATEGORIES, SIZES, COLORS, EXTRA_COLORS, PRICE_CONFIG, DEFAULT_FILTER_STATE), and ColorOption type in `src/components/shop/Fillter.tsx`
    - Add "use client" directive at the top
    - Export `FilterState` interface with fields: category (string), sizes (number[]), colors (string[]), priceMin (number), priceMax (number)
    - Define `FilterProps` interface with: initialState? (Partial<FilterState>), onChange ((state: FilterState) => void), className? (string)
    - Define all constants as specified in the design document
    - _Requirements: 1.4, 8.2, 8.4_

  - [x] 1.2 Implement the FilterHeader sub-component and main Filter component shell
    - Create internal `FilterHeader` component rendering "BỘ LỌC" title and "Xóa tất cả" button in a flex row
    - Implement the main `Filter` component with `useState<FilterState>` initialized from `initialState` merged with `DEFAULT_FILTER_STATE`
    - Render FilterHeader and placeholder divs for each section with 24px vertical spacing
    - Wire the "Xóa tất cả" button to a no-op handler for now
    - _Requirements: 1.1, 1.2, 1.3, 8.3, 8.4_

- [x] 2. Implement collapsible FilterSection sub-component
  - [x] 2.1 Create the FilterSection generic collapsible wrapper
    - Implement `FilterSection` with props: title (string), defaultExpanded (boolean, default true), children (ReactNode)
    - Use `useState<boolean>` for expanded state
    - Render a clickable header row with the title and ChevronUp/ChevronDown icon from lucide-react
    - Wrap children in `AnimatePresence` + `motion.div` with height/opacity animation (duration 0.25s)
    - Add `aria-expanded` attribute on the header button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 2.2 Integrate FilterSection into the main Filter component
    - Replace placeholder divs with four `FilterSection` components titled: "Danh mục", "Kích cỡ", "Màu sắc", "Khoảng giá"
    - All sections default to expanded
    - _Requirements: 1.2, 2.5_

- [x] 3. Implement CategoryFilter sub-component
  - [x] 3.1 Create the CategoryFilter with radio button list
    - Implement internal `CategoryFilter` component receiving `selected` (string) and `onSelect` ((category: string) => void) props
    - Render radio buttons for each item in CATEGORIES array
    - Style the selected radio button distinctly
    - Wire selection to update the parent Filter state and call onChange
    - Use semantic HTML with fieldset/legend
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1_

- [x] 4. Implement SizeFilter sub-component
  - [x] 4.1 Create the SizeFilter with grid of toggle buttons
    - Implement internal `SizeFilter` component receiving `selected` (number[]) and `onToggle` ((size: number) => void) props
    - Render SIZES in a grid layout (4 columns)
    - Toggle size in/out of the selected array on click
    - Style selected sizes with contrasting background/border
    - Wire toggle to update the parent Filter state and call onChange
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.1_

- [x] 5. Implement ColorFilter sub-component
  - [x] 5.1 Create the ColorFilter with color swatches and expand button
    - Implement internal `ColorFilter` component receiving `selected` (string[]) and `onToggle` ((colorId: string) => void) props
    - Render COLORS as circular swatches with the hex background color
    - Show a Check icon overlay (from lucide-react) on selected swatches
    - Add a "+" button (Plus icon from lucide-react) that reveals EXTRA_COLORS when clicked
    - Ensure minimum 44×44px touch target for each swatch
    - Toggle color in/out of the selected array on click
    - Wire toggle to update the parent Filter state and call onChange
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 8.1_

- [x] 6. Implement PriceFilter sub-component (dual range slider)
  - [x] 6.1 Create the PriceFilter with dual native range inputs and formatted text inputs
    - Implement internal `PriceFilter` component receiving `min` (number), `max` (number), and `onRangeChange` ((min: number, max: number) => void) props
    - Render two overlaid `<input type="range">` elements for min and max handles
    - Render a styled div between the two thumbs representing the filled track segment (calculated left/width percentages)
    - Handle z-index swap when min thumb approaches max thumb
    - Render two formatted text input fields showing values in Vietnamese đồng format (e.g., "190.000đ")
    - Use PRICE_CONFIG for min, max, and step values
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Implement price input validation and clamping logic
    - On blur or Enter in a text input, parse the numeric value (strip formatting)
    - Clamp min to not exceed current max; clamp max to not go below current min
    - Clamp values to [0, 5,000,000] range
    - Revert to previous valid value if input is non-numeric or out of bounds
    - Update slider positions to match validated input values
    - Wire changes to update the parent Filter state and call onChange
    - _Requirements: 6.5, 6.6, 6.7, 6.8, 8.1_

- [x] 7. Checkpoint - Verify all filter sections render correctly
  - Ensure all filter sections render and are interactive, ask the user if questions arise.

- [x] 8. Implement clear-all functionality and onChange integration
  - [x] 8.1 Wire the clear-all button to reset state and finalize onChange
    - Implement the clear-all handler that resets state to DEFAULT_FILTER_STATE
    - Call onChange with the reset state
    - Disable the "Xóa tất cả" button when current state deeply equals DEFAULT_FILTER_STATE
    - Ensure every state mutation (category, size, color, price) calls onChange with the complete FilterState
    - _Requirements: 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1_

- [x] 9. Add accessibility attributes and responsive styling
  - [x] 9.1 Add semantic HTML and ARIA attributes across all sub-components
    - Wrap CategoryFilter in fieldset/legend
    - Add aria-label or aria-labelledby to all interactive controls
    - Add aria-checked to size and color toggle buttons
    - Ensure all controls are reachable via Tab in logical order
    - Add visible focus indicators (ring styles) to all interactive elements
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 9.2 Add responsive Tailwind classes for mobile and desktop layouts
    - Apply mobile-first responsive approach
    - Ensure single-column layout below 768px, sidebar layout at 1024px+
    - Ensure minimum 44×44px touch targets on mobile viewports
    - Apply the `className` prop to the root element for external styling
    - _Requirements: 9.4, 9.5_

- [x] 10. Final checkpoint - Ensure component is complete
  - Ensure all filter interactions work correctly, onChange fires with complete state, clear-all resets properly, and accessibility attributes are in place. Ask the user if questions arise.

## Notes

- All implementation is in a single file: `src/components/shop/Fillter.tsx`
- Only `FilterState` interface and `Filter` component are exported; sub-components are internal
- No test framework is configured in this project, so test tasks are omitted
- The `cn()` utility from `@/lib/utils` is used for conditional Tailwind class merging
- Price formatting uses Vietnamese đồng format with dot separators (e.g., "190.000đ")
- The component uses the uncontrolled pattern: `initialState` seeds state on mount but does not re-sync on prop changes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1"] },
    { "id": 4, "tasks": ["4.1", "5.1"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["9.1", "9.2"] }
  ]
}
```
