# Requirements Document

## Introduction

This feature implements a complete end-to-end checkout and order management flow for the Duky Store storefront. It covers the checkout submission process (form validation, API call, error handling), post-checkout cart clearing and success page with real order data, and connecting the user's order history and order detail pages to the backend API. The backend already exposes `POST /checkout` and `GET /orders/:code?phone=` endpoints; this feature focuses on the frontend integration and user experience.

## Glossary

- **Checkout_System**: The frontend module responsible for collecting customer information, validating inputs, calling the checkout API, and handling the response
- **Cart_Context**: The React context that manages cart state (items, session ID, add/remove/clear operations) across the application
- **Success_Page**: The page displayed after a successful checkout, showing order confirmation details
- **Order_History_Page**: The user account page that displays a list of the customer's past orders
- **Order_Detail_Page**: The user account page that displays full details of a single order
- **Order_Lookup_API**: The backend endpoint `GET /orders/:code?phone=<customerPhone>` that returns order details
- **Checkout_API**: The backend endpoint `POST /checkout` that validates cart contents, deducts inventory, and creates an order
- **Session_ID**: A UUID stored in localStorage that identifies the guest cart session

## Requirements

### Requirement 1: Checkout Form Validation

**User Story:** As a customer, I want the checkout form to validate my inputs before submission, so that I receive immediate feedback on errors without waiting for a server response.

#### Acceptance Criteria

1. WHEN the customer submits the checkout form with an empty full name field, THE Checkout_System SHALL display an inline error message indicating the full name is required
2. WHEN the customer submits the checkout form with a phone number shorter than 8 characters or longer than 20 characters, THE Checkout_System SHALL display an inline error message indicating the phone number format is invalid
3. WHEN the customer submits the checkout form without selecting province, district, or ward, THE Checkout_System SHALL display an inline error message indicating the address selection is incomplete
4. WHEN the customer submits the checkout form with an address line shorter than 5 characters, THE Checkout_System SHALL display an inline error message indicating the address is too short
5. WHEN all required fields pass validation, THE Checkout_System SHALL enable the submit button and proceed with the API call

### Requirement 2: Checkout API Integration

**User Story:** As a customer, I want to place an order by submitting my checkout information, so that my cart items are converted into a confirmed order.

#### Acceptance Criteria

1. WHEN the customer submits a valid checkout form, THE Checkout_System SHALL send a POST request to the Checkout_API with sessionId, customerName, customerPhone, customerEmail, paymentMethod, addressLine, ward, district, province, country, and customerNote fields
2. WHEN the Checkout_API returns a successful response (EC: 0), THE Checkout_System SHALL extract the order code, creation date, and payment method from the response
3. WHEN the Checkout_API returns a successful response, THE Checkout_System SHALL redirect the customer to the Success_Page with orderCode, orderDate, and payment method as URL parameters
4. WHILE the checkout request is in progress, THE Checkout_System SHALL display a loading state on the submit button and prevent duplicate submissions

### Requirement 3: Checkout Error Handling

**User Story:** As a customer, I want to see clear error messages when checkout fails, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. IF the Checkout_API returns an error indicating the cart is empty, THEN THE Checkout_System SHALL display a message informing the customer that the cart is empty and provide a link to continue shopping
2. IF the Checkout_API returns an error indicating a product is out of stock, THEN THE Checkout_System SHALL display a message identifying which product is unavailable
3. IF the Checkout_API returns an error indicating a variant is inactive, THEN THE Checkout_System SHALL display a message informing the customer that the selected variant is no longer available
4. IF the Checkout_API returns a network error or timeout, THEN THE Checkout_System SHALL display a generic error message and allow the customer to retry
5. IF the Checkout_API returns a validation error (400), THEN THE Checkout_System SHALL display the error message from the API response

### Requirement 4: Post-Checkout Cart Clearing

**User Story:** As a customer, I want my cart to be cleared after a successful checkout, so that I start fresh for my next shopping session.

