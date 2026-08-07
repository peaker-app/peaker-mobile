import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/Button";
import { shouldRetry } from "@/hooks/usePagedQuery";
import { Link } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProfileResponse } from "@/types/api";

export const DashboardGreeting = () => {
  const t = useTranslations("dashboard.greeting");

  const profile = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => apiFetch<ProfileResponse>(endpoints.profiles.me),
    retry: shouldRetry,
  });

  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl leading-relaxed font-semibold text-start">
        {profile.data
          ? t("titleNamed", { name: profile.data.displayName })
          : t("title")}
      </h1>
      <p className="leading-relaxed text-muted-foreground text-start">
        {t("body")}
      </p>
      <Button asChild className="self-start">
        <Link href="/dashboard/ascents/new">{t("logAscent")}</Link>
      </Button>
    </header>
  );
};
