import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "react-router";
import { useLocale, useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PeakActions } from "@/components/features/peaks/PeakActions";
import { PhotoCredit } from "@/components/features/peaks/PhotoCredit";
import { PeakFactsList } from "@/components/features/peaks/PeakFactsList";
import { PeakMap } from "@/components/features/peaks/PeakMap";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import type { Locale } from "@/i18n/config";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { isRetryable } from "@/lib/api/problem";
import { detailZoom } from "@/lib/map";
import { peakThumbnail } from "@/lib/peakImage";
import {
  isWikidataId,
  localizedPeakName,
  peakDisplayName,
} from "@/lib/peakName";
import type { PeakDetailResponse, PeakNameResponse } from "@/types/api";

const photoWidth = 800;
const photoHeight = 500;
const detailStaleMs = 86_400_000;

const PeakDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const AlternativeNames = ({
  names,
}: {
  names: readonly PeakNameResponse[];
}) => {
  const t = useTranslations("peakDetail.alternativeNames");

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {names.map((alternative) => (
          <li key={`${alternative.languageCode}-${alternative.name}`}>
            <Badge variant="outline">
              <span lang={alternative.languageCode}>{alternative.name}</span>
              {alternative.isOfficial ? (
                <span className="text-muted-foreground">{t("official")}</span>
              ) : null}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
};

const PeakDetail = ({ peak }: { peak: PeakDetailResponse }) => {
  const t = useTranslations("peakDetail");
  const peaks = useTranslations("peaks");
  const nav = useTranslations("nav");
  const locale = useLocale() as Locale;

  const name = peakDisplayName(localizedPeakName(peak, locale), (id) =>
    peaks("unnamed", { id }),
  );

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        steps={[{ label: nav("peaks"), href: "/peaks" }, { label: name }]}
      />

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl leading-relaxed font-semibold text-start">
          {name}
        </h1>
        {name === peak.name || isWikidataId(peak.name) ? null : (
          <p className="leading-relaxed text-muted-foreground text-start">
            {t("canonicalName", { name: peak.name })}
          </p>
        )}
      </header>

      {peak.imageUrl ? (
        <figure className="flex flex-col gap-2">
          <Image
            src={peakThumbnail(peak.imageUrl, photoWidth)}
            alt={name}
            width={photoWidth}
            height={photoHeight}
            className="h-auto w-full rounded-md object-cover"
          />
          <figcaption>
            <PhotoCredit peak={peak} />
          </figcaption>
        </figure>
      ) : null}

      <PeakFactsList peak={peak} />

      <PeakMap
        points={[
          { id: peak.id, latitude: peak.latitude, longitude: peak.longitude },
        ]}
        zoom={detailZoom}
        className="h-64"
      />

      <PeakActions peakId={peak.id} locale={locale} />

      {peak.alternativeNames.length > 0 ? (
        <AlternativeNames names={peak.alternativeNames} />
      ) : null}
    </div>
  );
};

export const PeakDetailScreen = () => {
  const { id = "" } = useParams();
  const toMessage = useProblemMessage();

  const peak = useQuery({
    queryKey: ["peaks", "detail", id],
    queryFn: () => apiFetch<PeakDetailResponse>(endpoints.peaks.byId(id)),
    retry: shouldRetry,
    staleTime: detailStaleMs,
  });

  if (peak.isError) {
    const problem = peak.error instanceof ApiError ? peak.error.problem : undefined;

    if (problem?.status === 404) {
      return <NotFoundScreen />;
    }

    return (
      <main className="flex-1 p-6">
        <ErrorState
          message={toMessage(peak.error)}
          onRetry={
            !problem || isRetryable(problem)
              ? () => void peak.refetch()
              : undefined
          }
        />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      {peak.isPending ? <PeakDetailSkeleton /> : <PeakDetail peak={peak.data} />}
    </main>
  );
};
