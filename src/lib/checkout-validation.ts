export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  paymentMethod: "COD" | "BANK_TRANSFER";
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  addressLine?: string;
}

/**
 * Validates checkout form data and returns field-specific error messages.
 * Returns an empty object when all fields are valid.
 */
export function validateCheckoutForm(data: CheckoutFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // fullName: required, non-empty after trim
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = "Vui lòng nhập họ và tên";
  }

  // phone: required, length between 8 and 20 characters
  if (!data.phone || data.phone.length < 8 || data.phone.length > 20) {
    errors.phone = "Số điện thoại phải từ 8 đến 20 ký tự";
  }

  // email: optional, but if provided must be valid format
  if (data.email && data.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = "Email không hợp lệ";
    }
  }

  // province: required, non-empty
  if (!data.province || data.province.trim().length === 0) {
    errors.province = "Vui lòng chọn tỉnh/thành phố";
  }

  // district: required, non-empty
  if (!data.district || data.district.trim().length === 0) {
    errors.district = "Vui lòng chọn quận/huyện";
  }

  // ward: required, non-empty
  if (!data.ward || data.ward.trim().length === 0) {
    errors.ward = "Vui lòng chọn phường/xã";
  }

  // addressLine: required, minimum 5 characters after trim
  if (!data.addressLine || data.addressLine.trim().length < 5) {
    errors.addressLine = "Địa chỉ phải có ít nhất 5 ký tự";
  }

  return errors;
}
