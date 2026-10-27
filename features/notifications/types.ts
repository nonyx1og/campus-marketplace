export type NotificationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface PriceNotificationPayload {
  id: string;
  listingId: string;
  listingTitle: string;
  oldPriceVnd: number;
  newPriceVnd: number;
  savedDiffVnd: number;
  timestamp: string;
  type: 'price_drop' | 'price_increase' | 'price_change';
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  listingId?: string;
  read: boolean;
  type: 'price_drop' | 'system' | 'general';
}

export interface PriceRecord {
  lastKnownPriceVnd: number;
  lastNotifiedPriceVnd?: number;
  lastCheckedAt: string;
}

export type FavoritePriceHistory = Record<string, PriceRecord>;

export interface PriceChangeEvaluationResult {
  notifications: PriceNotificationPayload[];
  updatedHistory: FavoritePriceHistory;
  skippedCount: number;
}
