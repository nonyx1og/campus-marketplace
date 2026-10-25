import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Strongly typed storage keys for SecureStore.
 * RULE: Session/token/secret must only be saved in SecureStore, never hardcoded.
 */
export const SECURE_STORE_KEYS = {
  AUTH_TOKEN: 'campus_marketplace_auth_token',
  USER_SESSION: 'campus_marketplace_user_session',
  REFRESH_TOKEN: 'campus_marketplace_refresh_token',
} as const;

export type SecureStoreKey = typeof SECURE_STORE_KEYS[keyof typeof SECURE_STORE_KEYS];

// Fallback memory cache for Web environment where SecureStore is not natively supported
const memoryStorage = new Map<string, string>();

export async function setSecureItem(key: SecureStoreKey, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStorage.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
}

export async function getSecureItem(key: SecureStoreKey): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryStorage.get(key) ?? null;
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteSecureItem(key: SecureStoreKey): Promise<void> {
  if (Platform.OS === 'web') {
    memoryStorage.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
