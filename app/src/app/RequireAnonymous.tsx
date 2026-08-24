import { useLocale, useTranslations } from "use-intl";
import { Navigate, Outlet, useSearchParams } from "react-router";
import { resolveNextPath } from "@/lib/auth/nextPath";
import { useSessionState } from "@/lib/auth/session";

export const RequireAnonymous = () => {
  const { status } = useSessionState();
  const [params] = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("common.states");

  if (status === "unknown") {
    return <p className="p-6 text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (status === "authenticated") {
    return <Navigate to={resolveNextPath(params.get("next"), locale)} replace />;
  }

  return <Outlet />;
};
