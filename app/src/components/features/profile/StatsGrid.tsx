import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { formatAltitude, parseDateOnly } from "@/lib/format";
import type { ProfileStatsResponse } from "@/types/api";

const StatCard = ({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) => (
  <dl className="flex flex-col-reverse gap-1 rounded-md border border-border bg-card p-4 text-start">
    <dt className="text-sm leading-relaxed text-muted-foreground">{label}</dt>
    <dd
      aria-label={`${label}: ${value}`}
      className="text-2xl leading-relaxed font-semibold"
    >
      {children ?? value}
    </dd>
  </dl>
);

export interface StatsGridProps {
  stats: ProfileStatsResponse;
  note?: string;
}

export const StatsGrid = ({ stats, note }: StatsGridProps) => {
  const t = useTranslations("stats");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const lastAscent = stats.lastAscentDate
    ? parseDateOnly(stats.lastAscentDate)
    : undefined;

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label={t("totalAscents")}
          value={String(stats.totalAscents)}
        />
        <StatCard
          label={t("distinctPeaks")}
          value={String(stats.distinctPeaks)}
        />
        <StatCard
          label={t("highestAltitude")}
          value={formatAltitude(locale, stats.highestAltitudeMeters)}
        />
        <StatCard
          label={t("lastAscent")}
          value={
            lastAscent ? format.dateTime(lastAscent, { dateStyle: "medium" }) : t("none")
          }
        />
      </div>
      {note ? (
        <p className="text-sm leading-relaxed text-muted-foreground text-start">
          {note}
        </p>
      ) : null}
    </section>
  );
};
