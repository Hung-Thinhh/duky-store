"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  CartItemResponse,
  CartResponse,
  getCartAPI,
  addToCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
} from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ToastState {
  message: string;
  type: "success" | "error";
}

interface CartContextType {
  cart: CartItemResponse[];
  cartCount: number;
  isCartOpen: boolean;
  toast: ToastState | null;
  loading: boolean;
  addToCart: (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ) => Promise<void>;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
  showToast: (message: string, type: "success" | "error") => void;
  getSessionId: () => string;
}

const STORAGE_KEY = "duky_cart_session";

// ─── Context ─────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItemResponse[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionIdRef = useRef<string>("");
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Computed ────────────────────────────────────────────────────────────────
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // ─── Toast helpers ───────────────────────────────────────────────────────────
  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      // Clear any existing timer
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ message, type });
      // Auto-dismiss after 3 seconds
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 3000);
    },
    []
  );

  // ─── SessionId management ────────────────────────────────────────────────────
  const getSessionId = useCallback((): string => {
    return sessionIdRef.current;
  }, []);

  // ─── Clear cart ──────────────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCart([]);
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, newSessionId);
    sessionIdRef.current = newSessionId;
  }, []);

  // ─── Cart refresh ────────────────────────────────────────────────────────────
  const refreshCart = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    setLoading(true);
    try {
      const response: CartResponse = await getCartAPI(sid);
      setCart(response.items);
    } catch {
      // Silently fail on refresh — cart may not exist yet for new sessions
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Initialize sessionId and fetch cart on mount ────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    let sid = localStorage.getItem(STORAGE_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, sid);
    }
    sessionIdRef.current = sid;

    // Fetch cart on mount
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response: CartResponse = await getCartAPI(sid!);
        setCart(response.items);
      } catch {
        setCart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // ─── Cleanup toast timer on unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // ─── addToCart ───────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    async (
      productId: string,
      variantId: string | undefined,
      quantity: number
    ): Promise<void> => {
      const sid = sessionIdRef.current;
      if (!sid) return;

      try {
        const response: CartResponse = await addToCartAPI({
          sessionId: sid,
          productId,
          variantId,
          quantity,
        });
        setCart(response.items);
        showToast("Đã thêm vào giỏ hàng", "success");
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Lỗi kết nối, vui lòng thử lại";
        showToast(message, "error");
      }
    },
    [showToast]
  );

  // ─── updateQuantity ──────────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<void> => {
      try {
        const response: CartResponse = await updateCartItemAPI(itemId, quantity);
        setCart(response.items);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Lỗi kết nối, vui lòng thử lại";
        showToast(message, "error");
      }
    },
    [showToast]
  );

  // ─── removeFromCart ──────────────────────────────────────────────────────────
  const removeFromCart = useCallback(
    async (itemId: string): Promise<void> => {
      // Optimistic update: remove from UI immediately
      setCart((prev) => prev.filter((item) => item.id !== itemId));

      try {
        const response: CartResponse = await removeCartItemAPI(itemId);
        setCart(response.items);
      } catch (error: unknown) {
        // On error, refresh cart to restore correct state
        const sid = sessionIdRef.current;
        if (sid) {
          try {
            const response = await getCartAPI(sid);
            setCart(response.items);
          } catch {
            // ignore
          }
        }
        const message =
          error instanceof Error
            ? error.message
            : "Lỗi kết nối, vui lòng thử lại";
        showToast(message, "error");
      }
    },
    [showToast]
  );

  // ─── Cart drawer ─────────────────────────────────────────────────────────────
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isCartOpen,
        toast,
        loading,
        addToCart,
        refreshCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        openCart,
        closeCart,
        dismissToast,
        showToast,
        getSessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
