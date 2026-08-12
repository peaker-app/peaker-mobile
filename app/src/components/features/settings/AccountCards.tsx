"use client";

import { useQueryClient } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useSessionState, signOut as revokeSession } from "@/lib/auth/session";
import { Link, useRouter } from "@/i18n/navigation";
import { useEmailConfirmation } from "@/stores/emailConfirmation";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

const Card = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3 rounded-md border border-border p-6">
    <h2 className="text-lg leading-relaxed font-semibold text-start">
      {heading}
    </h2>
    {children}
  </section>
);

export const AccountCards = ({ displayName }: { displayName: string }) => {
  const t = useTranslations("settings.account");
  const { session } = useSessionState();
  const unconfirmed = useEmailConfirmation((state) => state.unconfirmed);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    router.replace("/");
    await revokeSession();
    queryClient.clear();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card heading={t("email.heading")}>
        <p dir="ltr" className="text-start font-medium">
          {session?.email}
        </p>
        {unconfirmed ? (
          <p className="text-sm leading-relaxed text-muted-foreground text-start">
            {t("email.unconfirmed")}
          </p>
        ) : null}
        <Button asChild variant="outline" size="sm" className="self-start">
          <Link href="/confirm-email/pending">{t("email.resend")}</Link>
        </Button>
      </Card>

      <Card heading={t("session.heading")}>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-start">
          {t("session.warning")}
        </p>
        <Button
          variant="outline"
          className="self-start"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          {t("session.signOut")}
        </Button>
      </Card>

      <Card heading={t("preferences.heading")}>
        <LocaleSwitcher />
        <p className="text-sm leading-relaxed text-start">
          {t("preferences.units")}
          {": "}
          {t("preferences.metric")}
        </p>
      </Card>

      <section className="flex flex-col gap-3 rounded-md border border-destructive/40 p-6">
        <h2 className="flex items-center gap-2 text-lg leading-relaxed font-semibold text-start">
          <TriangleAlertIcon aria-hidden className="size-5 text-destructive" />
          {t("danger.heading")}
        </h2>
        <Alert variant="destructive">
          <AlertDescription>{t("danger.body")}</AlertDescription>
        </Alert>
        <div className="self-start">
          <DeleteAccountDialog confirmationName={displayName} />
        </div>
      </section>
    </div>
  );
};
