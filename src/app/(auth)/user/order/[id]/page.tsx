"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { UserSidebar } from "@/components/auth/UserSidebar";
import { formatCurrency } from "@/lib/utils";
import { orderLookupAPI, CheckoutOrder } from "@/lib/api";
import { getOrderHistory } from "@/lib/order-storage";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING": return "Chờ xác nhận";
    case "CONFIRMED": return "Đã xác nhận";
    case "PROCESSING": return "Đang xử lý";
    case "SHIPPING": return "Đang giao";
    case "DELIVERED": return "Hoàn thành";
    case "CANCELLED": return "Đã hủy";
    case "COMPLETED": return "Hoàn thành";
    case "RETURNED": return "Đã trả hàng";
    case "REFUNDED": return "Đã hoàn tiền";
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
    case "RETURNED": return { color: "#6b7280", bg: "#f3f4f6" };
    case "REFUNDED": return { color: "#6b7280", bg: "#f3f4f6" };
    default: return { color: "#6b7280", bg: "#f3f4f6" };
  }
}

function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case "COD": return "Thanh toán khi nhận hàng";
    case "BANK_TRANSFER": return "Chuyển khoản ngân hàng";
    default: return method;
  }
}

function getShippingStatusLabel(status: string): string {
  switch (status) {
    case "NOT_SHIPPED": return "Chưa giao";
    case "SHIPPING": return "Đang giao";
    case "DELIVERED": return "Đã giao";
    default: return status;
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cartCount } = useCart();
  const { customer } = useAuth();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get phone from stored order history or auth context
      const storedOrders = getOrderHistory();
      const storedOrder = storedOrders.find((o) => o.code === id);
      const phone = storedOrder?.phone || customer?.phone || "";

      if (!phone) {
        setError("Không tìm thấy thông tin số điện thoại để tra cứu đơn hàng.");
        setIsLoading(false);
        return;
      }

      const data = await orderLookupAPI(id, phone);
      setOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, customer?.phone]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Derive payment method from payments array
  const paymentMethod = order?.payments?.[0]?.method || "COD";
  const statusStyle = order ? getStatusColor(order.status) : { color: "#6b7280", bg: "#f3f4f6" };

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="order-detail-page">
        <div className="order-detail-layout">
          <UserSidebar />

          <main className="order-detail-main">
            {/* Loading State */}
            {isLoading && (
              <div className="od-loading">
                <Loader2 size={32} className="od-loading-spinner" />
                <p>Đang tải thông tin đơn hàng...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="od-error">
                <AlertCircle size={48} />
                <p>{error}</p>
                <Link href="/user/order" className="od-error-link">
                  ← Quay lại danh sách đơn hàng
                </Link>
              </div>
            )}

            {/* Order Content */}
            {!isLoading && !error && order && (
              <>
                {/* Header */}
                <div className="od-header">
                  <h1 className="od-title">Chi tiết đơn hàng</h1>
                  <p className="od-meta">
                    Mã đơn hàng: <strong>#{order.code}</strong> &nbsp;|&nbsp; Đặt ngày {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                {/* Info Cards Row */}
                <div className="od-info-row">
                  <div className="od-info-card">
                    <span className="od-info-label">Trạng thái</span>
                    <span className="od-info-status" style={{ color: statusStyle.color, background: statusStyle.bg }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="od-info-divider" />
                  <div className="od-info-card">
                    <span className="od-info-label">Phương thức thanh toán</span>
                    <div className="od-info-value">
                      <CreditCard size={14} />
                      <span>{getPaymentMethodLabel(paymentMethod)}</span>
                    </div>
                  </div>
                  <div className="od-info-divider" />
                  <div className="od-info-card">
                    <span className="od-info-label">Vận chuyển</span>
                    <div className="od-info-value">
                      <Truck size={14} />
                      <span>{getShippingStatusLabel(order.shippingStatus)}</span>
                    </div>
                  </div>
                  <div className="od-info-divider" />
                  <div className="od-info-card">
                    <span className="od-info-label">Tổng tiền</span>
                    <span className="od-info-total">{formatCurrency(order.grandTotal)}</span>
                  </div>
                </div>

                {/* Products */}
                <div className="od-section">
                  <h2 className="od-section-title">Sản phẩm đã đặt</h2>
                  <div className="od-products">
                    {order.items.map((item) => (
                      <div key={item.id} className="od-product-row">
                        <div className="od-product-info">
                          <span className="od-product-name">{item.productName}</span>
                          {item.sku && <span className="od-product-sku">Mã SP: {item.sku}</span>}
                          {item.variantName && (
                            <span className="od-product-variant">{item.variantName}</span>
                          )}
                        </div>
                        <div className="od-product-price">
                          <span className="od-product-qty">{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                          <span className="od-product-line-total">{formatCurrency(item.lineTotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {order.statusHistories && order.statusHistories.length > 0 && (
                  <div className="od-section">
                    <h2 className="od-section-title">Lịch sử đơn hàng</h2>
                    <div className="od-timeline">
                      {order.statusHistories.map((entry, idx) => (
                        <div key={entry.id} className="od-timeline-item">
                          <div className="od-timeline-dot-col">
                            <div className="od-timeline-dot od-timeline-dot--done">
                              <CheckCircle size={16} />
                            </div>
                            {idx < order.statusHistories.length - 1 && <div className="od-timeline-line" />}
                          </div>
                          <div className="od-timeline-content">
                            <span className="od-timeline-title">
                              {entry.fromStatus
                                ? `${getStatusLabel(entry.fromStatus)} → ${getStatusLabel(entry.toStatus)}`
                                : getStatusLabel(entry.toStatus)}
                            </span>
                            <span className="od-timeline-date">{formatOrderDate(entry.createdAt)}</span>
                          </div>
                          {entry.note && <span className="od-timeline-desc">{entry.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="od-section">
                    <h2 className="od-section-title">Địa chỉ giao hàng</h2>
                    <div className="od-address">
                      <div className="od-address-icon">
                        <MapPin size={18} />
                      </div>
                      <div className="od-address-info">
                        <span className="od-address-name">{order.shippingAddress.fullName}</span>
                        <span className="od-address-phone">{order.shippingAddress.phone}</span>
                        <span className="od-address-line">
                          {[
                            order.shippingAddress.addressLine,
                            order.shippingAddress.ward,
                            order.shippingAddress.district,
                            order.shippingAddress.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .order-detail-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
          margin-top: 80px;
        }

        .order-detail-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          align-items: start;
        }

        .order-detail-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Loading */
        .od-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        :global(.od-loading-spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Error */
        .od-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 60px 0;
          color: var(--text-muted);
        }

        .od-error p {
          font-size: 14px;
          color: var(--text-muted);
        }

        :global(.od-error-link) {
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

        :global(.od-error-link:hover) {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* Header */
        .od-header { margin-bottom: 4px; }
        .od-title { font-family: var(--font-accent); font-size: 26px; font-weight: 700; color: var(--text-main); }
        .od-meta { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
        .od-meta strong { color: var(--text-main); }

        /* Info Row */
        .od-info-row {
          display: flex;
          align-items: stretch;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          padding: 20px 0;
        }

        .od-info-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 0 24px;
        }

        .od-info-divider {
          width: 1px;
          background: var(--border-subtle);
          align-self: stretch;
        }

        .od-info-label { font-size: 11px; color: var(--text-muted); font-weight: 500; }

        .od-info-status {
          display: inline-flex;
          align-self: flex-start;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .od-info-value {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .od-info-total {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* Section */
        .od-section {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          padding: 24px;
        }

        .od-section-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
        }

        /* Products */
        .od-products { display: flex; flex-direction: column; }

        .od-product-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .od-product-row:last-child { border-bottom: none; }

        .od-product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .od-product-name { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .od-product-sku { font-size: 11px; color: var(--text-muted); }
        .od-product-variant { font-size: 12px; color: var(--text-muted); }

        .od-product-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          min-width: 120px;
        }

        .od-product-qty { font-size: 12px; color: var(--text-muted); }
        .od-product-line-total { font-size: 14px; font-weight: 700; color: var(--text-main); }

        /* Timeline */
        .od-timeline { display: flex; flex-direction: column; }

        .od-timeline-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          min-height: 60px;
        }

        .od-timeline-dot-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .od-timeline-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .od-timeline-dot--done {
          background: #dcfce7;
          color: #16a34a;
        }

        .od-timeline-line {
          width: 2px;
          flex: 1;
          min-height: 24px;
          background: var(--border-subtle);
          margin: 4px 0;
        }

        .od-timeline-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 180px;
        }

        .od-timeline-title { font-size: 13px; font-weight: 600; color: var(--text-main); }
        .od-timeline-date { font-size: 11px; color: var(--text-muted); }
        .od-timeline-desc { font-size: 12px; color: var(--text-muted); padding-top: 2px; }

        /* Address */
        .od-address {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .od-address-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .od-address-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .od-address-name { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .od-address-phone { font-size: 13px; color: var(--text-muted); }
        .od-address-line { font-size: 13px; color: var(--text-main); line-height: 1.5; }

        /* Responsive */
        @media (max-width: 1024px) {
          .order-detail-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .od-info-row { flex-direction: column; gap: 16px; padding: 20px; }
          .od-info-divider { width: 100%; height: 1px; }
          .od-product-row { flex-direction: column; align-items: flex-start; }
          .od-product-price { align-items: flex-start; }
        }

        @media (max-width: 640px) {
          .order-detail-page { padding: 24px 1rem 60px; }
        }
      `}</style>
    </>
  );
}
