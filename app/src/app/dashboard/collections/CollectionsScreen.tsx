import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { PagedErrorState } from "@/app/PagedErrorState";
import { parsePageParam } from "@/app/pageParam";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CollectionDialog } from "@/components/features/collections/CollectionDialog";
import { CollectionsGrid } from "@/components/features/collections/CollectionsGrid";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { endpoints } from "@/lib/api/endpoints";
import type { CollectionSummaryResponse } from "@/types/api";

const pageSize = 20;
const listPath = "/dashboard/collections";
const skeletonCount = 6;

type CollectionsPageQuery = ReturnType<
  typeof usePagedQuery<CollectionSummaryResponse>
>;

const CollectionsSkeleton = () => (
  <ul className="grid grid-cols-1 gap-4">
    {Array.from({ length: skeletonCount }, (_unused, index) => (
      <li key={index}>
        <Skeleton className="h-28 w-full" />
      </li>
    ))}
  </ul>
);

const NewCollectionButton = () => {
  const t = useTranslations("collections");

  return (
    <CollectionDialog
      idPrefix="createCollection"
      title={t("create.title")}
      submitLabel={t("create.submit")}
      trigger={
        <DialogTrigger asChild>
          <Button>{t("new")}</Button>
        </DialogTrigger>
      }
    />
  );
};

const CollectionsEmpty = () => {
  const t = useTranslations("collections.empty");

  return <EmptyState title={t("title")} description={t("body")} />;
};

const CollectionsResults = ({ results }: { results: CollectionsPageQuery }) => {
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
    return <CollectionsSkeleton />;
  }

  return results.data.items.length === 0 ? (
    <CollectionsEmpty />
  ) : (
    <CollectionsGrid collections={results.data} />
  );
};

export const CollectionsScreen = () => {
  const t = useTranslations("collections");
  const [params] = useSearchParams();

  const results = usePagedQuery<CollectionSummaryResponse>(
    ["collections", "mine"],
    endpoints.collections.root,
    { page: parsePageParam(params.get("page")), size: pageSize },
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        {results.isError ? null : <NewCollectionButton />}
      </div>
      <CollectionsResults results={results} />
    </main>
  );
};
