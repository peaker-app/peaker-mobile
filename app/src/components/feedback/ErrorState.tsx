"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ message, onRetry, className }: ErrorStateProps) => {
  const t = useTranslations("common.states");

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-10 text-center",
        className,
      )}
    >
      <TriangleAlertIcon aria-hidden className="size-6 text-destructive" />
      <p className="text-base leading-relaxed font-medium">
        {t("errorTitle")}
      </p>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </div>
  );
};
