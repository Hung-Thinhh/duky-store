# Implementation Plan: Customer Authentication (Google + Email/Password)

## Overview

This plan implements customer registration and login (email/password + Google OAuth) across the NestJS backend and Next.js frontend. The backend already has Google OAuth login, token refresh, logout, and profile endpoints. We add email/password register and login endpoints with rate limiting. On the frontend, we build the auth API layer, AuthContext with token management, wire the existing Login/SignUp templates, integrate Google sign-in, and display the header avatar.

## Tasks

- [x] 1. Backend: Register and Login endpoints
  - [x] 1.1 Create RegisterDto and LoginDto
    - Create `src/modules/customer-auth/dto/register.dto.ts` with fields: email (IsEmail), password (IsString, MinLength 8, MaxLength 72), passwordConfirmation (IsString, MinLength 8, MaxLength 72)
    - Create `src/modules/customer-auth/dto/login.dto.ts` with fields: email (IsEmail), password (IsString, MinLength 8)
    - Use `class-validator` decorators for validation
    - _Requirements: 1.3, 1.5, 1.7, 2.2_

  - [x] 1.2 Implement register method in CustomerAuthService
    - Add `register(registerDto: RegisterDto, requestMeta: RequestMeta)` method
    - Validate passwordConfirmation matches password, throw BadRequestException if not
    - Normalize email to lowercase before duplicate check
    - Check if email already exists (case-insensitive), throw ConflictException with generic message "Email đã được đăng ký" (do not reveal account type)
    - Hash password with bcryptjs (cost factor 10)
    - Create customer record with status ACTIVE, type NEW
    - Call `issueTokenPair()` to return access/refresh tokens + customer profile
    - _Requirements: 1.1, 1.2, 1.4, 1.6_

  - [x] 1.3 Implement loginWithEmail method with rate limiting in CustomerAuthService
    - Add in-memory rate limit store: `Map<string, { count: number; firstAttemptAt: number; lockedUntil: number | null }>`
    - Add `checkRateLimit(email)`: if 5 failed attempts within 15 min, throw TooManyRequestsException
    - Add `recordFailedAttempt(email)`: increment counter, set firstAttemptAt on first attempt
    - Add `clearFailedAttempts(email)`: remove entry from map
    - Implement `loginWithEmail(loginDto: LoginDto, requestMeta: RequestMeta)`:
      - Normalize email to lowercase
      - Check rate limit before proceeding
      - Find customer by email; if not found, return identical unauthorized error
      - Compare password with bcrypt; if mismatch, record failed attempt, return identical unauthorized error
      - Check customer status; if BLOCKED, throw ForbiddenException
      - Clear failed attempts on success
      - Call `issueTokenPair()` to return tokens + profile
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

  - [x] 1.4 Add register and login endpoints to CustomerAuthController
    - Add `@Post('register')` endpoint calling `customerAuthService.register()`
    - Add `@Post('login')` endpoint calling `customerAuthService.loginWithEmail()`
    - Both endpoints extract `RequestMeta` from the request object
    - Add Swagger decorators (`@ApiOperation`, `@ApiBody`)
    - Wrap responses in the standard `{ EC, EM, DT }` envelope format
    - _Requirements: 1.1, 2.1_

  - [ ]\* 1.5 Write unit tests for register and loginWithEmail
    - Test valid registration returns tokens and customer profile
    - Test duplicate email returns error without revealing account type
    - Test password validation (too short, too long, mismatch)
    - Test valid login returns tokens
    - Test wrong password returns same error as non-existent email
    - Test blocked account returns forbidden
    - Test rate limiting after 5 failed attempts
    - _Requirements: 1.1–1.7, 2.1–2.6_

