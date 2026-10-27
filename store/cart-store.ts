import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListingItem } from '@/types/listing';
import { Listing } from '@/types/domain';
import { StoredCartItem } from '@/features/cart/types';
import { DEFAULT_DELIVERY_RULE } from '@/features/cart/deliveryRules';

export const CART_STORAGE_KEY = 'campus_marketplace_cart_items';
export const DELIVERY_RULE_STORAGE_KEY = 'campus_marketplace_delivery_rule';
const LEGACY_CART_STORAGE_KEY = 'campus_marketplace_cart';

export interface CartActionResult {
  success: boolean;
  message?: string;
  adjustedQuantity?: number;
}

export interface CartState {
  items: StoredCartItem[];
  selectedDeliveryRuleId: string;
  isHydrated: boolean;

  // Actions
  hydrateCart: () => Promise<void>;
  addToCart: (
    itemOrId: ListingItem | Listing | string,
    quantity?: number,
    maxStock?: number
  ) => Promise<CartActionResult>;
  updateQuantity: (
    listingId: string,
    quantity: number,
    maxStock?: number
  ) => Promise<CartActionResult>;
  incrementQuantity: (
    listingId: string,
    maxStock?: number
  ) => Promise<CartActionResult>;
  decrementQuantity: (listingId: string) => Promise<CartActionResult>;
  removeFromCart: (listingId: string) => Promise<void>;
  setCartItems: (items: StoredCartItem[]) => Promise<void>;
  setDeliveryRuleId: (ruleId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

/**
 * Safely extracts a clean string ID from a string or object.
 */
function extractListingId(input: unknown): string {
  if (typeof input === 'string') return input.trim();
  if (input && typeof input === 'object' && 'id' in input) {
    const id = (input as { id: unknown }).id;
    if (typeof id === 'string') return id.trim();
  }
  return '';
}

/**
 * Helper to persist items array to AsyncStorage safely.
 */
async function persistCartItems(items: StoredCartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Non-fatal persistence error
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  selectedDeliveryRuleId: DEFAULT_DELIVERY_RULE.id,
  isHydrated: false,

  hydrateCart: async () => {
    try {
      const [rawItems, rawRule] = await Promise.all([
        AsyncStorage.getItem(CART_STORAGE_KEY),
        AsyncStorage.getItem(DELIVERY_RULE_STORAGE_KEY),
      ]);

      let hydratedItems: StoredCartItem[] = [];

      if (rawItems) {
        try {
          const parsed = JSON.parse(rawItems);
          if (Array.isArray(parsed)) {
            hydratedItems = parsed
              .map((it: any) => ({
                listingId: extractListingId(it?.listingId || it?.id || it?.listing?.id),
                quantity: Math.max(1, Math.floor(Number(it?.quantity) || 1)),
              }))
              .filter((it) => Boolean(it.listingId));
          }
        } catch {
          // Fall back if parse fails
        }
      } else {
        // Attempt legacy migration if present
        const legacyRaw = await AsyncStorage.getItem(LEGACY_CART_STORAGE_KEY);
        if (legacyRaw) {
          try {
            const legacyParsed = JSON.parse(legacyRaw);
            const sourceArray = Array.isArray(legacyParsed)
              ? legacyParsed
              : legacyParsed?.items;
            if (Array.isArray(sourceArray)) {
              hydratedItems = sourceArray
                .map((it: any) => ({
                  listingId: extractListingId(it?.listingId || it?.id || it?.listing?.id),
                  quantity: Math.max(1, Math.floor(Number(it?.quantity) || 1)),
                }))
                .filter((it) => Boolean(it.listingId));
              await persistCartItems(hydratedItems);
            }
          } catch {
            // Ignore legacy parse failure
          }
        }
      }

      set({
        items: hydratedItems,
        selectedDeliveryRuleId: rawRule || DEFAULT_DELIVERY_RULE.id,
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  addToCart: async (itemOrId, quantity = 1, maxStock) => {
    const listingId = extractListingId(itemOrId);
    if (!listingId) {
      return { success: false, message: 'Mã sản phẩm không hợp lệ.' };
    }

    // Detect stock limit from passed object if available
    let resolvedStock = maxStock;
    if (
      resolvedStock === undefined &&
      typeof itemOrId === 'object' &&
      itemOrId !== null &&
      'stock' in itemOrId
    ) {
      const s = (itemOrId as { stock?: unknown }).stock;
      if (typeof s === 'number' && Number.isFinite(s)) {
        resolvedStock = Math.max(0, Math.floor(s));
      }
    }

    if (resolvedStock !== undefined && resolvedStock <= 0) {
      return {
        success: false,
        message: 'Sản phẩm này hiện đã hết hàng trong khuôn viên trường.',
      };
    }

    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((it) => it.listingId === listingId);
    const safeAddQty = Math.max(1, Math.floor(quantity));

    let updatedItems: StoredCartItem[];

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      const targetQty = existing.quantity + safeAddQty;

      if (resolvedStock !== undefined && targetQty > resolvedStock) {
        if (existing.quantity >= resolvedStock) {
          return {
            success: false,
            message: `Bạn đã thêm số lượng tối đa (${resolvedStock}) sẵn có của sản phẩm này.`,
            adjustedQuantity: resolvedStock,
          };
        }
        // Cap to max stock
        updatedItems = currentItems.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: resolvedStock } : it
        );
        set({ items: updatedItems });
        await persistCartItems(updatedItems);
        return {
          success: true,
          message: `Đã điều chỉnh về số lượng tối đa (${resolvedStock}) hiện có.`,
          adjustedQuantity: resolvedStock,
        };
      }

      updatedItems = currentItems.map((it, idx) =>
        idx === existingIndex ? { ...it, quantity: targetQty } : it
      );
    } else {
      const initialQty =
        resolvedStock !== undefined ? Math.min(safeAddQty, resolvedStock) : safeAddQty;
      updatedItems = [...currentItems, { listingId, quantity: initialQty }];
    }

    set({ items: updatedItems });
    await persistCartItems(updatedItems);
    return { success: true };
  },

  updateQuantity: async (listingId, quantity, maxStock) => {
    const cleanId = extractListingId(listingId);
    if (!cleanId) return { success: false };

    const currentItems = get().items;
    const targetQty = Math.floor(quantity);

    if (targetQty <= 0) {
      const filtered = currentItems.filter((it) => it.listingId !== cleanId);
      set({ items: filtered });
      await persistCartItems(filtered);
      return { success: true, adjustedQuantity: 0 };
    }

    let resolvedQty = targetQty;
    let message: string | undefined;

    if (maxStock !== undefined && resolvedQty > maxStock) {
      resolvedQty = Math.max(1, maxStock);
      message = `Chỉ còn ${maxStock} sản phẩm trong kho. Đã tự động điều chỉnh.`;
    }

    const updated = currentItems.map((it) =>
      it.listingId === cleanId ? { ...it, quantity: resolvedQty } : it
    );

    set({ items: updated });
    await persistCartItems(updated);
    return { success: true, message, adjustedQuantity: resolvedQty };
  },

  incrementQuantity: async (listingId, maxStock) => {
    const cleanId = extractListingId(listingId);
    const existing = get().items.find((it) => it.listingId === cleanId);
    if (!existing) return { success: false };

    if (maxStock !== undefined && existing.quantity >= maxStock) {
      return {
        success: false,
        message: `Số lượng đã đạt giới hạn tồn kho hiện tại (${maxStock}).`,
      };
    }

    return await get().updateQuantity(cleanId, existing.quantity + 1, maxStock);
  },

  decrementQuantity: async (listingId) => {
    const cleanId = extractListingId(listingId);
    const existing = get().items.find((it) => it.listingId === cleanId);
    if (!existing) return { success: false };

    if (existing.quantity <= 1) {
      await get().removeFromCart(cleanId);
      return { success: true, adjustedQuantity: 0 };
    }

    return await get().updateQuantity(cleanId, existing.quantity - 1);
  },

  removeFromCart: async (listingId) => {
    const cleanId = extractListingId(listingId);
    const filtered = get().items.filter((it) => it.listingId !== cleanId);
    set({ items: filtered });
    await persistCartItems(filtered);
  },

  setCartItems: async (newItems) => {
    const sanitized = newItems
      .map((it) => ({
        listingId: extractListingId(it.listingId),
        quantity: Math.max(1, Math.floor(it.quantity || 1)),
      }))
      .filter((it) => Boolean(it.listingId));

    set({ items: sanitized });
    await persistCartItems(sanitized);
  },

  setDeliveryRuleId: async (ruleId) => {
    set({ selectedDeliveryRuleId: ruleId });
    try {
      await AsyncStorage.setItem(DELIVERY_RULE_STORAGE_KEY, ruleId);
    } catch {
      // Non-fatal
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      await AsyncStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {
      // Non-fatal
    }
  },
}));

// ============================================================================
// SELECTORS & CUSTOM HOOKS (Optimized re-renders, Zero duplicate server state)
// ============================================================================

export const selectCartItems = (state: CartState): StoredCartItem[] => state.items;

export const selectCartTotalCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectSelectedDeliveryRuleId = (state: CartState): string =>
  state.selectedDeliveryRuleId;

export const selectIsCartHydrated = (state: CartState): boolean => state.isHydrated;

export const selectCartItemQuantity =
  (listingId: string) =>
  (state: CartState): number =>
    state.items.find((it) => it.listingId === extractListingId(listingId))?.quantity ?? 0;

/**
 * Custom React Hook returning cart items.
 */
export function useCartItems(): StoredCartItem[] {
  return useCartStore(selectCartItems);
}

/**
 * Custom React Hook returning total item count in cart.
 */
export function useCartTotalCount(): number {
  return useCartStore(selectCartTotalCount);
}

/**
 * Custom React Hook returning selected delivery rule ID.
 */
export function useSelectedDeliveryRuleId(): string {
  return useCartStore(selectSelectedDeliveryRuleId);
}
