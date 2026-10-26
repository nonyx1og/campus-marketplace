import { create } from 'zustand';
import { ScreenViewState } from '@/types/domain';
import { setSimulatedOfflineMode } from '@/lib/api/catalogue';

export interface CatalogueClientState {
  // Pure client UI state
  searchQuery: string;
  selectedCategory: string;
  page: number;
  pageSize: number;
  isSimulatedOffline: boolean;
  demoStateOverride: ScreenViewState | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setPage: (page: number) => void;
  setSimulatedOffline: (enabled: boolean) => void;
  setDemoStateOverride: (override: ScreenViewState | null) => void;
  resetFilters: () => void;
}

export const useCatalogueStore = create<CatalogueClientState>((set) => ({
  searchQuery: '',
  selectedCategory: 'Tất cả',
  page: 1,
  pageSize: 6,
  isSimulatedOffline: false,
  demoStateOverride: null,

  setSearchQuery: (query: string) =>
    set({ searchQuery: query, page: 1 }),

  setSelectedCategory: (category: string) =>
    set({ selectedCategory: category, page: 1 }),

  setPage: (page: number) =>
    set({ page }),

  setSimulatedOffline: (enabled: boolean) => {
    setSimulatedOfflineMode(enabled);
    set({ isSimulatedOffline: enabled });
  },

  setDemoStateOverride: (demoStateOverride: ScreenViewState | null) =>
    set({ demoStateOverride }),

  resetFilters: () =>
    set({ searchQuery: '', selectedCategory: 'Tất cả', page: 1 }),
}));

// Dedicated Selectors to prevent unnecessary re-renders
export const selectSearchQuery = (state: CatalogueClientState) => state.searchQuery;
export const selectSelectedCategory = (state: CatalogueClientState) => state.selectedCategory;
export const selectCataloguePage = (state: CatalogueClientState) => state.page;
export const selectCataloguePageSize = (state: CatalogueClientState) => state.pageSize;
export const selectIsSimulatedOffline = (state: CatalogueClientState) => state.isSimulatedOffline;
export const selectDemoStateOverride = (state: CatalogueClientState) => state.demoStateOverride;

export const selectSetSearchQuery = (state: CatalogueClientState) => state.setSearchQuery;
export const selectSetSelectedCategory = (state: CatalogueClientState) => state.setSelectedCategory;
export const selectSetCataloguePage = (state: CatalogueClientState) => state.setPage;
export const selectSetSimulatedOffline = (state: CatalogueClientState) => state.setSimulatedOffline;
export const selectSetDemoStateOverride = (state: CatalogueClientState) => state.setDemoStateOverride;
export const selectResetFilters = (state: CatalogueClientState) => state.resetFilters;
