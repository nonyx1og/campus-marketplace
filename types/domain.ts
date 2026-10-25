/**
 * Campus Marketplace Core Domain Types.
 * Strictly typed domain contracts for users, catalogue listings, cart,
 * checkout summary, delivery rules, and API query states.
 */

// ============================================================================
// 1. User & Roles
// ============================================================================

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  fullName?: string; // Kept for backward compatibility
  studentId?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 2. Category
// ============================================================================

export type PredefinedCategory =
  | 'textbooks'
  | 'electronics'
  | 'stationery'
  | 'dorm'
  | 'clothing'
  | 'services'
  | 'sports'
  | 'other';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

// ============================================================================
// 3. Listing
// ============================================================================

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  category: string;
  priceMinor: number; // Integer minor currency units (e.g., VND integer)
  stock: number;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  sellerName?: string;
  campusLocation?: string;
  priceVnd?: number; // Integer VND compatibility
  imageUrl?: string; // Alias for photoUri
}

// ============================================================================
// 4. Cart
// ============================================================================

export interface CartItem {
  listingId: string;
  quantity: number;
}

// ============================================================================
// 5. Delivery & Checkout
// ============================================================================

export type DeliveryMethod = 'campus_pickup' | 'dorm_delivery' | 'direct_meetup';

export interface DeliveryRule {
  id: string;
  name: string;
  method: DeliveryMethod;
  feeMinor: number; // Integer minor units (0 for free on-campus meetup)
  campusLocationRequired: boolean;
  description?: string;
  estimatedMinutes?: number;
}

export interface CheckoutSummary {
  itemsCount: number;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  discountMinor: number;
  totalMinor: number;
  deliveryRule?: DeliveryRule;
  appliedCouponCode?: string;
}

// ============================================================================
// 6. API Error & Query States
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  status?: number; // HTTP status code (e.g. 400, 401, 404, 500)
  details?: Record<string, unknown>;
  timestamp?: string;
}

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';
export type ScreenViewState = 'loading' | 'empty' | 'error' | 'content';

export interface QueryState<TData = unknown, TError = ApiError> {
  status: QueryStatus;
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
}

export interface ApiResponse<TData = unknown> {
  success: boolean;
  data: TData;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<TItem = unknown> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
