# Requirements Document

## Introduction

The Product Filter feature provides a sidebar component for the Duky Store e-commerce products page. It enables users to narrow down product listings by category, size, color, and price range. The filter UI uses Vietnamese labels, supports collapsible sections with smooth animations, and includes a "clear all" action to reset all active filters. The component integrates into the existing Next.js 16 / React 19 / Tailwind CSS 4 stack.

## Glossary

- **Filter_Sidebar**: The sidebar UI component that contains all filter sections and controls
- **Category_Filter**: The filter section that allows selection of a single product category via radio buttons
- **Size_Filter**: The filter section that displays shoe sizes as a grid of selectable buttons
- **Color_Filter**: The filter section that displays color swatches for selecting product colors
- **Price_Filter**: The filter section with a range slider and min/max inputs for price bounds
- **Filter_Section**: A collapsible group within the Filter_Sidebar containing a title and filter controls
- **Product_List**: The grid of ProductCard components displaying filtered results
- **Active_Filter**: A filter criterion currently applied to narrow the Product_List

## Requirements

### Requirement 1: Filter Sidebar Layout

**User Story:** As a shopper, I want a clearly organized filter sidebar, so that I can easily find and apply filters to narrow product results.

#### Acceptance Criteria

1. THE Filter_Sidebar SHALL display a header row with the text "BỘ LỌC" aligned to the left and a "Xóa tất cả" clear button aligned to the right within the same row
2. THE Filter_Sidebar SHALL render four Filter_Sections in this order from top to bottom: Category_Filter, Size_Filter, Color_Filter, Price_Filter
3. THE Filter_Sidebar SHALL use a vertical layout with 24px spacing between each Filter_Section
4. THE Filter_Sidebar SHALL be rendered as a client component using the "use client" directive
5. WHEN the user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL reset all active filters across all four Filter_Sections to their default unselected state

### Requirement 2: Collapsible Filter Sections

**User Story:** As a shopper, I want to collapse and expand filter sections, so that I can focus on the filters relevant to me.

#### Acceptance Criteria

1. WHEN a user activates a Filter_Section header by click or keyboard, THE Filter_Sidebar SHALL toggle the visibility of that section's content and update the aria-expanded attribute to reflect the new state
2. WHILE a Filter_Section is collapsed, THE Filter_Sidebar SHALL hide the section content and display a chevron icon pointing downward
3. WHILE a Filter_Section is expanded, THE Filter_Sidebar SHALL show the section content and display a chevron icon pointing upward
4. THE Filter_Sidebar SHALL animate the expand and collapse transitions using the motion library with a duration no longer than 300ms
5. THE Filter_Sidebar SHALL render all Filter_Sections in the expanded state by default

### Requirement 3: Category Filter

**User Story:** As a shopper, I want to filter products by category, so that I can browse only the type of footwear I am interested in.

#### Acceptance Criteria

1. THE Category_Filter SHALL display a list of radio buttons with the following options in this order: "Tất cả", "Boot cổ thấp", "Boot cổ cao", "Chelsea", "Derby / Oxford", "Sneaker"
2. WHEN a user selects a category radio button, THE Category_Filter SHALL mark that option as selected and deselect the previously selected option
3. THE Category_Filter SHALL have "Tất cả" selected by default on initial page load, representing no category filtering
4. WHEN "Tất cả" is selected, THE Product_List SHALL display all products regardless of category
5. WHEN a specific category is selected, THE Product_List SHALL display only products whose category field is an exact match (case-sensitive) to the selected filter value
6. IF a selected category yields zero matching products, THEN THE Product_List SHALL display an empty-state message indicating that no products are available in the selected category
7. WHEN a user selects a category radio button, THE Product_List SHALL update the displayed products within 300 milliseconds without requiring a full page reload

### Requirement 4: Size Filter

**User Story:** As a shopper, I want to filter products by shoe size, so that I can see only products available in my size.

#### Acceptance Criteria

1. THE Size_Filter SHALL display size options in a grid layout with the values: 38, 39, 40, 41, 42, 43, 44, 45
2. WHEN a user clicks an unselected size button, THE Size_Filter SHALL mark that size as selected; WHEN a user clicks an already-selected size button, THE Size_Filter SHALL mark that size as unselected
3. THE Size_Filter SHALL allow multiple sizes to be selected simultaneously up to the total number of available size options
4. WHILE one or more sizes are selected, THE Size_Filter SHALL render selected size buttons with a visually distinct style (e.g., contrasting background fill or border) that differentiates them from unselected size buttons at a glance
5. WHILE no sizes are selected, THE Product_List SHALL display products of all sizes
6. WHILE one or more sizes are selected, THE Product_List SHALL display only products that are available in at least one of the selected sizes
7. WHEN the user deselects all previously selected sizes, THE Product_List SHALL return to displaying products of all sizes within 1 second of the last deselection

### Requirement 5: Color Filter

**User Story:** As a shopper, I want to filter products by color, so that I can find footwear that matches my style preference.

#### Acceptance Criteria

