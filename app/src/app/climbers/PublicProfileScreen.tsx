import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";
import { StatsGrid } from "@/components/features/profile/StatsGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PublicProfileResponse } from "@/types/api";
import { PublicAscentsList } from "./PublicAscentsList";

const publicStaleTime = 300_000;

const PublicProfileSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const PublicProfile = ({
  profile,
  slug,
}: {
  profile: PublicProfileResponse;
  slug: string;
}) => {
  const t = useTranslations("profile.public");
  const stats = useTranslations("stats");

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader profile={profile} />
      <StatsGrid stats={profile.stats} note={stats("publicOnly")} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg leading-relaxed font-semibold text-start">
          {t("ascentsHeading")}
        </h2>
        <PublicAscentsList userId={profile.userId} slug={slug} />
      </section>
    </div>
  );
};

export const PublicProfileScreen = () => {
  const { slug = "" } = useParams();
  const toMessage = useProblemMessage();

  const profile = useQuery({
    queryKey: ["climber", slug],
    queryFn: () =>
      apiFetch<PublicProfileResponse>(endpoints.profiles.bySlug(slug)),
    retry: shouldRetry,
    staleTime: publicStaleTime,
  });

  if (profile.isError) {
    const problem =
      profile.error instanceof ApiError ? profile.error.problem : undefined;

    if (problem?.status === 404) {
      return <NotFoundScreen />;
    }

    return (
      <main className="flex-1 p-6">
        <ErrorState
          message={toMessage(profile.error)}
          onRetry={() => void profile.refetch()}
        />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      {profile.isPending ? (
        <PublicProfileSkeleton />
      ) : (
        <PublicProfile profile={profile.data} slug={slug} />
      )}
    </main>
  );
};
