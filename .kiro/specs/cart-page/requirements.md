# Requirements Document

## Introduction

Trang Giỏ hàng (Cart Page) là trang hiển thị đầy đủ danh sách sản phẩm trong giỏ hàng của người dùng tại route `/cart`. Trang cho phép người dùng xem, chọn, cập nhật số lượng, xóa sản phẩm, xem tóm tắt đơn hàng, và tiến hành thanh toán. Trang cũng hiển thị gợi ý sản phẩm liên quan và các cam kết của cửa hàng.

## Glossary

- **Cart_Page**: Trang giỏ hàng tại route `/cart`, hiển thị toàn bộ sản phẩm trong giỏ
- **Cart_Item**: Một dòng sản phẩm trong giỏ hàng, bao gồm hình ảnh, tên, biến thể, số lượng, giá
- **Cart_Context**: React Context quản lý state giỏ hàng (CartContext.tsx)
- **Order_Summary**: Sidebar tóm tắt đơn hàng hiển thị tạm tính, phí giao hàng, tổng tiền
- **Quantity_Selector**: Bộ điều chỉnh số lượng sản phẩm với nút tăng/giảm
- **Select_All_Checkbox**: Checkbox chọn tất cả sản phẩm trong giỏ hàng
- **Item_Checkbox**: Checkbox chọn từng sản phẩm riêng lẻ
- **Delete_Selected_Button**: Nút xóa tất cả sản phẩm đã được chọn
- **Recommend_Section**: Carousel gợi ý sản phẩm "Bạn có thể thích"
- **Trust_Badges**: Phần hiển thị các cam kết của Duky Store (miễn phí giao hàng, đổi trả, hỗ trợ 24/7)
- **Payment_Methods_Display**: Phần hiển thị các phương thức thanh toán được hỗ trợ (COD, chuyển khoản, thẻ)

## Requirements

### Requirement 1: Display Cart Page Header

**User Story:** As a customer, I want to see the cart page title with item count, so that I know how many items are in my cart.

#### Acceptance Criteria

1. WHEN the Cart_Page loads, THE Cart_Page SHALL display the title "Giỏ hàng của bạn" followed by the total quantity of all items (sum of individual item quantities) in parentheses, formatted as "(N)" where N is the numeric count.
2. WHEN the cart item count changes, THE Cart_Page SHALL update the displayed count in the title within 500 milliseconds of the state change without requiring a page reload.
3. IF the cart contains zero items, THEN THE Cart_Page SHALL display the title "Giỏ hàng của bạn (0)".
4. THE Cart_Page SHALL display a breadcrumb navigation with the items "Trang chủ" linking to the home page and "Giỏ hàng" as the current page, separated by a "/" delimiter.

### Requirement 2: Display Cart Items List

**User Story:** As a customer, I want to see all products in my cart with their details, so that I can review my selections before checkout.

#### Acceptance Criteria

1. THE Cart_Page SHALL display each Cart_Item with product image, product name, color variant (if selected), size variant (if selected), unit price, quantity, and line total calculated as unit price multiplied by quantity
2. WHEN the cart contains items, THE Cart_Page SHALL render each Cart_Item as a row with a thumbnail image of 80x80 pixels, ordered from most recently added at the top to earliest added at the bottom
3. IF the cart is empty, THEN THE Cart_Page SHALL display an empty state with a message "Giỏ hàng của bạn đang trống" and a "Tiếp tục mua sắm" link navigating to `/collections`
4. IF a Cart_Item has no color variant or no size variant selected, THEN THE Cart_Page SHALL omit the corresponding variant label from that Cart_Item row rather than displaying a blank or placeholder value

### Requirement 3: Select and Bulk Delete Items

**User Story:** As a customer, I want to select multiple items and delete them at once, so that I can quickly manage my cart.

#### Acceptance Criteria

1. THE Cart_Page SHALL display an Item_Checkbox next to each Cart_Item for individual selection
2. THE Cart_Page SHALL display a Select_All_Checkbox labeled "Chọn tất cả" that toggles selection of all items
3. WHEN the Select_All_Checkbox is checked, THE Cart_Page SHALL mark all Item_Checkboxes as checked
4. WHEN the Select_All_Checkbox is unchecked, THE Cart_Page SHALL mark all Item_Checkboxes as unchecked
5. WHEN all Item_Checkboxes are individually checked, THE Cart_Page SHALL mark the Select_All_Checkbox as checked
6. WHEN any Item_Checkbox is unchecked while all others are checked, THE Cart_Page SHALL mark the Select_All_Checkbox as unchecked
7. WHEN the user clicks the Delete_Selected_Button labeled "Xóa đã chọn" while one or more items are selected, THE Cart_Page SHALL remove all selected items from the cart, deselect all Item_Checkboxes, and display an Undo_Toast for 5 seconds allowing the user to restore the deleted items
8. WHILE no items are selected, THE Cart_Page SHALL display the Delete_Selected_Button in a disabled state with reduced opacity and SHALL prevent the button from triggering any delete action
9. IF the bulk delete operation fails, THEN THE Cart_Page SHALL restore all selected items to their previous state and display an error message indicating the deletion was unsuccessful
10. WHEN all Cart_Items are removed via bulk delete and no items remain, THE Cart_Page SHALL display the empty cart state

