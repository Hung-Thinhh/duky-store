# Requirements Document

## Introduction

This feature enhances the Duky Store homepage hero banner by transforming it into a multi-slide, multi-layer slider. Each slide supports up to 8 stacked image layers with gentle floating animations, creating a parallax-like depth effect. The topmost layer contains code-based text content (title, subtitle, tagline, CTA buttons) that remains consistent with the current design. The slider auto-scrolls between 3 slides and layer assets are loaded from the `public/assets/slider_N/` directories.

## Glossary

- **Slider**: The full-width hero banner component that cycles through multiple slides on the homepage
- **Slide**: A single view within the Slider, composed of stacked layers and a text overlay
- **Layer**: An individual image element within a Slide, positioned absolutely and stacked via z-index
- **Floating_Animation**: A gentle CSS or JS-based up/down oscillation applied to image layers to create visual depth
- **Text_Overlay**: The topmost layer of a Slide containing code-rendered title, subtitle, tagline, and CTA buttons
- **Auto_Scroll**: Automatic timed transition between slides without user interaction
- **Slide_Indicator**: A visual element (dot or bar) showing the current active slide position
- **Trust_Bar**: The bottom bar displaying service features (shipping, size exchange, warranty, support)
- **CTA_Button**: A call-to-action button prompting user interaction (e.g., "KHÁM PHÁ NGAY")

## Requirements

### Requirement 1: Multi-Layer Slide Rendering

**User Story:** As a visitor, I want to see a visually rich hero banner with layered images creating depth, so that the homepage feels premium and engaging.

#### Acceptance Criteria

1. THE Slider SHALL render each Slide as a stack of 1 to 8 image layers using absolute positioning within the slide container, where each layer fills the full width and height of the container
2. WHEN a Slide is active, THE Slider SHALL display all layers for that Slide ordered by filename alphabetically ascending, assigning z-index values starting at 0 for the first file through to the highest index for the last file
3. THE Slider SHALL load layer images from the `public/assets/slider_N/` directory where N is the slide number (1-indexed)
4. WHEN a layer image fails to load, THE Slider SHALL hide that layer without affecting the rendering of other layers in the same Slide
5. IF all layer images for a Slide fail to load or the slide directory contains no image files, THEN THE Slider SHALL hide that Slide and advance to the next Slide with at least one visible layer

### Requirement 2: Floating Animation on Layers

**User Story:** As a visitor, I want to see subtle floating animations on the banner layers, so that the hero section feels dynamic and alive.

#### Acceptance Criteria

1. WHILE a Slide is active, THE Slider SHALL apply a continuous vertical floating animation to each image Layer, using an ease-in-out easing function and looping indefinitely until the Slide becomes inactive
2. THE Floating_Animation SHALL use a duration between 3 seconds and 6 seconds and a start delay between 0 seconds and 2 seconds per Layer, with no two Layers sharing the same duration-delay combination, to create a non-synchronized motion effect
3. THE Floating_Animation SHALL have a vertical displacement between 5px and 15px from the layer's resting position
4. WHEN the browser tab becomes not visible (via the Page Visibility API), THE Slider SHALL pause all Floating_Animations within 100ms
5. WHEN the browser tab becomes visible again, THE Slider SHALL resume all Floating_Animations from their paused state within 100ms

### Requirement 3: Auto-Scroll Between Slides

**User Story:** As a visitor, I want the hero banner to automatically cycle through slides, so that I can see multiple promotions without interaction.

#### Acceptance Criteria

1. THE Slider SHALL support exactly 3 slides in the initial implementation
2. WHILE the Slider is visible and no user interaction is occurring, THE Slider SHALL automatically transition to the next Slide after a configurable interval (default: 5000ms, minimum: 3000ms, maximum: 10000ms)
3. WHEN the last Slide is reached, THE Slider SHALL loop back to the first Slide seamlessly using the same transition animation
4. THE Slider SHALL use a crossfade or slide transition with a duration between 600ms and 1000ms
5. WHEN a user hovers over the Slider on a viewport width of 1024px or greater, THE Slider SHALL pause the Auto_Scroll timer
6. WHEN the user moves the cursor away from the Slider, THE Slider SHALL reset the Auto_Scroll timer to the full configured interval and resume cycling from the current Slide
7. WHEN a user manually selects a Slide via pagination controls, THE Slider SHALL reset the Auto_Scroll timer to the full configured interval starting from the newly selected Slide

### Requirement 4: Text Overlay Preservation

**User Story:** As a store owner, I want the existing title, subtitle, tagline, and CTA buttons to remain on the hero banner, so that the brand messaging and conversion elements are preserved.

#### Acceptance Criteria

