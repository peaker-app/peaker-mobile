import { useTranslations } from "use-intl";
import { AccountCards } from "@/components/features/settings/AccountCards";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { useOwnProfile } from "@/lib/profile/useOwnProfile";

const legalLinks = [
  { href: "/legal/notice", key: "notice" },
  { href: "/legal/privacy", key: "privacy" },
  { href: "/legal/cookies", key: "cookies" },
  { href: "/legal/terms", key: "terms" },
] as const;

export const AccountScreen = () => {
  const t = useTranslations("settings.account");
  const profile = useTranslations("settings.profile");
  const footer = useTranslations("footer");
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

      <nav aria-label={footer("legalHeading")} className="mt-2">
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          {legalLinks.map((link) => (
            <li key={link.key}>
              <Link href={link.href} className="underline">
                {footer(`legal.${link.key}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
};
