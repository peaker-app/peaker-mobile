import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConditionsSummary } from "@/components/features/ascents/ConditionsSummary";
import { PhotoGallery } from "@/components/features/ascents/PhotoGallery";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { isRetryable } from "@/lib/api/problem";
import { useSessionState } from "@/lib/auth/sessionStore";
import type { AscentResponse, PublicProfileResponse } from "@/types/api";
import { AscentHeadline } from "./AscentHeadline";
import { AscentNotes } from "./AscentNotes";

const publicStaleMs = 300_000;

const PublicAscentSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-48 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

const AuthorLink = ({ userId }: { userId: string }) => {
  const t = useTranslations("ascents.public");

  const author = useQuery({
    queryKey: ["profile", "byUser", userId],
    queryFn: () =>
      apiFetch<PublicProfileResponse>(endpoints.profiles.byUserId(userId)),
    retry: shouldRetry,
    staleTime: publicStaleMs,
  });

  if (!author.data) {
    return null;
  }

  return (
    <Link
      href={`/climbers/${author.data.slug}`}
      className="text-start font-medium hover:underline"
    >
      {t("byClimber", { name: author.data.displayName })}
    </Link>
  );
};

const OwnerActions = ({ ascent }: { ascent: AscentResponse }) => {
  const t = useTranslations("ascents.detail");
  const { session } = useSessionState();

  if (session?.userId !== ascent.userId) {
    return null;
  }

  return (
    <Button asChild variant="outline" className="self-start">
      <Link href={`/dashboard/ascents/${ascent.id}/edit`}>{t("edit")}</Link>
    </Button>
  );
};

const PublicAscent = ({ ascent }: { ascent: AscentResponse }) => {
  const t = useTranslations("ascents.public");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        steps={[{ label: t("breadcrumb") }, { label: ascent.peakName }]}
      />

      <header className="flex flex-col gap-2">
        <AscentHeadline
          peakName={ascent.peakName}
          peakAltitudeMeters={ascent.peakAltitudeMeters}
          ascentDate={ascent.ascentDate}
        />
        <AuthorLink userId={ascent.userId} />
        <OwnerActions ascent={ascent} />
      </header>

      <PhotoGallery photos={ascent.photos} peakName={ascent.peakName} />
      <AscentNotes ascent={ascent} />
      <ConditionsSummary conditions={ascent.conditions} />

      <Link
        href={`/peaks/${ascent.peakId}`}
        className="text-start font-medium hover:underline"
      >
        {t("viewPeak")}
      </Link>
    </div>
  );
};

export const PublicAscentScreen = () => {
  const { id = "" } = useParams();
  const toMessage = useProblemMessage();

  const ascent = useQuery({
    queryKey: ["ascent", id],
    queryFn: () => apiFetch<AscentResponse>(endpoints.ascents.byId(id)),
    retry: shouldRetry,
    staleTime: publicStaleMs,
  });

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
        <PublicAscentSkeleton />
      ) : (
        <PublicAscent ascent={ascent.data} />
      )}
    </main>
  );
};
