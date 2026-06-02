"use client";

import React from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

export default function NotFound() {
  const { cartCount } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/40 text-zinc-900 font-sans">
      <Header cartCount={cartCount} />

      {/* Main Container - min-h-[calc(100vh-80px)] ensures the main area fills the full screen height under the Header, pushing Footer below the fold */}
      <main className="flex-grow flex items-center justify-center py-16 px-6 relative min-h-[calc(100vh-80px)]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

        {/* Centered Minimal Card */}
        <div className="relative z-10 max-w-md w-full bg-white border border-zinc-200/80 rounded-2xl p-8 sm:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center space-y-6">
          {/* Big 404 with Star */}
          <div className="relative inline-block">
            <h1 className="text-[72px] sm:text-[84px] font-playfair font-normal leading-none text-zinc-950 tracking-tighter select-none">
              404
            </h1>
            <span className="absolute top-1 -right-6 text-zinc-900 text-2xl select-none">
              ✦
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-lg sm:text-xl font-bold font-montserrat tracking-tight text-zinc-900">
            Trang bạn tìm kiếm không tồn tại
          </h2>

          {/* Small Divider */}
          <div className="w-12 h-[1px] bg-zinc-300 mx-auto" />

          {/* Description */}
          <p className="text-[12px] sm:text-[13px] text-zinc-500 font-light leading-relaxed font-montserrat">
            Đường liên kết có thể đã bị di chuyển, thay đổi tên hoặc không còn
            tồn tại. Vui lòng quay lại trang chủ hoặc tiếp tục mua sắm các sản
            phẩm khác.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-4 bg-zinc-950 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center gap-1 font-montserrat"
            >
              Về trang chủ →
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-4 border border-zinc-300 bg-white text-zinc-950 text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-50 hover:border-zinc-400 transition-all duration-300 flex items-center justify-center font-montserrat"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
