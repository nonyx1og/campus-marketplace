import { DeliveryRule, CheckoutSummary } from '@/types/domain';
import {
  DEFAULT_DELIVERY_RULE,
  DORM_FREE_SHIPPING_THRESHOLD,
  CAMPUS_PICKUP_FREE_THRESHOLD,
} from './deliveryRules';
import { CheckoutCalculationItem } from './types';

/**
 * Calculates delivery fee based on campus delivery rule and subtotal.
 * Strictly uses integer arithmetic without floating-point numbers.
 */
export function calculateDeliveryFee(rule: DeliveryRule, subtotalMinor: number): number {
  if (rule.id === 'direct_meetup') {
    return 0;
  }
  if (rule.id === 'dorm_delivery') {
    return subtotalMinor >= DORM_FREE_SHIPPING_THRESHOLD ? 0 : rule.feeMinor;
  }
  if (rule.id === 'campus_pickup') {
    return subtotalMinor >= CAMPUS_PICKUP_FREE_THRESHOLD ? 0 : rule.feeMinor;
  }
  return rule.feeMinor;
}

/**
 * Pure function computing checkout summary using integer minor units (VND integer).
 * Strictly avoids floating point math.
 *
 * @param items Array of items with integer priceMinor and quantity
 * @param deliveryRule The selected campus delivery rule
 * @param discountMinor Optional discount in integer minor units
 * @returns Fully populated CheckoutSummary
 */
export function calculateCheckoutSummary(
  items: CheckoutCalculationItem[],
  deliveryRule: DeliveryRule = DEFAULT_DELIVERY_RULE,
  discountMinor: number = 0
): CheckoutSummary {
  // Validate and sanitize discount
  const safeDiscount = Math.max(0, Math.floor(discountMinor || 0));

  let itemsCount = 0;
  let subtotalMinor = 0;

  for (const item of items) {
    const qty = Math.max(0, Math.floor(item.quantity || 0));
    const price = Math.max(0, Math.floor(item.priceMinor || 0));
    itemsCount += qty;
    subtotalMinor += qty * price;
  }

  // Calculate delivery fee with free delivery thresholds
  const deliveryFeeMinor =
    subtotalMinor > 0 ? calculateDeliveryFee(deliveryRule, subtotalMinor) : 0;

  // Calculate final total (clamped at minimum 0)
  const totalMinor = Math.max(0, subtotalMinor + deliveryFeeMinor - safeDiscount);

  return {
    itemsCount,
    subtotalMinor,
    deliveryFeeMinor,
    discountMinor: safeDiscount,
    totalMinor,
    deliveryRule,
  };
}
