import { refreshToken as refreshTokenApi } from "./auth-api";

// ─── localStorage keys ───────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "duky_access_token";
const REFRESH_TOKEN_KEY = "duky_refresh_token";
const CUSTOMER_KEY = "duky_customer";

// ─── Refresh state (module-level singleton) ──────────────────────────────────
let refreshPromise: Promise<string> | null = null;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Uses promise deduplication so only one refresh request is in-flight at a time.
 * Concurrent callers receive the same promise.
 */
function performTokenRefresh(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await refreshTokenApi(storedRefreshToken);

      // Update tokens in localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(response.customer));

      return response.accessToken;
    } catch {
      // Refresh failed — clear all tokens and redirect
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_KEY);
      window.location.href = "/login";
      throw new Error("Token refresh failed");
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Authenticated fetch wrapper — a drop-in replacement for native `fetch`.
 *
 * - Attaches `Authorization: Bearer <accessToken>` header from localStorage
 * - On 401 response: attempts token refresh (single in-flight via promise deduplication)
 * - Queues concurrent requests during refresh, resolves all with new token
 * - Retries the original failed request exactly once with the new access token
 * - On refresh failure: clears all tokens from localStorage, redirects to `/login`
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  // Build headers with Authorization
  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(input, { ...init, headers });

  // If not 401, return the response as-is
  if (response.status !== 401) {
    return response;
  }

  // 401 received — attempt token refresh
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) {
    // No refresh token available — clear and redirect
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    window.location.href = "/login";
    return response;
  }

  try {
    // This deduplicates: concurrent 401s share the same refresh promise
    const newAccessToken = await performTokenRefresh();

    // Retry the original request exactly once with the new token
    const retryHeaders = new Headers(init?.headers);
    retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

    return fetch(input, { ...init, headers: retryHeaders });
  } catch {
    // Refresh failed — performTokenRefresh already handles cleanup and redirect
    return response;
  }
}
