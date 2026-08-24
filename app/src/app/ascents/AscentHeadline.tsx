import { useFormatter, useLocale, useTranslations } from "use-intl";
import type { Locale } from "@/i18n/config";
import { formatAltitude, parseDateOnly } from "@/lib/format";

export interface AscentHeadlineProps {
  peakName: string;
  peakAltitudeMeters: number;
  ascentDate: string;
}

export const useReadableAscentDate = (ascentDate: string): string => {
  const format = useFormatter();
  const date = parseDateOnly(ascentDate);

  return date ? format.dateTime(date, { dateStyle: "long" }) : ascentDate;
};

export const AscentHeadline = ({
  peakName,
  peakAltitudeMeters,
  ascentDate,
}: AscentHeadlineProps) => {
  const t = useTranslations("ascents.header");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;
  const readableDate = useReadableAscentDate(ascentDate);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h1
        dir="auto"
        className="text-2xl leading-relaxed font-semibold text-start"
      >
        {peakName}
      </h1>
      <p className="leading-relaxed text-muted-foreground text-start">
        {units("meters", { value: formatAltitude(locale, peakAltitudeMeters) })}
        {" · "}
        {t("date", { date: readableDate })}
      </p>
    </div>
  );
};
