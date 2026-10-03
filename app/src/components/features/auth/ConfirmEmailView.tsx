"use client";

import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import { dashboardPath } from "@/lib/auth/nextPath";
import { forgetTokenInUrl } from "@/lib/auth/tokenUrl";
import { useSessionState } from "@/lib/auth/session";
import { useEmailConfirmation } from "@/stores/emailConfirmation";

type ConfirmState = "pending" | "success" | "already" | "error" | "missingToken";

export const ConfirmEmailView = ({ token }: { token?: string }) => {
  const t = useTranslations("auth.confirmEmail");
  const { status } = useSessionState();
  const [state, setState] = useState<ConfirmState>(
    token ? "pending" : "missingToken",
  );
  const requested = useRef(false);
  const clearUnconfirmed = useEmailConfirmation((store) => store.clear);

  useEffect(() => {
    if (!token || requested.current) {
      return;
    }

    requested.current = true;
    forgetTokenInUrl();

    const confirm = async () => {
      try {
        await apiFetch(endpoints.auth.confirmEmail, {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        clearUnconfirmed();
        setState("success");
      } catch (error) {
        const confirmedBefore =
          error instanceof ApiError &&
          hasCode(error.problem, "User.EmailAlreadyConfirmed");

        if (confirmedBefore) {
          clearUnconfirmed();
        }

        setState(confirmedBefore ? "already" : "error");
      }
    };

    void confirm();
  }, [token, clearUnconfirmed]);

  const settled = state !== "pending";
  const failed = state === "error" || state === "missingToken";

  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <div aria-live="polite" className="flex flex-col items-center gap-4">
        {state === "pending" ? (
          <p className="leading-relaxed text-muted-foreground">{t("pending")}</p>
        ) : null}

        {state === "success" || state === "already" ? (
          <>
            <CircleCheckIcon aria-hidden className="size-10 text-primary" />
            <h1 className="text-2xl leading-relaxed font-semibold">
              {t(state === "success" ? "successTitle" : "alreadyTitle")}
            </h1>
            <p className="max-w-prose leading-relaxed text-muted-foreground">
              {t(state === "success" ? "successBody" : "alreadyBody")}
            </p>
          </>
        ) : null}

        {failed ? (
          <>
            <TriangleAlertIcon aria-hidden className="size-10 text-destructive" />
            <h1 className="text-2xl leading-relaxed font-semibold">
              {t("errorTitle")}
            </h1>
            <p className="max-w-prose leading-relaxed text-muted-foreground">
              {t(state === "missingToken" ? "missingToken" : "errorBody")}
            </p>
          </>
        ) : null}
      </div>

      {settled ? (
        <div className="flex flex-wrap justify-center gap-3">
          {failed ? (
            <Button asChild>
              <Link href="/confirm-email/pending">{t("requestNew")}</Link>
            </Button>
          ) : (
            <Button asChild autoFocus>
              <Link href={status === "authenticated" ? dashboardPath : "/login"}>
                {t(status === "authenticated" ? "goToDashboard" : "goToLogin")}
              </Link>
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
};
