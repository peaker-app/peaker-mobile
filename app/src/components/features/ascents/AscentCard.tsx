import { ImageIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { VisibilityBadge } from "@/components/features/ascents/VisibilityBadge";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { formatAltitude, parseDateOnly } from "@/lib/format";
import type { AscentSummaryResponse } from "@/types/api";

export interface AscentCardProps {
  ascent: AscentSummaryResponse;
  href: string;
  showVisibility?: boolean;
}

const thumbnailSize = 64;

export const AscentCard = ({
  ascent,
  href,
  showVisibility = false,
}: AscentCardProps) => {
  const t = useTranslations("ascents.card");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const date = parseDateOnly(ascent.ascentDate);
  const readableDate = date
    ? format.dateTime(date, { dateStyle: "long" })
    : ascent.ascentDate;

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-card p-4">
      {ascent.thumbnailUrl ? (
        <Image
          src={ascent.thumbnailUrl}
          alt=""
          width={thumbnailSize}
          height={thumbnailSize}
          className="size-16 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
          <ImageIcon aria-hidden className="size-6 text-muted-foreground" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          dir="auto"
          aria-label={t("accessibleName", {
            peak: ascent.peakName,
            date: readableDate,
          })}
          className="block wrap-break-word text-start font-medium hover:underline"
        >
          {ascent.peakName}
        </Link>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("altitude", {
            value: formatAltitude(locale, ascent.peakAltitudeMeters),
          })}
          {" · "}
          {readableDate}
        </p>
      </div>
      {showVisibility ? <VisibilityBadge value={ascent.visibility} /> : null}
    </li>
  );
};
