"use client";

import { MailWarningIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Link } from "@/i18n/navigation";
import { useEmailConfirmation } from "@/stores/emailConfirmation";

export const UnconfirmedEmailBanner = () => {
  const t = useTranslations("dashboard.unconfirmed");
  const unconfirmed = useEmailConfirmation((state) => state.unconfirmed);

  if (!unconfirmed) {
    return null;
  }

  return (
    <Alert variant="warning" role="status">
      <MailWarningIcon aria-hidden />
      <AlertDescription className="flex flex-wrap items-center gap-2">
        {t("message")}
        <Link
          href="/confirm-email/pending"
          className="font-medium text-foreground underline"
        >
          {t("action")}
        </Link>
      </AlertDescription>
    </Alert>
  );
};