#### Acceptance Criteria

1. WHEN the Checkout_API returns a successful response, THE Cart_Context SHALL clear all cart items from the local state
2. WHEN the Checkout_API returns a successful response, THE Cart_Context SHALL generate a new Session_ID and store it in localStorage
3. WHEN the customer navigates to the cart page after a successful checkout, THE Cart_Context SHALL display an empty cart

### Requirement 5: Success Page with Real Order Data

**User Story:** As a customer, I want to see my actual order details on the success page, so that I can confirm my order was placed correctly.

#### Acceptance Criteria

1. WHEN the Success_Page loads with an orderCode URL parameter, THE Success_Page SHALL display the order code prominently with a copy-to-clipboard button
2. WHEN the Success_Page loads with an orderDate URL parameter, THE Success_Page SHALL display the formatted order date
3. WHEN the Success_Page loads with a payment URL parameter, THE Success_Page SHALL display the corresponding payment method label (COD or bank transfer)
4. THE Success_Page SHALL provide a button linking to the Order_History_Page
5. THE Success_Page SHALL provide a button linking to the shop to continue shopping

### Requirement 6: Order History Page Integration

**User Story:** As a logged-in customer, I want to view my past orders in my account dashboard, so that I can track my purchases.

#### Acceptance Criteria

1. WHEN the customer navigates to the Order_History_Page, THE Order_History_Page SHALL call the Order_Lookup_API using the customer's phone number and display real order data instead of mock data
2. WHEN the Order_History_Page receives order data, THE Order_History_Page SHALL display each order with its code, date, status, item count, and grand total
3. WHEN the customer clicks a status filter tab, THE Order_History_Page SHALL filter the displayed orders by the selected status
4. WHEN the customer searches by order code, THE Order_History_Page SHALL filter the displayed orders to match the search query
5. IF the Order_Lookup_API returns no orders, THEN THE Order_History_Page SHALL display an empty state message with a link to continue shopping
6. IF the Order_Lookup_API returns an error, THEN THE Order_History_Page SHALL display an error message and offer a retry option

### Requirement 7: Order Detail Page Integration

**User Story:** As a logged-in customer, I want to view the full details of a specific order, so that I can see the products, shipping address, payment info, and status timeline.

#### Acceptance Criteria

1. WHEN the customer navigates to the Order_Detail_Page, THE Order_Detail_Page SHALL call the Order_Lookup_API with the order code and customer phone number
2. WHEN the Order_Detail_Page receives order data, THE Order_Detail_Page SHALL display the order status, payment method, shipping method, and grand total in an info card
3. WHEN the Order_Detail_Page receives order data, THE Order_Detail_Page SHALL display each order item with product name, SKU, variant info, quantity, unit price, and line total
4. WHEN the Order_Detail_Page receives order data with status histories, THE Order_Detail_Page SHALL display a timeline showing each status change with its date
5. WHEN the Order_Detail_Page receives order data with a shipping address, THE Order_Detail_Page SHALL display the full shipping address
6. IF the Order_Lookup_API returns an error for the order detail, THEN THE Order_Detail_Page SHALL display an error message and provide a link back to the Order_History_Page

### Requirement 8: Quick Buy Checkout Flow

**User Story:** As a customer using the quick buy feature, I want the checkout to work with the quick buy product added to my cart, so that I can complete a purchase without manually adding items to the cart first.

#### Acceptance Criteria

1. WHEN the customer arrives at the checkout page via quick buy (with quickBuy=true URL parameter), THE Checkout_System SHALL add the quick buy product to the cart via the Cart API before displaying the checkout form
2. WHEN the quick buy product is successfully added to the cart, THE Checkout_System SHALL proceed with the standard checkout flow using the cart session
3. IF the quick buy product cannot be added to the cart (out of stock or inactive), THEN THE Checkout_System SHALL display an error message and provide a link back to the product page
