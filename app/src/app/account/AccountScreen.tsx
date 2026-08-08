import { useTranslations } from "use-intl";
import { AccountCards } from "@/components/features/settings/AccountCards";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { useOwnProfile } from "@/lib/profile/useOwnProfile";

export const AccountScreen = () => {
  const t = useTranslations("settings.account");
  const profile = useTranslations("settings.profile");
  const { data } = useOwnProfile();

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-xl leading-relaxed font-semibold text-start">
        {t("title")}
      </h1>

      <Button asChild variant="outline" className="self-start">
        <Link href="/dashboard/settings/profile">{profile("title")}</Link>
      </Button>

      <AccountCards displayName={data?.displayName ?? ""} />
    </main>
  );
};
