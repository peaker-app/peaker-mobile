"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError, apiFetch, buildQuery } from "@/lib/api/client";
import { isRetryable } from "@/lib/api/problem";
import type { PagedResponse } from "@/types/api";

const maxRetries = 2;

export const shouldRetry = (attempt: number, error: unknown): boolean =>
  attempt < maxRetries &&
  error instanceof ApiError &&
  isRetryable(error.problem);

export interface PagedQueryOptions {
  page: number;
  size?: number;
  filters?: Record<string, string | number | undefined | null>;
  enabled?: boolean;
}

export const usePagedQuery = <T>(
  key: readonly unknown[],
  path: string,
  { page, size = 20, filters = {}, enabled = true }: PagedQueryOptions,
) =>
  useQuery({
    queryKey: [...key, page, size, filters],
    queryFn: () =>
      apiFetch<PagedResponse<T>>(`${path}${buildQuery({ ...filters, page, size })}`),
    placeholderData: keepPreviousData,
    retry: shouldRetry,
    enabled,
  });
