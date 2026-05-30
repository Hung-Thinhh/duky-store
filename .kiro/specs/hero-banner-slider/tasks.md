# Implementation Plan: Hero Banner Slider

## Overview

Replace the static `HeroBanner` component with a multi-slide, multi-layer animated `HeroSlider` using GSAP for floating animations and slide transitions. Implementation follows a bottom-up approach: types → mock data → individual sub-components → main orchestrator → integration into the page.

## Tasks

- [x] 1. Define TypeScript interfaces and create mock data
  - [x] 1.1 Create type definitions file at `src/types/heroSlider.ts`
    - Define `SlideConfig`, `LayerConfig`, `FloatAnimationConfig`, `SlideTextContent`, `CTAButton`, `SlideAnimationConfig`, `TrustItem` interfaces
    - Include JSDoc comments with validation constraints (max lengths, ranges)
    - _Requirements: 8.3, 8.1_

  - [x] 1.2 Create mock data file at `src/data/heroSlider.ts`
    - Define 3 slides with layer configs pointing to `public/assets/slider_1/`, `slider_2/`, `slider_3/`
    - Include text content (badge, title, tagline, buttons) for each slide in Vietnamese
    - Include float animation configs with unique duration/delay per layer
    - Add a `FALLBACK_SLIDE` constant with current default hero banner content
    - Export a `getHeroSliderData()` function (simulates future API call)
    - _Requirements: 8.1, 8.2, 4.2_

  - [x] 1.3 Create slide data validation utility at `src/components/shop/home/HeroSlider/utils.ts`
    - Implement `validateSlides(slides: SlideConfig[]): SlideConfig[]` that filters invalid entries
    - Implement `generateFloatConfigs(layerCount: number): FloatAnimationConfig[]` that ensures unique duration/delay pairs
    - Implement `getNextSlideIndex(current: number, total: number): number` for cycling logic
    - Implement `sortLayersByFilename(layers: LayerConfig[]): LayerConfig[]` for z-index assignment
    - _Requirements: 8.4, 2.2, 3.2, 3.3, 1.2_

  - [ ]* 1.4 Write property tests for validation utilities
    - **Property 1: Float animation config validity and uniqueness**
    - **Property 2: Slide data validation preserves valid entries and filters invalid ones**
    - **Property 3: Auto-scroll index cycling wraps correctly**
    - **Property 5: Layer z-index ordering matches alphabetical filename sort**
    - **Validates: Requirements 2.2, 2.3, 8.1, 8.2, 8.4, 3.2, 3.3, 1.2**

- [x] 2. Checkpoint - Ensure types, mock data, and utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement sub-components
  - [x] 3.1 Create `SlideLayer` component at `src/components/shop/home/HeroSlider/SlideLayer.tsx`
    - Render image with `next/image`, absolute positioning, and assigned z-index
    - Accept `floatConfig` and `isActive` props
    - Use `useEffect` + GSAP to create/kill floating tween based on `isActive`
    - Handle `onError` to hide layer on image load failure
    - Apply mobile displacement cap (max 10px when viewport < 768px)
    - _Requirements: 1.1, 1.4, 2.1, 2.3, 7.4_

  - [x] 3.2 Create `TextOverlay` component at `src/components/shop/home/HeroSlider/TextOverlay.tsx`
    - Render badge, title, tagline, and CTA buttons using existing `Button` component variants
    - Set z-index ≥ 10 to render above all image layers
    - Use GSAP for staggered text entry/exit animations (within 800ms total)
    - Primary button: `variant="premium-black"` with arrow icon
    - Secondary button: `variant="premium-glass"`
    - Wrap buttons in Next.js `Link` for navigation
    - Ensure minimum font sizes on mobile (14px body, 24px heading)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.3_

  - [x] 3.3 Create `SlideIndicators` component at `src/components/shop/home/HeroSlider/SlideIndicators.tsx`
    - Render one dot per slide, active dot visually distinct (wider + different color)
    - Call `onSelect(index)` on click, ignore if `disabled` or already active
    - Add `aria-label` with "Slide N of Total" format
    - Ensure 44×44px minimum tap target on mobile
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 7.5_

  - [x] 3.4 Create `TrustBar` component at `src/components/shop/home/HeroSlider/TrustBar.tsx`
    - Absolute positioning at bottom of slider container
    - Higher z-index than slide layers
    - Render nothing when items array is empty
    - Reuse glass-effect styling from existing HeroBanner trust bar
    - No animation or transform changes during transitions
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.5 Write unit tests for sub-components
    - Test SlideLayer hides on image error
    - Test TextOverlay renders all text fields and buttons
    - Test SlideIndicators renders correct count and active state
    - Test TrustBar conditional rendering (empty items = no render)
    - _Requirements: 1.4, 4.2, 5.1, 6.4_

