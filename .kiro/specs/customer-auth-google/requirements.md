# Requirements Document

## Introduction

This feature implements customer authentication for the Duky Store storefront, enabling customers to register and log in using email/password or Google OAuth. After authentication, the header user icon displays the customer's Google avatar, providing a personalized shopping experience. The backend (NestJS + Prisma) already has a `customer-auth` module with Google OAuth verification and JWT token management. The frontend (Next.js) has existing Login and SignUp page templates that need to be wired to the backend API.

## Glossary

- **Customer_Auth_Service**: The backend NestJS service (`CustomerAuthService`) responsible for authenticating customers, issuing JWT tokens, and managing refresh tokens
- **Auth_Context**: The frontend React context that manages customer authentication state (tokens, user profile) across the application
- **Google_Identity_Services**: Google's client-side JavaScript library (GSI) used to initiate the OAuth consent flow and obtain an ID token
- **Access_Token**: A short-lived JWT (15 minutes) used to authenticate API requests from the frontend
- **Refresh_Token**: A long-lived opaque token (7 days) used to obtain new access tokens without re-authentication
- **Customer_Profile**: The authenticated customer's data including id, email, fullName, phone, status, type, and emailVerifiedAt
- **Header_Component**: The frontend header navigation bar that displays the user icon or avatar
- **ID_Token**: A JWT issued by Google containing the user's identity claims (email, name, picture)

## Requirements

### Requirement 1: Customer Registration with Email and Password

**User Story:** As a new customer, I want to create an account with my email and password, so that I can track orders and manage my profile.

#### Acceptance Criteria

1. WHEN a customer submits a valid email and password, THE Customer_Auth_Service SHALL create a new customer record with status ACTIVE and type NEW, and return an Access_Token and Refresh_Token pair along with the customer profile
2. WHEN a customer submits an email that already exists in the system (case-insensitive comparison), THE Customer_Auth_Service SHALL return an error indicating the email is already registered without revealing whether the account was created via email or Google
3. IF the password contains fewer than 8 characters or more than 72 characters, THEN THE Customer_Auth_Service SHALL return a validation error indicating the password length requirement
4. THE Customer_Auth_Service SHALL store the password as a bcrypt hash with a cost factor of at least 10
5. IF the email format is invalid according to RFC 5322 basic syntax, THEN THE Customer_Auth_Service SHALL return a validation error indicating the email format is not accepted
6. THE Customer_Auth_Service SHALL normalize the submitted email to lowercase before storing and before duplicate checking
7. IF the password and password confirmation fields do not match, THEN THE Customer_Auth_Service SHALL return a validation error indicating the passwords do not match

### Requirement 2: Customer Login with Email and Password

**User Story:** As a returning customer, I want to log in with my email and password, so that I can access my account and continue shopping.

#### Acceptance Criteria

1. WHEN a customer submits a valid email address and password, THE Customer_Auth_Service SHALL verify the password against the stored hash and return an Access_Token (expiry configurable, default 15 minutes), a Refresh_Token (expiry configurable, default 7 days), and the Customer_Profile object containing id, email, fullName, phone, status, and type
2. IF the submitted email is not a valid email format or the password is fewer than 8 characters, THEN THE Customer_Auth_Service SHALL return a validation error listing each violated constraint without attempting authentication
3. IF the email does not exist in the system or the password does not match the stored hash, THEN THE Customer_Auth_Service SHALL return an identical unauthorized error for both cases to prevent email enumeration
4. IF the customer account status is BLOCKED, THEN THE Customer_Auth_Service SHALL return a forbidden error indicating the account is blocked
5. THE Customer_Auth_Service SHALL perform email matching in a case-insensitive manner by normalizing the submitted email to lowercase before lookup
6. IF a customer fails authentication 5 consecutive times for the same email within a 15-minute window, THEN THE Customer_Auth_Service SHALL reject further login attempts for that email for 15 minutes and return an error indicating too many failed attempts

### Requirement 3: Customer Login with Google OAuth

