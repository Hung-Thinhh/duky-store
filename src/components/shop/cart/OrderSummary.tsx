"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft, Truck, ClipboardList, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryProps {
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  isCartEmpty: boolean;
}

export function OrderSummary({
  subtotal,
  shippingFee,
  total,
  itemCount,
  isCartEmpty,
}: OrderSummaryProps) {
  const isFreeShipping = shippingFee === 0;

  return (
    <aside className="lg:sticky lg:top-4 bg-white rounded-3xl p-6 md:p-8 shadow-[6px_6px_16px_rgba(0,0,0,0.06),-6px_-6px_16px_rgba(255,255,255,0.8)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
          <ClipboardList size={20} className="text-black" />
        </div>
        <h3 className="font-serif text-lg font-bold text-black tracking-tight">
          Tóm tắt đơn hàng
        </h3>
      </div>

      {/* Summary rows */}
      <div className="space-y-5 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-base text-slate-600">Tạm tính</span>
          <span className="text-base font-medium text-black">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Shipping fee */}
        <div className="flex justify-between items-center">
          <span className="text-base text-slate-600 flex items-center gap-1.5">
            Phí giao hàng
          </span>
          {isFreeShipping ? (
            <span className="text-sm font-medium text-green-600">
              Khách hàng thanh toán
            </span>
          ) : (
            <span className="text-base font-medium text-black">
              {formatCurrency(shippingFee)}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 my-5" />

      {/* Total */}
      <div className="flex justify-between items-center my-4">
        <span className="text-lg font-bold text-black">Tổng tiền</span>
        <span className="content font-serif text-lg font-extrabold text-black">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Free shipping badge */}
      {isFreeShipping && !isCartEmpty && (
        <div className="flex bg-teal-50 border border-teal-100 rounded-2xl overflow-hidden mb-6">
          {/* Left - Icon */}
          <div className="flex items-center justify-center px-4 bg-teal-100/50">
            <Truck size={20} className="text-teal-600" />
          </div>
          {/* Right - Info */}
          <div className="py-4 px-4">
            <p className="text-sm font-semibold text-teal-700">
              Phí giao hàng
            </p>
            <p className="text-xs text-teal-600 mt-0.5">
              Được tính theo giá bên vận chuyển
            </p>
          </div>
        </div>
      )}

      {/* Empty state message */}
      {isCartEmpty && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-6">
          <ShoppingCart size={18} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-500">
            Giỏ hàng của bạn đang trống
          </span>
        </div>
      )}

      {/* Checkout button */}
      {isCartEmpty ? (
        <button
          disabled
          aria-disabled="true"
          className="w-full py-3.5 min-h-[44px] rounded-full text-sm font-bold uppercase tracking-wider text-white bg-black opacity-50 cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          <ShoppingCart size={16} />
          TIẾN HÀNH THANH TOÁN
        </button>
      ) : (
        <Link
          href="/thanh-toan"
          className="w-full py-3.5 min-h-[44px] rounded-full text-sm font-bold uppercase tracking-wider text-white bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          TIẾN HÀNH THANH TOÁN
        </Link>
      )}
    </aside>
  );
}
