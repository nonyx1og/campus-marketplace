import { DeliveryRule, CheckoutSummary, Listing } from '@/types/domain';
import { ListingItem } from '@/types/listing';

export type CartItemStatus = 'valid' | 'exceeds_stock' | 'out_of_stock' | 'deleted';

export interface StoredCartItem {
  listingId: string;
  quantity: number;
}

export interface EnrichedCartItem {
  listingId: string;
  quantity: number;
  listing: ListingItem | Listing | null;
  status: CartItemStatus;
  availableStock: number;
  unitPriceMinor: number;
  subtotalMinor: number;
  errorMessage?: string;
}

export interface CartValidationResult {
  isValid: boolean;
  hasOutOfStock: boolean;
  hasExceedsStock: boolean;
  hasDeleted: boolean;
  items: EnrichedCartItem[];
  canCheckout: boolean;
  errorSummary?: string;
}

export interface CheckoutCalculationItem {
  priceMinor: number;
  quantity: number;
}
