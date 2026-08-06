import { useTranslations } from "use-intl";
import { SignOutButton } from "@/components/features/auth/SignOutButton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { useSessionState } from "@/lib/auth/session";

export const AccountScreen = () => {
  const t = useTranslations("settings.account");
  const { session } = useSessionState();

  return (
    <main className="flex-1 p-6">
      <h1 className="mb-4 text-xl font-semibold text-start">{t("title")}</h1>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("email.heading")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <p dir="ltr" className="text-sm leading-relaxed text-start">
              {session?.email}
            </p>
            <Button asChild variant="outline">
              <Link href="/confirm-email/pending">{t("email.resend")}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("session.heading")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};
