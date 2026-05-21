const ORDER_HISTORY_KEY = "duky_order_history";

export interface StoredOrder {
  code: string;
  phone: string;
  date: string;
  paymentMethod: string;
}

/**
 * Appends an order to the order history stored in localStorage.
 */
export function saveOrderToHistory(order: StoredOrder): void {
  const history = getOrderHistory();
  history.push(order);
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Reads and parses the order history array from localStorage.
 * Returns an empty array if no history exists or if parsing fails.
 */
export function getOrderHistory(): StoredOrder[] {
  const raw = localStorage.getItem(ORDER_HISTORY_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Removes the order history key from localStorage.
 */
export function clearOrderHistory(): void {
  localStorage.removeItem(ORDER_HISTORY_KEY);
}
