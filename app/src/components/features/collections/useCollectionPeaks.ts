"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { CollectionPeakResponse, PagedResponse } from "@/types/api";

export interface CollectionPeaksOptions {
  collectionId: string;
  page: PagedResponse<CollectionPeakResponse>;
}

export const useCollectionPeaks = ({ collectionId, page }: CollectionPeaksOptions) => {
  const t = useTranslations("collections.detail");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [serverPage, setServerPage] = useState(page);
  const [peaks, setPeaks] = useState(page.items);
  const [total, setTotal] = useState(page.totalCount);
  const [busy, setBusy] = useState(false);

  if (serverPage !== page) {
    setServerPage(page);
    setPeaks(page.items);
    setTotal(page.totalCount);
  }

  const addPeak = async (peakId: string): Promise<string | undefined> => {
    setBusy(true);

    try {
      const added = await apiFetch<CollectionPeakResponse>(
        endpoints.collections.peaks(collectionId),
        { method: "POST", body: JSON.stringify({ peakId }) },
      );

      setPeaks((current) => [added, ...current]);
      setTotal((current) => current + 1);
      toast.success(t("peakAdded", { name: added.peakName }));

      if (page.page === 1) {
        router.refresh();
      } else {
        router.push(`/dashboard/collections/${collectionId}`);
      }

      return undefined;
    } catch (error) {
      return toMessage(error);
    } finally {
      setBusy(false);
    }
  };

  const removePeak = async (peak: CollectionPeakResponse) => {
    setBusy(true);

    try {
      await apiFetch(endpoints.collections.peak(collectionId, peak.peakId), {
        method: "DELETE",
      });

      setPeaks((current) => current.filter((item) => item.id !== peak.id));
      setTotal((current) => current - 1);
      toast.success(t("peakRemoved", { name: peak.peakName }));
      router.refresh();
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return { peaks, total, busy, addPeak, removePeak };
};
