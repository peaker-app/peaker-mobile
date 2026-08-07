"use client";

import { useFormatter, useLocale, useTranslations } from "next-intl";
import { VisibilityBadge } from "@/components/features/ascents/VisibilityBadge";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { formatAltitude, parseDateOnly } from "@/lib/format";
import type { AscentSummaryResponse } from "@/types/api";

export const AscentTable = ({
  ascents,
}: {
  ascents: readonly AscentSummaryResponse[];
}) => {
  const t = useTranslations("ascents.mine.table");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <caption className="sr-only">{t("caption")}</caption>
        <thead>
          <tr className="border-b border-border text-start">
            <th scope="col" className="min-w-0 whitespace-normal p-3 text-start font-medium">
              {t("peak")}
            </th>
            <th scope="col" className="whitespace-normal p-3 text-start font-medium">
              {t("altitude")}
            </th>
            <th
              scope="col"
              aria-sort="descending"
              className="whitespace-normal p-3 text-start font-medium"
            >
              {t("date")}
            </th>
            <th scope="col" className="whitespace-normal p-3 text-start font-medium">
              {t("visibility")}
            </th>
            <th scope="col" className="whitespace-normal p-3 text-start font-medium">
              {t("actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {ascents.map((ascent) => {
            const date = parseDateOnly(ascent.ascentDate);

            return (
              <tr key={ascent.id} className="border-b border-border">
                <td className="min-w-0 p-3">
                  <Link
                    href={`/dashboard/ascents/${ascent.id}`}
                    className="font-medium hover:underline"
                  >
                    {ascent.peakName}
                  </Link>
                </td>
                <td className="p-3">
                  {units("meters", {
                    value: formatAltitude(locale, ascent.peakAltitudeMeters),
                  })}
                </td>
                <td className="p-3">
                  {date
                    ? format.dateTime(date, { dateStyle: "medium" })
                    : ascent.ascentDate}
                </td>
                <td className="p-3">
                  <VisibilityBadge value={ascent.visibility} />
                </td>
                <td className="p-3">
                  <Link
                    href={`/dashboard/ascents/${ascent.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {t("edit")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
