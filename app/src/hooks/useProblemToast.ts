"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  translateProblem,
  type MessageResolver,
  type ProblemDetails,
} from "@/lib/api/problem";

export const useProblemMessage = () => {
  const t = useTranslations("errors") as unknown as MessageResolver;

  return useCallback(
    (error: unknown): string =>
      error instanceof ApiError
        ? translateProblem(error.problem, t)
        : t("unknown"),
    [t],
  );
};

export const useProblemToast = () => {
  const toMessage = useProblemMessage();

  return useCallback(
    (error: unknown) => {
      toast.error(toMessage(error));
    },
    [toMessage],
  );
};

export const useTranslateProblem = () => {
  const t = useTranslations("errors") as unknown as MessageResolver;

  return useCallback(
    (problem: ProblemDetails): string => translateProblem(problem, t),
    [t],
  );
};
