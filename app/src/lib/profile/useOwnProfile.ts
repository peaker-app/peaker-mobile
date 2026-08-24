import { useQuery } from "@tanstack/react-query";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProfileResponse } from "@/types/api";

export const useOwnProfile = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => apiFetch<ProfileResponse>(endpoints.profiles.me),
    retry: shouldRetry,
  });
