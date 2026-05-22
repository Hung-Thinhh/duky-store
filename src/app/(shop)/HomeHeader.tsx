"use client";

import { Header } from "@/components/layout";
import { useCart } from "@/context/CartContext";

/**
 * Client component wrapper for Header that provides cart count from CartContext.
 * Extracted from the homepage to allow the page shell to remain a Server Component.
 */
export function HomeHeader() {
  const { cartCount } = useCart();

  return <Header cartCount={cartCount} />;
}
