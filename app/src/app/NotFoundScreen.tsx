import { CompassIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/Button";

export const NotFoundScreen = () => {
  const t = useTranslations("errors.notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <CompassIcon aria-hidden className="size-10 text-muted-foreground" />
      <p className="text-3xl font-semibold text-muted-foreground">{t("code")}</p>
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        {t("description")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">{t("goHome")}</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/peaks">{t("searchPeaks")}</Link>
        </Button>
      </div>
    </main>
  );
};
