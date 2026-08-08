import { useParams, useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { PagedErrorState } from "@/app/PagedErrorState";
import { parsePageParam } from "@/app/pageParam";
import { CollectionHeader } from "@/components/features/collections/CollectionHeader";
import { CollectionPeaksSection } from "@/components/features/collections/CollectionPeaksSection";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/client";
import { collectionLabel } from "@/lib/collections/label";
import type { CollectionDetailResponse } from "@/types/api";
import { useCollectionDetail } from "./useCollectionDetail";

const listPath = "/dashboard/collections";

const CollectionDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

const CollectionDetail = ({
  collection,
}: {
  collection: CollectionDetailResponse;
}) => {
  const t = useTranslations("collections");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        steps={[
          { label: t("title"), href: listPath },
          { label: collectionLabel(collection, t("defaultName")) },
        ]}
      />

      <CollectionHeader collection={collection} />

      <CollectionPeaksSection
        collectionId={collection.id}
        page={collection.peaks}
      />
    </div>
  );
};

export const CollectionDetailScreen = () => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const collection = useCollectionDetail(id, parsePageParam(params.get("page")));

  if (collection.isError) {
    const problem =
      collection.error instanceof ApiError ? collection.error.problem : undefined;

    if (problem?.status === 404) {
      return <NotFoundScreen />;
    }

    return (
      <main className="flex-1 p-6">
        <PagedErrorState
          error={collection.error}
          firstPagePath={`${listPath}/${id}`}
          onRetry={() => void collection.refetch()}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      {collection.isPending ? (
        <CollectionDetailSkeleton />
      ) : (
        <CollectionDetail collection={collection.data} />
      )}
    </main>
  );
};
