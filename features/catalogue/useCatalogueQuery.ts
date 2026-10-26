import { useQuery } from '@tanstack/react-query';
import {
  fetchCatalogueListings,
  isSimulatedOfflineMode,
} from '@/lib/api/catalogue';
import {
  saveCatalogueCache,
  getCatalogueCache,
  CatalogueCachePayload,
} from '@/lib/storage/catalogue-cache';
import { ListingItem, CatalogueQueryParams } from '@/types/listing';
import { ApiError } from '@/types/domain';

export interface UseCatalogueQueryResult {
  listings: ListingItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastUpdated: string | null;
  isFromCache: boolean;
  isOffline: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: ApiError | Error | null;
  refetch: () => Promise<unknown>;
}

interface CatalogueFetchResult {
  items: ListingItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  lastUpdated: string;
  isFromCache: boolean;
}
import { filterListings } from './filterListings';

/**
 * Typed TanStack Query hook for catalogue listings with offline persistence fallback.
 * - Always saves successful API payloads to local persistence (AsyncStorage).
 * - Gracefully falls back to local cache on network error or offline mode.
 * - Displays lastUpdated timestamp and updates it on successful refresh.
 * - Completely avoids white screen crashes.
 */
export function useCatalogueQuery(params: CatalogueQueryParams = {}): UseCatalogueQueryResult {
  const { page = 1, limit = 6, category = 'Tất cả', search = '' } = params;

  const queryKey = ['catalogue', 'listings', { page, limit, category, search }];

  const query = useQuery<CatalogueFetchResult, ApiError | Error>({
    queryKey,
    queryFn: async (): Promise<CatalogueFetchResult> => {
      try {
        // Attempt remote API request
        const res = await fetchCatalogueListings({ page, limit, category, search });
        const now = new Date().toISOString();

        // Persist fresh catalogue to local storage
        const cachePayload: CatalogueCachePayload = {
          items: res.items,
          lastUpdated: now,
          total: res.total,
          page: res.page,
          pageSize: res.pageSize,
        };
        await saveCatalogueCache(cachePayload);

        return {
          items: res.items,
          total: res.total,
          page: res.page,
          pageSize: res.pageSize,
          hasMore: res.hasMore,
          lastUpdated: now,
          isFromCache: false,
        };
      } catch (networkError) {
        // Request failed or offline -> check local persistence cache
        const cached = await getCatalogueCache();

        if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
          // Filter cached items in-memory using pure filterListings
          const filteredItems = filterListings(cached.items, search, category);
          const startIndex = (page - 1) * limit;
          const paginatedCached = filteredItems.slice(startIndex, startIndex + limit);

          return {
            items: paginatedCached,
            total: filteredItems.length,
            page,
            pageSize: limit,
            hasMore: startIndex + limit < filteredItems.length,
            lastUpdated: cached.lastUpdated,
            isFromCache: true,
          };
        }

        // No cache available in offline mode -> throw error to present helpful ErrorState
        throw networkError;
      }
    },
    // In offline mode or simulated offline, avoid aggressive retrying so UI updates immediately
    retry: (failureCount) => {
      if (isSimulatedOfflineMode()) return false;
      return failureCount < 1;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
  });

  const isSimulatedOffline = isSimulatedOfflineMode();
  const data = query.data;

  const isFromCache = Boolean(data?.isFromCache);
  const isOffline = isFromCache || isSimulatedOffline;

  return {
    listings: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? limit,
    hasMore: Boolean(data?.hasMore),
    lastUpdated: data?.lastUpdated ?? null,
    isFromCache,
    isOffline,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
