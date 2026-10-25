import { create } from 'zustand';
import { ListingItem } from '@/types/listing';

export interface CartItem {
  listing: ListingItem;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addToCart: (item: ListingItem) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.listing.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.listing.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { listing: item, quantity: 1 }] };
    }),
  removeFromCart: (listingId) =>
    set((state) => ({
      items: state.items.filter((i) => i.listing.id !== listingId),
    })),
  clearCart: () => set({ items: [] }),
}));

// Selectors
export const selectCartItems = (state: CartState) => state.items;
export const selectCartTotalCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotalVnd = (state: CartState): number =>
  state.items.reduce((total, item) => total + Math.round(item.listing.priceVnd) * item.quantity, 0);
