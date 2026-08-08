import { useQuery } from "@tanstack/react-query";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { apiFetch, buildQuery } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CollectionDetailResponse } from "@/types/api";

export const collectionPeaksPageSize = 20;

export const useCollectionDetail = (id: string, page: number) =>
  useQuery({
    queryKey: ["collections", "detail", id, page],
    queryFn: () =>
      apiFetch<CollectionDetailResponse>(
        `${endpoints.collections.byId(id)}${buildQuery({
          page,
          size: collectionPeaksPageSize,
        })}`,
      ),
    retry: shouldRetry,
  });