- [x] 2. Checkpoint - Backend endpoints complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Frontend: Auth API layer and AuthContext
  - [x] 3.1 Create auth-api.ts with all auth API functions
    - Create `src/lib/auth-api.ts`
    - Implement `loginWithEmail(email, password)`: POST to `/api/v1/customer/auth/login`
    - Implement `register(email, password, passwordConfirmation)`: POST to `/api/v1/customer/auth/register`
    - Implement `googleLogin(idToken)`: POST to `/api/v1/customer/auth/google`
    - Implement `refreshToken(refreshToken)`: POST to `/api/v1/customer/auth/refresh`
    - Implement `logout(refreshToken)`: POST to `/api/v1/customer/auth/logout`
    - Implement `getProfile(accessToken)`: GET `/api/v1/customer/auth/me` with Bearer header
    - All functions parse the `{ EC, EM, DT }` response envelope
    - Define `AuthResponse` and `CustomerProfile` TypeScript interfaces
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 9.1_

  - [x] 3.2 Create authFetch wrapper with 401 interception and token refresh queuing
    - Create `src/lib/auth-fetch.ts`
    - Attach `Authorization: Bearer <accessToken>` header from localStorage
    - On 401 response: attempt token refresh using stored refresh token
    - Use promise deduplication to ensure only one refresh request in-flight
    - Queue concurrent requests during refresh, resolve all with new token
    - Retry the original failed request exactly once with new access token
    - On refresh failure: clear all tokens from localStorage, redirect to `/login`
    - _Requirements: 6.4, 6.5, 6.6_

  - [x] 3.3 Create AuthContext with full state management
    - Create `src/context/AuthContext.tsx`
    - Define `AuthState`: `{ isAuthenticated, isLoading, customer }`
    - Define `AuthContextValue`: extends AuthState with `login`, `register`, `googleLogin`, `logout`, `refresh` actions
    - Store access/refresh tokens in localStorage with keys `duky_access_token` and `duky_refresh_token`
    - On app load: check localStorage for tokens, validate access token expiration, restore state or attempt refresh
    - Provide context value to all children via `AuthProvider`
    - Export `useAuth()` hook for consuming components
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

  - [ ]\* 3.4 Write unit tests for auth-api and AuthContext
    - Test auth-api functions make correct fetch calls with proper payloads
    - Test AuthContext state transitions (unauthenticated → authenticated → logout)
    - Test token refresh on expired access token
    - Test 401 interception queuing behavior
    - _Requirements: 6.1–6.7_

- [x] 4. Frontend: Wire Login and SignUp templates to API
  - [x] 4.1 Wire LoginTemplate to auth API
    - Add form state management (loading, error messages)
    - On form submit: call `auth.login(email, password)` from AuthContext
    - Display field-level validation errors from API response
    - Display rate limit error message when EC=6
    - Redirect to homepage on successful login
    - Disable submit button during loading
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x] 4.2 Wire SignUpTemplate to auth API
    - Add controlled state for email, password, passwordConfirmation fields
    - On form submit: call `auth.register(email, password, passwordConfirmation)` from AuthContext
    - Display field-level validation errors (email format, password length, mismatch)
    - Display duplicate email error
    - Redirect to homepage on successful registration
    - Disable submit button during loading
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7_

- [x] 5. Frontend: Google sign-in integration
  - [x] 5.1 Create GoogleLoginButton component
    - Create `src/components/shop/GoogleLoginButton.tsx`
    - Install and use `@react-oauth/google` package's `useGoogleLogin` hook
    - Render a button matching the existing Google button UI style from templates
    - On click: trigger Google popup flow, disable button until flow completes
    - On success: call `auth.googleLogin(idToken)` from AuthContext
    - On popup dismissed: re-enable button without error
    - On API error: re-enable button, display error message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 5.2 Integrate GoogleLoginButton into LoginTemplate and SignUpTemplate
    - Replace the static Google `<button>` in LoginTemplate with `<GoogleLoginButton />`
    - Replace the static Google `<button>` in SignUpTemplate with `<GoogleLoginButton />`
    - Ensure redirect to homepage on successful Google login
    - _Requirements: 7.3, 7.4_

- [x] 6. Frontend: Header avatar display
  - [x] 6.1 Update Header component with auth-aware avatar
    - Import and use `useAuth()` hook in Header
    - When authenticated: replace the `<User>` icon link with a circular avatar image (32×32 desktop, 28×28 mobile)
    - Use customer's Google avatar URL if available, otherwise show fallback
    - Fallback: circular div with first character of fullName (uppercase) on neutral background
    - Avatar links to `/user` page
    - Add `alt` attribute with customer's fullName for accessibility
    - Handle image load error with 3-second timeout → show fallback
    - When unauthenticated: keep existing `<User>` icon linking to `/login`
    - Apply same logic in mobile menu section
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7. Frontend: Update Providers with AuthProvider and GoogleOAuthProvider
  - [x] 7.1 Update Providers component
    - Install `@react-oauth/google` package
    - Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local` (placeholder value)
    - Wrap children with `GoogleOAuthProvider` (using env variable for clientId)
    - Wrap children with `AuthProvider` (from AuthContext)
    - Maintain existing `CartProvider` wrapping
    - Order: `GoogleOAuthProvider` → `AuthProvider` → `CartProvider`
    - _Requirements: 7.1, 6.7_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The backend already has Google OAuth, refresh, logout, and profile endpoints — only register and login are new
- The frontend uses native `fetch` (no axios) — the authFetch wrapper follows this pattern
- Token storage uses localStorage keys: `duky_access_token`, `duky_refresh_token`
- The standard API response envelope is `{ EC: number, EM: string, DT: T }`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "3.2"] },
    { "id": 2, "tasks": ["1.3", "3.3"] },
    { "id": 3, "tasks": ["1.4", "3.4", "7.1"] },
    { "id": 4, "tasks": ["1.5", "4.1", "4.2", "5.1"] },
    { "id": 5, "tasks": ["5.2", "6.1"] }
  ]
}
```
