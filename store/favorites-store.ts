import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_STORAGE_KEY = 'campus_marketplace_favorite_ids';
const LEGACY_FAVORITES_STORAGE_KEY = 'campus_marketplace_favorites';

/**
 * Helper to safely extract a string listing ID from either a string ID
 * or an object containing an `id` property.
 */
export function extractListingId(input: unknown): string {
  if (typeof input === 'string') return input.trim();
  if (input && typeof input === 'object' && 'id' in input) {
    const id = (input as { id: unknown }).id;
    if (typeof id === 'string') return id.trim();
  }
  return '';
}

export interface FavoritesState {
  /**
   * Minimal client state: only stores the set of favorite listing IDs.
   * Listing details are never duplicated in the client store; they are
   * queried or derived from TanStack Query / cache / API on demand.
   */
  favoriteIds: string[];
  isHydrated: boolean;
  addFavorite: (idOrItem: string | { id: string }) => Promise<void>;
  removeFavorite: (idOrItem: string | { id: string }) => Promise<void>;
  toggleFavorite: (idOrItem: string | { id: string }) => Promise<void>;
  isFavorite: (id: string) => boolean;
  hydrateFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],
  isHydrated: false,

  hydrateFavorites: async () => {
    try {
      let raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

      // Gracefully migrate legacy storage key if present
      if (!raw) {
        const legacyRaw = await AsyncStorage.getItem(LEGACY_FAVORITES_STORAGE_KEY);
        if (legacyRaw) {
          try {
            const legacyParsed = JSON.parse(legacyRaw);
            if (Array.isArray(legacyParsed)) {
              const extracted = legacyParsed
                .map(extractListingId)
                .filter((id): id is string => Boolean(id));
              const unique = Array.from(new Set(extracted));
              set({ favoriteIds: unique, isHydrated: true });
              await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(unique));
              return;
            }
          } catch {
            // Ignore legacy parse failure
          }
        }
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const validated = parsed
            .map(extractListingId)
            .filter((id): id is string => Boolean(id));
          const unique = Array.from(new Set(validated));
          set({ favoriteIds: unique, isHydrated: true });
          return;
        }
      }
    } catch {
      // Non-fatal hydration error
    }
    set({ isHydrated: true });
  },

  addFavorite: async (idOrItem: string | { id: string }) => {
    const id = extractListingId(idOrItem);
    if (!id) return;

    const current = get().favoriteIds;
    if (current.includes(id)) return;

    const updated = [id, ...current];
    set({ favoriteIds: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Persistence error handled gracefully
    }
  },

  removeFavorite: async (idOrItem: string | { id: string }) => {
    const id = extractListingId(idOrItem);
    if (!id) return;

    const current = get().favoriteIds;
    const updated = current.filter((x) => x !== id);
    set({ favoriteIds: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Persistence error handled gracefully
    }
  },

  toggleFavorite: async (idOrItem: string | { id: string }) => {
    const id = extractListingId(idOrItem);
    if (!id) return;

    const isFav = get().favoriteIds.includes(id);
    if (isFav) {
      await get().removeFavorite(id);
    } else {
      await get().addFavorite(id);
    }
  },

  isFavorite: (id: string) => {
    const cleanId = extractListingId(id);
    return get().favoriteIds.includes(cleanId);
  },

  clearFavorites: async () => {
    set({ favoriteIds: [] });
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      await AsyncStorage.removeItem(LEGACY_FAVORITES_STORAGE_KEY);
    } catch {
      // Persistence error handled gracefully
    }
  },
}));

// ============================================================================
// SELECTORS & CUSTOM HOOKS (Ensures zero duplicate state & optimized re-renders)
// ============================================================================

/**
 * Selector for the minimal array of favorite listing IDs.
 */
export const selectFavoriteIds = (state: FavoritesState): string[] => state.favoriteIds;

/**
 * Selector for total number of favorites.
 */
export const selectFavoritesCount = (state: FavoritesState): number => state.favoriteIds.length;

/**
 * Selector factory checking if a specific listing is favorited.
 */
export const selectIsFavorite =
  (id: string) =>
  (state: FavoritesState): boolean =>
    state.favoriteIds.includes(extractListingId(id));

/**
 * Selector checking if the favorites store has finished hydration from storage.
 */
export const selectIsFavoritesHydrated = (state: FavoritesState): boolean => state.isHydrated;

/**
 * Custom React hook returning whether a listing is favorited.
 * Uses fine-grained Zustand selector so the component only re-renders when
 * this specific listing's favorite status changes.
 */
export function useIsFavorite(listingId: string): boolean {
  const cleanId = extractListingId(listingId);
  return useFavoritesStore((state) => state.favoriteIds.includes(cleanId));
}

/**
 * Custom React hook returning the full array of favorite listing IDs.
 */
export function useFavoriteIds(): string[] {
  return useFavoritesStore(selectFavoriteIds);
}

/**
 * Backward-compatible selector alias.
 */
export const selectFavorites = (state: FavoritesState): string[] => state.favoriteIds;
