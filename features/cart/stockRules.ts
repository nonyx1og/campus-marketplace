import { CartValidationResult, EnrichedCartItem, StoredCartItem } from './types';
import { ListingItem } from '@/types/listing';
import { Listing } from '@/types/domain';

/**
 * Reconciles cart items against freshly fetched or cached listing details.
 * Prevents stale listing objects from acting as the single source of truth.
 *
 * Checks:
 * 1. Deleted/missing listings -> status: 'deleted'
 * 2. Out-of-stock listings (stock === 0) -> status: 'out_of_stock'
 * 3. Quantity exceeds stock -> status: 'exceeds_stock'
 * 4. Normal valid listings -> status: 'valid'
 */
export function validateCartAgainstStock(
  cartItems: StoredCartItem[],
  freshListingsMap: Map<string, ListingItem | Listing | null>
): CartValidationResult {
  let hasOutOfStock = false;
  let hasExceedsStock = false;
  let hasDeleted = false;

  const enrichedItems: EnrichedCartItem[] = cartItems.map((cartItem) => {
    const listing = freshListingsMap.get(cartItem.listingId) ?? null;

    if (!listing) {
      hasDeleted = true;
      return {
        listingId: cartItem.listingId,
        quantity: cartItem.quantity,
        listing: null,
        status: 'deleted',
        availableStock: 0,
        unitPriceMinor: 0,
        subtotalMinor: 0,
        errorMessage: 'Sản phẩm đã bị xóa hoặc không còn tồn tại trên chợ.',
      };
    }

    const availableStock =
      typeof listing.stock === 'number' && Number.isFinite(listing.stock)
        ? Math.max(0, Math.floor(listing.stock))
        : 0;

    const unitPriceMinor = Math.max(
      0,
      Math.floor(listing.priceVnd ?? listing.priceMinor ?? 0)
    );
    const subtotalMinor = unitPriceMinor * cartItem.quantity;

    if (availableStock === 0) {
      hasOutOfStock = true;
      return {
        listingId: cartItem.listingId,
        quantity: cartItem.quantity,
        listing,
        status: 'out_of_stock',
        availableStock: 0,
        unitPriceMinor,
        subtotalMinor,
        errorMessage: 'Sản phẩm hiện đã hết hàng trong trường.',
      };
    }

    if (cartItem.quantity > availableStock) {
      hasExceedsStock = true;
      return {
        listingId: cartItem.listingId,
        quantity: cartItem.quantity,
        listing,
        status: 'exceeds_stock',
        availableStock,
        unitPriceMinor,
        subtotalMinor,
        errorMessage: `Số lượng đặt (${cartItem.quantity}) vượt quá tồn kho hiện có (${availableStock}).`,
      };
    }

    return {
      listingId: cartItem.listingId,
      quantity: cartItem.quantity,
      listing,
      status: 'valid',
      availableStock,
      unitPriceMinor,
      subtotalMinor,
    };
  });

  const isValid =
    !hasOutOfStock && !hasExceedsStock && !hasDeleted && enrichedItems.length > 0;
  const canCheckout = isValid;

  let errorSummary: string | undefined;
  if (hasDeleted) {
    errorSummary = 'Có sản phẩm đã bị người bán gỡ hoặc không tồn tại.';
  } else if (hasOutOfStock) {
    errorSummary = 'Có sản phẩm trong giỏ đã hết hàng. Vui lòng gỡ bỏ.';
  } else if (hasExceedsStock) {
    errorSummary = 'Có sản phẩm có số lượng vượt quá tồn kho. Vui lòng giảm số lượng.';
  }

  return {
    isValid,
    hasOutOfStock,
    hasExceedsStock,
    hasDeleted,
    items: enrichedItems,
    canCheckout,
    errorSummary,
  };
}

/**
 * Pure function: auto-adjusts cart quantities to match available stock.
 * Capping quantities at availableStock and removing deleted / zero stock items if requested.
 */
export function autoAdjustCartItems(
  cartItems: StoredCartItem[],
  freshListingsMap: Map<string, ListingItem | Listing | null>,
  removeUnavailable: boolean = true
): StoredCartItem[] {
  const adjusted: StoredCartItem[] = [];

  for (const item of cartItems) {
    const listing = freshListingsMap.get(item.listingId);
    if (!listing) {
      if (!removeUnavailable) {
        adjusted.push(item);
      }
      continue;
    }

    const availableStock =
      typeof listing.stock === 'number' && Number.isFinite(listing.stock)
        ? Math.max(0, Math.floor(listing.stock))
        : 0;

    if (availableStock === 0) {
      if (!removeUnavailable) {
        adjusted.push(item);
      }
      continue;
    }

    const cappedQuantity = Math.min(item.quantity, availableStock);
    if (cappedQuantity > 0) {
      adjusted.push({
        listingId: item.listingId,
        quantity: cappedQuantity,
      });
    }
  }

  return adjusted;
}
