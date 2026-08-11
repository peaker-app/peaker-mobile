import { useTranslations } from "use-intl";
import { AscentHeadline } from "@/app/ascents/AscentHeadline";
import { VisibilityBadge } from "@/components/features/ascents/VisibilityBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { discardQueuedAscent, type QueuedAscent } from "@/lib/offline/queue";
import { useQueuedPhotos } from "@/lib/offline/useQueuedPhotos";

const QueuedStatus = ({ status }: { status: QueuedAscent["status"] }) => {
  const t = useTranslations("offline.detail");
  const state = status === "rejected" ? "rejected" : "pending";

  return (
    <Alert
      variant={status === "rejected" ? "destructive" : "warning"}
      role="status"
    >
      <div className="flex flex-col gap-1">
        <AlertTitle>{t(`${state}.title`)}</AlertTitle>
        <AlertDescription>{t(`${state}.body`)}</AlertDescription>
      </div>
    </Alert>
  );
};

const QueuedPhotos = ({ entry }: { entry: QueuedAscent }) => {
  const t = useTranslations("offline.detail");
  const photos = useQueuedPhotos(entry.photos);

  if (entry.photos.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-medium text-start">
        {t("photosPending", { count: entry.photos.length })}
      </h2>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id}>
            <img
              src={photo.previewUrl}
              alt=""
              className="h-28 w-full rounded-md object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

export const QueuedAscentDetail = ({ entry }: { entry: QueuedAscent }) => {
  const t = useTranslations("offline.detail");
  const nav = useTranslations("nav");
  const router = useRouter();

  const discard = () => {
    void discardQueuedAscent(entry.clientAscentId);
    router.replace("/dashboard/ascents");
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        steps={[
          { label: nav("myAscents"), href: "/dashboard/ascents" },
          { label: entry.peak.name },
        ]}
      />

      <header className="flex flex-col gap-3">
        <AscentHeadline
          peakName={entry.peak.name}
          peakAltitudeMeters={entry.peak.altitudeMeters}
          ascentDate={entry.request.ascentDate}
        />
        {entry.request.visibility ? (
          <VisibilityBadge value={entry.request.visibility} />
        ) : null}
      </header>

      <QueuedStatus status={entry.status} />

      <QueuedPhotos entry={entry} />

      {entry.droppedPhotos > 0 ? (
        <Alert variant="warning" role="status">
          <AlertDescription>
            {t("photosDropped", { count: entry.droppedPhotos })}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button variant="outline" className="self-start" onClick={discard}>
        {t("discard")}
      </Button>

      <Link
        href={`/peaks/${entry.request.peakId}`}
        dir="auto"
        className="text-start font-medium hover:underline"
      >
        {entry.peak.name}
      </Link>
    </div>
  );
};
