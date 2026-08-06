import { useTranslations } from "use-intl";
import {
  pageSize,
  toQueryString,
  type PeakQuery,
} from "@/app/[locale]/(public)/peaks/searchParams";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PeakCard } from "@/components/features/peaks/PeakCard";
import { PeakPagination } from "@/components/features/peaks/PeakPagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { hasCode, isRetryable } from "@/lib/api/problem";
import type { PagedResponse, PeakListItemResponse } from "@/types/api";

export type PeakPageQuery = ReturnType<
  typeof usePagedQuery<PeakListItemResponse>
>;

export interface PeakResultsProps {
  query: PeakQuery;
  results: PeakPageQuery;
}

const outOfRangeCode = "Pagination.PageOutOfRange";

const PeakResultsSkeleton = () => (
  <ul className="grid grid-cols-1 gap-3">
    {Array.from({ length: pageSize }, (_unused, index) => (
      <li key={index}>
        <Skeleton className="h-24 w-full" />
      </li>
    ))}
  </ul>
);

const PeakResultsError = ({
  query,
  error,
  onRetry,
}: {
  query: PeakQuery;
  error: unknown;
  onRetry: () => void;
}) => {
  const toMessage = useProblemMessage();
  const router = useRouter();

  const problem = error instanceof ApiError ? error.problem : undefined;
  const backToFirstPage = problem && hasCode(problem, outOfRangeCode);
  const transient = !problem || isRetryable(problem);

  if (backToFirstPage) {
    return (
      <ErrorState
        message={toMessage(error)}
        onRetry={() => router.push(`/peaks${toQueryString(query)}`)}
      />
    );
  }

  return (
    <ErrorState
      message={toMessage(error)}
      onRetry={transient ? onRetry : undefined}
    />
  );
};

const PeakResultsList = ({
  query,
  page,
}: {
  query: PeakQuery;
  page: PagedResponse<PeakListItemResponse>;
}) => {
  const t = useTranslations("peaks");

  if (page.items.length === 0) {
    return (
      <EmptyState
        title={
          query.q ? t("search.empty", { query: query.q }) : t("catalogueEmpty")
        }
        description={query.q ? t("search.emptyHint") : t("catalogueEmptyHint")}
      />
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3">
        {page.items.map((peak) => (
          <PeakCard key={peak.id} peak={peak} />
        ))}
      </ul>
      <PeakPagination query={query} totalPages={page.totalPages} />
    </>
  );
};

export const PeakResults = ({ query, results }: PeakResultsProps) => {
  const t = useTranslations("peaks");

  if (results.isError) {
    return (
      <PeakResultsError
        query={query}
        error={results.error}
        onRetry={() => void results.refetch()}
      />
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <p aria-live="polite" className="text-sm leading-relaxed text-start">
        {results.isPending
          ? null
          : t("search.results", { count: results.data.totalCount })}
      </p>
      {results.isPending ? (
        <PeakResultsSkeleton />
      ) : (
        <PeakResultsList query={query} page={results.data} />
      )}
    </section>
  );
};
