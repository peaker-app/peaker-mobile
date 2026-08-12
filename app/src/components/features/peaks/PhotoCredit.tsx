import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { PeakDetailResponse } from "@/types/api";

const linked = (label: string, href: string | null): ReactNode =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {label}
    </a>
  ) : (
    label
  );

export const PhotoCredit = ({ peak }: { peak: PeakDetailResponse }) => {
  const t = useTranslations("peakDetail.photoCredit");

  if (!peak.imageUrl || (!peak.imageAuthor && !peak.imageLicense)) {
    return null;
  }

  return (
    <p className="text-xs leading-relaxed text-muted-foreground text-start">
      {t("photo")}
      {": "}
      {linked(peak.imageAuthor ?? t("unknownAuthor"), peak.imageCreditUrl)}
      {peak.imageLicense ? (
        <>
          {" · "}
          {linked(peak.imageLicense, peak.imageLicenseUrl)}
        </>
      ) : null}
      {" · "}
      {t("source")}
    </p>
  );
};
