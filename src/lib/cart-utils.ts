import { CartItemResponse } from "@/lib/api";

/**
 * Computes the total cart count as the sum of all item quantities.
 */
export function computeCartCount(items: CartItemResponse[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

/**
 * Computes the subtotal as the sum of (unitPrice × quantity) for each item.
 */
export function computeSubtotal(items: CartItemResponse[]): number {
  return items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
}

/**
 * Computes the total as subtotal + shipping - discount.
 */
export function computeTotal(
  subtotal: number,
  shipping: number,
  discount: number
): number {
  return subtotal + shipping - discount;
}

/**
 * Returns a Set of all item IDs if selectAll is true, or an empty Set if false.
 */
export function applySelectAll(
  itemIds: string[],
  selectAll: boolean
): Set<string> {
  return selectAll ? new Set(itemIds) : new Set();
}

/**
 * Returns true if and only if selectedIds.size equals totalCount and totalCount > 0.
 */
export function isAllSelected(
  selectedIds: Set<string>,
  totalCount: number
): boolean {
  return totalCount > 0 && selectedIds.size === totalCount;
}

/**
 * Filters out items whose IDs are in the selectedIds set, preserving order.
 */
export function bulkDelete(
  items: CartItemResponse[],
  selectedIds: Set<string>
): CartItemResponse[] {
  return items.filter((item) => !selectedIds.has(item.id));
}

/**
 * Clamps the result of (current + delta) to the range [min, max].
 */
export function clampQuantity(
  current: number,
  delta: number,
  min: number,
  max: number
): number {
  const result = current + delta;
  return Math.max(min, Math.min(max, result));
}
