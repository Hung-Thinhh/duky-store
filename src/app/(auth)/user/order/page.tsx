"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { listCustomerOrders } from "@/lib/auth-api";
import Pagination from "@/components/shop/Pagination";

// ─── Types ───────────────────────────────────────────────────────────────────
type StatusFilter = "all" | "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "COMPLETED" | "CANCELLED";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "PROCESSING": return "Đang xử lý";
    case "SHIPPING": return "Đang giao";
    case "DELIVERED":
    case "COMPLETED": return "Hoàn thành";
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
    case "DELIVERED":
    case "COMPLETED": return { color: "#16a34a", bg: "#dcfce7" };
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
  const [currentPage, setCurrentPage] = useState(1);

  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("dragging");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    const handleMouseUp = () => {
      isDown = false;
      el.classList.remove("dragging");
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const customerOrders = await listCustomerOrders();
      setOrders(customerOrders);
    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders
    .filter((order) => {
      let matchTab = activeTab === "all";
      if (!matchTab) {
        if (activeTab === "COMPLETED") {
          matchTab = order.status === "COMPLETED" || order.status === "DELIVERED";
        } else {
          matchTab = order.status === activeTab;
        }
      }
      const matchSearch =
        !searchQuery.trim() ||
        order.code.toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchTab && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

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
              <div className="order-sort-container" ref={sortRef}>
                <button
                  type="button"
                  className="order-sort-btn"
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  <span>{sortBy === "newest" ? "Mới nhất" : "Cũ nhất"}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isSortOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {isSortOpen && (
                  <div className="order-sort-dropdown">
                    <button
                      type="button"
                      className={`order-sort-option ${
                        sortBy === "newest" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortBy("newest");
                        setIsSortOpen(false);
                      }}
                    >
                      Mới nhất
                    </button>
                    <button
                      type="button"
                      className={`order-sort-option ${
                        sortBy === "oldest" ? "active" : ""
                      }`}
                      onClick={() => {
                        setSortBy("oldest");
                        setIsSortOpen(false);
                      }}
                    >
                      Cũ nhất
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs + Search */}
            <div className="order-tabs-row">
              <div className="order-tabs" ref={tabsRef}>
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
                  <>
                    {paginatedOrders.map((order) => {
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
                    })}

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </>
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

        .order-sort-container {
          position: relative;
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

        .order-sort-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-input);
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
          z-index: 100;
        }

        .order-sort-option {
          background: transparent;
          border: none;
          padding: 8px 12px;
          text-align: left;
          font-size: 13px;
          font-family: var(--font-main);
          color: var(--text-main);
          cursor: pointer;
          border-radius: 6px;
          transition: var(--transition-fast);
        }

        .order-sort-option:hover {
          background: var(--bg-secondary);
        }

        .order-sort-option.active {
          font-weight: 600;
          background: var(--bg-secondary);
          color: var(--text-main);
        }

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
          cursor: grab;
        }

        .order-tabs.dragging {
          cursor: grabbing;
          user-select: none;
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
          white-space: nowrap;
          flex-shrink: 0;
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
          .order-main { min-width: 0; }
        }

        @media (max-width: 768px) {
          .order-card { flex-direction: column; align-items: flex-start; gap: 16px; }
          .order-card-right { align-items: flex-start; }
          .order-tabs {
            overflow-x: auto;
            scrollbar-width: none; /* Firefox */
            -webkit-overflow-scrolling: touch;
            width: 100%;
            max-width: 100%;
          }
          .order-tabs::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }
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
