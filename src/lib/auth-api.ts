const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// ─── Response envelope ───────────────────────────────────────────────────────
interface ApiResponse<T> {
  EC: number;
  EM: string;
  DT: T;
}

// ─── Auth types ──────────────────────────────────────────────────────────────
export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  status: "ACTIVE" | "BLOCKED";
  type: "NEW" | "REGULAR" | "VIP" | "WHOLESALE";
  emailVerifiedAt: string | null;
}

export interface AuthResponse {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  customer: CustomerProfile;
}

export interface AuthError {
  EC: number;
  EM: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
async function authApiFetch<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (json.EC !== 0) {
    const error: AuthError & Error = Object.assign(new Error(json.EM), {
      EC: json.EC,
      EM: json.EM,
    });
    throw error;
  }

  return json.DT;
}

// ─── Auth API functions ──────────────────────────────────────────────────────

/**
 * Login with email and password.
 * POST /api/v1/customer/auth/login
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  return authApiFetch<AuthResponse>("/customer/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register a new customer with email and password.
 * POST /api/v1/customer/auth/register
 */
export async function register(
  email: string,
  password: string,
  passwordConfirmation: string
): Promise<AuthResponse> {
  return authApiFetch<AuthResponse>("/customer/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, passwordConfirmation }),
  });
}

/**
 * Login or register with a Google ID token.
 * POST /api/v1/customer/auth/google
 */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  return authApiFetch<AuthResponse>("/customer/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
}

/**
 * Refresh the access token using a refresh token.
 * POST /api/v1/customer/auth/refresh
 */
export async function refreshToken(
  refreshTokenValue: string
): Promise<AuthResponse> {
  return authApiFetch<AuthResponse>("/customer/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

/**
 * Logout by revoking the refresh token.
 * POST /api/v1/customer/auth/logout
 */
export async function logout(
  refreshTokenValue: string
): Promise<{ success: boolean }> {
  return authApiFetch<{ success: boolean }>("/customer/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });
}

/**
 * Get the current authenticated customer's profile.
 * GET /api/v1/customer/auth/me
 */
export async function getProfile(accessToken: string): Promise<CustomerProfile> {
  return authApiFetch<CustomerProfile>("/customer/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
