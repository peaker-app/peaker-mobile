import { useLocale, useTranslations } from "use-intl";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { formatAltitude } from "@/lib/format";
import { useOfflineQueue, type QueuedAscent } from "@/lib/offline/queue";

const QueuedRow = ({ entry }: { entry: QueuedAscent }) => {
  const t = useTranslations("offline.list");
  const units = useTranslations("units");
  const locale = useLocale() as Locale;

  return (
    <li>
      <Link
        href={`/dashboard/ascents/${entry.clientAscentId}`}
        className="flex flex-col gap-1 rounded-lg border border-dashed p-4 hover:bg-muted"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span dir="auto" className="font-medium text-start">
            {entry.peak.name}
          </span>
          <Badge variant={entry.status === "rejected" ? "warning" : "neutral"}>
            {t(entry.status)}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground text-start">
          {units("meters", {
            value: formatAltitude(locale, entry.peak.altitudeMeters),
          })}
          {" · "}
          {entry.request.ascentDate}
          {entry.photos.length > 0
            ? ` · ${t("photos", { count: entry.photos.length })}`
            : ""}
        </span>
      </Link>
    </li>
  );
};

export const QueuedAscentsList = () => {
  const entries = useOfflineQueue((state) => state.entries);

  return entries.length === 0 ? null : (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <QueuedRow key={entry.clientAscentId} entry={entry} />
      ))}
    </ul>
  );
};
