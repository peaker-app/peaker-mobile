import { useQuery } from "@tanstack/react-query";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AscentResponse } from "@/types/api";

export const useOwnAscent = (id: string, { enabled = true } = {}) =>
  useQuery({
    queryKey: ["ascent", id],
    queryFn: () => apiFetch<AscentResponse>(endpoints.ascents.byId(id)),
    retry: shouldRetry,
    enabled,
  });
