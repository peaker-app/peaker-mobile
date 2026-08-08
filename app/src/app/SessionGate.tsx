import { useEffect, type ReactNode } from "react";
import { useTranslations } from "use-intl";
import { restoreSession, useSessionState } from "@/lib/auth/session";
import { launchScreen } from "@/lib/native/splashScreen";

export const SessionGate = ({ children }: { children: ReactNode }) => {
  const { status } = useSessionState();
  const t = useTranslations("common.states");
  const ready = status !== "unknown";

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    if (ready) {
      void launchScreen.hide();
    }
  }, [ready]);

  if (!ready) {
    return (
      <p role="status" className="p-6 text-sm text-muted-foreground">
        {t("loading")}
      </p>
    );
  }

  return children;
};
