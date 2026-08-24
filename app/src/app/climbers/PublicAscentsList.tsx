import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { PagedErrorState } from "@/app/PagedErrorState";
import { parsePageParam } from "@/app/pageParam";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/feedback/Pagination";
import { AscentCard } from "@/components/features/ascents/AscentCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { useRouter } from "@/i18n/navigation";
import { endpoints } from "@/lib/api/endpoints";
import type { AscentSummaryResponse } from "@/types/api";

const pageSize = 10;

const PublicAscentsSkeleton = () => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: 5 }, (_unused, index) => (
      <li key={index}>
        <Skeleton className="h-24 w-full" />
      </li>
    ))}
  </ul>
);

export const PublicAscentsList = ({
  userId,
  slug,
}: {
  userId: string;
  slug: string;
}) => {
  const t = useTranslations("profile.public");
  const [params] = useSearchParams();
  const router = useRouter();
  const page = parsePageParam(params.get("page"));

  const ascents = usePagedQuery<AscentSummaryResponse>(
    ["ascents", "byUser", userId],
    endpoints.ascents.byUser(userId),
    { page, size: pageSize },
  );

  if (ascents.isError) {
    return (
      <PagedErrorState
        error={ascents.error}
        firstPagePath={`/climbers/${slug}`}
        onRetry={() => void ascents.refetch()}
      />
    );
  }

  if (ascents.isPending) {
    return <PublicAscentsSkeleton />;
  }

  if (ascents.data.items.length === 0) {
    return <EmptyState title={t("empty")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {ascents.data.items.map((ascent) => (
          <AscentCard
            key={ascent.id}
            ascent={ascent}
            href={`/ascents/${ascent.id}`}
          />
        ))}
      </ul>
      <Pagination
        page={ascents.data.page}
        totalPages={ascents.data.totalPages}
        onPageChange={(next) =>
          router.push(
            next === 1 ? `/climbers/${slug}` : `/climbers/${slug}?page=${next}`,
          )
        }
      />
    </div>
  );
};
