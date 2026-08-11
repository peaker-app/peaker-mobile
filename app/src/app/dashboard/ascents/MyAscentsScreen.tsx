import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { PagedErrorState } from "@/app/PagedErrorState";
import { parsePageParam } from "@/app/pageParam";
import { EmptyState } from "@/components/feedback/EmptyState";
import { MyAscentsList } from "@/components/features/ascents/MyAscentsList";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { Link } from "@/i18n/navigation";
import { endpoints } from "@/lib/api/endpoints";
import type { AscentSummaryResponse } from "@/types/api";
import { QueuedAscentsList } from "./QueuedAscentsList";

const pageSize = 20;
const listPath = "/dashboard/ascents";

type AscentPageQuery = ReturnType<typeof usePagedQuery<AscentSummaryResponse>>;

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

const MyAscentsResults = ({ results }: { results: AscentPageQuery }) => {
  if (results.isError) {
    return (
      <PagedErrorState
        error={results.error}
        firstPagePath={listPath}
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
    { page: parsePageParam(params.get("page")), size: pageSize },
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("title")}
      </h1>
      <Button asChild className="self-start">
        <Link href="/dashboard/ascents/new">{t("logAscent")}</Link>
      </Button>
      <QueuedAscentsList />
      <MyAscentsResults results={results} />
    </main>
  );
};
