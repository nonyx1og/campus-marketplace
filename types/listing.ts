import { Listing, ScreenViewState, Category } from './domain';

export type { Listing, ScreenViewState, Category };

/**
 * Listing item data contract for catalogue screens.
 * Contains convenience fields and is compatible with the Listing domain contract.
 */
export interface ListingItem {
  id: string;
  title: string;
  description: string;
  priceVnd: number; // Integer VND
  category: string;
  sellerId: string;
  sellerName: string;
  campusLocation: string;
  createdAt: string;
  priceMinor?: number; // Integer minor currency units
  stock?: number;
  photoUri?: string;
  updatedAt?: string;
  imageUrl?: string;
}

/**
 * Helper to normalize a ListingItem into the strict domain Listing contract.
 */
export function toDomainListing(item: ListingItem): Listing {
  return {
    id: item.id,
    sellerId: item.sellerId,
    title: item.title,
    category: item.category,
    priceMinor: item.priceMinor ?? item.priceVnd,
    stock: item.stock ?? 1,
    photoUri: item.photoUri ?? item.imageUrl,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
    description: item.description,
    sellerName: item.sellerName,
    campusLocation: item.campusLocation,
    priceVnd: item.priceVnd,
    imageUrl: item.imageUrl,
  };
}
