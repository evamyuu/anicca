/**
 * @fileoverview Provides the TanStack Query client to the component tree.
 *
 * @module shared/providers/QueryProvider
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** @internal Default stale time for cached queries (5 minutes). */
const DEFAULT_STALE_TIME_MS = 1000 * 60 * 5;

/** @internal Maximum number of query retries on failure. */
const DEFAULT_QUERY_RETRY_COUNT = 2;

/** @internal Maximum number of mutation retries on failure. */
const DEFAULT_MUTATION_RETRY_COUNT = 1;

/**
 * Singleton {@link QueryClient} instance for the entire application.
 *
 * @remarks
 * A single instance is created at module load time and shared across all
 * components. This prevents redundant cache invalidation on re-renders.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME_MS,
      retry: DEFAULT_QUERY_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: DEFAULT_MUTATION_RETRY_COUNT,
    },
  },
});

/**
 * Props for {@link QueryProvider}.
 */
interface QueryProviderProps {
  /** The component subtree that will have access to the query client. */
  children: React.ReactNode;
}

/**
 * Wraps the application with the TanStack Query {@link QueryClientProvider}.
 *
 * @param props - See {@link QueryProviderProps}.
 * @returns The provider element wrapping `children`.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
