import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatsGrid } from "@/components/features/profile/StatsGrid";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProfileStatsResponse } from "@/types/api";

const cardCount = 4;

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 gap-3">
    {Array.from({ length: cardCount }, (_unused, index) => (
      <Skeleton key={index} className="h-24 w-full" />
    ))}
  </div>
);

const isProfilePending = (error: unknown): boolean =>
  error instanceof ApiError && error.problem.status === 404;

export const DashboardStats = () => {
  const t = useTranslations("dashboard");
  const figures = useTranslations("stats");
  const toMessage = useProblemMessage();

  const stats = useQuery({
    queryKey: ["profile", "stats"],
    queryFn: () => apiFetch<ProfileStatsResponse>(endpoints.profiles.myStats),
    retry: shouldRetry,
  });

  if (stats.isPending) {
    return <StatsSkeleton />;
  }

  if (stats.isError) {
    return isProfilePending(stats.error) ? (
      <EmptyState
        title={t("profilePending.title")}
        description={t("profilePending.body")}
        action={
          <Button variant="outline" onClick={() => void stats.refetch()}>
            {t("profilePending.retry")}
          </Button>
        }
      />
    ) : (
      <ErrorState
        message={toMessage(stats.error)}
        onRetry={() => void stats.refetch()}
      />
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("stats.heading")}
      </h2>
      <StatsGrid stats={stats.data} note={figures("eventualConsistency")} />
    </section>
  );
};
