import { ChevronRightIcon, MountainIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { formatAltitude, formatDistance } from "@/lib/format";
import { peakThumbnail } from "@/lib/peakImage";
import { peakDisplayName } from "@/lib/peakName";

const thumbnailSize = 64;

export interface PeakCardItem {
  id: string;
  name: string;
  altitudeMeters: number;
  countryCode: string | null;
  region: string | null;
  imageUrl?: string | null;
  distanceMeters?: number;
}

export const placeLabel = (
  locale: Locale,
  countryCode: string | null,
  region: string | null,
): string | undefined => {
  const country = countryCode
    ? new Intl.DisplayNames([locale], { type: "region" }).of(countryCode)
    : undefined;

  return [region, country].filter(Boolean).join(", ") || undefined;
};

export const PeakCard = ({ peak }: { peak: PeakCardItem }) => {
  const t = useTranslations("peaks.card");
  const peaks = useTranslations("peaks");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;

  const name = peakDisplayName(peak.name, (id) => peaks("unnamed", { id }));
  const altitude = formatAltitude(locale, peak.altitudeMeters);
  const place = placeLabel(locale, peak.countryCode, peak.region);
  const distance =
    peak.distanceMeters === undefined
      ? undefined
      : formatDistance(locale, peak.distanceMeters);

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-card p-4">
      {peak.imageUrl ? (
        <Image
          src={peakThumbnail(peak.imageUrl, thumbnailSize * 2)}
          alt=""
          width={thumbnailSize}
          height={thumbnailSize}
          className="size-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <MountainIcon aria-hidden className="size-8 shrink-0 text-primary" />
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={`/peaks/${peak.id}`}
          dir="auto"
          aria-label={t("accessibleName", { name, altitude })}
          className="block wrap-break-word text-start font-medium hover:underline"
        >
          {name}
        </Link>
        <p className="wrap-break-word text-sm leading-relaxed text-muted-foreground">
          {t("altitude", { value: altitude })}
          {place ? ` · ${place}` : ""}
        </p>
        {distance ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("distance", {
              value: units(distance.unit, { value: distance.value }),
            })}
          </p>
        ) : null}
      </div>
      <ChevronRightIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
      />
    </li>
  );
};
