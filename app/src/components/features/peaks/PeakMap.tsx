"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PeakMapViewProps } from "./PeakMapView";

const PeakMapView = dynamic(() => import("./PeakMapView"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export const PeakMap = (props: PeakMapViewProps) => {
  const t = useTranslations("peaks.map");

  return (
    <>
      <PeakMapView {...props} />
      <p className="sr-only">{t("textualAlternative")}</p>
    </>
  );
};
