import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { isProfilePending } from "@/lib/profile/isProfilePending";
import { useOwnProfile } from "@/lib/profile/useOwnProfile";

export const DashboardGreeting = () => {
  const t = useTranslations("dashboard.greeting");
  const pending = useTranslations("dashboard.profilePending");
  const profile = useOwnProfile();

  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl leading-relaxed font-semibold text-start">
        {profile.data
          ? t("titleNamed", { name: profile.data.displayName })
          : t("title")}
      </h1>
      <p className="leading-relaxed text-muted-foreground text-start">
        {profile.isError && isProfilePending(profile.error)
          ? pending("body")
          : t("body")}
      </p>
      <Button asChild className="self-start">
        <Link href="/dashboard/ascents/new">{t("logAscent")}</Link>
      </Button>
    </header>
  );
};
