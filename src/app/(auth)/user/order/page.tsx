"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
import { UserSidebar } from "@/components/auth/UserSidebar";
import { getOrderHistory } from "@/lib/order-storage";
import { orderLookupAPI, CheckoutOrder } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "DELIVERED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "PROCESSING": return "Đang xử lý";
    case "SHIPPING": return "Đang giao";
    case "DELIVERED": return "Hoàn thành";
    case "CANCELLED": return "Đã hủy";
    default: return status;
  }
}

function getStatusColor(status: string): { color: string; bg: string } {
  switch (status) {
    case "PENDING": return { color: "#f59e0b", bg: "#fef3c7" };
    case "CONFIRMED": return { color: "#3b82f6", bg: "#dbeafe" };
    case "PROCESSING": return { color: "#8b5cf6", bg: "#ede9fe" };
    case "SHIPPING": return { color: "#f59e0b", bg: "#fef3c7" };
    case "DELIVERED": return { color: "#16a34a", bg: "#dcfce7" };
    case "CANCELLED": return { color: "#ef4444", bg: "#fef2f2" };
    default: return { color: "#6b7280", bg: "#f3f4f6" };
  }
}

function formatOrderDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function OrderPage() {
  const { cartCount } = useCart();
  const { customer } = useAuth();
  const [activeTab, setActiveTab] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<CheckoutOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const storedOrders = getOrderHistory();

      if (storedOrders.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      const results: CheckoutOrder[] = [];

      for (const stored of storedOrders) {
        try {
          // Use phone from stored order data, fallback to auth context
          const phone = stored.phone || customer?.phone || "";
          if (!phone) continue;

          const order = await orderLookupAPI(stored.code, phone);
          results.push(order);
        } catch {
          // Skip individual order failures silently
        }
      }

      setOrders(results);
    } catch {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, [customer?.phone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Client-side filtering
  const filteredOrders = orders.filter((order) => {
    const matchTab = activeTab === "all" || order.status === activeTab;
    const matchSearch =
      !searchQuery.trim() ||
      order.code.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="order-page">
        <div className="order-layout">
          {/* ─── Sidebar ─── */}
          <UserSidebar />

          {/* ─── Main Content ─── */}
          <main className="order-main">
            {/* Title + Sort */}
            <div className="order-header">
              <h1 className="order-title">Đơn hàng</h1>
              <button type="button" className="order-sort-btn">
                <span>Mới nhất</span>
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Tabs + Search */}
            <div className="order-tabs-row">
              <div className="order-tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`order-tab ${activeTab === tab.key ? "order-tab--active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="order-search">
                <div className="order-search-icon">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Tìm mã đơn hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="order-search-input"
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="order-loading">
                <Loader2 size={32} className="order-loading-spinner" />
                <p>Đang tải đơn hàng...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="order-error">
                <AlertCircle size={48} />
                <p>{error}</p>
                <button
                  type="button"
                  className="order-retry-btn"
                  onClick={fetchOrders}
                >
                  <RefreshCw size={16} />
                  <span>Thử lại</span>
                </button>
              </div>
            )}

            {/* Order List */}
            {!isLoading && !error && (
              <div className="order-list">
                {filteredOrders.length === 0 ? (
                  <div className="order-empty">
                    <Package size={48} />
                    <p>Không có đơn hàng nào</p>
                    <Link href="/" className="order-empty-link">
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    return (
                      <Link
                        key={order.id}
                        href={`/user/order/${order.code}`}
                        className="order-card-link"
                      >
                        <div className="order-card">
                          {/* Left: Info */}
                          <div className="order-card-left">
                            <div className="order-card-header">
                              <span className="order-card-code">
                                Đơn hàng #{order.code}
                              </span>
                              <span className="order-card-date">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <span
                              className="order-card-status"
                              style={{
                                color: statusStyle.color,
                                background: statusStyle.bg,
                              }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </div>

                          {/* Center: Item count */}
                          <div className="order-card-center">
                            <span className="order-card-item-count">
                              {order.items.length} sản phẩm
                            </span>
                          </div>

                          {/* Right: Total */}
                          <div className="order-card-right">
                            <span className="order-card-total-label">Tổng tiền</span>
                            <span className="order-card-total">
                              {formatCurrency(order.grandTotal)}
                            </span>
                            <span className="order-card-detail-arrow">
                              Xem chi tiết →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </main>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .order-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
          margin-top: 80px;
        }

        .order-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* ─── Main ─── */
        .order-main { display: flex; flex-direction: column; gap: 20px; }

        .order-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .order-title {
          font-family: var(--font-accent);
          font-size: 26px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-sort-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border-input);
          border-radius: 10px;
          background: var(--bg-card);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .order-sort-btn:hover { border-color: var(--text-main); }

        /* ─── Tabs ─── */
        .order-tabs-row {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .order-tabs {
          display: flex;
          gap: 0;
          flex: 1;
        }

        .order-search {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          border: 1px solid var(--border-input);
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-card);
          transition: var(--transition-fast);
        }

        .order-search:focus-within {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .order-search-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .order-search-input {
          padding: 8px 12px 8px 0;
          border: none;
          font-size: 13px;
          font-family: var(--font-main);
          color: var(--text-main);
          background: transparent;
          outline: none;
          width: 250px;
        }

        .order-search-input::placeholder {
          color: var(--text-muted);
        }

        .order-tab {
          padding: 12px 20px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .order-tab:hover { color: var(--text-main); }

        .order-tab--active {
          color: var(--text-main);
          border-bottom-color: var(--text-main);
          font-weight: 600;
        }

        /* ─── Loading State ─── */
        .order-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        :global(.order-loading-spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ─── Error State ─── */
        .order-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        .order-error p {
          font-size: 14px;
          color: var(--text-muted);
        }

        .order-retry-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid var(--border-input);
          background: var(--bg-card);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .order-retry-btn:hover {
          border-color: var(--text-main);
          background: var(--bg-secondary);
        }

        /* ─── Order List ─── */
        .order-list { display: flex; flex-direction: column; gap: 16px; }

        .order-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        :global(.order-empty-link) {
          margin-top: 8px;
          padding: 10px 24px;
          border-radius: 999px;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        :global(.order-empty-link:hover) {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        :global(.order-card-link) {
          text-decoration: none;
          color: inherit;
        }

        .order-card {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 20px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          transition: var(--transition-fast);
        }

        .order-card:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-1px);
        }

        .order-card-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .order-card-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .order-card-code {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-card-date {
          font-size: 12px;
          color: var(--text-muted);
        }

        .order-card-status {
          display: inline-flex;
          align-self: flex-start;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .order-card-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .order-card-item-count {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* ─── Right: Total ─── */
        .order-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          min-width: 140px;
        }

        .order-card-total-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .order-card-total {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-card-detail-arrow {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .order-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .order-card { flex-direction: column; align-items: flex-start; gap: 16px; }
          .order-card-right { align-items: flex-start; }
          .order-tabs { overflow-x: auto; }
          .order-tabs-row { flex-direction: column; align-items: stretch; gap: 12px; }
          .order-search { margin-bottom: 0; }
        }

        @media (max-width: 640px) {
          .order-page { padding: 24px 1rem 60px; }
        }
      `}</style>
    </>
  );
}
