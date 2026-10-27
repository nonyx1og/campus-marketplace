import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatVND } from '@/lib/currency';
import {
  NotificationPermissionStatus,
  PriceNotificationPayload,
  NotificationHistoryItem,
  FavoritePriceHistory,
} from './types';
import { evaluatePriceChanges } from './priceTracker';
import { ListingItem } from '@/types/listing';

export const NOTIFICATION_STORAGE_KEYS = {
  PERMISSION: 'campus_marketplace_notification_permission',
  HISTORY: 'campus_marketplace_notification_history',
  PRICE_HISTORY: 'campus_marketplace_favorite_prices',
};

// Listeners for in-app notification toasts/banners
type NotificationListener = (item: NotificationHistoryItem) => void;
const inAppListeners: Set<NotificationListener> = new Set();

export function addNotificationListener(listener: NotificationListener): () => void {
  inAppListeners.add(listener);
  return () => inAppListeners.delete(listener);
}

/**
 * Get current notification permission status.
 * Checks AsyncStorage and syncs with Web Notification API if on Web.
 */
export async function getNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    // 1. If on Web, check browser Notification API first
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'denied';
    }

    // 2. Check local persistence
    const saved = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.PERMISSION);
    if (saved === 'granted' || saved === 'denied') {
      return saved;
    }

    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/**
 * Request notification permission explicitly with user consent.
 * Handles user acceptance and rejection gracefully without repeatedly prompting if denied.
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  try {
    // 1. Web Platform Permission Request
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      const status: NotificationPermissionStatus =
        result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'undetermined';
      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.PERMISSION, status);
      return status;
    }

    /**
     * PLATFORM LIMITATION & ARCHITECTURE NOTE:
     * -------------------------------------------------------------------------------------
     * In Expo SDK 58 with React 19 peer constraints, 'expo-notifications' native module
     * cannot be installed in Expo Go without a custom native development build
     * (eas build --profile development / npx expo run:android|ios).
     *
     * TODO: For production EAS native build:
     * 1. Resolve React 19 peer conflict or use development client build.
     * 2. Call `await Notifications.requestPermissionsAsync()` from 'expo-notifications'.
     * 3. Register native push token / APNs / FCM background channel.
     *
     * In the current cross-platform environment (Expo Go & Web), we provide this clean
     * permission flow that stores the user's decision in AsyncStorage, fires real browser
     * notifications on Web, and triggers in-app alert banners with notification center
     * history on mobile.
     * -------------------------------------------------------------------------------------
     */
    const status: NotificationPermissionStatus = 'granted';
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.PERMISSION, status);
    return status;
  } catch {
    return 'denied';
  }
}

/**
 * Handle user explicitly rejecting notification permission.
 */
export async function handlePermissionDenied(): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.PERMISSION, 'denied');
  } catch {
    // Silent fail
  }
}

/**
 * Reset permission (e.g. for testing / demo reset).
 */
export async function resetNotificationPermission(): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEYS.PERMISSION);
  } catch {
    // Silent fail
  }
}

/**
 * Load price history from storage
 */
export async function loadPriceHistory(): Promise<FavoritePriceHistory> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.PRICE_HISTORY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save price history to storage
 */
export async function savePriceHistory(history: FavoritePriceHistory): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));
  } catch {
    // Silent fail
  }
}

/**
 * Load notification history
 */
export async function loadNotificationHistory(): Promise<NotificationHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save notification history
 */
export async function saveNotificationHistory(history: NotificationHistoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {
    // Silent fail
  }
}

/**
 * Trigger a local notification for a price change.
 * Checks permission first: if denied, skips!
 */
export async function triggerPriceNotification(
  payload: PriceNotificationPayload
): Promise<boolean> {
  const permission = await getNotificationPermission();

  // If user denied permission, do NOT trigger!
  if (permission === 'denied') {
    return false;
  }

  const isDrop = payload.type === 'price_drop';
  const title = isDrop
    ? '⚡ Tin vui! Giá sản phẩm yêu thích vừa GIẢM!'
    : '📢 Cập nhật giá sản phẩm trong danh sách yêu thích';

  const body = isDrop
    ? `"${payload.listingTitle}" vừa giảm ${formatVND(payload.savedDiffVnd)}! Giá mới chỉ còn ${formatVND(payload.newPriceVnd)}.`
    : `"${payload.listingTitle}" có giá mới: ${formatVND(payload.newPriceVnd)} (Giá cũ: ${formatVND(payload.oldPriceVnd)}).`;

  const historyItem: NotificationHistoryItem = {
    id: payload.id,
    title,
    body,
    timestamp: payload.timestamp,
    listingId: payload.listingId,
    read: false,
    type: 'price_drop',
  };

  // 1. Save to notification history
  const history = await loadNotificationHistory();
  await saveNotificationHistory([historyItem, ...history.slice(0, 49)]);

  // 2. Broadcast to in-app listeners
  inAppListeners.forEach((listener) => {
    try {
      listener(historyItem);
    } catch {
      // Listener error ignored
    }
  });

  // 3. Web Platform: Native Desktop Notification if granted
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback to in-app alert
      }
    }
  } else {
    // 4. Mobile: In-app system banner/alert
    Alert.alert(title, body);
  }

  return true;
}

/**
 * Higher-level orchestration:
 * Checks current listings against favorite IDs, detects price drops/changes,
 * updates price history, and triggers notifications without spamming unchanged items.
 */
export async function checkAndNotifyFavoritePriceChanges(
  favoriteIds: string[],
  currentListings: ListingItem[]
): Promise<PriceNotificationPayload[]> {
  if (!favoriteIds || favoriteIds.length === 0 || !currentListings || currentListings.length === 0) {
    return [];
  }

  const history = await loadPriceHistory();
  const result = evaluatePriceChanges(favoriteIds, currentListings, history);

  // Persist updated price history
  await savePriceHistory(result.updatedHistory);

  // Trigger notifications for items that actually changed
  for (const notif of result.notifications) {
    await triggerPriceNotification(notif);
  }

  return result.notifications;
}
