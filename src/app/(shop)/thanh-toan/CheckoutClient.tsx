"use client";

import React, { useState, useEffect } from "react";
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
  ShoppingBag,
  Info,
  AlertCircle,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { listAddresses, createAddress, CustomerAddress } from "@/lib/auth-api";
import { formatCurrency } from "@/lib/utils";
import { Header, Footer } from "@/components/layout";
import { Navpages } from "@/components/shop";
import { PopupTemplate } from "@/components/shop/PopupTemplate";
import { addToCartAPI, checkoutAPI } from "@/lib/api";
import {
  validateCheckoutForm,
  ValidationErrors,
} from "@/lib/checkout-validation";
import { saveOrderToHistory } from "@/lib/order-storage";

export function CheckoutClient() {
  const { cart, cartCount, clearCart, getSessionId } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);

  // ─── Quick Buy Mode ──────────────────────────────────────────────────────────
  const searchParams = useSearchParams();
  const isQuickBuy = searchParams.get("quickBuy") === "true";
  const quickBuySlug = searchParams.get("slug");
  const quickBuyProductId = searchParams.get("productId");
  const quickBuyVariantId = searchParams.get("variantId");
  const quickBuyQuantity = Number(searchParams.get("quantity")) || 1;
  const quickBuyName = searchParams.get("name") || "";
  const quickBuyPrice = Number(searchParams.get("price")) || 0;
  const quickBuyImage = searchParams.get("image") || "";
  const quickBuyVariantLabel = searchParams.get("variantLabel") || "";

  const [quickBuyError, setQuickBuyError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
    coupon: "",
    paymentMethod: "cod" as "bank" | "check" | "cod",
  });

  useEffect(() => {
    if (customer?.email) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || customer.email,
      }));
    }
  }, [customer]);

  const subtotal =
    isQuickBuy && quickBuyPrice
      ? quickBuyPrice * quickBuyQuantity
      : cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "phone") {
      val = value.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setForm((prev) => ({ ...prev, [name]: val }));
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

  const handleSelectAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.addressLine,
      province: addr.province || "",
      district: addr.district || "",
      ward: addr.ward || "",
    }));

    // Clear validation errors
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.fullName;
      delete next.phone;
      delete next.addressLine;
      delete next.province;
      delete next.district;
      delete next.ward;
      return next;
    });
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const data = await listAddresses();
        setAddresses(data);
        const defaultAddr = data.find((addr) => addr.isDefault);
        if (defaultAddr) {
          handleSelectAddress(defaultAddr);
        } else if (data.length > 0) {
          handleSelectAddress(data[0]);
        }
      } catch (err) {
        console.error("Failed to load customer addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  const proceedWithCheckout = async () => {
    // Clear previous errors
    setApiError("");

    // Build address parts
    const wardName = form.ward.trim();
    const districtName = form.district.trim();
    const provinceName = form.province.trim();
    const addressLine = form.address;
    const paymentMethod =
      form.paymentMethod === "bank"
        ? ("BANK_TRANSFER" as const)
        : ("COD" as const);

    // Get sessionId from useCart hook
    const sessionId = getSessionId();
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
          localStorage.setItem("duky_cart_session", qbSessionId);
        }

        await addToCartAPI({
          sessionId: qbSessionId,
          productId: quickBuyProductId,
          variantId: quickBuyVariantId || undefined,
          quantity: quickBuyQuantity,
        });

        const order = await checkoutAPI({
          sessionId: qbSessionId,
          customerId: customer?.id || undefined,
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
        window.location.href = `/thanh-toan/thanh-cong?${params.toString()}`;
        return;
      }

      // Standard cart checkout
      const order = await checkoutAPI({
        sessionId,
        customerId: customer?.id || undefined,
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
      window.location.href = `/thanh-toan/thanh-cong?${params.toString()}`;
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setApiError("Lỗi kết nối. Vui lòng thử lại.");
      } else if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (
          msg.includes("cart") &&
          (msg.includes("empty") || msg.includes("trống"))
        ) {
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

  const handleSaveDefaultAddressAndCheckout = async () => {
    setShowAddressPrompt(false);
    setSubmitting(true);
    try {
      await createAddress({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        addressLine: form.address.trim(),
        ward: form.ward.trim(),
        district: form.district.trim(),
        province: form.province.trim(),
        isDefault: true,
      });
    } catch (err: any) {
      console.error("Failed to create default address:", err);
    }
    await proceedWithCheckout();
  };

  const handleCheckoutWithoutSaving = async () => {
    setShowAddressPrompt(false);
    await proceedWithCheckout();
  };

  const handleCancelPrompt = () => {
    setShowAddressPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setApiError("");

    // Build address parts
    const wardName = form.ward.trim();
    const districtName = form.district.trim();
    const provinceName = form.province.trim();
    const addressLine = form.address;
    const paymentMethod =
      form.paymentMethod === "bank"
        ? ("BANK_TRANSFER" as const)
        : ("COD" as const);

    // Validate form
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

      // Scroll to the first invalid field in visual order
      const fieldOrder: (keyof ValidationErrors)[] = [
        "fullName",
        "phone",
        "email",
        "province",
        "district",
        "ward",
        "addressLine",
      ];
      const firstErrorField = fieldOrder.find((field) => errors[field]);
      if (firstErrorField) {
        const inputName =
          firstErrorField === "addressLine" ? "address" : firstErrorField;
        const element = document.getElementsByName(inputName)[0];
        if (element) {
          const formField = element.closest(".form-field");
          if (formField) {
            formField.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus({ preventScroll: true });
          } else {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus({ preventScroll: true });
          }
        }
      }
      return;
    }

    // Clear form errors if validation passes
    setFormErrors({});

    // If logged in and has 0 addresses, ask to save as default
    if (isAuthenticated && addresses.length === 0) {
      setShowAddressPrompt(true);
    } else {
      await proceedWithCheckout();
    }
  };

  return (
    <>
      <Header cartCount={cartCount} />

      <PopupTemplate
        isOpen={showAddressPrompt}
        onClose={handleCancelPrompt}
        size="sm"
        headerTitle="Lưu địa chỉ mặc định?"
        showCloseButton={false}
      >
        <div className="address-modal-content">
          <p className="address-modal__text">
            Bạn chưa có địa chỉ giao hàng nào được lưu trong tài khoản. Bạn có
            muốn lưu thông tin này làm địa chỉ mặc định cho các lần mua hàng sau
            không?
          </p>
          <div className="address-modal__actions">
            <button
              type="button"
              className="address-modal__btn address-modal__btn--primary"
              onClick={handleSaveDefaultAddressAndCheckout}
            >
              Đồng ý & Đặt hàng
            </button>
            <button
              type="button"
              className="address-modal__btn address-modal__btn--secondary"
              onClick={handleCheckoutWithoutSaving}
            >
              Chỉ đặt hàng
            </button>
          </div>
        </div>
      </PopupTemplate>

      <main id="main-content" className="checkout-page">
        <div className="checkout-nav-wrap">
          <Navpages
            items={[{ label: "Trang chủ", href: "/" }, { label: "Thanh toán" }]}
          />
        </div>
        <div className="checkout-layout">
          {/* Left: Payment Info Form */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2 className="checkout-form__title">THÔNG TIN THANH TOÁN</h2>

            {/* Saved Addresses Section */}
            {isAuthenticated && addresses.length > 0 && (
              <div className="saved-addresses-section">
                <label className="form-field__label">
                  Chọn từ địa chỉ đã lưu
                </label>
                <div className="saved-addresses-list">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const parts = [
                      addr.addressLine,
                      addr.ward,
                      addr.district,
                      addr.province,
                    ].filter(Boolean);
                    const fullAddress = parts.join(", ");

                    return (
                      <div
                        key={addr.id}
                        className={`saved-address-card${isSelected ? " saved-address-card--selected" : ""}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <div className="saved-address-card__header">
                          <span className="saved-address-card__name">
                            {addr.fullName}
                          </span>
                          <span className="saved-address-card__phone">
                            {addr.phone}
                          </span>
                          {isSelected && (
                            <div className="saved-address-card__checkmark">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <p className="saved-address-card__address">
                          {fullAddress}
                        </p>
                        {addr.isDefault && (
                          <span className="saved-address-card__default-badge">
                            Mặc định
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="form-field">
              <label className="form-field__label">
                Họ và tên <span className="required">*</span>
              </label>
              <div
                className={`form-field__input-wrap${formErrors.fullName ? " form-field__input-wrap--error" : ""}`}
              >
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
              {formErrors.fullName && (
                <span className="form-field__error">{formErrors.fullName}</span>
              )}
            </div>

            {/* Phone & Email */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-field__label">
                  Số điện thoại <span className="required">*</span>
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.phone ? " form-field__input-wrap--error" : ""}`}
                >
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
                {formErrors.phone && (
                  <span className="form-field__error">{formErrors.phone}</span>
                )}
              </div>
              <div className="form-field">
                <label className="form-field__label">
                  Email <span className="required">*</span>
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.email ? " form-field__input-wrap--error" : ""}`}
                >
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
                {formErrors.email && (
                  <span className="form-field__error">{formErrors.email}</span>
                )}
              </div>
            </div>

            {/* Province & District */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-field__label">
                  Tỉnh / Thành phố <span className="required">*</span>
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.province ? " form-field__input-wrap--error" : ""}`}
                >
                  <div className="form-field__icon-box">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="province"
                    placeholder="Nhập tỉnh / thành phố"
                    value={form.province}
                    onChange={handleChange}
                  />
                </div>
                {formErrors.province && (
                  <span className="form-field__error">
                    {formErrors.province}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label className="form-field__label">
                  Quận / Huyện (tùy chọn)
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.district ? " form-field__input-wrap--error" : ""}`}
                >
                  <div className="form-field__icon-box">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="district"
                    placeholder="Nhập quận / huyện"
                    value={form.district}
                    onChange={handleChange}
                  />
                </div>
                {formErrors.district && (
                  <span className="form-field__error">
                    {formErrors.district}
                  </span>
                )}
              </div>
            </div>

            {/* Ward & Address */}
            <div className="form-row">
              <div className="form-field">
                <label className="form-field__label">
                  Xã / Phường <span className="required">*</span>
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.ward ? " form-field__input-wrap--error" : ""}`}
                >
                  <div className="form-field__icon-box">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    name="ward"
                    placeholder="Nhập xã / phường"
                    value={form.ward}
                    onChange={handleChange}
                  />
                </div>
                {formErrors.ward && (
                  <span className="form-field__error">{formErrors.ward}</span>
                )}
              </div>
              <div className="form-field">
                <label className="form-field__label">
                  Địa chỉ <span className="required">*</span>
                </label>
                <div
                  className={`form-field__input-wrap${formErrors.addressLine ? " form-field__input-wrap--error" : ""}`}
                >
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
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.addressLine;
                          return next;
                        });
                      }
                    }}
                  />
                </div>
                {formErrors.addressLine && (
                  <span className="form-field__error">
                    {formErrors.addressLine}
                  </span>
                )}
              </div>
            </div>

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
                      <Link
                        href={
                          quickBuySlug ? `/san-pham/${quickBuySlug}` : "/bst"
                        }
                        className="order-summary__link"
                      >
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
                        <div
                          className="order-item__img order-item__img--placeholder"
                          style={{
                            width: 56,
                            height: 56,
                            background: "#f3f4f6",
                            borderRadius: 8,
                          }}
                        />
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
                  <Link href="/" className="order-summary__link">
                    Tiếp tục mua sắm
                  </Link>
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="order-item__img-wrap">
                      {item.product?.thumbnailMedia?.secureUrl ||
                      item.product?.thumbnailMedia?.url ? (
                        <Image
                          src={
                            (item.product.thumbnailMedia.secureUrl ||
                              item.product.thumbnailMedia.url)!
                          }
                          alt={item.productName}
                          width={56}
                          height={56}
                          className="order-item__img"
                        />
                      ) : (
                        <div
                          className="order-item__img order-item__img--placeholder"
                          style={{
                            width: 56,
                            height: 56,
                            background: "#f3f4f6",
                            borderRadius: 8,
                          }}
                        />
                      )}
                    </div>
                    <div className="order-item__info">
                      <p className="order-item__name">{item.productName}</p>
                      <p className="order-item__meta">
                        {item.variant && (
                          <>
                            {item.variant.sizeLabel &&
                              `Size: ${item.variant.sizeLabel}`}
                            {item.variant.sizeLabel &&
                              item.variant.colorName &&
                              " / "}
                            {item.variant.colorName &&
                              `Màu: ${item.variant.colorName}`}
                            {" — "}
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
                  <span className="order-summary__tooltip">
                    Khách hàng thanh toán phí ship khi nhận được hàng
                  </span>
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
              <Link href="/chinh-sach" className="order-summary__policy-link">
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
            margin-top: 32px;
            padding: 0 2rem 80px;
          }

          .checkout-nav-wrap {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0 2rem;
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
            color: var(--text-muted);
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
              padding: 0 16px 60px;
            }

            .checkout-form {
              padding: 24px 20px;
            }

            .order-summary {
              position: static;
            }
          }

          /* Saved Addresses in Checkout Styling */
          .saved-addresses-section {
            margin-bottom: 24px;
          }

          .saved-addresses-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 12px;
            margin-top: 8px;
          }

          .saved-address-card {
            border: 1px solid var(--border-card);
            border-radius: 12px;
            padding: 14px;
            background: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .saved-address-card:hover {
            border-color: #000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .saved-address-card--selected {
            border-color: #000;
            background: #fafafa;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .saved-address-card__header {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            padding-right: 20px;
          }

          .saved-address-card__name {
            font-weight: 600;
            font-size: 13px;
            color: var(--text-main);
          }

          .saved-address-card__phone {
            font-size: 12px;
            color: var(--text-muted);
          }

          .saved-address-card__address {
            font-size: 11px;
            color: var(--text-muted);
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .saved-address-card__checkmark {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 18px;
            height: 18px;
            background: #000;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .saved-address-card__default-badge {
            align-self: flex-start;
            font-size: 9px;
            font-weight: 600;
            color: #92400e;
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            margin-top: 4px;
          }

          /* ===== Address Modal ===== */
          :global(.address-modal-content) {
            text-align: center;
          }

          :global(.address-modal__text) {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 24px;
          }

          :global(.address-modal__actions) {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          :global(.address-modal__btn) {
            width: 100%;
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }

          :global(.address-modal__btn--primary) {
            background: var(--accent-black);
            color: #fff;
          }

          :global(.address-modal__btn--primary:hover) {
            background: #1a1a1a;
            transform: translateY(-1px);
          }

          :global(.address-modal__btn--secondary) {
            background: var(--bg-secondary);
            color: var(--text-main);
            border: 1px solid var(--border-input);
          }

          :global(.address-modal__btn--secondary:hover) {
            background: var(--border-subtle);
          }
        `}</style>
      </main>
    </>
  );
}