### Requirement 4: Update Item Quantity

**User Story:** As a customer, I want to increase or decrease the quantity of items in my cart, so that I can adjust my order.

#### Acceptance Criteria

1. THE Quantity_Selector SHALL display a minus button, the current quantity value, and a plus button for each Cart_Item
2. WHEN the plus button is clicked and the current quantity is below the maximum allowed quantity (the lesser of 99 or available stock), THE Quantity_Selector SHALL increase the item quantity by 1
3. WHEN the minus button is clicked and the current quantity is greater than 1, THE Quantity_Selector SHALL decrease the item quantity by 1
4. WHILE the item quantity equals 1, THE Quantity_Selector SHALL display the minus button in a disabled state with reduced opacity and SHALL NOT respond to click events on the minus button
5. WHILE the item quantity equals the maximum allowed quantity (the lesser of 99 or available stock), THE Quantity_Selector SHALL display the plus button in a disabled state with reduced opacity and SHALL NOT respond to click events on the plus button
6. WHEN the quantity changes, THE Cart_Page SHALL update the line total and Order_Summary totals within 100 milliseconds using optimistic rendering
7. IF the server-side quantity update fails, THEN THE Cart_Page SHALL revert the quantity and totals to their previous values and SHALL display an error message indicating the update could not be completed

### Requirement 5: Remove Individual Item

**User Story:** As a customer, I want to remove a single item from my cart, so that I can discard products I no longer want.

#### Acceptance Criteria

1. THE Cart_Page SHALL display a delete icon (trash) for each Cart_Item
2. WHEN the delete icon is clicked, THE Cart_Page SHALL remove the corresponding Cart_Item from the cart list within 1 second using an optimistic update and SHALL display an undo notification for 5 seconds allowing the user to restore the removed item
3. WHEN an item is removed, THE Cart_Page SHALL update the cart item count in the header badge and recalculate the Order_Summary subtotal and total to reflect the remaining items
4. IF the user activates the undo action within the 5-second window, THEN THE Cart_Page SHALL restore the removed Cart_Item to its original position with its previous quantity preserved
5. IF the removal fails on the server for a logged-in user, THEN THE Cart_Page SHALL revert the Cart_Item back into the cart list and display an error notification indicating the removal was unsuccessful
6. WHEN the last Cart_Item is removed from the cart, THE Cart_Page SHALL display the empty cart state with a prompt to continue shopping

### Requirement 6: Display Order Summary Sidebar

**User Story:** As a customer, I want to see a summary of my order with subtotal, shipping, and total, so that I can understand the cost before checkout.

#### Acceptance Criteria

1. THE Order_Summary SHALL display "Tạm tính" (subtotal) as the sum of all cart item line totals, where each line total equals item unit price multiplied by item quantity, formatted in VNĐ currency notation
2. IF free shipping applies (order subtotal meets the configured free-shipping threshold OR a FREE_SHIP coupon is active), THEN THE Order_Summary SHALL display "Phí giao hàng" (shipping fee) with the text value "Miễn phí"
3. THE Order_Summary SHALL display "Tổng tiền" (total) calculated as subtotal plus shipping fee minus any applicable discount, formatted in VNĐ currency notation
4. IF free shipping applies, THEN THE Order_Summary SHALL display a badge adjacent to the shipping fee row indicating the free shipping benefit
5. WHILE the viewport width is 1024px or greater, THE Order_Summary SHALL remain fixed in view during vertical scrolling so that it does not leave the visible area
6. WHEN the cart is empty, THE Order_Summary SHALL display "0" formatted in VNĐ currency notation for both the subtotal and total values, and display a message indicating the cart is empty with a link to continue shopping

### Requirement 7: Checkout and Continue Shopping Actions

**User Story:** As a customer, I want clear actions to proceed to checkout or continue shopping, so that I can navigate easily.

#### Acceptance Criteria

