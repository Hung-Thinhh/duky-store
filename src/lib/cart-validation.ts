import type { VariantData } from '@/components/shop/product/InfoSection';

export interface ValidateAddToCartParams {
  selectedSize: number | null;
  selectedColor: string | null;
  availableSizes: number[];
  availableColors: string[];
  matchedVariant: VariantData | null;
  quantity: number;
}

export interface ValidationError {
  field: 'size' | 'color' | 'stock';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateAddToCart(params: ValidateAddToCartParams): ValidationResult {
  const {
    selectedSize,
    selectedColor,
    availableSizes,
    availableColors,
    matchedVariant,
    quantity,
  } = params;

  const errors: ValidationError[] = [];

  if (availableSizes.length > 0 && selectedSize === null) {
    errors.push({ field: 'size', message: 'Vui lòng chọn size' });
  }

  if (availableColors.length > 0 && selectedColor === null) {
    errors.push({ field: 'color', message: 'Vui lòng chọn màu' });
  }

  if (matchedVariant?.inventory) {
    const availableQuantity = matchedVariant.inventory.availableQuantity;

    if (availableQuantity === 0) {
      errors.push({ field: 'stock', message: 'Sản phẩm đã hết hàng' });
    } else if (quantity > availableQuantity) {
      errors.push({
        field: 'stock',
        message: `Số lượng yêu cầu vượt quá tồn kho (còn ${availableQuantity} sản phẩm)`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