**User Story:** As a customer, I want to log in using my Google account, so that I can access the store without creating a separate password.

#### Acceptance Criteria

1. WHEN a customer provides a valid Google ID_Token, THE Customer_Auth_Service SHALL verify the token against Google's token endpoint and return an Access_Token (default expiry 15 minutes) and Refresh_Token (default expiry 7 days) pair along with the customer profile
2. WHEN the Google account email does not exist in the system, THE Customer_Auth_Service SHALL create a new customer record using the Google profile name (falling back to the email local-part if the name is empty) and email, with status ACTIVE and email marked as verified
3. WHEN the Google account email already exists in the system and the customer status is ACTIVE, THE Customer_Auth_Service SHALL log in the existing customer without modifying the account details
4. IF the Google ID_Token is invalid or expired, THEN THE Customer_Auth_Service SHALL return an unauthorized error indicating the token is not valid
5. IF the Google ID_Token audience does not match any of the configured allowed Google client IDs (GOOGLE_CUSTOMER_CLIENT_IDS, GOOGLE_CLIENT_IDS, or GOOGLE_CLIENT_ID), THEN THE Customer_Auth_Service SHALL return an unauthorized error indicating audience mismatch
6. WHEN a customer authenticates via Google, THE Customer_Auth_Service SHALL set the emailVerifiedAt timestamp on the customer record if it has not been set previously
7. IF the Google account email exists in the system but the customer status is BLOCKED, THEN THE Customer_Auth_Service SHALL return a forbidden error indicating the account is blocked
8. IF the Google account email is not verified on Google's side, THEN THE Customer_Auth_Service SHALL return an unauthorized error indicating the Google email is not verified

### Requirement 4: Token Refresh

**User Story:** As an authenticated customer, I want my session to remain active without re-entering credentials, so that I have a seamless shopping experience.

#### Acceptance Criteria

1. WHEN a Refresh_Token that exists in the system, has not been revoked, and has not expired is provided, THE Customer_Auth_Service SHALL revoke the old Refresh_Token and issue a new Access_Token and Refresh_Token pair along with the Customer_Profile in the response
2. IF the Refresh_Token has been revoked, THEN THE Customer_Auth_Service SHALL revoke all Refresh_Tokens for that customer and return an unauthorized error
3. IF the Refresh_Token has expired, THEN THE Customer_Auth_Service SHALL return an unauthorized error
4. THE Customer_Auth_Service SHALL set Access_Token expiration to 15 minutes
5. THE Customer_Auth_Service SHALL set Refresh_Token expiration to 7 days
6. IF the Refresh_Token does not match any record in the system, THEN THE Customer_Auth_Service SHALL return an unauthorized error

### Requirement 5: Customer Logout

**User Story:** As an authenticated customer, I want to log out of my account, so that my session is terminated securely.

#### Acceptance Criteria

1. WHEN a customer submits a logout request with a valid Refresh_Token, THE Customer_Auth_Service SHALL revoke the Refresh_Token and return a response with a success field set to true
2. IF the provided Refresh_Token is invalid, already revoked, or expired, THEN THE Customer_Auth_Service SHALL still return a success response without raising an error
3. WHEN the backend logout call succeeds, THE Auth_Context SHALL clear the Access_Token, Refresh_Token, and Customer_Profile from browser storage and reset the authentication state to unauthenticated
4. IF the backend logout call fails due to a network error or non-success response, THEN THE Auth_Context SHALL still clear all local tokens and Customer_Profile from browser storage and reset the authentication state to unauthenticated

### Requirement 6: Frontend Authentication State Management

**User Story:** As a customer, I want my login state to persist across page navigations, so that I do not need to log in again on every page.

#### Acceptance Criteria

