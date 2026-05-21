# Requirements Document

## Introduction

A reusable Popup Template component for the Duky Store e-commerce application. The component provides a generic, animated modal overlay that can be used for contact information display, notifications, alerts, and any other popup purposes. It follows the existing CartDrawer animation pattern (AnimatePresence + motion.div) and the store's luxury minimal aesthetic.

## Glossary

- **Popup_Template**: The reusable modal overlay component that renders configurable content within an animated container
- **Overlay**: The semi-transparent dark backdrop rendered behind the popup content that covers the entire viewport
- **Close_Button**: The interactive element (X icon) positioned in the top-right corner of the popup that triggers the close callback
- **Header_Section**: The top area of the popup that displays an optional logo, image, or title
- **Body_Section**: The main content area of the popup that renders children or custom content
- **Size_Variant**: A predefined width configuration for the popup container (sm, md, lg)
- **Focus_Trap**: A mechanism that constrains keyboard focus within the popup while it is open
- **Animation_Controller**: The motion (framer-motion) system that manages enter and exit transitions for the overlay and popup content

## Requirements

### Requirement 1: Popup Visibility Control

**User Story:** As a developer, I want to control the popup's open and close state via props, so that I can integrate it with any parent component's state management.

#### Acceptance Criteria

1. WHEN the isOpen prop transitions from false to true, THE Popup_Template SHALL render the overlay and popup content with a fade-and-scale enter animation lasting no more than 300ms
2. WHEN the isOpen prop transitions from true to false, THE Popup_Template SHALL play a fade-and-scale exit animation lasting no more than 200ms and remove the overlay and popup content from the DOM after the animation completes
3. WHEN the isOpen prop transitions from false to true, THE Popup_Template SHALL store the current value of document.body.style.overflow and set it to "hidden" to prevent body scrolling
4. WHEN the isOpen prop transitions from true to false, THE Popup_Template SHALL restore document.body.style.overflow to the value stored when the popup was opened
5. IF the component unmounts while isOpen is true, THEN THE Popup_Template SHALL restore document.body.style.overflow to the value stored when the popup was opened

### Requirement 2: Overlay Behavior

**User Story:** As a user, I want to see a dark backdrop behind the popup, so that I can focus on the popup content without distraction.

#### Acceptance Criteria

1. WHILE the Popup_Template is open, THE Overlay SHALL render as a fixed full-viewport element with a black background at 50% opacity and a backdrop blur of 4px
2. WHEN the user clicks on the Overlay, THE Popup_Template SHALL call the onClose callback
3. IF the user clicks on the Popup_Template content area, THEN THE Overlay SHALL NOT trigger the onClose callback
4. THE Overlay SHALL animate its opacity from 0 to 1 on enter and from 1 to 0 on exit over a duration of 200 milliseconds
5. THE Overlay SHALL have a z-index that positions it above all other page content but below the Popup_Template panel

### Requirement 3: Close Button

**User Story:** As a user, I want a visible close button on the popup, so that I can dismiss it without clicking the overlay.

#### Acceptance Criteria

1. THE Close_Button SHALL render in the top-right corner of the popup container with a minimum click target of 44×44 CSS pixels
2. WHEN the user clicks the Close_Button, THE Popup_Template SHALL call the onClose callback
3. THE Close_Button SHALL display the X icon from lucide-react
4. WHEN the user hovers over the Close_Button, THE Close_Button SHALL change its background opacity to indicate interactivity
5. THE Close_Button SHALL include an accessible label of "Close" so that screen readers can identify its purpose
6. WHEN the Close_Button receives keyboard focus and the user presses Enter or Space, THE Popup_Template SHALL call the onClose callback

### Requirement 4: Animation System

**User Story:** As a user, I want smooth open and close animations, so that the popup feels polished and responsive.

#### Acceptance Criteria

1. THE Popup_Template SHALL use AnimatePresence from motion/react to manage enter and exit animations, ensuring the popup content remains in the DOM until the exit animation completes
2. WHEN the popup opens, THE Animation_Controller SHALL animate the popup content scale from 95% to 100% and opacity from 0 to 1, using only transform and opacity properties
3. WHEN the popup closes, THE Animation_Controller SHALL animate the popup content scale from 100% to 95% and opacity from 1 to 0, using only transform and opacity properties
4. THE Animation_Controller SHALL use a spring transition with damping of 25 and stiffness of 200 for the popup content animations
5. IF the popup is toggled closed while the open animation is in progress, THEN THE Animation_Controller SHALL interrupt the open animation and begin the exit animation from the current intermediate values

### Requirement 5: Header Section

**User Story:** As a developer, I want to configure the popup header with a logo, image, or custom title, so that I can brand the popup for different use cases.

#### Acceptance Criteria

1. WHERE the headerImage prop is provided, THE Header_Section SHALL render an image element horizontally centered at the top of the popup with a maximum height of 120px and object-contain scaling
2. WHERE the headerImage prop is provided, THE Header_Section SHALL set the image alt attribute to the value of the headerImageAlt prop, or to an empty string if headerImageAlt is not provided
3. WHERE the headerTitle prop is provided, THE Header_Section SHALL render the title text using font-serif styling, truncated to a single line with overflow hidden if it exceeds the container width
4. WHERE a custom headerContent render prop is provided, THE Header_Section SHALL render the custom content instead of the default image or title, taking precedence over both headerImage and headerTitle props
5. WHERE both headerImage and headerTitle props are provided without headerContent, THE Header_Section SHALL render the image above the title
6. WHERE none of headerImage, headerTitle, or headerContent props are provided, THE Header_Section SHALL not render any header markup in the DOM

