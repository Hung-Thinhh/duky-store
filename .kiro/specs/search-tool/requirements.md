# Requirements Document

## Introduction

The Search Tool is a modal overlay component for Duky Store (Vietnamese fashion e-commerce) that enables users to search for products. It provides a full-width search input with Vietnamese text normalization, popular search tag chips, product suggestion cards (max 4), a "view all results" footer, keyboard navigation, and smooth animations via framer-motion. The component follows the store's luxury minimal aesthetic.

## Glossary

- **Search_Tool**: The modal overlay component that provides product search functionality
- **Search_Input**: The pill-shaped text input field where users type search queries
- **Popular_Tags**: Clickable chip elements displaying trending or popular search terms
- **Product_Suggestions**: A horizontal grid of up to 4 product cards shown as search results
- **View_All_Footer**: The bottom bar that links to the full search results page
- **Backdrop**: The semi-transparent overlay behind the modal that dims the page content
- **Normalization**: The process of converting Vietnamese text to lowercase ASCII for matching

## Requirements

### Requirement 1: Modal Display and Lifecycle

**User Story:** As a user, I want the search tool to appear as a modal overlay, so that I can search without leaving the current page.

#### Acceptance Criteria

1. WHEN the user triggers the search action, THE Search_Tool SHALL render a modal overlay with a semi-transparent Backdrop
2. WHEN the Search_Tool opens, THE Search_Tool SHALL animate the modal panel into view using framer-motion enter transitions
3. WHEN the Search_Tool closes, THE Search_Tool SHALL animate the modal panel out of view before removing it from the DOM
4. WHILE the Search_Tool is open, THE Search_Tool SHALL prevent body scrolling by setting overflow hidden on the document body
5. WHEN the Search_Tool closes, THE Search_Tool SHALL restore the document body scroll to its previous state

### Requirement 2: Search Input Behavior

**User Story:** As a user, I want a prominent search input field, so that I can type my product search query quickly.

#### Acceptance Criteria

1. WHEN the Search_Tool opens, THE Search_Input SHALL receive focus automatically after the open animation completes
2. THE Search_Input SHALL display the placeholder text "Bạn cần tìm gì hôm nay?"
3. WHEN the user types in the Search_Input, THE Search_Tool SHALL update the query state and trigger product filtering immediately
4. THE Search_Input SHALL render as a pill-shaped input with a Search icon on the left side

### Requirement 3: Vietnamese Text Normalization

**User Story:** As a Vietnamese-speaking user, I want search to match products regardless of diacritics, so that I can find products without typing exact accents.

#### Acceptance Criteria

1. WHEN filtering products, THE Search_Tool SHALL normalize both the query and product text to lowercase with diacritics removed
2. THE Normalization function SHALL convert Vietnamese characters đ and Đ to d and D respectively
3. THE Normalization function SHALL produce the same result when applied multiple times to the same input (idempotence)
4. WHEN an empty string is provided, THE Normalization function SHALL return an empty string

### Requirement 4: Product Filtering and Suggestions

**User Story:** As a user, I want to see relevant product suggestions as I type, so that I can quickly find and navigate to products.

#### Acceptance Criteria

1. WHEN the query is non-empty, THE Search_Tool SHALL filter products by matching the normalized query against product name and category
2. THE Search_Tool SHALL display at most 4 product suggestions regardless of the total number of matching products
3. WHEN the query is empty, THE Search_Tool SHALL display the first 4 products from the product list as default suggestions
4. THE Search_Tool SHALL preserve the original order of products from the source array in filtered results
5. THE Search_Tool SHALL NOT mutate the original products array during filtering

### Requirement 5: Popular Search Tags

**User Story:** As a user, I want to see popular search terms, so that I can quickly explore trending products without typing.

#### Acceptance Criteria

1. THE Search_Tool SHALL display a section labeled "Tìm kiếm phổ biến" with clickable tag chips
2. WHEN the user clicks a Popular_Tag, THE Search_Tool SHALL set the search query to that tag's exact text value
3. WHEN a Popular_Tag is clicked, THE Search_Tool SHALL trigger product filtering with the tag text as the new query

### Requirement 6: Product Suggestion Cards

**User Story:** As a user, I want to see product details in suggestion cards, so that I can identify the right product before clicking.

#### Acceptance Criteria

1. THE Product_Suggestions section SHALL display each product card with a square image, product name (max 2 lines), and formatted price
2. WHEN the user clicks a product suggestion card, THE Search_Tool SHALL navigate to that product's detail page at /product/[id]
3. WHEN the user clicks a product suggestion card, THE Search_Tool SHALL close the modal after navigation

### Requirement 7: View All Results Footer

**User Story:** As a user, I want to view all search results on a dedicated page, so that I can browse more products matching my query.

#### Acceptance Criteria

1. WHEN the query is non-empty, THE View_All_Footer SHALL display the text "Xem tất cả kết quả cho '[query]'" with an ArrowRight icon
2. WHEN the query is empty, THE View_All_Footer SHALL NOT be visible
3. WHEN the user clicks the View_All_Footer, THE Search_Tool SHALL navigate to /search?q=[encoded_query] and close the modal

### Requirement 8: Keyboard Navigation

**User Story:** As a user, I want to use keyboard shortcuts to interact with the search modal, so that I can search efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the user presses the Escape key while the Search_Tool is open, THE Search_Tool SHALL close the modal regardless of current input value
2. WHEN the user presses Enter with a non-empty query, THE Search_Tool SHALL navigate to the search results page at /search?q=[encoded_query]
3. WHEN the user presses Enter with an empty query, THE Search_Tool SHALL NOT perform any navigation

### Requirement 9: Backdrop Interaction

**User Story:** As a user, I want to close the search modal by clicking outside it, so that I can quickly return to browsing.

#### Acceptance Criteria

1. WHEN the user clicks the Backdrop area outside the modal panel, THE Search_Tool SHALL close the modal
2. THE Backdrop SHALL render as a semi-transparent overlay covering the full viewport

### Requirement 10: Error Handling

**User Story:** As a user, I want the search tool to handle edge cases gracefully, so that I never encounter a broken interface.

#### Acceptance Criteria

1. WHEN the products array is empty, THE Search_Tool SHALL remain functional with the search input and popular tags still operational
2. IF a product image fails to load, THEN THE Product_Suggestions SHALL display a fallback placeholder while keeping the card clickable
3. WHEN the user inputs special characters or extremely long text, THE Normalization function SHALL handle the input without errors
