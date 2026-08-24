import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AscentCard } from "@/components/features/ascents/AscentCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link } from "@/i18n/navigation";
import { endpoints } from "@/lib/api/endpoints";
import type { AscentSummaryResponse } from "@/types/api";

const recentCount = 5;

const RecentSkeleton = () => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: recentCount }, (_unused, index) => (
      <li key={index}>
        <Skeleton className="h-24 w-full" />
      </li>
    ))}
  </ul>
);

const RecentEmpty = () => {
  const t = useTranslations("dashboard.empty");

  return (
    <EmptyState
      title={t("title")}
      description={t("body")}
      action={
        <Button asChild>
          <Link href="/dashboard/ascents/new">{t("action")}</Link>
        </Button>
      }
    />
  );
};

export const RecentAscents = () => {
  const t = useTranslations("dashboard.recent");
  const toMessage = useProblemMessage();

  const recent = usePagedQuery<AscentSummaryResponse>(
    ["ascents", "recent"],
    endpoints.ascents.root,
    { page: 1, size: recentCount },
  );

  if (recent.isError) {
    return (
      <ErrorState
        message={toMessage(recent.error)}
        onRetry={() => void recent.refetch()}
      />
    );
  }

  if (recent.isPending) {
    return <RecentSkeleton />;
  }

  if (recent.data.items.length === 0) {
    return <RecentEmpty />;
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>
      <ul className="flex flex-col gap-3">
        {recent.data.items.map((ascent) => (
          <AscentCard
            key={ascent.id}
            ascent={ascent}
            href={`/dashboard/ascents/${ascent.id}`}
            showVisibility
          />
        ))}
      </ul>
      <Link
        href="/dashboard/ascents"
        className="text-start font-medium hover:underline"
      >
        {t("seeAll")}
      </Link>
    </section>
  );
};
