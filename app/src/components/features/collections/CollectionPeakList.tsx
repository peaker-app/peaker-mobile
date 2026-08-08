"use client";

import { Trash2Icon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { formatAltitude, parseDateOnly } from "@/lib/format";
import type { CollectionPeakResponse } from "@/types/api";

export interface CollectionPeakListProps {
  peaks: readonly CollectionPeakResponse[];
  busy: boolean;
  onRemove: (peak: CollectionPeakResponse) => void;
}

export const CollectionPeakList = ({
  peaks,
  busy,
  onRemove,
}: CollectionPeakListProps) => {
  const t = useTranslations("collections.detail");
  const units = useTranslations("units");
  const format = useFormatter();
  const locale = useLocale() as Locale;

  const altitude = (meters: number) =>
    units("meters", { value: formatAltitude(locale, meters) });

  const addedOn = (value: string) => {
    const date = parseDateOnly(value.slice(0, 10));

    return date ? format.dateTime(date, { dateStyle: "medium" }) : "";
  };

  const removeButton = (peak: CollectionPeakResponse) => (
    <Button
      variant="ghost"
      size="icon"
      disabled={busy}
      aria-label={t("removePeak", { name: peak.peakName })}
      onClick={() => onRemove(peak)}
    >
      <Trash2Icon aria-hidden className="size-4" />
    </Button>
  );

  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {peaks.map((peak) => (
          <li
            key={peak.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border p-4"
          >
            <div className="flex flex-col gap-1">
              <Link
                href={`/peaks/${peak.peakId}`}
                dir="auto"
                className="font-medium hover:underline"
              >
                {peak.peakName}
              </Link>
              <span className="text-sm text-muted-foreground">
                {altitude(peak.peakAltitudeMeters)}
              </span>
            </div>
            {removeButton(peak)}
          </li>
        ))}
      </ul>

      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-3 text-start font-medium">
              {t("peakColumn")}
            </th>
            <th scope="col" className="p-3 text-start font-medium">
              {t("altitudeColumn")}
            </th>
            <th scope="col" className="p-3 text-start font-medium">
              {t("addedColumn")}
            </th>
            <th scope="col" className="p-3">
              <span className="sr-only">{t("peaks")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {peaks.map((peak) => (
            <tr key={peak.id} className="border-b border-border">
              <td className="p-3 text-start">
                <Link
                  href={`/peaks/${peak.peakId}`}
                  dir="auto"
                  className="font-medium hover:underline"
                >
                  {peak.peakName}
                </Link>
              </td>
              <td className="p-3 text-start">{altitude(peak.peakAltitudeMeters)}</td>
              <td className="p-3 text-start">{addedOn(peak.addedAtUtc)}</td>
              <td className="p-3 text-end">{removeButton(peak)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
