/**
 * Integer-based currency formatting and calculation utilities.
 * RULE: Currencies must always be handled as integers (VND) to eliminate floating-point precision errors.
 */

/**
 * Format an integer amount into Vietnamese Dong currency string.
 * @param amountInVnd Integer representation of money in VND (e.g., 50000)
 */
export function formatVND(amountInVnd: number): string {
  if (!Number.isFinite(amountInVnd)) {
    return '0 ₫';
  }

  // Ensure amount is strictly treated as an integer
  const integerAmount = Math.round(amountInVnd);

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(integerAmount);
}

/**
 * Safely add two integer amounts.
 */
export function addMoney(a: number, b: number): number {
  return Math.round(a) + Math.round(b);
}

/**
 * Safely calculate total for integer prices and quantities.
 */
export function calculateLineTotal(unitPrice: number, quantity: number): number {
  const safePrice = Math.round(unitPrice);
  const safeQty = Math.max(0, Math.floor(quantity));
  return safePrice * safeQty;
}
