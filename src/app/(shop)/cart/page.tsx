"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop";
import { CartItemRow } from "@/components/shop/cart/CartItemRow";
import { OrderSummary } from "@/components/shop/cart/OrderSummary";
import { TrustBadges } from "@/components/shop/cart/TrustBadges";
import { PaymentMethodsDisplay } from "@/components/shop/cart/PaymentMethodsDisplay";
import RecommendSection from "@/components/shop/product/RecommendSection";
import { computeCartCount, applySelectAll, isAllSelected } from "@/lib/cart-utils";
import { CartItemResponse } from "@/lib/api";

export default function CartPage() {
  const {
    cart,
    cartCount,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Local selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Computed values
  const displayCount = computeCartCount(cart);
  const allSelected = isAllSelected(selectedIds, cart.length);
  const hasSelection = selectedIds.size > 0;
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  // Handlers
  const handleSelectAll = () => {
    const itemIds = cart.map((item) => item.id);
    const newSelection = applySelectAll(itemIds, !allSelected);
    setSelectedIds(newSelection);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (!hasSelection) return;

    // Remove items from cart
    const itemsToDelete = cart.filter((item) => selectedIds.has(item.id));
    itemsToDelete.forEach((item) => removeFromCart(item.id));

    // Clear selection
    setSelectedIds(new Set());
  };

  const handleRemove = (id: string) => {
    // Remove from cart
    removeFromCart(id);

    // Clear from selection
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="max-w-[1440px] mx-auto mt-12 pt-10 px-8 pb-20 overflow-x-hidden">
          {/* Breadcrumb */}
          <Navpages
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Giỏ hàng" },
            ]}
          />

          {/* Page title */}
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-6">
            Giỏ hàng của bạn ({displayCount})
          </h1>

          {cart.length === 0 ? (
            /* Empty cart state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag size={64} className="text-slate-200 mb-4" />
              <p className="text-base lg:text-lg text-slate-500 mb-6">
                Giỏ hàng của bạn đang trống
              </p>
              <Link
                href="/collections"
                className="px-8 py-3 min-h-[44px] bg-black text-white rounded-full font-bold text-base sm:text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            /* Two-column layout */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start transition-all duration-300 ease-in-out">
              {/* Left column: Cart items */}
              <div className="space-y-4">
                {/* Select all & Delete selected controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-2xl p-4 border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-5 h-5 accent-black cursor-pointer"
                      aria-label="Chọn tất cả"
                    />
                    <span className="text-base sm:text-sm font-semibold text-black">
                      Chọn tất cả
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={!hasSelection}
                    className="flex items-center gap-2 px-4 py-2 min-h-[44px] text-base sm:text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-label="Xóa đã chọn"
                  >
                    <Trash2 size={16} />
                    <span>Xóa đã chọn</span>
                  </button>
                </div>

                {/* Cart item rows */}
                {cart.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isSelected={selectedIds.has(item.id)}
                    onToggleSelect={handleToggleSelect}
                    onUpdateQuantity={updateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Right column: Sidebar */}
              <div className="space-y-6">
                <OrderSummary
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  total={total}
                  itemCount={cart.length}
                  isCartEmpty={cart.length === 0}
                />
                <TrustBadges />
                <PaymentMethodsDisplay />
              </div>
            </div>
          )}
      </section>

      {/* Section 2: Recommendations */}
      <div className="mt-8">
        <RecommendSection title="Bạn có thể thích" />
      </div>

      <Footer />
    </>
  );
}
