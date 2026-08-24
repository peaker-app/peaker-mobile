import { useTranslations } from "use-intl";
import { Navigate, Outlet, useLocation } from "react-router";
import { useSessionState } from "@/lib/auth/session";

export const RequireSession = () => {
  const { status } = useSessionState();
  const { pathname, search } = useLocation();
  const t = useTranslations("common.states");

  if (status === "unknown") {
    return <p className="p-6 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (status === "anonymous") {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(`${pathname}${search}`)}`}
        replace
      />
    );
  }

  return <Outlet />;
};
