"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { UserSidebar } from "@/components/auth/UserSidebar";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Address {
  id: string;
  label: string;
  type: string;
  isDefault: boolean;
  fullName: string;
  phone: string;
  address: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_ADDRESSES: Address[] = [
  {
    id: "1",
    label: "Nhà riêng",
    type: "Mặc định",
    isDefault: true,
    fullName: "Vinh QD",
    phone: "0987 654 321",
    address: "221B Baker Street, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh, Việt Nam",
  },
  {
    id: "2",
    label: "Văn phòng",
    type: "Cơ quan",
    isDefault: false,
    fullName: "Vinh QD",
    phone: "0987 654 321",
    address: "Tòa nhà Bitexco, 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh, Việt Nam",
  },
  {
    id: "3",
    label: "Nhà ba mẹ",
    type: "Nhà người thân",
    isDefault: false,
    fullName: "Vinh QD",
    phone: "0987 654 321",
    address: "123 Đường số 8, Phường Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh, Việt Nam",
  },
];

export default function AddressPage() {
  const { cartCount } = useCart();
  const [addresses] = useState<Address[]>(MOCK_ADDRESSES);

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="address-page">
        <div className="address-layout">
          {/* ─── Sidebar ─── */}
          <UserSidebar />

          {/* ─── Main Content ─── */}
          <main className="address-main">
            {/* Header */}
            <div className="address-header">
              <div className="address-header-left">
                <h1 className="address-title">Địa chỉ</h1>
                <p className="address-subtitle">Quản lý các địa chỉ giao hàng của bạn</p>
              </div>
              <button type="button" className="address-add-btn">
                <Plus size={16} />
                <span>Thêm địa chỉ mới</span>
              </button>
            </div>

            {/* Address List */}
            <div className="address-list">
              {addresses.map((addr) => (
                <div key={addr.id} className="address-card">
                  {/* Left: Type badge + Icon */}
                  <div className="address-card-left">
                    <span className={`address-type-badge ${addr.isDefault ? "address-type-badge--default" : ""}`}>
                      {addr.isDefault ? "Mặc định" : addr.type}
                    </span>
                    <div className="address-card-icon">
                      <MapPin size={20} />
                    </div>
                  </div>

                  {/* Center: Info */}
                  <div className="address-card-center">
                    <h3 className="address-card-label">{addr.label}</h3>
                    <p className="address-card-name">{addr.fullName}</p>
                    <p className="address-card-phone">{addr.phone}</p>
                    <p className="address-card-address">{addr.address}</p>
                  </div>

                  {/* Right: Actions */}
                  <div className="address-card-actions">
                    <button type="button" className="address-action-btn">
                      <Pencil size={14} />
                      <span>Sửa</span>
                    </button>
                    <button type="button" className="address-action-btn address-action-btn--delete">
                      <Trash2 size={14} />
                      <span>Xóa</span>
                    </button>
                    <ChevronRight size={16} className="address-action-arrow" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .address-page {
          max-width: 1440px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
          margin-top: 80px;
        }

        .address-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* ─── Sidebar ─── */
        .address-sidebar {
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

        .sidebar-name { font-size: 15px; font-weight: 700; color: var(--text-main); }
        .sidebar-type { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 2px; }

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
        }

        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
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

        .sidebar-nav-item:hover { background: var(--bg-secondary); transform: translateX(4px); }
        .sidebar-nav-item--active { background: var(--bg-secondary); font-weight: 600; }
        .sidebar-nav-item--logout { color: #ef4444; margin-top: 8px; }
        .sidebar-nav-item--logout:hover { background: #fef2f2; }

        /* ─── Main ─── */
        .address-main { display: flex; flex-direction: column; gap: 24px; }

        .address-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .address-header-left { display: flex; flex-direction: column; gap: 4px; }

        .address-title {
          font-family: var(--font-accent);
          font-size: 26px;
          font-weight: 700;
          color: var(--text-main);
        }

        .address-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .address-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #1a1a1a, #3a3a3a);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .address-add-btn:hover {
          background: linear-gradient(135deg, #000000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── Address List ─── */
        .address-list { display: flex; flex-direction: column; gap: 16px; }

        .address-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: var(--card-shadow);
          transition: var(--transition-fast);
        }

        .address-card:hover {
          box-shadow: var(--card-shadow-hover);
          transform: translateY(-1px);
        }

        .address-card-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 80px;
        }

        .address-type-badge {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-muted);
          padding: 3px 8px;
          border-radius: 6px;
          background: var(--bg-secondary);
          white-space: nowrap;
        }

        .address-type-badge--default {
          color: #f59e0b;
          background: #fef3c7;
        }

        .address-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .address-card-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .address-card-label {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .address-card-name {
          font-size: 13px;
          color: var(--text-main);
        }

        .address-card-phone {
          font-size: 13px;
          color: var(--text-muted);
        }

        .address-card-address {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: 4px;
        }

        .address-card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .address-action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-main);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .address-action-btn:hover {
          background: var(--bg-secondary);
          border-color: var(--text-main);
        }

        .address-action-btn--delete {
          color: #ef4444;
          border-color: #fecaca;
        }

        .address-action-btn--delete:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        :global(.address-action-arrow) {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .address-layout { grid-template-columns: 1fr; }
          .address-sidebar { position: static; }
        }

        @media (max-width: 768px) {
          .address-card { flex-direction: column; align-items: flex-start; }
          .address-card-actions { align-self: flex-end; }
          .address-header { flex-direction: column; gap: 16px; }
        }

        @media (max-width: 640px) {
          .address-page { padding: 24px 1rem 60px; }
        }
      `}</style>
    </>
  );
}
