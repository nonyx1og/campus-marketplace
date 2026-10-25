import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client configured for offline-first resilience.
 * - Cache persists recent data with extended gcTime.
 * - StaleTime set to 5 minutes to avoid excessive background refetches.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection (offline cache preservation)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
