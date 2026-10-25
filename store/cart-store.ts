import { create } from 'zustand';
import { ListingItem } from '@/types/listing';
import { CartItem as DomainCartItem } from '@/types/domain';

export interface CartItem extends DomainCartItem {
  listingId: string;
  quantity: number;
  listing: ListingItem;
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
      const existing = state.items.find((i) => i.listingId === item.id || i.listing.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            (i.listingId === item.id || i.listing.id === item.id) ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { listingId: item.id, listing: item, quantity: 1 }] };
    }),
  removeFromCart: (listingId) =>
    set((state) => ({
      items: state.items.filter((i) => i.listingId !== listingId && i.listing.id !== listingId),
    })),
  clearCart: () => set({ items: [] }),
}));

// Selectors
export const selectCartItems = (state: CartState) => state.items;
export const selectCartTotalCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartTotalVnd = (state: CartState): number =>
  state.items.reduce((total, item) => total + Math.round(item.listing.priceVnd) * item.quantity, 0);
