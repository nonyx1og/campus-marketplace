import AsyncStorage from '@react-native-async-storage/async-storage';
import { CatalogueCachePayload } from '@/types/listing';

export type { CatalogueCachePayload };

export const CATALOGUE_CACHE_KEYS = {
  CATALOGUE_DATA: 'campus_marketplace_catalogue_data',
  LAST_UPDATED: 'campus_marketplace_catalogue_last_updated',
} as const;

/**
 * Save successful catalogue data to local persistent storage.
 */
export async function saveCatalogueCache(payload: CatalogueCachePayload): Promise<void> {
  try {
    const jsonValue = JSON.stringify(payload);
    await AsyncStorage.setItem(CATALOGUE_CACHE_KEYS.CATALOGUE_DATA, jsonValue);
    await AsyncStorage.setItem(CATALOGUE_CACHE_KEYS.LAST_UPDATED, payload.lastUpdated);
  } catch (error) {
    // Non-fatal error; log in development without crashing UI
    if (__DEV__) {
      console.warn('Failed to save catalogue cache to AsyncStorage:', error);
    }
  }
}

/**
 * Retrieve cached catalogue payload from local storage.
 * Returns null if no cache is available or if data is corrupt.
 */
export async function getCatalogueCache(): Promise<CatalogueCachePayload | null> {
  try {
    const raw = await AsyncStorage.getItem(CATALOGUE_CACHE_KEYS.CATALOGUE_DATA);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CatalogueCachePayload;
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to read catalogue cache from AsyncStorage:', error);
    }
    return null;
  }
}

/**
 * Retrieve last updated timestamp from local storage.
 */
export async function getLastUpdated(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CATALOGUE_CACHE_KEYS.LAST_UPDATED);
  } catch {
    return null;
  }
}

/**
 * Purge catalogue cache (e.g. for testing or demo reset).
 */
export async function clearCatalogueCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      CATALOGUE_CACHE_KEYS.CATALOGUE_DATA,
      CATALOGUE_CACHE_KEYS.LAST_UPDATED,
    ]);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to clear catalogue cache:', error);
    }
  }
}
