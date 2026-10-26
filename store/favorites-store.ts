import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListingItem } from '@/types/listing';

export const FAVORITES_STORAGE_KEY = 'campus_marketplace_favorites';

export interface FavoritesState {
  favorites: ListingItem[];
  isHydrated: boolean;
  addFavorite: (item: ListingItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  toggleFavorite: (item: ListingItem) => Promise<void>;
  isFavorite: (id: string) => boolean;
  hydrateFavorites: () => Promise<void>;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isHydrated: false,

  hydrateFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ListingItem[];
        if (Array.isArray(parsed)) {
          set({ favorites: parsed, isHydrated: true });
          return;
        }
      }
    } catch {
      // Non-fatal hydration error
    }
    set({ isHydrated: true });
  },

  addFavorite: async (item: ListingItem) => {
    const current = get().favorites;
    if (current.some((f) => f.id === item.id)) return;

    const updated = [item, ...current];
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Persistence error handled gracefully
    }
  },

  removeFavorite: async (id: string) => {
    const updated = get().favorites.filter((f) => f.id !== id);
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Persistence error handled gracefully
    }
  },

  toggleFavorite: async (item: ListingItem) => {
    const isFav = get().favorites.some((f) => f.id === item.id);
    if (isFav) {
      await get().removeFavorite(item.id);
    } else {
      await get().addFavorite(item);
    }
  },

  isFavorite: (id: string) => {
    return get().favorites.some((f) => f.id === id);
  },

  clearFavorites: async () => {
    set({ favorites: [] });
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch {
      // Persistence error handled gracefully
    }
  },
}));

// Selectors for optimized re-renders
export const selectFavorites = (state: FavoritesState): ListingItem[] => state.favorites;
export const selectFavoritesCount = (state: FavoritesState): number => state.favorites.length;
export const selectIsFavorite = (id: string) => (state: FavoritesState): boolean =>
  state.favorites.some((f) => f.id === id);
export const selectIsFavoritesHydrated = (state: FavoritesState): boolean => state.isHydrated;
