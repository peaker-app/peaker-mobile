"use client";

import { Pagination } from "@/components/feedback/Pagination";
import { useRouter } from "@/i18n/navigation";
import type { CollectionSummaryResponse, PagedResponse } from "@/types/api";
import { CollectionCard } from "./CollectionCard";

export const CollectionsGrid = ({
  collections,
}: {
  collections: PagedResponse<CollectionSummaryResponse>;
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {collections.items.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </ul>

      <Pagination
        page={collections.page}
        totalPages={collections.totalPages}
        onPageChange={(page) =>
          router.push(
            page === 1
              ? "/dashboard/collections"
              : `/dashboard/collections?page=${page}`,
          )
        }
      />
    </div>
  );
};
