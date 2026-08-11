import { useParams, useSearchParams } from "react-router";
import { useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { AscentHeadline } from "@/app/ascents/AscentHeadline";
import { AscentNotes } from "@/app/ascents/AscentNotes";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConditionsSummary } from "@/components/features/ascents/ConditionsSummary";
import { PhotoManager } from "@/components/features/ascents/PhotoManager";
import { VisibilityBadge } from "@/components/features/ascents/VisibilityBadge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { isRetryable } from "@/lib/api/problem";
import { useOfflineQueue } from "@/lib/offline/queue";
import type { AscentResponse } from "@/types/api";
import { QueuedAscentDetail } from "./QueuedAscentDetail";
import { useOwnAscent } from "./useOwnAscent";

const AscentDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const failedCount = (value: string | null): number => {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const PendingPhotosAlert = ({ count }: { count: number }) => {
  const t = useTranslations("ascents.detail.pendingPhotos");

  return (
    <Alert variant="warning" role="status">
      <div className="flex flex-col gap-1">
        <AlertTitle>{t("title", { count })}</AlertTitle>
        <AlertDescription>{t("body")}</AlertDescription>
      </div>
    </Alert>
  );
};

const AscentActions = ({ ascent }: { ascent: AscentResponse }) => {
  const t = useTranslations("ascents.detail");

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <Link href={`/dashboard/ascents/${ascent.id}/edit`}>{t("edit")}</Link>
      </Button>
      {ascent.visibility === "Public" ? (
        <Button asChild variant="ghost">
          <Link href={`/ascents/${ascent.id}`}>{t("viewPublic")}</Link>
        </Button>
      ) : null}
    </div>
  );
};

const AscentDetail = ({
  ascent,
  pendingPhotos,
}: {
  ascent: AscentResponse;
  pendingPhotos: number;
}) => {
  const nav = useTranslations("nav");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        steps={[
          { label: nav("myAscents"), href: "/dashboard/ascents" },
          { label: ascent.peakName },
        ]}
      />

      <header className="flex flex-col gap-3">
        <AscentHeadline
          peakName={ascent.peakName}
          peakAltitudeMeters={ascent.peakAltitudeMeters}
          ascentDate={ascent.ascentDate}
        />
        <VisibilityBadge value={ascent.visibility} />
        <AscentActions ascent={ascent} />
      </header>

      {pendingPhotos > 0 ? <PendingPhotosAlert count={pendingPhotos} /> : null}

      <PhotoManager
        ascentId={ascent.id}
        photos={ascent.photos}
        peakName={ascent.peakName}
      />

      <AscentNotes ascent={ascent} />
      <ConditionsSummary conditions={ascent.conditions} />

      <Link
        href={`/peaks/${ascent.peakId}`}
        dir="auto"
        className="text-start font-medium hover:underline"
      >
        {ascent.peakName}
      </Link>
    </div>
  );
};

export const AscentDetailScreen = () => {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const toMessage = useProblemMessage();
  const queued = useOfflineQueue((state) =>
    state.entries.find((entry) => entry.clientAscentId === id),
  );
  const ascent = useOwnAscent(id, { enabled: queued === undefined });

  if (queued) {
    return (
      <main className="flex-1 p-6">
        <QueuedAscentDetail entry={queued} />
      </main>
    );
  }

  if (ascent.isError) {
    const problem =
      ascent.error instanceof ApiError ? ascent.error.problem : undefined;

    if (problem?.status === 404) {
      return <NotFoundScreen />;
    }

    return (
      <main className="flex-1 p-6">
        <ErrorState
          message={toMessage(ascent.error)}
          onRetry={
            !problem || isRetryable(problem)
              ? () => void ascent.refetch()
              : undefined
          }
        />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      {ascent.isPending ? (
        <AscentDetailSkeleton />
      ) : (
        <AscentDetail
          ascent={ascent.data}
          pendingPhotos={failedCount(params.get("photosFailed"))}
        />
      )}
    </main>
  );
};
