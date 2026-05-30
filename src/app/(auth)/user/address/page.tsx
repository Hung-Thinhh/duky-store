"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Pencil, Trash2, Plus, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Header, Footer } from "@/components/layout";
import { UserSidebar } from "@/components/auth/UserSidebar";
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  CustomerAddress,
} from "@/lib/auth-api";

export default function AddressPage() {
  const { cartCount } = useCart();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [note, setNote] = useState("Nhà riêng");

  const fetchAddresses = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await listAddresses();
      setAddresses(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setAddressLine("");
    setWard("");
    setDistrict("");
    setProvince("");
    setIsDefault(false);
    setNote("Nhà riêng");
  };

  const handleAddNewClick = () => {
    resetForm();
    setEditingAddressId(null);
    setShowForm(true);
  };

  const handleEditClick = (addr: CustomerAddress) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine(addr.addressLine);
    setWard(addr.ward || "");
    setDistrict(addr.district || "");
    setProvince(addr.province || "");
    setIsDefault(addr.isDefault);
    setNote(addr.note || "Nhà riêng");
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddressId(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !ward.trim() ||
      !province.trim()
    ) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullName,
        phone,
        addressLine,
        ward: ward.trim(),
        district: district.trim() || null,
        province: province.trim(),
        isDefault,
        note: note || "Nhà riêng",
      };

      if (editingAddressId) {
        await updateAddress(editingAddressId, payload);
      } else {
        await createAddress(payload);
      }

      setShowForm(false);
      setEditingAddressId(null);
      resetForm();
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || "Đã xảy ra lỗi khi lưu địa chỉ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      await deleteAddress(id);
      await fetchAddresses();
    } catch (err: any) {
      alert(err.message || "Không thể xóa địa chỉ");
    }
  };

  const formatFullAddress = (addr: CustomerAddress) => {
    const parts = [
      addr.addressLine,
      addr.ward,
      addr.district,
      addr.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

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
                <p className="address-subtitle">
                  Quản lý các địa chỉ giao hàng của bạn
                </p>
              </div>
              {!showForm && (
                <button
                  type="button"
                  className="address-add-btn"
                  onClick={handleAddNewClick}
                >
                  <Plus size={16} />
                  <span>Thêm địa chỉ mới</span>
                </button>
              )}
            </div>

            {/* Address Form Card */}
            {showForm && (
              <form onSubmit={handleSubmit} className="address-form-card">
                <h2 className="form-card-title">
                  {editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
                </h2>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Họ và tên người nhận{" "}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Số điện thoại liên hệ{" "}
                      <span className="required-star">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Số nhà, tên đường <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Địa chỉ cụ thể"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Phường / Xã <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      placeholder="Phường / Xã"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Quận / Huyện (tùy chọn)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Quận / Huyện"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Tỉnh / Thành phố <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Tỉnh / Thành phố"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Loại địa chỉ</label>
                    <select
                      className="form-input"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    >
                      <option value="Nhà riêng">Nhà riêng</option>
                      <option value="Văn phòng">Văn phòng</option>
                      <option value="Nhà người thân">Nhà người thân</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-checkbox-field">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    <span>Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu địa chỉ"}
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {isLoading ? (
              <div className="address-loading">
                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
              </div>
            ) : errorMsg ? (
              <div className="alert-banner alert-banner--error">{errorMsg}</div>
            ) : addresses.length === 0 ? (
              <div className="no-address-state">
                <MapPin size={48} className="no-address-icon" />
                <p>Bạn chưa thêm địa chỉ giao hàng nào.</p>
                {!showForm && (
                  <button
                    type="button"
                    className="address-add-btn"
                    style={{ marginTop: 16 }}
                    onClick={handleAddNewClick}
                  >
                    <Plus size={16} />
                    <span>Thêm địa chỉ mới</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className="address-card">
                    {/* Left: Type badge + Icon */}
                    <div className="address-card-left">
                      <span
                        className={`address-type-badge ${addr.isDefault ? "address-type-badge--default" : ""}`}
                      >
                        {addr.isDefault ? "Mặc định" : addr.note || "Địa chỉ"}
                      </span>
                      <div className="address-card-icon">
                        <MapPin size={20} />
                      </div>
                    </div>

                    {/* Center: Info */}
                    <div className="address-card-center">
                      <h3 className="address-card-name">{addr.fullName}</h3>
                      <p className="address-card-phone">SĐT: {addr.phone}</p>
                      <p className="address-card-address">
                        Địa chỉ: {formatFullAddress(addr)}
                      </p>
                      <p className="address-card-type">
                        Loại địa chỉ: {addr.note || "Khác"}
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="address-card-actions">
                      <button
                        type="button"
                        className="address-action-btn"
                        onClick={() => handleEditClick(addr)}
                      >
                        <Pencil size={14} />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        className="address-action-btn address-action-btn--delete"
                        onClick={() => handleDeleteClick(addr.id)}
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

        .sidebar-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }
        .sidebar-type {
          font-size: 12px;
          color: #f59e0b;
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
          color: #ef4444;
          margin-top: 8px;
        }
        .sidebar-nav-item--logout:hover {
          background: #fef2f2;
        }

        /* ─── Main ─── */
        .address-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .address-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .address-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

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

        /* ─── Address Form Card ─── */
        .address-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 28px;
          box-shadow: var(--card-shadow);
          margin-bottom: 24px;
        }

        .form-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .required-star {
          color: #ef4444;
          margin-left: 2px;
          font-weight: 600;
        }

        .form-input {
          padding: 10px 14px;
          border: 1px solid var(--border-input);
          border-radius: 8px;
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          transition: var(--transition-fast);
          background: #fff;
        }

        .form-input:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .form-checkbox-field {
          margin-top: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 20px;
        }

        .cancel-btn {
          padding: 10px 24px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          color: var(--text-main);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .cancel-btn:hover {
          background: var(--border-subtle);
          transform: translateY(-2px);
        }

        .address-form-card .save-btn {
          padding: 10px 24px;
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

        .address-form-card .save-btn:hover {
          background: linear-gradient(135deg, #000, #2a2a2a);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        .address-form-card .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* ─── Address List ─── */
        .address-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

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

        .address-card-name {
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
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

        .address-card-type {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 6px;
          font-weight: 500;
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

        /* ─── Loading and Empty States ─── */
        .address-loading {
          min-h: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }

        .no-address-state {
          padding: 48px;
          text-align: center;
          background: var(--bg-card);
          border: 1px dashed var(--border-subtle);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 14px;
        }

        .no-address-icon {
          margin-bottom: 12px;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .alert-banner {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          width: 100%;
          box-sizing: border-box;
        }
        .alert-banner--error {
          background: #fee2e2;
          color: #ef4444;
          border: 1px solid #fecaca;
        }

        /* ─── Responsive ─── */
        @media (max-width: 1024px) {
          .address-layout {
            grid-template-columns: 1fr;
          }
          .address-sidebar {
            position: static;
          }
          .address-main {
            min-width: 0;
          }
        }

        @media (max-width: 768px) {
          .address-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .address-card-actions {
            align-self: flex-end;
          }
          .address-header {
            flex-direction: column;
            gap: 16px;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .address-page {
            padding: 24px 1rem 60px;
          }
        }
      `}</style>
    </>
  );
}
