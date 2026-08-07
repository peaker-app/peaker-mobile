import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { MyAscentsList } from "@/components/features/ascents/MyAscentsList";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode, isRetryable } from "@/lib/api/problem";
import type { AscentSummaryResponse } from "@/types/api";

const pageSize = 20;
const listPath = "/dashboard/ascents";
const outOfRangeCode = "Pagination.PageOutOfRange";

type AscentPageQuery = ReturnType<typeof usePagedQuery<AscentSummaryResponse>>;

const parsePage = (value: string | null): number => {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
};

const MyAscentsSkeleton = () => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: pageSize }, (_unused, index) => (
      <li key={index}>
        <Skeleton className="h-24 w-full" />
      </li>
    ))}
  </ul>
);

const MyAscentsEmpty = () => {
  const t = useTranslations("ascents.mine.empty");

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

const MyAscentsError = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) => {
  const toMessage = useProblemMessage();
  const router = useRouter();

  const problem = error instanceof ApiError ? error.problem : undefined;
  const transient = !problem || isRetryable(problem);

  if (problem && hasCode(problem, outOfRangeCode)) {
    return (
      <ErrorState
        message={toMessage(error)}
        onRetry={() => router.push(listPath)}
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

const MyAscentsResults = ({ results }: { results: AscentPageQuery }) => {
  if (results.isError) {
    return (
      <MyAscentsError
        error={results.error}
        onRetry={() => void results.refetch()}
      />
    );
  }

  if (results.isPending) {
    return <MyAscentsSkeleton />;
  }

  return results.data.items.length === 0 ? (
    <MyAscentsEmpty />
  ) : (
    <MyAscentsList ascents={results.data} />
  );
};

export const MyAscentsScreen = () => {
  const t = useTranslations("ascents.mine");
  const [params] = useSearchParams();

  const results = usePagedQuery<AscentSummaryResponse>(
    ["ascents", "mine"],
    endpoints.ascents.root,
    { page: parsePage(params.get("page")), size: pageSize },
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("title")}
      </h1>
      <Button asChild className="self-start">
        <Link href="/dashboard/ascents/new">{t("logAscent")}</Link>
      </Button>
      <MyAscentsResults results={results} />
    </main>
  );
};