1. THE Text_Overlay SHALL render above all other Slide layers (background image, gradient overlays, and pagination controls) using a z-index value greater than or equal to 10
2. THE Text_Overlay SHALL contain a badge label (maximum 30 characters), a main title (maximum 100 characters), a tagline description (maximum 150 characters), and exactly two CTA_Buttons
3. THE Text_Overlay SHALL use code-based rendering (React components with Tailwind CSS), not image-based text
4. WHEN the Slider transitions between slides, THE Text_Overlay content SHALL animate out the current text, update to the active Slide's configured text data, and animate in the new text within 800 milliseconds total transition duration
5. THE CTA_Buttons SHALL render as interactive elements: a primary dark-background button with an arrow icon and a secondary button with a semi-transparent backdrop-blur background
6. WHEN a user clicks a CTA_Button, THE System SHALL navigate to the configured link destination associated with that button
7. THE Text_Overlay SHALL maintain a minimum contrast ratio of 4.5:1 between text content and the underlying background across all slides

### Requirement 5: Slide Indicators

**User Story:** As a visitor, I want to see which slide is currently active and be able to navigate to a specific slide, so that I have control over the content I view.

#### Acceptance Criteria

1. THE Slider SHALL display one Slide_Indicator per slide, where the active Slide_Indicator is visually distinct from inactive indicators through a difference in size, color, or shape
2. WHEN a user clicks a Slide_Indicator, THE Slider SHALL transition to the corresponding Slide within 1000 milliseconds
3. IF a user clicks the Slide_Indicator for the already-active Slide, THEN THE Slider SHALL take no action
4. WHEN a user manually selects a Slide via indicator, THE Slider SHALL reset the Auto_Scroll timer to its full duration
5. IF the Slider is currently animating a transition, THEN THE Slider SHALL ignore additional Slide_Indicator clicks until the current transition completes
6. THE Slider SHALL provide each Slide_Indicator with an accessible label indicating its slide number and total count

### Requirement 6: Trust Bar Preservation

**User Story:** As a store owner, I want the trust bar with service features to remain visible at the bottom of the hero banner, so that customers see key value propositions immediately.

#### Acceptance Criteria

1. THE Trust_Bar SHALL remain positioned at the bottom of the Slider section with a fixed offset from the bottom edge, using absolute positioning relative to the Slider container
2. THE Trust_Bar SHALL display above all Slide layers by rendering at a higher z-index than the slide image and content layers
3. WHILE the Slider transitions between slides, THE Trust_Bar SHALL remain at the same position with no changes to its opacity, transform, or layout properties
4. IF the trust items list is empty, THEN THE Trust_Bar SHALL not be rendered in the Slider section

### Requirement 7: Responsive Behavior

**User Story:** As a visitor on any device, I want the hero banner slider to display correctly, so that I have a good experience regardless of screen size.

#### Acceptance Criteria

1. THE Slider SHALL maintain a minimum height of 85vh on viewports 768px wide and above, and a minimum height of 50vh on viewports below 768px
2. WHILE viewed on screens smaller than 768px, THE Slider SHALL scale layer images to fit within the viewport width while maintaining their original aspect ratio, with no horizontal overflow
3. WHILE viewed on screens smaller than 768px, THE Text_Overlay SHALL render body text at a minimum font size of 14px, heading text at a minimum font size of 24px, and maintain a minimum spacing of 12px between text elements
4. WHILE viewed on screens smaller than 768px, THE Floating_Animation SHALL limit displacement to a maximum of 10px in any direction so that no animated element extends beyond the viewport boundary
5. WHILE viewed on screens smaller than 768px, THE Slider SHALL ensure all interactive elements (buttons, pagination indicators) have a minimum tap target size of 44×44px

### Requirement 8: Slide Data Configuration

**User Story:** As a developer, I want slide data to be easily configurable, so that new slides can be added or modified without code changes to the component logic.

#### Acceptance Criteria

1. THE Slider SHALL accept slide configuration as a typed data array of 1 to 10 slides, where each slide defines up to 8 image layers with z-index order, text content, and animation parameters (duration in milliseconds between 200 and 2000, easing function name, and entry direction)
2. IF the slide data array is empty, undefined, or contains no valid slide entries, THEN THE Slider SHALL render a single slide with the current default hero banner content (badge: "SUMMER COLLECTION", background image, title, description, and primary/secondary action buttons) as a fallback
3. THE Slider SHALL define a TypeScript interface for slide configuration that includes: layer image paths (array of up to 8 strings), layer z-index values (integers 0 to 100), text overlay content (badge string max 50 characters, title string max 100 characters, tagline string max 200 characters, and up to 3 button objects each with label and link), and per-slide animation settings (duration, easing, entry direction)
4. IF a slide entry is missing one or more required fields (image layers, title), THEN THE Slider SHALL skip that entry and proceed to render the remaining valid slides
