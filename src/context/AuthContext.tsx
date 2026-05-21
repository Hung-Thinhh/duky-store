"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  loginWithEmail,
  register as registerApi,
  googleLogin as googleLoginApi,
  refreshToken as refreshTokenApi,
  logout as logoutApi,
  CustomerProfile,
} from "@/lib/auth-api";

// ─── localStorage keys ───────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "duky_access_token";
const REFRESH_TOKEN_KEY = "duky_refresh_token";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  customer: CustomerProfile | null;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload without a library.
 * Splits the token into parts, base64url-decodes the payload, and parses JSON.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT access token is expired by decoding its payload
 * and comparing the `exp` claim against the current time.
 * Returns true if expired or if the token cannot be decoded.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  // Add a small buffer (5 seconds) to account for clock skew
  return payload.exp < Date.now() / 1000 + 5;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

  // ─── Initialize auth state on mount ──────────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initializeAuth() {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      // No tokens at all — unauthenticated
      if (!accessToken && !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      // Access token exists and is not expired — restore state
      if (accessToken && !isTokenExpired(accessToken)) {
        const payload = decodeJwtPayload(accessToken);
        if (payload && payload.customer) {
          setCustomer(payload.customer as CustomerProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        // If payload doesn't contain customer info, try refresh to get profile
      }

      // Access token expired or missing but refresh token exists — attempt refresh
      if (storedRefreshToken) {
        try {
          const response = await refreshTokenApi(storedRefreshToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          setCustomer(response.customer);
          setIsAuthenticated(true);
        } catch {
          // Refresh failed — clear everything
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          setCustomer(null);
          setIsAuthenticated(false);
        }
      } else {
        // No refresh token — clear stale access token
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }

      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  // ─── Actions ─────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginWithEmail(email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    setCustomer(response.customer);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(
    async (email: string, password: string, passwordConfirmation: string) => {
      const response = await registerApi(email, password, passwordConfirmation);
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      setCustomer(response.customer);
      setIsAuthenticated(true);
    },
    []
  );

  const googleLogin = useCallback(async (idToken: string) => {
    const response = await googleLoginApi(idToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    setCustomer(response.customer);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    // Always clear local state regardless of API call result
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setCustomer(null);
    setIsAuthenticated(false);

    // Call logout API but ignore errors (Requirements 5.3, 5.4)
    if (storedRefreshToken) {
      try {
        await logoutApi(storedRefreshToken);
      } catch {
        // Ignore errors — local state is already cleared
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await refreshTokenApi(storedRefreshToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    setCustomer(response.customer);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        customer,
        login,
        register,
        googleLogin,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