1. THE Order_Summary SHALL display a primary button labeled "TIẾN HÀNH THANH TOÁN" that navigates to the `/checkout` route
2. THE Order_Summary SHALL display a secondary button labeled "TIẾP TỤC MUA HÀNG" that navigates to the `/collections` route
3. IF the cart is empty, THEN THE "TIẾN HÀNH THANH TOÁN" button SHALL appear visually disabled and SHALL NOT navigate to the `/checkout` route when clicked
4. IF the cart contains items that are no longer available for purchase, THEN THE "TIẾN HÀNH THANH TOÁN" button SHALL appear visually disabled and SHALL NOT navigate to the `/checkout` route when clicked
5. IF the user is not authenticated AND clicks the "TIẾN HÀNH THANH TOÁN" button, THEN THE Order_Summary SHALL redirect the user to the login page with a callback URL that returns the user to `/checkout` after successful authentication

### Requirement 8: Display Payment Methods

**User Story:** As a customer, I want to see available payment methods, so that I know my options before proceeding to checkout.

#### Acceptance Criteria

1. WHILE the cart contains at least one item, THE Cart_Page SHALL display a "Phương thức thanh toán" section within the order summary sidebar listing all supported payment options.
2. THE Payment_Methods_Display SHALL show a recognizable icon and a text label for each of the following 6 payment methods: COD, bank transfer, Visa, MasterCard, JCB, and Momo.
3. THE Payment_Methods_Display SHALL render as a static, informational-only section with no selectable or interactive controls on the cart page.

### Requirement 9: Display Trust Badges

**User Story:** As a customer, I want to see store commitments and guarantees, so that I feel confident about my purchase.

#### Acceptance Criteria

1. THE Cart_Page SHALL display a Trust_Badges section below the order summary area with the heading "DUKY STORE cam kết"
2. THE Trust_Badges SHALL include exactly 3 badges with the labels: "Miễn phí giao hàng", "Đổi trả dễ dàng", and "Hỗ trợ 24/7"
3. THE Trust_Badges SHALL display a distinct icon and its corresponding text label for each badge, arranged in a horizontal row on viewports 768px and above and in a vertical stack on viewports below 768px
4. THE Trust_Badges section SHALL be visible without horizontal scrolling on viewports from 320px to 1280px wide

### Requirement 10: Display Product Recommendations

**User Story:** As a customer, I want to see product recommendations, so that I can discover additional items I might like.

#### Acceptance Criteria

1. THE Cart_Page SHALL display a Recommend_Section below the cart content with the title "Bạn có thể thích"
2. THE Recommend_Section SHALL display between 4 and 12 recommended products in a horizontally scrollable carousel
3. THE Recommend_Section SHALL reuse the existing ProductCard component for each recommended product, rendering the product image, name, and price
4. THE Recommend_Section SHALL reuse the existing RecommendSection component with the title prop set to "Bạn có thể thích"
5. IF no recommended products are available, THEN THE Cart_Page SHALL hide the Recommend_Section entirely

### Requirement 11: Responsive Layout

**User Story:** As a customer, I want the cart page to work well on both desktop and mobile devices, so that I can manage my cart from any device.

#### Acceptance Criteria

1. WHILE the viewport width is 1024px or greater, THE Cart_Page SHALL display a two-column layout with cart items on the left and Order_Summary on the right
2. WHILE the viewport width is less than 1024px, THE Cart_Page SHALL stack the cart items above the Order_Summary in a single column
3. WHILE the viewport width is less than 1024px, THE Cart_Page SHALL render all interactive elements (buttons, quantity selectors, links) with a minimum touch target size of 44×44px and all body text at a minimum size of 16px
4. THE Cart_Page SHALL prevent horizontal scrolling by constraining all content within the viewport width at every supported breakpoint
5. WHEN the viewport is resized across the 1024px breakpoint, THE Cart_Page SHALL transition between layouts without content overlap or loss of visible cart items

### Requirement 12: Integration with Existing Cart Context

**User Story:** As a developer, I want the cart page to use the existing CartContext, so that cart state is consistent across the application.

#### Acceptance Criteria

1. THE Cart_Page SHALL consume cart state from the existing Cart_Context by calling the useCart hook, accessing at minimum the cart array, cartCount, updateQuantity, removeFromCart, openCart, and closeCart properties
2. WHEN an item quantity is updated or an item is removed via the Cart_Page, THE Cart_Context SHALL update the cartCount displayed in the Header badge and the items displayed in the Cart_Drawer within the same render cycle
3. THE Cart_Page SHALL use the formatCurrency utility from @/lib/utils for all displayed monetary values including individual item totals and the cart subtotal
4. THE Cart_Page SHALL include the Header component (receiving cartCount and onCartClick props) and the Footer component as layout wrappers, matching the structure used by the checkout page
5. IF the cart array from Cart_Context is empty, THEN THE Cart_Page SHALL display an empty state message and a navigation link to continue shopping
