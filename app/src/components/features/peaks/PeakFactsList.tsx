import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { countryName } from "@/lib/countries";
import { formatAltitude, formatCoordinate } from "@/lib/format";
import type { PeakDetailResponse } from "@/types/api";

interface Fact {
  key: string;
  label: string;
  value: ReactNode;
}

export const PeakFactsList = ({ peak }: { peak: PeakDetailResponse }) => {
  const t = useTranslations("peakDetail.facts");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;

  const coordinates = `${formatCoordinate(locale, peak.latitude)}, ${formatCoordinate(locale, peak.longitude)}`;

  const facts: (Fact | undefined)[] = [
    {
      key: "altitude",
      label: t("altitude"),
      value: units("meters", { value: formatAltitude(locale, peak.altitudeMeters) }),
    },
    peak.prominenceMeters === null
      ? undefined
      : {
          key: "prominence",
          label: t("prominence"),
          value: units("meters", {
            value: formatAltitude(locale, peak.prominenceMeters),
          }),
        },
    {
      key: "coordinates",
      label: t("coordinates"),
      value: (
        <data value={`${peak.latitude},${peak.longitude}`} dir="ltr">
          {coordinates}
        </data>
      ),
    },
    peak.countryCode === null
      ? undefined
      : {
          key: "country",
          label: t("country"),
          value: countryName(locale, peak.countryCode),
        },
    peak.region === null
      ? undefined
      : { key: "region", label: t("region"), value: peak.region },
    peak.rangeName === null
      ? undefined
      : { key: "range", label: t("range"), value: peak.rangeName },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>
      <dl className="flex flex-col gap-2 text-start">
        {facts
          .filter((fact) => fact !== undefined)
          .map((fact) => (
            <div
              key={fact.key}
              className="flex flex-wrap gap-2 border-b border-border pb-2 text-sm leading-relaxed"
            >
              <dt className="min-w-0 flex-1 text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="min-w-0 font-medium">{fact.value}</dd>
            </div>
          ))}
      </dl>
      <a
        href={`https://www.openstreetmap.org/?mlat=${peak.latitude}&mlon=${peak.longitude}#map=13/${peak.latitude}/${peak.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-start text-sm font-medium hover:underline"
      >
        {t("openInMap")}
      </a>
    </section>
  );
};