- [x] 4. Implement main HeroSlider orchestrator
  - [x] 4.1 Create `HeroSlider` component at `src/components/shop/home/HeroSlider/index.tsx`
    - Manage state: `currentSlide`, `isTransitioning`, `isPaused`
    - Implement auto-scroll timer with `setTimeout` (default 5000ms)
    - Pause on hover (desktop ≥ 1024px only), resume on mouse leave
    - Reset timer on manual indicator navigation
    - Implement `transitionToSlide(index)` using GSAP timeline for crossfade
    - Guard against concurrent transitions via `isTransitioning`
    - Handle Page Visibility API: pause/resume GSAP global timeline
    - Validate incoming slides data, apply fallback if empty/invalid
    - Render all sub-components: SlideLayer[], TextOverlay, SlideIndicators, TrustBar
    - Set container to `min-h-[85vh]` on desktop, `min-h-[50vh]` on mobile
    - _Requirements: 1.1, 2.1, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.4, 5.5, 7.1_

  - [x] 4.2 Create barrel export at `src/components/shop/home/HeroSlider/index.tsx`
    - Export HeroSlider as default and named export
    - Export sub-components for potential standalone use

  - [ ]* 4.3 Write property test for transition guard
    - **Property 4: Transition guard prevents concurrent transitions**
    - **Validates: Requirements 5.5, 3.7**

  - [ ]* 4.4 Write property test for mobile displacement cap
    - **Property 6: Mobile displacement cap**
    - **Validates: Requirement 7.4**

- [x] 5. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integration and wiring
  - [x] 6.1 Create placeholder asset directories
    - Create `public/assets/slider_2/` and `public/assets/slider_3/` directories
    - Add placeholder images (can copy from slider_1 initially)
    - _Requirements: 1.3_

  - [x] 6.2 Replace HeroBanner usage with HeroSlider on homepage
    - Update the homepage to import and render `HeroSlider` instead of `HeroBanner`
    - Pass mock data from `src/data/heroSlider.ts`
    - Pass existing trust items to the `TrustBar`
    - Keep `HeroBanner.tsx` file intact as fallback reference
    - _Requirements: 1.1, 6.1, 8.1_

  - [ ]* 6.3 Write integration test for full slider lifecycle
    - Test mount → renders first slide → auto-scroll fires → transitions to next
    - Test indicator click → transitions → timer resets
    - Test fallback renders when no valid slides
    - _Requirements: 3.2, 5.2, 8.2_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- GSAP is already installed (`gsap@^3.15.0`) — no additional animation dependencies needed
- The existing `HeroBanner.tsx` is preserved as a fallback and reference
- Mock data in `src/data/heroSlider.ts` is designed to be easily replaced by API calls later
- Property tests use `fast-check` (already in devDependencies)
- Slider asset directories (`slider_2/`, `slider_3/`) need placeholder images for development

## Task Dependency Graph

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1"],
      "description": "Define TypeScript interfaces, create mock data, and validation utilities"
    },
    {
      "wave": 2,
      "tasks": ["2"],
      "description": "Checkpoint - verify types, data, and utility tests"
    },
    {
      "wave": 3,
      "tasks": ["3"],
      "description": "Implement sub-components (SlideLayer, TextOverlay, SlideIndicators, TrustBar)"
    },
    {
      "wave": 4,
      "tasks": ["4"],
      "description": "Implement main HeroSlider orchestrator"
    },
    {
      "wave": 5,
      "tasks": ["5"],
      "description": "Checkpoint - verify all component tests pass"
    },
    {
      "wave": 6,
      "tasks": ["6"],
      "description": "Integration and wiring into homepage"
    },
    {
      "wave": 7,
      "tasks": ["7"],
      "description": "Final checkpoint - all tests pass"
    }
  ]
}
```