1. THE Color_Filter SHALL display color swatches representing: black, dark brown, brown, tan, gray, white, with each swatch being a minimum of 44×44 pixels in touch target size
2. WHEN a user clicks a color swatch, THE Color_Filter SHALL toggle the selected state of that color and update the product list to display only products matching any of the currently selected colors
3. THE Color_Filter SHALL allow multiple colors to be selected simultaneously, up to the total number of available color options
4. WHILE a color swatch is selected, THE Color_Filter SHALL display a visible border or checkmark overlay on the selected swatch that is visually distinct from the unselected state
5. THE Color_Filter SHALL display a "+" button to indicate additional color options are available
6. WHEN a user clicks the "+" button, THE Color_Filter SHALL reveal the full set of additional color options not shown in the default view
7. IF no color swatches are selected, THEN THE Color_Filter SHALL display all products without color-based filtering applied

### Requirement 6: Price Range Filter

**User Story:** As a shopper, I want to filter products by price range, so that I can find footwear within my budget.

#### Acceptance Criteria

1. THE Price_Filter SHALL display a range slider with two handles representing minimum and maximum price, with an absolute minimum of 0 and an absolute maximum of 5,000,000, and a step increment of 10,000
2. THE Price_Filter SHALL display numeric input fields showing the current minimum and maximum price values formatted in Vietnamese đồng (e.g., "190.000đ")
3. THE Price_Filter SHALL set the default minimum price to 190,000 and the default maximum price to 1,500,000
4. WHEN a user drags a slider handle, THE Price_Filter SHALL update the corresponding input field value within 100 milliseconds
5. WHEN a user confirms a value in a price input field (by pressing Enter or moving focus away from the field), THE Price_Filter SHALL update the corresponding slider handle position
6. IF a user enters a minimum price greater than the current maximum price, THEN THE Price_Filter SHALL clamp the minimum value to equal the current maximum price and update both the input field and slider handle to reflect the clamped value
7. IF a user enters a maximum price less than the current minimum price, THEN THE Price_Filter SHALL clamp the maximum value to equal the current minimum price and update both the input field and slider handle to reflect the clamped value
8. IF a user enters a non-numeric value or a value outside the range of 0 to 5,000,000 in a price input field, THEN THE Price_Filter SHALL revert the input field to its previous valid value
9. WHILE a price range is set, THE Product_List SHALL display only products whose price falls within the specified minimum and maximum bounds (inclusive), updating the displayed results within 300 milliseconds of a range change
10. IF no products match the current price range, THEN THE Product_List SHALL display a message indicating that no products were found within the selected price range

### Requirement 7: Clear All Filters

**User Story:** As a shopper, I want to reset all filters at once, so that I can start a fresh product search without manually deselecting each filter.

#### Acceptance Criteria

1. WHEN a user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL reset the Category_Filter to "Tất cả"
2. WHEN a user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL deselect all selected sizes in the Size_Filter, leaving no size option checked
3. WHEN a user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL deselect all selected colors in the Color_Filter, leaving no color option checked
4. WHEN a user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL reset the Price_Filter minimum value to 190,000đ and the maximum value to 1,500,000đ
5. WHEN a user clicks the "Xóa tất cả" button, THE Product_List SHALL update within 1 second to display all products without any filter constraints
6. IF no filters are currently active, THEN THE Filter_Sidebar SHALL keep the "Xóa tất cả" button disabled or hidden
7. WHEN a user clicks the "Xóa tất cả" button, THE Filter_Sidebar SHALL visually update all filter controls to reflect their default unselected state

### Requirement 8: Filter State Communication

**User Story:** As a developer, I want the filter component to communicate selected filters to the parent page, so that the product list can be filtered accordingly.

#### Acceptance Criteria

1. WHEN any filter value changes, THE Filter_Sidebar SHALL invoke the onChange callback with the complete current filter state within the same render cycle
2. THE Filter_Sidebar SHALL expose a TypeScript interface defining the filter state shape including: selected category (string or null when unselected), selected sizes array, selected colors array, minimum price (integer in VND), and maximum price (integer in VND)
3. WHEN initial filter values are provided as props, THE Filter_Sidebar SHALL render with those values pre-applied and update its internal state when the props change
4. IF no initial filter values are provided, THEN THE Filter_Sidebar SHALL default to "Tất cả" for category, empty arrays for sizes and colors, 190,000 for minimum price, and 1,500,000 for maximum price

### Requirement 9: Responsive and Accessible Design

**User Story:** As a shopper using various devices, I want the filter to be usable and accessible, so that I can filter products regardless of device or assistive technology.

#### Acceptance Criteria

1. THE Filter_Sidebar SHALL use semantic HTML elements including fieldset and legend for each filter category group, and shall associate each interactive control with a visible label element
2. THE Filter_Sidebar SHALL provide aria-label or aria-labelledby attributes for all interactive controls, and shall use aria-checked or aria-expanded attributes to communicate current state to assistive technologies
3. THE Filter_Sidebar SHALL support keyboard navigation where all filter controls are reachable via the Tab key in logical reading order, operable via Enter or Space keys, and display a visible focus indicator on the currently focused element
4. THE Filter_Sidebar SHALL use Tailwind CSS utility classes following the project mobile-first responsive approach with a single-column layout on viewports below 768px and a sidebar layout on viewports at or above 1024px
5. THE Filter_Sidebar SHALL render all interactive controls with a minimum touch target size of 44×44 pixels on viewports below 768px
