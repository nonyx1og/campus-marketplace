/**
 * Listing item data contract.
 * Note: priceVnd is strictly an integer representing VND currency.
 */
export interface ListingItem {
  id: string;
  title: string;
  description: string;
  priceVnd: number; // Integer, VND
  category: string;
  sellerId: string;
  sellerName: string;
  campusLocation: string;
  imageUrl?: string;
  createdAt: string;
}

export type ScreenViewState = 'loading' | 'empty' | 'error' | 'content';
