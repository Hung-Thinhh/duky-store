"use client";

import React, { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Lock,
  ChevronDown,
  ShoppingBag,
  Info,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop";
import { useVietnamLocations } from "@/hooks/useVietnamLocations";
import { addToCartAPI, checkoutAPI } from "@/lib/api";
import { validateCheckoutForm, ValidationErrors } from "@/lib/checkout-validation";
import { saveOrderToHistory } from "@/lib/order-storage";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { cart, cartCount, updateQuantity, removeFromCart, clearCart, getSessionId } = useCart();
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    loading,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
  } = useVietnamLocations();

  // ─── Quick Buy Mode ──────────────────────────────────────────────────────────
  const searchParams = useSearchParams();
  const isQuickBuy = searchParams.get('quickBuy') === 'true';
  const quickBuySlug = searchParams.get('slug');
  const quickBuyProductId = searchParams.get('productId');
  const quickBuyVariantId = searchParams.get('variantId');
  const quickBuyQuantity = Number(searchParams.get('quantity')) || 1;
  const quickBuyName = searchParams.get('name') || '';
  const quickBuyPrice = Number(searchParams.get('price')) || 0;
  const quickBuyImage = searchParams.get('image') || '';
  const quickBuyVariantLabel = searchParams.get('variantLabel') || '';

  const [quickBuyError, setQuickBuyError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    altAddress: "",
    note: "",
    coupon: "",
    shipToOther: false,
    paymentMethod: "cod" as "bank" | "check" | "cod",
  });

  const subtotal = isQuickBuy && quickBuyPrice
    ? quickBuyPrice * quickBuyQuantity
    : cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user modifies the field
    if (name in formErrors) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof ValidationErrors];
        return next;
      });
    }
    // Clear API error when user retries
    if (apiError) {
      setApiError("");
    }
  };

  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setApiError("");

    // Build address parts
    const wardName = wards.find(w => String(w.code) === selectedWard)?.name || '';
    const districtName = districts.find(d => String(d.code) === selectedDistrict)?.name || '';
    const provinceName = provinces.find(p => String(p.code) === selectedProvince)?.name || '';

    const addressLine = form.shipToOther && form.altAddress
      ? form.altAddress
      : form.address;

    // Map payment method
    const paymentMethod = form.paymentMethod === "bank" ? "BANK_TRANSFER" as const : "COD" as const;

    // 1. Validate with validateCheckoutForm
    const errors = validateCheckoutForm({
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      province: provinceName,
      district: districtName,
      ward: wardName,
      addressLine: addressLine,
      paymentMethod,
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear form errors if validation passes
    setFormErrors({});

    // Get sessionId from localStorage
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('duky_cart_session') || '' : '';
    if (!sessionId && !isQuickBuy) {
      setApiError("Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm vào giỏ.");
      return;
    }

    setSubmitting(true);

    try {
      // If quick buy, add product to cart then checkout immediately
      if (isQuickBuy && quickBuyProductId) {
        // Need a session for the cart
        const qbSessionId = sessionId || crypto.randomUUID();
        if (!sessionId) {
          localStorage.setItem('duky_cart_session', qbSessionId);
        }

        await addToCartAPI({
          sessionId: qbSessionId,
          productId: quickBuyProductId,
          variantId: quickBuyVariantId || undefined,
          quantity: quickBuyQuantity,
        });

        const order = await checkoutAPI({
          sessionId: qbSessionId,
          customerName: form.fullName.trim(),
          customerPhone: form.phone.trim(),
          customerEmail: form.email.trim() || undefined,
          paymentMethod,
          addressLine: addressLine.trim(),
          ward: wardName,
          district: districtName,
          province: provinceName,
          country: "VN",
          customerNote: form.note.trim() || undefined,
        });

        // Quick buy: do NOT clear cart, just save order and redirect
        saveOrderToHistory({
          code: order.code,
          phone: form.phone,
          date: order.createdAt,
          paymentMethod: form.paymentMethod,
        });

        const orderDate = new Date(order.createdAt).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const params = new URLSearchParams({
          orderCode: order.code,
          orderDate,
          payment: form.paymentMethod,
        });
        window.location.href = `/checkout/success?${params.toString()}`;
        return;
      }

      // Standard cart checkout
      const order = await checkoutAPI({
        sessionId,
        customerName: form.fullName.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim() || undefined,
        paymentMethod,
        addressLine: addressLine.trim(),
        ward: wardName,
        district: districtName,
        province: provinceName,
        country: "VN",
        customerNote: form.note.trim() || undefined,
      });

      // Standard flow: clear cart and save order to history
      clearCart();
      saveOrderToHistory({
        code: order.code,
        phone: form.phone,
        date: order.createdAt,
        paymentMethod: form.paymentMethod,
      });

      // Navigate to success page with real order data
      const orderDate = new Date(order.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const params = new URLSearchParams({
        orderCode: order.code,
        orderDate,
        payment: form.paymentMethod,
      });
      window.location.href = `/checkout/success?${params.toString()}`;
    } catch (err) {
      // 4.2: Structured API error handling
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setApiError("Lỗi kết nối. Vui lòng thử lại.");
      } else if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("cart") && (msg.includes("empty") || msg.includes("trống"))) {
          setApiError("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
        } else if (msg.includes("out of stock") || msg.includes("hết hàng")) {
          setApiError(err.message);
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError("Lỗi kết nối. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header cartCount={cartCount} />
      
      <section className="checkout-page">
        <div className="checkout-nav-wrap">
        <Navpages
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Thanh toán" },
          ]}
        />
      </div>
      <div className="checkout-layout">
        
        {/* Left: Payment Info Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2 className="checkout-form__title">THÔNG TIN THANH TOÁN</h2>

          {/* Full Name */}
          <div className="form-field">
            <label className="form-field__label">
              Họ và tên <span className="required">*</span>
            </label>
            <div className={`form-field__input-wrap${formErrors.fullName ? ' form-field__input-wrap--error' : ''}`}>
              <div className="form-field__icon-box">
                <User size={18} />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
            {formErrors.fullName && <span className="form-field__error">{formErrors.fullName}</span>}
          </div>

          {/* Phone & Email */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">
                Số điện thoại <span className="required">*</span>
              </label>
              <div className={`form-field__input-wrap${formErrors.phone ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              {formErrors.phone && <span className="form-field__error">{formErrors.phone}</span>}
            </div>
            <div className="form-field">
              <label className="form-field__label">Email (tùy chọn)</label>
              <div className={`form-field__input-wrap${formErrors.email ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập địa chỉ email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {formErrors.email && <span className="form-field__error">{formErrors.email}</span>}
            </div>
          </div>

          {/* City & District */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">
                Tỉnh / Thành phố <span className="required">*</span>
              </label>
              <div className={`form-field__input-wrap form-field__select-wrap${formErrors.province ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <MapPin size={18} />
                </div>
                <select
                  name="city"
                  value={selectedProvince}
                  onChange={(e) => {
                    handleProvinceChange(e.target.value);
                    if (formErrors.province) {
                      setFormErrors((prev) => { const next = { ...prev }; delete next.province; return next; });
                    }
                    if (apiError) setApiError("");
                  }}
                >
                  <option value="">
                    {loading.provinces ? "Đang tải..." : "Chọn tỉnh / thành phố"}
                  </option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="form-field__chevron" />
              </div>
              {formErrors.province && <span className="form-field__error">{formErrors.province}</span>}
            </div>
            <div className="form-field">
              <label className="form-field__label">
                Quận / Huyện <span className="required">*</span>
              </label>
              <div className={`form-field__input-wrap form-field__select-wrap${formErrors.district ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <MapPin size={18} />
                </div>
                <select
                  name="district"
                  value={selectedDistrict}
                  onChange={(e) => {
                    handleDistrictChange(e.target.value);
                    if (formErrors.district) {
                      setFormErrors((prev) => { const next = { ...prev }; delete next.district; return next; });
                    }
                    if (apiError) setApiError("");
                  }}
                  disabled={!selectedProvince}
                >
                  <option value="">
                    {loading.districts ? "Đang tải..." : "Chọn quận / huyện"}
                  </option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="form-field__chevron" />
              </div>
              {formErrors.district && <span className="form-field__error">{formErrors.district}</span>}
            </div>
          </div>

          {/* Ward & Address */}
          <div className="form-row">
            <div className="form-field">
              <label className="form-field__label">
                Xã / Phường <span className="required">*</span>
              </label>
              <div className={`form-field__input-wrap form-field__select-wrap${formErrors.ward ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <MapPin size={18} />
                </div>
                <select
                  name="ward"
                  value={selectedWard}
                  onChange={(e) => {
                    handleWardChange(e.target.value);
                    if (formErrors.ward) {
                      setFormErrors((prev) => { const next = { ...prev }; delete next.ward; return next; });
                    }
                    if (apiError) setApiError("");
                  }}
                  disabled={!selectedDistrict}
                >
                  <option value="">
                    {loading.wards ? "Đang tải..." : "Chọn xã / phường"}
                  </option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="form-field__chevron" />
              </div>
              {formErrors.ward && <span className="form-field__error">{formErrors.ward}</span>}
            </div>
            <div className="form-field">
              <label className="form-field__label">
                Địa chỉ <span className="required">*</span>
              </label>
              <div className={`form-field__input-wrap${formErrors.addressLine ? ' form-field__input-wrap--error' : ''}`}>
                <div className="form-field__icon-box">
                  <Home size={18} />
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Ví dụ: Số 20, ngõ 90"
                  value={form.address}
                  onChange={(e) => {
                    handleChange(e);
                    if (formErrors.addressLine) {
                      setFormErrors((prev) => { const next = { ...prev }; delete next.addressLine; return next; });
                    }
                  }}
                />
              </div>
              {formErrors.addressLine && <span className="form-field__error">{formErrors.addressLine}</span>}
            </div>
          </div>

          {/* Ship to other address */}
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.shipToOther}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, shipToOther: e.target.checked }))
              }
            />
            <span>Giao hàng tới địa chỉ khác?</span>
          </label>

          {form.shipToOther && (
            <div className="form-field">
              <label className="form-field__label">
                Địa chỉ bạn muốn nhận hàng <span className="required">*</span>
              </label>
              <div className="form-field__input-wrap">
                <div className="form-field__icon-box">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  name="altAddress"
                  placeholder="Nhập địa chỉ"
                  value={form.altAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="form-field">
            <label className="form-field__label">
              Ghi chú đơn hàng (tùy chọn)
            </label>
            <textarea
              name="note"
              placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
              value={form.note}
              onChange={handleChange}
              maxLength={300}
              rows={4}
              className="form-field__textarea"
            />
            <span className="form-field__counter">
              {form.note.length}/300
            </span>
          </div>
        </form>

        {/* Right: Order Summary */}
        <div className="order-summary">
          <div className="order-summary__header">
            <div className="order-summary__header-icon">
              <ShoppingBag size={20} />
            </div>
            <h3 className="order-summary__title">ĐƠN HÀNG CỦA BẠN</h3>
          </div>

          {/* API Error Banner */}
          {apiError && (
            <div className="order-summary__error-banner">
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </div>
          )}

          {/* Product list header */}
          <div className="order-summary__list-header">
            <span>SẢN PHẨM</span>
            <span>TẠM TÍNH</span>
          </div>

          {/* Product items */}
          <div className="order-summary__items">
            {isQuickBuy ? (
              quickBuyError ? (
                <div className="order-summary__error-banner">
                  <AlertCircle size={16} />
                  <span>
                    {quickBuyError}{" "}
                    <Link href={quickBuySlug ? `/products/${quickBuySlug}` : "/collections"} className="order-summary__link">
                      Quay lại sản phẩm
                    </Link>
                  </span>
                </div>
              ) : (
                <div className="order-item">
                  <div className="order-item__img-wrap">
                    {quickBuyImage ? (
                      <Image
                        src={quickBuyImage}
                        alt={quickBuyName}
                        width={56}
                        height={56}
                        className="order-item__img"
                      />
                    ) : (
                      <div className="order-item__img order-item__img--placeholder" style={{ width: 56, height: 56, background: '#f3f4f6', borderRadius: 8 }} />
                    )}
                  </div>
                  <div className="order-item__info">
                    <p className="order-item__name">{quickBuyName}</p>
                    <p className="order-item__meta">
                      {quickBuyVariantLabel && `${quickBuyVariantLabel} — `}
                      ×&nbsp;{quickBuyQuantity}
                    </p>
                  </div>
                  <span className="order-item__price">
                    {formatCurrency(quickBuyPrice * quickBuyQuantity)}
                  </span>
                </div>
              )
            ) : cart.length === 0 ? (
              <p className="order-summary__empty">
                Giỏ hàng trống.{" "}
                <Link href="/collections" className="order-summary__link">
                  Tiếp tục mua sắm
                </Link>
              </p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item__img-wrap">
                    {item.product?.thumbnailMedia?.secureUrl || item.product?.thumbnailMedia?.url ? (
                      <Image
                        src={(item.product.thumbnailMedia.secureUrl || item.product.thumbnailMedia.url)!}
                        alt={item.productName}
                        width={56}
                        height={56}
                        className="order-item__img"
                      />
                    ) : (
                      <div className="order-item__img order-item__img--placeholder" style={{ width: 56, height: 56, background: '#f3f4f6', borderRadius: 8 }} />
                    )}
                  </div>
                  <div className="order-item__info">
                    <p className="order-item__name">{item.productName}</p>
                    <p className="order-item__meta">
                      {item.variant && (
                        <>
                          {item.variant.sizeLabel && `Size: ${item.variant.sizeLabel}`}
                          {item.variant.sizeLabel && item.variant.colorName && ' / '}
                          {item.variant.colorName && `Màu: ${item.variant.colorName}`}
                          {' — '}
                        </>
                      )}
                      ×&nbsp;{item.quantity}
                    </p>
                  </div>
                  <span className="order-item__price">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Coupon input */}
          <div className="order-summary__coupon">
            <input
              type="text"
              name="coupon"
              placeholder="Nhập mã ưu đãi"
              value={form.coupon}
              onChange={handleChange}
              className="order-summary__coupon-input"
            />
            <button type="button" className="order-summary__coupon-btn">
              ÁP DỤNG
            </button>
          </div>

          {/* Subtotal & Shipping */}
          <div className="order-summary__row">
            <span>Tạm tính</span>
            <span className="order-summary__value">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="order-summary__row">
            <span className="order-summary__shipping-label">
              Phí giao hàng
              <span className="order-summary__tooltip-wrap">
                <Info size={14} className="order-summary__tooltip-icon" />
                <span className="order-summary__tooltip">Khách hàng thanh toán phí ship khi nhận được hàng</span>
              </span>
            </span>
            <span className="order-summary__value order-summary__free">
              Khách hàng thanh toán
            </span>
          </div>

          {/* Total */}
          <div className="order-summary__total">
            <span>TỔNG CỘNG</span>
            <span className="order-summary__total-value">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <label className="payment-option payment-option--disabled">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                disabled
              />
              <span className="payment-option__radio" />
              <span>Chuyển khoản ngân hàng</span>
              <span className="payment-option__badge">Sắp ra mắt</span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={form.paymentMethod === "cod"}
                onChange={handleChange}
              />
              <span className="payment-option__radio" />
              <span>Trả tiền mặt khi nhận hàng</span>
            </label>

            {form.paymentMethod === "cod" && (
              <div className="payment-description">
                <Lock size={16} className="payment-description__icon" />
                <p>
                  Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng từ nhân viên
                  giao hàng.
                </p>
              </div>
            )}
          </div>

          {/* Privacy note */}
          <p className="order-summary__privacy">
            Thông tin cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng, tăng
            trải nghiệm sử dụng website, và cho các mục đích cụ thể khác đã
            được mô tả trong{" "}
            <Link href="/policy" className="order-summary__policy-link">
              chính sách riêng tư
            </Link>{" "}
            của chúng tôi.
          </p>

          {/* Place Order Button */}
          <button
            type="submit"
            className="order-summary__submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .checkout-page {
          max-width: 1440px;
          margin: 0 auto;
          margin-top: 24px;
          padding: 40px 2rem 80px;
        }

        .checkout-nav-wrap {
          max-width: 1440px;
          margin: 24px auto 0;
          padding: 0 2rem;
        }

        .coupon-banner__icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-main);
        }

        .coupon-banner__text {
          flex: 1;
          font-size: 14px;
          color: var(--text-muted);
        }

        .coupon-banner__input-wrap {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-btn);
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .coupon-banner__input {
          padding: 10px 16px;
          border: none;
          outline: none;
          font-size: 14px;
          background: transparent;
          color: var(--text-main);
          width: 180px;
        }

        .coupon-banner__input::placeholder {
          color: var(--text-label);
        }

        .coupon-banner__btn {
          padding: 10px 20px;
          background: var(--accent-black);
          color: #fff;
          border: none;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .coupon-banner__btn:hover {
          background: #333;
        }

        /* ===== Layout ===== */
        .checkout-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }

        /* ===== Form ===== */
        .checkout-form {
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 40px 36px;
          box-shadow: var(--card-shadow);
        }

        .checkout-form__title {
          font-family: var(--font-accent);
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 28px;
          letter-spacing: -0.01em;
        }

        /* Form Field */
        .form-field {
          margin-bottom: 20px;
          flex: 1;
        }

        .form-field__label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .required {
          color: #e53e3e;
        }

        .form-field__input-wrap {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: var(--transition-fast);
          background: #fff;
        }

        .form-field__input-wrap:focus-within {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .form-field__input-wrap--error {
          border-color: #e53e3e;
        }

        .form-field__input-wrap--error:focus-within {
          border-color: #e53e3e;
          box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.1);
        }

        .form-field__error {
          display: block;
          font-size: 12px;
          color: #e53e3e;
          margin-top: 4px;
        }

        .form-field__icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          flex-shrink: 0;
          color: var(--text-muted);
        }

        .form-field__input-wrap input,
        .form-field__input-wrap select {
          flex: 1;
          padding: 12px 16px 12px 0;
          border: none;
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          background: transparent;
          appearance: none;
          -webkit-appearance: none;
        }

        .form-field__input-wrap input::placeholder {
          color: var(--text-label);
        }

        .form-field__select-wrap {
          position: relative;
        }

        .form-field__chevron {
          position: absolute;
          right: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        /* Checkbox */
        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--text-main);
          margin-bottom: 24px;
          cursor: pointer;
        }

        .checkbox-field input {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-black);
          cursor: pointer;
        }

        /* Textarea */
        .form-field__textarea {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          resize: vertical;
          min-height: 100px;
          font-family: var(--font-main);
          transition: var(--transition-fast);
        }

        .form-field__textarea::placeholder {
          color: var(--text-label);
        }

        .form-field__textarea:focus {
          border-color: var(--text-main);
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .form-field__counter {
          display: block;
          text-align: right;
          font-size: 12px;
          color: var(--text-label);
          margin-top: 4px;
        }

        /* ===== Order Summary ===== */
        .order-summary {
          background: var(--bg-card);
          border-radius: var(--radius-section);
          padding: 32px 28px;
          box-shadow: var(--card-shadow);
          position: sticky;
          top: 120px;
        }

        .order-summary__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .order-summary__header-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
        }

        .order-summary__title {
          font-family: var(--font-accent);
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-summary__error-banner {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
          font-size: 13px;
          color: #dc2626;
          line-height: 1.4;
        }

        .order-summary__error-banner svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .order-summary__list-header {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 16px;
        }

        .order-summary__items {
          margin-bottom: 20px;
        }

        .order-summary__coupon {
          display: flex;
          align-items: center;
          gap: 0;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-btn);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .order-summary__coupon-input {
          flex: 1;
          padding: 10px 16px;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--text-main);
          background: transparent;
        }

        .order-summary__coupon-input::placeholder {
          color: var(--text-label);
        }

        .order-summary__coupon-btn {
          padding: 10px 18px;
          background: var(--accent-black);
          color: #fff;
          border: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }

        .order-summary__coupon-btn:hover {
          background: #333;
        }

        .order-summary__empty {
          font-size: 14px;
          color: var(--text-muted);
          text-align: center;
          padding: 20px 0;
        }

        .order-summary__link {
          color: var(--text-main);
          text-decoration: underline;
          font-weight: 600;
        }

        /* Order Item */
        .order-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .order-item__img-wrap {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          overflow: hidden;
          background: var(--bg-secondary);
          flex-shrink: 0;
        }

        .order-item__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .order-item__info {
          flex: 1;
          min-width: 0;
        }

        .order-item__name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .order-item__meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .order-item__price {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
        }

        /* Summary rows */
        .order-summary__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          font-size: 14px;
          color: var(--text-main);
          border-bottom: 1px solid var(--border-subtle);
        }

        .order-summary__value {
          font-weight: 600;
        }

        .order-summary__free {
          color: var(--text-muted);
          font-style: italic;
        }

        .order-summary__shipping-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .order-summary__tooltip-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        .order-summary__tooltip-icon {
          color: #9ca3af;
          transition: color 0.2s;
        }

        .order-summary__tooltip-wrap:hover .order-summary__tooltip-icon {
          color: #374151;
        }

        .order-summary__tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: #fff;
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          padding: 8px 12px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 10;
        }

        .order-summary__tooltip-wrap:hover .order-summary__tooltip {
          opacity: 1;
        }

        .order-summary__total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        .order-summary__total-value {
          font-family: var(--content);
          font-size: 15px;
          font-weight: 800;
          color: #000000ff;
        }

        /* Payment Methods */
        .payment-methods {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--text-main);
          cursor: pointer;
        }

        .payment-option input[type="radio"] {
          display: none;
        }

        .payment-option--disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .payment-option__badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .payment-option__radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border-input);
          position: relative;
          flex-shrink: 0;
          transition: var(--transition-fast);
        }

        .payment-option input[type="radio"]:checked + .payment-option__radio {
          border-color: var(--accent-black);
        }

        .payment-option
          input[type="radio"]:checked
          + .payment-option__radio::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-black);
        }

        .payment-description {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          padding: 14px 16px;
          margin-top: 4px;
        }

        .payment-description__icon {
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .payment-description p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* Privacy */
        .order-summary__privacy {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.6;
          margin-top: 20px;
        }

        .order-summary__policy-link {
          color: var(--accent-black);
          text-decoration: underline;
          font-weight: 600;
        }

        /* Submit Button */
        .order-summary__submit {
          width: 100%;
          margin-top: 20px;
          padding: 16px;
          background: var(--accent-black);
          color: #fff;
          border: none;
          border-radius: var(--radius-btn);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .order-summary__submit:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .order-summary__submit:active {
          transform: translateY(0);
        }

        /* ===== Responsive ===== */
        @media (max-width: 600px) {
          .checkout-page {
            padding: 20px 16px 60px;
          }

          .coupon-banner__input-wrap {
            width: 100%;
          }

          .coupon-banner__input {
            flex: 1;
            width: auto;
          }

          .checkout-form {
            padding: 24px 20px;
          }

          .order-summary {
            position: static;
          }
        }
      `}</style>
    </section>
      <Footer />
    </>
  );
}
