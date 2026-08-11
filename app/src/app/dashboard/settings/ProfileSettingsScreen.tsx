import { useTranslations } from "use-intl";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { AvatarUploader } from "@/components/features/settings/AvatarUploader";
import { ProfileDataForm } from "@/components/features/settings/ProfileDataForm";
import { SlugForm } from "@/components/features/settings/SlugForm";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link } from "@/i18n/navigation";
import { isProfilePending } from "@/lib/profile/isProfilePending";
import { useOwnProfile } from "@/lib/profile/useOwnProfile";
import type { ProfileResponse } from "@/types/api";

const ProfileSettingsSkeleton = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-64 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

const ProfileSettings = ({ profile }: { profile: ProfileResponse }) => {
  const t = useTranslations("settings.profile");

  return (
    <div className="flex flex-col gap-6">
      <AvatarUploader
        avatarUrl={profile.avatarUrl}
        displayName={profile.displayName}
      />

      <ProfileDataForm profile={profile} />

      <SlugForm slug={profile.slug} />

      <Link
        href={`/climbers/${profile.slug}`}
        className="text-start font-medium hover:underline"
      >
        {t("viewPublic")}
      </Link>
    </div>
  );
};

export const ProfileSettingsScreen = () => {
  const t = useTranslations("settings.profile");
  const pending = useTranslations("dashboard.profilePending");
  const toMessage = useProblemMessage();
  const profile = useOwnProfile();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("title")}
      </h1>

      {profile.isPending ? <ProfileSettingsSkeleton /> : null}

      {profile.isError && isProfilePending(profile.error) ? (
        <EmptyState
          title={pending("title")}
          description={pending("body")}
          action={
            <Button variant="outline" onClick={() => void profile.refetch()}>
              {pending("retry")}
            </Button>
          }
        />
      ) : null}

      {profile.isError && !isProfilePending(profile.error) ? (
        <ErrorState
          message={toMessage(profile.error)}
          onRetry={() => void profile.refetch()}
        />
      ) : null}

      {profile.isSuccess ? <ProfileSettings profile={profile.data} /> : null}
    </main>
  );
};