1. THE Auth_Context SHALL store the Access_Token and Refresh_Token in localStorage, and the Customer_Profile (id, email, fullName, phone, status, type) in memory state
2. WHEN the application loads and tokens exist in localStorage, THE Auth_Context SHALL validate the Access_Token expiration claim and restore the authenticated state if the token has not expired
3. IF the application loads and the stored Access_Token has expired but a Refresh_Token exists, THEN THE Auth_Context SHALL attempt a token refresh before setting the authenticated state
4. WHEN an API request receives a 401 Unauthorized response and a valid Refresh_Token exists, THE Auth_Context SHALL automatically call the refresh endpoint to obtain a new Access_Token and Refresh_Token pair, then retry the failed request exactly once
5. WHILE a token refresh request is in progress, THE Auth_Context SHALL queue any concurrent API requests and resolve them with the new Access_Token once the refresh completes, rather than triggering multiple refresh calls
6. IF the token refresh fails due to an invalid or expired Refresh_Token or a network error, THEN THE Auth_Context SHALL clear all stored tokens and Customer_Profile from localStorage and memory, and redirect the customer to the login page
7. THE Auth_Context SHALL provide the authentication state (authenticated or unauthenticated), Customer_Profile, and actions (login, logout, refresh) to all child components via React Context

### Requirement 7: Google Sign-In Button Integration

**User Story:** As a customer, I want to click the Google button on the login or signup page, so that I can authenticate with my Google account.

#### Acceptance Criteria

1. WHEN a customer clicks the Google sign-in button, THE Google_Identity_Services SHALL display the Google account chooser popup and THE Auth_Context SHALL disable the Google sign-in button until the popup flow completes or is dismissed
2. WHEN the customer selects a Google account and grants consent, THE Google_Identity_Services SHALL return an ID_Token to the frontend
3. WHEN the frontend receives the Google ID_Token, THE Auth_Context SHALL send the ID_Token to the Customer_Auth_Service google endpoint (`POST /api/v1/customer/auth/google`)
4. WHEN the Google login API call returns EC equal to 0, THE Auth_Context SHALL store the accessToken and refreshToken in client storage and store the Customer_Profile and redirect the customer to the homepage
5. IF the Google sign-in popup is closed without selecting an account, THEN THE Auth_Context SHALL remain in the unauthenticated state and re-enable the Google sign-in button without displaying an error
6. IF the Google login API call returns EC not equal to 0 or a network error occurs, THEN THE Auth_Context SHALL remain in the unauthenticated state, re-enable the Google sign-in button, and display an error message indicating that Google sign-in failed

### Requirement 8: Header Avatar Display

**User Story:** As an authenticated customer, I want to see my Google avatar in the header instead of the generic user icon, so that I know I am logged in.

#### Acceptance Criteria

1. WHILE the customer is authenticated, THE Header_Component SHALL display the customer's Google avatar image as a circular thumbnail of 32×32 pixels (desktop) or 28×28 pixels (mobile) in place of the generic User icon
2. WHILE the customer is not authenticated, THE Header_Component SHALL display the generic User icon linking to the login page
3. WHEN the customer clicks the avatar image, THE Header_Component SHALL navigate to the customer account page
4. IF the customer's avatar image fails to load within 3 seconds or returns an error, THEN THE Header_Component SHALL display a circular fallback containing the first character of the customer's full name, rendered as an uppercase letter on a neutral background
5. THE Header_Component SHALL render the avatar image with alt text containing the customer's full name to support screen readers

### Requirement 9: Get Current Customer Profile

**User Story:** As an authenticated customer, I want to retrieve my profile information, so that the application can display my details.

#### Acceptance Criteria

1. WHEN an authenticated customer calls the profile endpoint, THE Customer_Auth_Service SHALL return the Customer_Profile containing only the fields: id, email, fullName, phone, status, type, and emailVerifiedAt, excluding sensitive fields such as passwordHash and deletedAt
2. IF the Access_Token is missing, expired, or fails signature validation, THEN THE Customer_Auth_Service SHALL return an unauthorized error and SHALL NOT return any profile data
3. IF the customer account has been soft-deleted (deletedAt is not null), THEN THE Customer_Auth_Service SHALL return an unauthorized error indicating the account is not active
4. IF the customer account status is BLOCKED, THEN THE Customer_Auth_Service SHALL return an unauthorized error indicating the account is not active
