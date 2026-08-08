import { QueryClient } from "@tanstack/react-query";
import { shouldRetry } from "@/hooks/usePagedQuery";

export const ownerScopes = [
  "ascent",
  "ascents",
  "profile",
  "collections",
] as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

for (const scope of ownerScopes) {
  queryClient.setQueryDefaults([scope], { staleTime: 0 });
}
