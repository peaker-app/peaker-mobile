"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/feedback/Pagination";
import { useRouter } from "@/i18n/navigation";
import type { CollectionPeakResponse, PagedResponse } from "@/types/api";
import { AddPeakDialog } from "./AddPeakDialog";
import { CollectionPeakList } from "./CollectionPeakList";
import { useCollectionPeaks } from "./useCollectionPeaks";

export interface CollectionPeaksSectionProps {
  collectionId: string;
  page: PagedResponse<CollectionPeakResponse>;
}

export const CollectionPeaksSection = ({
  collectionId,
  page,
}: CollectionPeaksSectionProps) => {
  const t = useTranslations("collections.detail");
  const common = useTranslations("common.states");
  const router = useRouter();
  const collections = useTranslations("collections");
  const { peaks, total, busy, addPeak, removePeak } = useCollectionPeaks({
    collectionId,
    page,
  });

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl leading-relaxed font-semibold text-start">
          {t("peaks")}
          <span className="ms-2 text-base font-normal text-muted-foreground">
            {collections("peakCount", { count: total })}
          </span>
        </h2>
        <AddPeakDialog
          presentPeakIds={peaks.map((peak) => peak.peakId)}
          onAdd={addPeak}
        />
      </div>

      {peaks.length === 0 ? (
        <EmptyState title={common("emptyTitle")} description={t("empty")} />
      ) : (
        <CollectionPeakList
          peaks={peaks}
          busy={busy}
          onRemove={(peak) => void removePeak(peak)}
        />
      )}

      <Pagination
        page={page.page}
        totalPages={page.totalPages}
        onPageChange={(next) =>
          router.push(
            next === 1
              ? `/dashboard/collections/${collectionId}`
              : `/dashboard/collections/${collectionId}?page=${next}`,
          )
        }
      />
    </section>
  );
};