### Requirement 6: Body Content

**User Story:** As a developer, I want to pass any content as children to the popup, so that I can reuse the component for different purposes.

#### Acceptance Criteria

1. THE Body_Section SHALL render React children passed to the Popup_Template component
2. WHILE the body content exceeds the visible height of the popup container, THE Body_Section SHALL enable vertical scrolling and hide horizontal overflow
3. THE Body_Section SHALL apply 24px padding on all sides around the content
4. WHEN no children are passed to the Popup_Template component, THE Body_Section SHALL render as an empty container preserving its padding

### Requirement 7: Size Variants

**User Story:** As a developer, I want to choose from predefined popup sizes, so that I can match the popup width to its content type.

#### Acceptance Criteria

1. WHERE the size prop is "sm", THE Popup_Template SHALL render with a maximum width of 400px
2. WHERE the size prop is "md", THE Popup_Template SHALL render with a maximum width of 500px
3. WHERE the size prop is "lg", THE Popup_Template SHALL render with a maximum width of 640px
4. WHERE no size prop is provided, THE Popup_Template SHALL default to the "md" size variant (maximum width of 500px)
5. WHILE the viewport width is narrower than the applicable maximum width, THE Popup_Template SHALL render at 100% of the viewport width minus 16px horizontal margin on each side
6. IF the size prop receives a value other than "sm", "md", or "lg", THEN THE Popup_Template SHALL fall back to the "md" size variant

### Requirement 8: Keyboard Accessibility

**User Story:** As a user navigating with a keyboard, I want to close the popup with the Escape key and have focus trapped within it, so that I can interact with the popup without a mouse.

#### Acceptance Criteria

1. WHEN the user presses the Escape key while any element within the Popup_Template has focus, THE Popup_Template SHALL call the onClose callback
2. WHILE the Popup_Template is open, THE Focus_Trap SHALL constrain Tab and Shift+Tab navigation to focusable elements within the popup, wrapping from the last focusable element back to the first on Tab, and from the first focusable element to the last on Shift+Tab
3. WHEN the Popup_Template opens and the enter animation completes, THE Focus_Trap SHALL move focus to the first focusable element inside the popup within 100 milliseconds
4. WHEN the Popup_Template closes, THE Focus_Trap SHALL return focus to the element that was focused before the popup opened; IF that element is no longer present in the DOM, THEN THE Focus_Trap SHALL move focus to the document body

### Requirement 9: ARIA Accessibility

**User Story:** As a user with assistive technology, I want the popup to be announced correctly by screen readers, so that I understand its purpose and can interact with it.

#### Acceptance Criteria

1. THE Popup_Template SHALL have role="dialog" on the popup container
2. THE Popup_Template SHALL have aria-modal="true" on the popup container
3. WHERE an ariaLabel prop is provided, THE Popup_Template SHALL set aria-label on the popup container to the value of the ariaLabel prop
4. WHERE an ariaLabelledBy prop is provided, THE Popup_Template SHALL set aria-labelledby on the popup container to the value of the ariaLabelledBy prop
5. IF both ariaLabel and ariaLabelledBy props are provided, THEN THE Popup_Template SHALL apply aria-labelledby and ignore aria-label
6. THE Close_Button SHALL have aria-label="Đóng" to describe its purpose
7. WHEN the Popup_Template opens, THE Popup_Template SHALL move focus to the first focusable element within the popup container within 100ms of the open animation completing
8. WHEN the Popup_Template closes, THE Popup_Template SHALL return focus to the element that triggered the popup opening

### Requirement 10: Responsive Design

**User Story:** As a user on a mobile device, I want the popup to adapt to smaller screens, so that I can view and interact with it comfortably.

#### Acceptance Criteria

1. WHILE the viewport width is less than the popup's configured maximum width (as determined by the Size_Variant), THE Popup_Template SHALL render at full viewport width minus 32px total horizontal margin (16px on each side), with a minimum rendered width of 280px
2. THE Popup_Template SHALL be vertically centered in the viewport using CSS centering (equal top and bottom spacing relative to the viewport edges)
3. WHILE the popup content height exceeds 90vh, THE Popup_Template SHALL constrain its maximum height to 90vh and enable vertical scrolling within the Body_Section
4. WHILE the popup height is constrained to 90vh, THE Popup_Template SHALL remain vertically centered within the remaining viewport space

### Requirement 11: Custom Styling

**User Story:** As a developer, I want to pass custom class names to the popup, so that I can override or extend default styles for specific use cases.

#### Acceptance Criteria

1. WHERE a className prop is provided, THE Popup_Template SHALL pass both the default container classes and the custom className to the cn utility, so that conflicting Tailwind classes in className override the corresponding default classes
2. WHERE an overlayClassName prop is provided, THE Popup_Template SHALL pass both the default overlay classes (fixed inset-0 backdrop with semi-transparent background) and the custom overlayClassName to the cn utility, so that conflicting Tailwind classes in overlayClassName override the corresponding default overlay classes
3. THE Popup_Template SHALL use white background with rounded-2xl corners as the default container style
4. IF neither className nor overlayClassName props are provided, THEN THE Popup_Template SHALL render with only the default container and overlay classes unchanged
