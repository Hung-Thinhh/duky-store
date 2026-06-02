"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Bell,
  Gift,
  Camera,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { UserSidebar } from "@/components/auth/UserSidebar";

export function SettingClient() {
  const { customer, updateProfile, changePassword } = useAuth();
  const { cartCount } = useCart();

  // Profile form
  const [fullName, setFullName] = useState(customer?.fullName || "");
  const [email] = useState(customer?.email || "");
  const [phone, setPhone] = useState(customer?.phone || "");

  // Sync profile details when customer object is loaded
  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || "");
      setPhone(customer.phone || "");
    }
  }, [customer]);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Msg banners
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Preferences
  const [emailNotif, setEmailNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(true);

  const isProfileUnchanged = fullName === (customer?.fullName || "") && (phone || "") === (customer?.phone || "");
  const isPasswordEmpty = !currentPassword && !newPassword && !confirmPassword;

  const handleSaveProfile = async () => {
    setProfileMsg(null);
    if (!fullName.trim()) {
      setProfileMsg({ text: "Họ và tên không được để trống", type: "error" });
      return;
    }
    if (phone) {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
        setProfileMsg({
          text: "Số điện thoại phải bao gồm đúng 10 chữ số",
          type: "error",
        });
        return;
      }
    }
    setIsSavingProfile(true);
    try {
      await updateProfile(fullName, phone);
      setProfileMsg({ text: "Cập nhật thông tin tài khoản thành công!", type: "success" });
    } catch (err: any) {
      setProfileMsg({ text: err.message || "Đã xảy ra lỗi khi cập nhật thông tin", type: "error" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ text: "Vui lòng nhập đầy đủ các trường mật khẩu", type: "error" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ text: "Mật khẩu mới phải từ 8 ký tự trở lên", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Mật khẩu xác nhận không khớp", type: "error" });
      return;
    }
    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordMsg({ text: "Cập nhật mật khẩu thành công!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ text: err.message || "Đã xảy ra lỗi khi cập nhật mật khẩu", type: "error" });
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileMsg(null);
    setFullName(customer?.fullName || "");
    setPhone(customer?.phone || "");
  };

  const handleCancelPassword = () => {
    setPasswordMsg(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <section className="setting-page">
        <div className="setting-layout">
          {/* ─── Sidebar ─── */}
          <UserSidebar />

          {/* ─── Main Content ─── */}
          <main className="setting-main">
            <div className="setting-header">
              <h1 className="setting-title">Cài đặt</h1>
              <p className="setting-subtitle">Quản lý thông tin tài khoản và tùy chọn của bạn</p>
            </div>

            {/* ─── Profile Section ─── */}
            <div className="setting-section">
              <h2 className="section-title">Thông tin tài khoản</h2>
              {profileMsg && (
                <div className={`alert-banner alert-banner--${profileMsg.type}`}>
                  {profileMsg.text}
                </div>
              )}
              <div className="profile-content">
                <div className="profile-form">
                  <div className="form-field">
                    <label className="form-label">Họ và tên</label>
                    <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input form-input--disabled" value={email} readOnly />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone || ""}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                        )
                      }
                      placeholder="Chưa cập nhật số điện thoại"
                    />
                  </div>
                </div>
                <div className="profile-avatar-section">
                  <div className="profile-avatar-large"><User size={40} /></div>
                  <button type="button" className="avatar-change-btn"><Camera size={14} /><span>Đổi ảnh đại diện</span></button>
                </div>
              </div>
              <div className="section-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelProfile} disabled={isSavingProfile || isProfileUnchanged}>
                  Hủy bỏ
                </button>
                <button type="button" className="save-btn" onClick={handleSaveProfile} disabled={isSavingProfile || isProfileUnchanged}>
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>

            {/* ─── Password Section ─── */}
            <div className="setting-section">
              <h2 className="section-title">Đổi mật khẩu</h2>
              {customer?.hasPassword ? (
                <>
                  {passwordMsg && (
                    <div className={`alert-banner alert-banner--${passwordMsg.type}`}>
                      {passwordMsg.text}
                    </div>
                  )}
                  <div className="password-grid">
                    <div className="form-field">
                      <label className="form-label">Mật khẩu hiện tại</label>
                      <div className="form-input-wrap">
                        <input type={showCurrent ? "text" : "password"} className="form-input-inner" placeholder="Nhập mật khẩu hiện tại" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <button type="button" className="toggle-pw" onClick={() => setShowCurrent(!showCurrent)}>{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Mật khẩu mới</label>
                      <div className="form-input-wrap">
                        <input type={showNew ? "text" : "password"} className="form-input-inner" placeholder="Nhập mật khẩu mới" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <button type="button" className="toggle-pw" onClick={() => setShowNew(!showNew)}>{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Xác nhận mật khẩu mới</label>
                      <div className="form-input-wrap">
                        <input type={showConfirm ? "text" : "password"} className="form-input-inner" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <button type="button" className="toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                  </div>
                  <div className="section-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancelPassword} disabled={isSavingPassword || isPasswordEmpty}>
                      Hủy bỏ
                    </button>
                    <button type="button" className="save-btn" onClick={handleUpdatePassword} disabled={isSavingPassword || isPasswordEmpty}>
                      {isSavingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="password-disabled-notice">
                  <p>Tài khoản của bạn được liên kết qua Google. Tính năng đổi mật khẩu trực tiếp chỉ khả dụng cho tài khoản đăng ký bằng email thông thường.</p>
                </div>
              )}
            </div>

            {/* ─── Preferences Section ─── */}
            <div className="setting-section">
              <h2 className="section-title">Tùy chọn tài khoản</h2>
              <div className="pref-list">
                <div className="pref-item">
                  <div className="pref-icon"><Bell size={18} /></div>
                  <div className="pref-info">
                    <span className="pref-title">Nhận thông báo đơn hàng qua email</span>
                    <span className="pref-desc">Chúng tôi sẽ gửi thông tin đơn hàng mới nhất đến email của bạn</span>
                  </div>
                  <button type="button" className={`toggle-switch ${emailNotif ? "toggle-switch--on" : ""}`} onClick={() => setEmailNotif(!emailNotif)}>
                    <span className="toggle-knob" />
                  </button>
                </div>
                <div className="pref-item">
                  <div className="pref-icon"><Gift size={18} /></div>
                  <div className="pref-info">
                    <span className="pref-title">Nhận ưu đãi và khuyến mãi</span>
                    <span className="pref-desc">Nhận các chương trình khuyến mãi và ưu đãi đặc biệt từ DUKY STORE</span>
                  </div>
                  <button type="button" className={`toggle-switch ${promoNotif ? "toggle-switch--on" : ""}`} onClick={() => setPromoNotif(!promoNotif)}>
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .setting-page { max-width: 1440px; margin: 0 auto; padding: 40px 2rem 80px; margin-top: 80px; }
        .setting-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; align-items: start; }

        /* Sidebar */
        .setting-sidebar { background: var(--bg-card); border-radius: var(--radius-section); border: 1px solid var(--border-card); box-shadow: var(--card-shadow); padding: 24px 16px; position: sticky; top: 120px; }
        .sidebar-profile { display: flex; flex-direction: column; align-items: center; text-align: center; padding-bottom: 20px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 16px; }
        .sidebar-avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 12px; }
        .sidebar-name { font-size: 15px; font-weight: 700; color: var(--text-main); }
        .sidebar-type { font-size: 12px; color: #f59e0b; font-weight: 600; margin-top: 2px; }
        .sidebar-badge { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 4px 10px; border-radius: 999px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-muted); }
        .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
        .sidebar-nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; font-size: 14px; font-weight: 500; color: var(--text-main); text-decoration: none; transition: var(--transition-fast); border: none; background: transparent; cursor: pointer; width: 100%; text-align: left; }
        .sidebar-nav-item:hover { background: var(--bg-secondary); transform: translateX(4px); }
        .sidebar-nav-item--active { background: var(--bg-secondary); font-weight: 600; }
        .sidebar-nav-item--logout { color: #ef4444; margin-top: 8px; }
        .sidebar-nav-item--logout:hover { background: #fef2f2; }

        /* Main */
        .setting-main { display: flex; flex-direction: column; gap: 24px; }
        .setting-header { margin-bottom: 4px; }
        .setting-title { font-family: var(--font-accent); font-size: 26px; font-weight: 700; color: var(--text-main); }
        .setting-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        /* Sections */
        .setting-section { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-section); padding: 28px; box-shadow: var(--card-shadow); }
        .section-title { font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 20px; }

        /* Profile */
        .profile-content { display: flex; gap: 32px; }
        .profile-form { flex: 1; display: flex; flex-direction: column; gap: 16px; }
        .profile-avatar-section { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .profile-avatar-large { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .avatar-change-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border: 1px solid var(--border-subtle); border-radius: 8px; background: transparent; font-size: 12px; font-weight: 500; color: var(--text-main); cursor: pointer; transition: var(--transition-fast); }
        .avatar-change-btn:hover { background: var(--bg-secondary); }

        /* Form */
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12px; font-weight: 500; color: var(--text-muted); }
        .form-input { padding: 10px 14px; border: 1px solid var(--border-input); border-radius: 8px; font-size: 14px; color: var(--text-main); outline: none; transition: var(--transition-fast); background: #fff; }
        .form-input:focus { border-color: var(--text-main); box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
        .form-input--disabled { background: var(--bg-secondary); color: var(--text-muted); cursor: not-allowed; }

        /* Password */
        .password-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .form-input-wrap { display: flex; align-items: center; border: 1px solid var(--border-input); border-radius: 8px; overflow: hidden; transition: var(--transition-fast); background: #fff; }
        .form-input-wrap:focus-within { border-color: var(--text-main); box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
        .form-input-inner { flex: 1; padding: 10px 14px; border: none; font-size: 14px; color: var(--text-main); outline: none; background: transparent; }
        .form-input-inner::placeholder { color: var(--text-muted); }
        .toggle-pw { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; }
        .toggle-pw:hover { color: var(--text-main); }

        /* Section Actions */
        .section-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
        .cancel-btn { padding: 10px 24px; border-radius: 999px; border: 1px solid var(--border-subtle); background: var(--bg-secondary); color: var(--text-main); font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition-fast); }
        .cancel-btn:hover { background: var(--border-subtle); transform: translateY(-2px); }
        .cancel-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .save-btn { padding: 10px 24px; border-radius: 999px; border: none; background: linear-gradient(135deg, #1a1a1a, #3a3a3a); color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: var(--transition-fast); box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
        .save-btn:hover { background: linear-gradient(135deg, #000, #2a2a2a); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Alert Banners & Notices */
        .alert-banner { padding: 12px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 20px; width: 100%; box-sizing: border-box; }
        .alert-banner--success { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
        .alert-banner--error { background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; }
        .password-disabled-notice { padding: 24px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); text-align: center; color: var(--text-muted); font-size: 14px; line-height: 1.5; }

        /* Preferences */
        .pref-list { display: flex; flex-direction: column; gap: 16px; }
        .pref-item { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border-subtle); }
        .pref-item:last-child { border-bottom: none; }
        .pref-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0; }
        .pref-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .pref-title { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .pref-desc { font-size: 12px; color: var(--text-muted); }

        /* Toggle Switch */
        .toggle-switch { width: 44px; height: 24px; border-radius: 999px; border: none; background: #d1d5db; position: relative; cursor: pointer; transition: background 200ms; flex-shrink: 0; }
        .toggle-switch--on { background: var(--text-main); }
        .toggle-knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 200ms; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .toggle-switch--on .toggle-knob { transform: translateX(20px); }

        /* Responsive */
        @media (max-width: 1024px) { .setting-layout { grid-template-columns: 1fr; } .setting-sidebar { position: static; } .setting-main { min-width: 0; } }
        @media (max-width: 768px) { .profile-content { flex-direction: column; } .password-grid { grid-template-columns: 1fr; } }
        @media (max-width: 640px) { .setting-page { padding: 24px 1rem 60px; } }
      `}</style>
    </>
  );
}
