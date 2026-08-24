"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/feedback/Pagination";
import { PeakCard } from "@/components/features/peaks/PeakCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Skeleton } from "@/components/ui/Skeleton";
import { Slider } from "@/components/ui/Slider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePagedQuery } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import type { Locale } from "@/i18n/config";
import { endpoints } from "@/lib/api/endpoints";
import { formatDistance } from "@/lib/format";
import {
  defaultRadiusMeters,
  mapsEnabled,
  maxRadiusMeters,
  minRadiusMeters,
  radiusStepMeters,
} from "@/lib/map";
import { clamp } from "@/lib/number";
import type { NearbyPeakResponse } from "@/types/api";
import { LocationPicker, type Origin } from "./LocationPicker";
import { MapListSwitcher, type Pane } from "./MapListSwitcher";
import { PeakMap } from "./PeakMap";

const pageSize = 20;
const radiusDebounceMs = 400;
const metersPerKilometer = 1000;

const toKilometers = (meters: number) => String(meters / metersPerKilometer);

export const NearbyPeaksView = () => {
  const t = useTranslations("peaks.nearby");
  const locale = useLocale() as Locale;
  const toMessage = useProblemMessage();

  const [origin, setOrigin] = useState<Origin | undefined>(undefined);
  const [radius, setRadius] = useState(defaultRadiusMeters);
  const [radiusText, setRadiusText] = useState(toKilometers(defaultRadiusMeters));
  const [page, setPage] = useState(1);
  const [pane, setPane] = useState<Pane>("list");
  const debouncedRadius = useDebouncedValue(radius, radiusDebounceMs);

  const changeRadius = (meters: number) => {
    setRadius(meters);
    setRadiusText(toKilometers(meters));
    setPage(1);
  };

  const commitRadiusText = () => {
    const parsed = Number.parseInt(radiusText, 10);
    const meters = Number.isFinite(parsed)
      ? parsed * metersPerKilometer
      : radius;

    changeRadius(clamp(meters, minRadiusMeters, maxRadiusMeters));
  };

  const query = usePagedQuery<NearbyPeakResponse>(
    ["peaks", "nearby", origin?.latitude, origin?.longitude],
    endpoints.peaks.nearby,
    {
      page,
      size: pageSize,
      filters: {
        lat: origin?.latitude,
        lon: origin?.longitude,
        radius: debouncedRadius,
      },
      enabled: origin !== undefined,
    },
  );

  const changeOrigin = (next: Origin) => {
    setOrigin(next);
    setPage(1);
  };

  const readableRadius = formatDistance(locale, debouncedRadius);
  const radiusLabel = t("radiusValue", {
    value: (debouncedRadius / 1000).toString(),
  });

  const showMap = mapsEnabled();

  return (
    <div className="flex flex-col gap-6">
      <LocationPicker origin={origin} onChange={changeOrigin} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="radius">{t("radius")}</Label>
        <div className="flex items-center gap-3">
          <Slider
            id="radius"
            className="flex-1"
            min={minRadiusMeters}
            max={maxRadiusMeters}
            step={radiusStepMeters}
            value={[radius]}
            onValueChange={(value) =>
              changeRadius(value[0] ?? defaultRadiusMeters)
            }
            thumbLabel={t("radius")}
            valueText={radiusLabel}
          />
          <Input
            id="radius-value"
            type="number"
            inputMode="numeric"
            className="w-24 shrink-0"
            min={minRadiusMeters / metersPerKilometer}
            max={maxRadiusMeters / metersPerKilometer}
            step={radiusStepMeters / metersPerKilometer}
            value={radiusText}
            aria-label={t("radiusInput")}
            onChange={(event) => setRadiusText(event.target.value)}
            onBlur={commitRadiusText}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitRadiusText();
              }
            }}
          />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {radiusLabel}
        </p>
      </div>

      {showMap ? <MapListSwitcher pane={pane} onChange={setPane} /> : null}

      {showMap && pane === "map" ? (
        <div className="flex flex-col gap-2">
          <PeakMap
            points={query.data?.items ?? []}
            origin={origin}
            radiusMeters={origin ? debouncedRadius : undefined}
            onPick={(latitude, longitude) =>
              changeOrigin({ latitude, longitude })
            }
            className="h-[60svh]"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("mapHint")}
          </p>
        </div>
      ) : (
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-lg leading-relaxed font-semibold text-start">
            {t("listHeading")}
          </h2>

          {origin === undefined ? (
            <EmptyState title={t("noOrigin")} />
          ) : query.isPending ? (
            <ul className="flex flex-col gap-3">
              {Array.from({ length: 6 }, (_, index) => (
                <li key={index}>
                  <Skeleton className="h-24 w-full" />
                </li>
              ))}
            </ul>
          ) : query.isError ? (
            <ErrorState
              message={toMessage(query.error)}
              onRetry={() => void query.refetch()}
            />
          ) : query.data.items.length === 0 ? (
            <EmptyState
              title={t("empty", {
                radius: `${readableRadius.value} ${readableRadius.unit === "meters" ? "m" : "km"}`,
              })}
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    changeRadius(Math.min(radius * 2, maxRadiusMeters))
                  }
                >
                  {t("emptyAction")}
                </Button>
              }
            />
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {query.data.items.map((peak) => (
                  <PeakCard key={peak.id} peak={peak} />
                ))}
              </ul>
              <Pagination
                page={page}
                totalPages={query.data.totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
};
