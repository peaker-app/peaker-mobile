"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePreferences } from "@/stores/preferences";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PeakMapViewProps } from "./PeakMapView";

const PeakMapView = dynamic(() => import("./PeakMapView"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export const PeakMap = (props: PeakMapViewProps) => {
  const t = useTranslations("peaks.map");
  const mapsConsent = usePreferences((state) => state.mapsConsent);
  const [allowedOnce, setAllowedOnce] = useState(false);

  if (!mapsConsent && !allowedOnce) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/40 p-6 text-center">
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {t("consentRequired")}
        </p>
        <Button onClick={() => setAllowedOnce(true)}>{t("loadMap")}</Button>
      </div>
    );
  }

  return (
    <>
      <PeakMapView {...props} />
      <p className="sr-only">{t("textualAlternative")}</p>
    </>
  );
};
