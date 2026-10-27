import { ListingItem } from '@/types/listing';
import {
  PriceNotificationPayload,
  FavoritePriceHistory,
  PriceChangeEvaluationResult,
} from './types';

/**
 * Pure function to evaluate price changes for items in user's favorite list.
 * Rules:
 * 1. Only checks items whose IDs are in favoriteIds.
 * 2. If item is newly favorited and has no price record: record current price, do NOT spam notification.
 * 3. If item's price has changed (newPrice !== lastKnownPrice):
 *    - If newPrice < lastKnownPrice: generate 'price_drop' notification.
 *    - If newPrice > lastKnownPrice: generate 'price_increase' or 'price_change'.
 * 4. If item's price is unchanged (newPrice === lastKnownPrice): skip completely ("không spam notification khi giá không đổi").
 * 5. Returns list of triggered notifications and the updated price history map.
 */
export function evaluatePriceChanges(
  favoriteIds: string[],
  currentListings: ListingItem[],
  existingHistory: FavoritePriceHistory = {},
  nowIso: string = new Date().toISOString()
): PriceChangeEvaluationResult {
  const notifications: PriceNotificationPayload[] = [];
  const updatedHistory: FavoritePriceHistory = { ...existingHistory };
  let skippedCount = 0;

  const favSet = new Set(favoriteIds);
  const listingsMap = new Map<string, ListingItem>();
  for (const item of currentListings) {
    if (favSet.has(item.id)) {
      listingsMap.set(item.id, item);
    }
  }

  for (const favId of favoriteIds) {
    const listing = listingsMap.get(favId);
    if (!listing) {
      // Listing not found or deleted, skip
      continue;
    }

    const currentPrice = Math.round(Number(listing.priceVnd));
    const record = existingHistory[favId];

    if (!record) {
      // First time tracking this favorited product: establish baseline price, do not spam alert
      updatedHistory[favId] = {
        lastKnownPriceVnd: currentPrice,
        lastNotifiedPriceVnd: currentPrice,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    const previousPrice = record.lastKnownPriceVnd;

    // Price did not change: DO NOT SPAM NOTIFICATION!
    if (currentPrice === previousPrice) {
      updatedHistory[favId] = {
        ...record,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    // Price changed! Check if already notified for this exact price
    if (record.lastNotifiedPriceVnd === currentPrice) {
      // Already notified for this exact price, suppress duplicate
      updatedHistory[favId] = {
        ...record,
        lastKnownPriceVnd: currentPrice,
        lastCheckedAt: nowIso,
      };
      skippedCount++;
      continue;
    }

    // Generate price notification
    const savedDiff = previousPrice - currentPrice;
    const isDrop = currentPrice < previousPrice;

    notifications.push({
      id: `notif-price-${favId}-${Date.now()}`,
      listingId: favId,
      listingTitle: listing.title,
      oldPriceVnd: previousPrice,
      newPriceVnd: currentPrice,
      savedDiffVnd: Math.abs(savedDiff),
      timestamp: nowIso,
      type: isDrop ? 'price_drop' : 'price_change',
    });

    updatedHistory[favId] = {
      lastKnownPriceVnd: currentPrice,
      lastNotifiedPriceVnd: currentPrice,
      lastCheckedAt: nowIso,
    };
  }

  return {
    notifications,
    updatedHistory,
    skippedCount,
  };
}
