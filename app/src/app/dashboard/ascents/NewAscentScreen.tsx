import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import type { SelectedPeak } from "@/components/features/ascents/PeakSearchCombobox";
import { RegisterAscentForm } from "@/components/features/ascents/RegisterAscentForm";
import { Skeleton } from "@/components/ui/Skeleton";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PeakDetailResponse } from "@/types/api";

const usePreselectedPeak = (peakId: string | null) => {
  const peak = useQuery({
    queryKey: ["peaks", "detail", peakId],
    queryFn: () =>
      apiFetch<PeakDetailResponse>(endpoints.peaks.byId(peakId ?? "")),
    enabled: peakId !== null,
    retry: shouldRetry,
  });

  const selected: SelectedPeak | undefined = peak.data
    ? {
        id: peak.data.id,
        name: peak.data.name,
        altitudeMeters: peak.data.altitudeMeters,
      }
    : undefined;

  return { selected, isLoading: peakId !== null && peak.isPending };
};

export const NewAscentScreen = () => {
  const t = useTranslations("ascentForm");
  const [params] = useSearchParams();
  const { selected, isLoading } = usePreselectedPeak(params.get("peakId"));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("newTitle")}
      </h1>
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <RegisterAscentForm preselectedPeak={selected} />
      )}
    </main>
  );
};
