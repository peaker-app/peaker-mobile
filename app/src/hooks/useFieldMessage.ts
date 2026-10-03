"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { passwordMinLength } from "@/lib/auth/validation";

type FieldResolver = {
  (key: string, values?: Record<string, number>): string;
  has: (key: string) => boolean;
};

export const useFieldMessage = () => {
  const t = useTranslations("errors") as unknown as FieldResolver;

  return useCallback(
    (message?: string): string | undefined =>
      message && t.has(message) ? t(message, { min: passwordMinLength }) : message,
    [t],
  );
};
