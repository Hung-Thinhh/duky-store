"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { icon: User, label: "Tài khoản của tôi", href: "/tai-khoan" },
  { icon: Package, label: "Đơn hàng", href: "/tai-khoan/don-hang" },
  { icon: MapPin, label: "Địa chỉ", href: "/tai-khoan/dia-chi" },
  { icon: Settings, label: "Cài đặt", href: "/tai-khoan/cai-dat" },
];

export function UserSidebar() {
  const { customer, logout } = useAuth();
  const pathname = usePathname();

  const displayName = customer?.fullName || customer?.email?.split("@")[0] || "Khách";
  const memberType = customer?.type === "VIP" ? "VIP" : customer?.type === "WHOLESALE" ? "Đối tác" : "Thành viên";

  return (
    <aside className="user-sidebar">
      {/* Profile */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <User size={28} />
        </div>
        <div className="sidebar-name">{displayName}</div>
        <div className="sidebar-type">{memberType}</div>
        <div className="sidebar-badge">
          <Heart size={12} />
          <span>Thành viên thân thiết</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-link ${isActive ? "sidebar-nav-link--active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button type="button" className="sidebar-logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </nav>

      <style jsx global>{`
        .user-sidebar {
          width: 240px;
          background: var(--bg-card);
          border-radius: var(--radius-section);
          border: 1px solid var(--border-card);
          box-shadow: var(--card-shadow);
          padding: 24px 16px;
          position: sticky;
          top: 120px;
        }

        .user-sidebar .sidebar-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 16px;
        }

        .user-sidebar .sidebar-avatar {
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

        .user-sidebar .sidebar-name {
          font-family: var(--font-main);
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .user-sidebar .sidebar-type {
          font-family: var(--font-main);
          font-size: 12px;
          color: #b45309;
          font-weight: 600;
          margin-top: 2px;
        }

        .user-sidebar .sidebar-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          font-family: var(--font-main);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .user-sidebar .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-link {
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
          transition: all 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        .sidebar-nav-link:hover {
          background: var(--bg-secondary);
          transform: translateX(4px);
        }

        .sidebar-nav-link--active {
          background: var(--bg-secondary);
          font-weight: 600;
        }

        .user-sidebar .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          font-family: var(--font-main);
          font-size: 14px;
          font-weight: 500;
          color: #d32f2f;
          text-decoration: none;
          transition: all 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          margin-top: 8px;
        }

        .user-sidebar .sidebar-logout-btn:hover {
          background: #fef2f2;
          transform: translateX(4px);
        }

        @media (max-width: 1024px) {
          .user-sidebar {
            position: static;
            width: 100%;
          }
        }
      `}</style>
    </aside>
  );
}
