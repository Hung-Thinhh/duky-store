"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Package,
  ShoppingBag,
  Heart,
  Tag,
  Mail,
  Phone,
  Calendar,
  MapPinned,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Header, Footer } from "@/components/layout";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { UserSidebar } from "@/components/auth/UserSidebar";
import { listAddresses, listCustomerOrders } from "@/lib/auth-api";
import { CheckoutOrder } from "@/lib/api";

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "PROCESSING":
      return "Đang xử lý";
    case "SHIPPING":
      return "Đang giao";
    case "DELIVERED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    case "COMPLETED":
      return "Hoàn thành";
    case "RETURNED":
      return "Đã trả hàng";
    case "REFUNDED":
      return "Đã hoàn tiền";
    default:
      return status;
  }
}

function getStatusColor(status: string): { color: string; bg: string } {
  switch (status) {
    case "PENDING":
      return { color: "#92400e", bg: "#fef3c7" };
    case "CONFIRMED":
      return { color: "#1d4ed8", bg: "#dbeafe" };
    case "PROCESSING":
      return { color: "#6d28d9", bg: "#ede9fe" };
    case "SHIPPING":
      return { color: "#92400e", bg: "#fef3c7" };
    case "DELIVERED":
    case "COMPLETED":
      return { color: "#15803d", bg: "#dcfce7" };
    case "CANCELLED":
      return { color: "#b91c1c", bg: "#fef2f2" };
    case "RETURNED":
      return { color: "#4b5563", bg: "#f3f4f6" };
    case "REFUNDED":
      return { color: "#4b5563", bg: "#f3f4f6" };
    default:
      return { color: "#4b5563", bg: "#f3f4f6" };
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

export function UserDashboardClient() {
  const { customer, isAuthenticated, isLoading } = useAuth();
  const { cartCount } = useCart();
  const [defaultAddress, setDefaultAddress] =
    React.useState<string>("Chưa cập nhật");
  const [recentOrders, setRecentOrders] = React.useState<CheckoutOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const addresses = await listAddresses();
        const def = addresses.find((addr) => addr.isDefault);
        if (def) {
          const parts = [
            def.addressLine,
            def.ward,
            def.district,
            def.province,
          ].filter(Boolean);
          setDefaultAddress(parts.join(", "));
        } else {
          setDefaultAddress("Chưa cập nhật");
        }
      } catch (err) {
        setDefaultAddress("Chưa cập nhật");
      }

      setIsOrdersLoading(true);
      try {
        const orders = await listCustomerOrders();
        setRecentOrders(orders.slice(0, 4));
      } catch (err) {
        setRecentOrders([]);
      } finally {
        setIsOrdersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const displayName =
    customer?.fullName || customer?.email?.split("@")[0] || "Khách";

  if (isLoading) {
    return (
      <>
        <Header cartCount={cartCount} />
        <main
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <p style={{ color: "#888", fontSize: 16 }}>Đang tải...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="dashboard-page">
        <div className="dashboard-layout">
          {/* ─── Sidebar ─── */}
          <UserSidebar />

          {/* ─── Main Content ─── */}
          <main className="dashboard-main">
            {/* Welcome Header */}
            <div className="dashboard-welcome">
              <h1 className="dashboard-title">Tài khoản của tôi</h1>
              <p className="dashboard-subtitle">
                Chào mừng bạn trở lại, {displayName} 👋
                <br />
                Quản lý thông tin tài khoản và hoạt động của bạn tại đây.
              </p>
            </div>

            {/* Bottom Section: Orders + Account Info */}
            <div className="dashboard-bottom">
              {/* Recent Orders */}
              <div className="dashboard-orders">
                <div className="section-header">
                  <h2 className="section-title">Đơn hàng gần đây</h2>
                  <Link href="/tai-khoan/don-hang" className="section-link-btn">
                    Xem tất cả →
                  </Link>
                </div>

                <div className="orders-list">
                  {isOrdersLoading ? (
                    <div
                      style={{
                        padding: "32px 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        className="loading-spinner-simple"
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "2px solid #e5e7eb",
                          borderTopColor: "#000",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <span
                        style={{ fontSize: 13, color: "var(--text-muted)" }}
                      >
                        Đang tải đơn hàng...
                      </span>
                      <style>{`
                        @keyframes spin {
                          to { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div
                      style={{
                        padding: "40px 0",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                      }}
                    >
                      <Package size={48} strokeWidth={1.5} style={{ color: "#9ca3af" }} />
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#6b7280",
                        }}
                      >
                        Không có đơn hàng nào
                      </span>
                    </div>
                  ) : (
                    recentOrders.map((order) => {
                      const statusStyle = getStatusColor(order.status);
                      return (
                        <Link
                          href={`/tai-khoan/don-hang/${order.code}`}
                          key={order.id}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div className="order-row">
                            <div className="order-row-img">
                              <Package size={20} />
                            </div>
                            <div className="order-row-info">
                              <span className="order-row-code">
                                #{order.code}
                              </span>
                              <span className="order-row-date">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </div>
                            <span
                              className="order-row-status"
                              style={{
                                color: statusStyle.color,
                                background: statusStyle.bg,
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                            <span className="order-row-amount">
                              {formatCurrency(order.grandTotal)}
                            </span>
                            <span className="order-row-arrow">›</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="dashboard-account">
                <div className="section-header">
                  <h2 className="section-title">Thông tin tài khoản</h2>
                  <Link href="/tai-khoan/cai-dat" className="section-link-btn">
                    <Pencil size={14} />
                    <span>Sửa</span>
                  </Link>
                </div>

                <div className="account-info-list">
                  <div className="account-info-item">
                    <User size={16} className="account-info-icon" />
                    <div className="account-info-content">
                      <span className="account-info-label">Họ và tên</span>
                      <span className="account-info-value">
                        {customer?.fullName || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>

                  <div className="account-info-item">
                    <Mail size={16} className="account-info-icon" />
                    <div className="account-info-content">
                      <span className="account-info-label">Email</span>
                      <span className="account-info-value">
                        {customer?.email || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>

                  <div className="account-info-item">
                    <Phone size={16} className="account-info-icon" />
                    <div className="account-info-content">
                      <span className="account-info-label">Số điện thoại</span>
                      <span className="account-info-value">
                        {customer?.phone || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>

                  <div className="account-info-item">
                    <Calendar size={16} className="account-info-icon" />
                    <div className="account-info-content">
                      <span className="account-info-label">Ngày tham gia</span>
                      <span className="account-info-value">
                        15 Tháng 3, 2024
                      </span>
                    </div>
                  </div>

                  <div className="account-info-item">
                    <MapPinned size={16} className="account-info-icon" />
                    <div className="account-info-content">
                      <span className="account-info-label">
                        Địa chỉ mặc định
                      </span>
                      <span className="account-info-value">
                        {defaultAddress}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .dashboard-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
          margin-top: 80px;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* ─── Sidebar ─── */
        .dashboard-sidebar {
          background: var(--bg-card);
          border-radius: var(--radius-section);
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
          padding: 24px 16px;
          position: sticky;
          top: 120px;
        }

        .sidebar-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 16px;
        }

        .sidebar-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .sidebar-name {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .sidebar-type {
          font-family: var(--font-main);
          font-size: 12px;
          color: #b45309;
          font-weight: 600;
          margin-top: 2px;
        }

        .sidebar-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-main);
          text-decoration: none;
          transition: var(--transition-fast);
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .sidebar-nav-item:hover {
          background: var(--bg-secondary);
          transform: translateX(4px);
        }

        .sidebar-nav-item--active {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .sidebar-nav-item--logout {
          color: #d32f2f;
          margin-top: 8px;
        }

        .sidebar-nav-item--logout:hover {
          background: #fef2f2;
        }

        /* ─── Main Content ─── */
        .dashboard-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-welcome {
          margin-bottom: 4px;
        }

        .dashboard-title {
          font-family: var(--font-accent);
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .dashboard-subtitle {
          font-family: var(--font-main);
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* ─── Stats Cards ─── */
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 20px;
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
        }

        .stat-card-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }

        .stat-card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
        }

        .stat-card-label {
          font-family: var(--font-main);
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-card-value {
          font-family: var(--font-main);
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
        }

        :global(.stat-card-link) {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition-fast);
          margin-top: auto;
        }

        :global(.stat-card-link:hover) {
          color: #f59e0b;
        }

        /* ─── Bottom Section ─── */
        .dashboard-bottom {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        :global(.section-link-btn) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        :global(.section-link-btn:hover) {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Orders ─── */
        .dashboard-orders {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-section);
          padding: 24px;
          box-shadow: var(--card-shadow);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
        }

        .order-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .order-row:last-child {
          border-bottom: none;
        }

        .order-row-img {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .order-row-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .order-row-code {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .order-row-date {
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--text-muted);
        }

        .order-row-status {
          font-family: var(--font-main);
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--bg-secondary);
        }

        .order-row-amount {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
          min-width: 90px;
          text-align: right;
        }

        .order-row-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
          font-size: 18px;
        }

        .orders-view-all-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          padding: 12px 20px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .orders-view-all-btn:hover {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Account Info ─── */
        .dashboard-account {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-section);
          padding: 24px;
          box-shadow: var(--card-shadow);
        }

        .account-info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .account-info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        :global(.account-info-icon) {
          color: #3a3a3a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .account-info-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .account-info-label {
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .account-info-value {
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .account-edit-btn-gradient {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          padding: 12px 20px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-family: var(--font-main);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .account-edit-btn-gradient:hover {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }

          .dashboard-sidebar {
            position: static;
          }

          .dashboard-main {
            min-width: 0;
          }

          .dashboard-bottom {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-page {
            padding: 24px 1rem 60px;
          }

          .dashboard-title {
            font-size: 22px;
          }

          .order-row {
            gap: 8px;
          }

          .order-row-img {
            display: none;
          }

          .order-row-amount {
            min-width: auto;
          }
        }
      `}</style>
    </>
  );
}
