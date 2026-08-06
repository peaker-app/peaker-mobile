"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import { dashboardPath } from "@/lib/auth/nextPath";

const cooldownSeconds = 120;

const formatCountdown = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const ResendConfirmationCard = () => {
  const t = useTranslations("auth.resend");
  const toMessage = useProblemMessage();
  const [remaining, setRemaining] = useState(0);
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  const resend = async () => {
    setSending(true);
    setNotice(undefined);
    setFailure(undefined);

    try {
      await apiFetch(endpoints.auth.resendConfirmation, { method: "POST" });
      setNotice(t("sent"));
      setRemaining(cooldownSeconds);
    } catch (error) {
      if (
        error instanceof ApiError &&
        hasCode(error.problem, "User.EmailAlreadyConfirmed")
      ) {
        setConfirmed(true);
      } else {
        setFailure(toMessage(error));

        if (error instanceof ApiError && error.problem.status === 429) {
          setRemaining(cooldownSeconds);
        }
      }
    } finally {
      setSending(false);
    }
  };

  if (confirmed) {
    return (
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl leading-relaxed font-semibold">
          {t("alreadyConfirmed")}
        </h1>
        <Button asChild>
          <Link href={dashboardPath}>{t("goToDashboard")}</Link>
        </Button>
      </section>
    );
  }

  const waiting = remaining > 0;

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        <p className="max-w-prose leading-relaxed text-muted-foreground text-start">
          {t("body")}
        </p>
      </header>

      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-start">
        {t("warning")}
      </p>

      <Button
        onClick={resend}
        disabled={sending || waiting}
        aria-disabled={sending || waiting}
        aria-describedby={waiting ? "resend-cooldown" : undefined}
        className="min-w-56"
      >
        {sending ? t("submitting") : t("submit")}
      </Button>

      {waiting ? (
        <p
          id="resend-cooldown"
          aria-live="off"
          className="text-sm leading-relaxed text-muted-foreground text-start"
        >
          {t.rich("cooldown", {
            value: formatCountdown(remaining),
            time: (chunks) => <span dir="ltr">{chunks}</span>,
          })}
        </p>
      ) : null}

      {notice ? (
        <Alert role="status">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      {failure ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
};
