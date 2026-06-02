"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  ShoppingBag,
  Copy,
  Check,
  Calendar,
  CircleDot,
  Truck,
  CreditCard,
  Package,
} from "lucide-react";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { cartCount } = useCart();

  return (
    <Suspense
      fallback={
        <>
          <Header cartCount={cartCount} />
          <section
            className="success-page"
            style={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p>Đang tải...</p>
          </section>
          <Footer />
        </>
      }
    >
      <CheckoutSuccessContent cartCount={cartCount} />
    </Suspense>
  );
}

function CheckoutSuccessContent({ cartCount }: { cartCount: number }) {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Read order info from URL params
  const orderCode =
    searchParams.get("orderCode") || "DKY" + Date.now().toString().slice(-8);
  const orderDate =
    searchParams.get("orderDate") ||
    new Date().toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const paymentMethod = searchParams.get("payment") || "cod";

  const paymentLabel =
    paymentMethod === "bank"
      ? "Chuyển khoản ngân hàng"
      : "Thanh toán khi nhận hàng";

  const handleCopy = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="success-page">
        {/* Success Icon */}
        <div className="success-icon-wrap">
          <div className="success-icon-bg">
            <CheckCircle size={48} className="success-icon" />
          </div>
          <div className="success-sparkle success-sparkle--1" />
          <div className="success-sparkle success-sparkle--2" />
          <div className="success-sparkle success-sparkle--3" />
          <div className="success-sparkle success-sparkle--4" />
        </div>

        {/* Title */}
        <h1 className="success-title">Đặt hàng thành công!</h1>
        <p className="success-subtitle">
          Cảm ơn bạn đã mua sắm tại Duky Store.
          <br />
          Chúng tôi đã nhận được đơn hàng của bạn.
        </p>

        {/* Order Code */}
        <div className="order-code-wrap">
          <ShoppingBag size={18} className="order-code-icon" />
          <span className="order-code-label">Mã đơn hàng:</span>
          <span className="order-code-value">#{orderCode}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="order-code-copy"
            aria-label="Sao chép mã đơn hàng"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Order Info Card */}
        <div className="order-info-card">
          <div className="order-info-header">
            <Package size={18} />
            <span>Thông tin đơn hàng</span>
          </div>

          {/* Row 1: 3 columns with vertical dividers */}
          <div className="order-info-row">
            <div className="order-info-col">
              <span className="order-info-label">Ngày đặt hàng</span>
              <div className="order-info-value">
                <Calendar size={14} className="order-info-value-icon" />
                <span>{orderDate}</span>
              </div>
            </div>
            <div className="order-info-divider" />
            <div className="order-info-col">
              <span className="order-info-label">Trạng thái đơn hàng</span>
              <div className="order-info-status">
                <CircleDot size={14} className="order-info-status-icon" />
                <span>Đang xử lý</span>
              </div>
            </div>
            <div className="order-info-divider" />
            <div className="order-info-col">
              <span className="order-info-label">Phương thức vận chuyển</span>
              <div className="order-info-value">
                <Truck size={14} className="order-info-value-icon" />
                <span>Giao hàng tiêu chuẩn</span>
              </div>
            </div>
          </div>

          {/* Row 2: Payment + Note */}
          <div className="order-info-row order-info-row--bottom">
            <div className="order-info-col">
              <span className="order-info-label">Phương thức thanh toán</span>
              <div className="order-info-value">
                <CreditCard size={14} className="order-info-value-icon" />
                <span>{paymentLabel}</span>
              </div>
            </div>
            {/* <div className="order-info-divider" />
            <div className="order-info-col order-info-col--note">
              <p className="order-info-note">
                Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
              </p>
            </div> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[480px] px-4">
          <Link
            href="/"
            className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-4 py-4 rounded-xl text-[14px] font-semibold bg-white text-gray-900 border-[1.5px] border-gray-200 shadow-sm hover:border-gray-900 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <ShoppingBag size={20} className="shrink-0" />
            <span>Tiếp tục mua sắm</span>
          </Link>
          <Link
            href="/tai-khoan/don-hang"
            className="w-full sm:flex-1 flex items-center justify-center gap-2.5 px-4 py-4 rounded-xl text-[14px] font-semibold bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg shadow-black/20 hover:from-black hover:to-gray-800 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
          >
            <Package size={20} className="shrink-0" />
            <span>Xem đơn hàng của tôi</span>
          </Link>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .success-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 8px 2rem 60px;
          margin-top: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* ─── Success Icon ─── */
        .success-icon-wrap {
          position: relative;
          margin-bottom: 24px;
        }

        .success-icon-bg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.2);
        }

        :global(.success-icon) {
          color: #16a34a;
        }

        .success-sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #86efac;
          animation: sparkle 2s ease-in-out infinite;
        }

        .success-sparkle--1 {
          top: -4px;
          left: 10px;
          animation-delay: 0s;
        }
        .success-sparkle--2 {
          top: 8px;
          right: -6px;
          animation-delay: 0.5s;
        }
        .success-sparkle--3 {
          bottom: 4px;
          left: -4px;
          animation-delay: 1s;
        }
        .success-sparkle--4 {
          top: -8px;
          right: 14px;
          animation-delay: 1.5s;
          width: 6px;
          height: 6px;
          background: #fde047;
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* ─── Title ─── */
        .success-title {
          font-family: var(--font-accent);
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .success-subtitle {
          font-family: var(--font-main);
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        /* ─── Order Code ─── */
        .order-code-wrap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 999px;
          padding: 12px 20px;
          box-shadow: var(--card-shadow);
          margin-bottom: 32px;
        }

        :global(.order-code-icon) {
          color: var(--text-muted);
        }

        .order-code-label {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .order-code-value {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-code-copy {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        .order-code-copy:hover {
          background: var(--accent-black);
          color: #fff;
          border-color: var(--accent-black);
        }

        /* ─── Order Info Card ─── */
        .order-info-card {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-section);
          padding: 28px;
          box-shadow: var(--card-shadow);
          margin-bottom: 32px;
          text-align: left;
        }

        .order-info-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-main);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 24px;
        }

        .order-info-row {
          display: flex;
          align-items: stretch;
          gap: 0;
          padding: 16px 0;
          border-top: 1px solid var(--border-subtle);
        }

        .order-info-row--bottom {
          border-top: 1px solid var(--border-subtle);
        }

        .order-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 20px;
        }

        .order-info-col:first-child {
          padding-left: 0;
        }

        .order-info-col:last-child {
          padding-right: 0;
        }

        .order-info-col--note {
          display: flex;
          justify-content: center;
        }

        .order-info-divider {
          width: 1px;
          background: var(--border-subtle);
          align-self: stretch;
          flex-shrink: 0;
        }

        .order-info-label {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .order-info-value {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        :global(.order-info-value-icon) {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .order-info-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: #16a34a;
        }

        :global(.order-info-status-icon) {
          color: #16a34a;
        }

        .order-info-note {
          font-family: var(--font-main);
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        /* ─── Action Buttons ─── */
        .success-actions {
          display: flex;
          gap: 16px;
          width: 100%;
          max-width: 520px;
        }

        .success-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 12px;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          text-decoration: none;
        }

        .success-btn--outline {
          background: #fff;
          color: var(--text-main);
          border: 1.5px solid var(--border-card);
          box-shadow: var(--card-shadow);
        }

        .success-btn--outline:hover {
          border-color: var(--text-main);
          transform: translateY(-2px);
          box-shadow: var(--card-shadow-hover);
        }

        .success-btn--primary {
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          border: none;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .success-btn--primary:hover {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Responsive ─── */
        @media (max-width: 640px) {
          .success-page {
            padding: 60px 1rem 40px;
          }

          .success-title {
            font-size: 24px;
          }

          .order-info-row {
            flex-direction: column;
            gap: 16px;
          }

          .order-info-divider {
            width: 100%;
            height: 1px;
          }

          .order-info-col {
            padding: 0;
          }

          .success-actions {
            flex-direction: column;
          }

          .order-code-wrap {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
