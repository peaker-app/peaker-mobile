import { useEffect, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { restoreSession, useSessionState } from "@/lib/auth/session";

export const SessionGate = ({ children }: { children: ReactNode }) => {
  const { status } = useSessionState();
  const t = useTranslations("common.states");

  useEffect(() => {
    void restoreSession();
  }, []);

  if (status === "unknown") {
    return (
      <p role="status" className="p-6 text-sm text-muted-foreground">
        {t("loading")}
      </p>
    );
  }

  return children;
};
