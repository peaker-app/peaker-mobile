import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { useTranslations } from "use-intl";
import { Button } from "@/components/ui/Button";

export interface ErrorScreenProps {
  reference?: string;
  reset: () => void;
}

export const ErrorScreen = ({ reference, reset }: ErrorScreenProps) => {
  const t = useTranslations("errors.generic");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <TriangleAlertIcon aria-hidden className="size-10 text-destructive" />
      <h1 ref={heading} tabIndex={-1} className="text-xl font-semibold">
        {t("title")}
      </h1>
      <p className="max-w-prose text-sm text-muted-foreground">
        {t("description")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button variant="secondary" asChild>
          <Link to="/">{t("goHome")}</Link>
        </Button>
      </div>
      {reference ? (
        <details className="text-xs text-muted-foreground">
          <summary>{t("reference")}</summary>
          <code>{reference}</code>
        </details>
      ) : null}
    </main>
  );
};
