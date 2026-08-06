import { useTranslations } from "use-intl";
import { useSearchParams } from "react-router";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { sanitizeNextPath } from "@/lib/auth/nextPath";

export const LoginScreen = () => {
  const t = useTranslations("auth.login");
  const [params] = useSearchParams();

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-relaxed font-semibold text-start">
          {t("title")}
        </h1>
        <p className="leading-relaxed text-muted-foreground text-start">
          {t("subtitle")}
        </p>
      </header>

      {params.get("registered") === "1" ? (
        <Alert role="status">
          <AlertDescription>{t("registered")}</AlertDescription>
        </Alert>
      ) : null}

      <LoginForm next={sanitizeNextPath(params.get("next"))} />
    </section>
  );
};
