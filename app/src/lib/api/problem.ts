export interface ProblemDetails {
  status: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const validationTitle = "One or more validation errors occurred.";

const retryableStatuses = new Set([500, 502, 503, 504]);

export const problemCodes = (problem: ProblemDetails): string[] => {
  if (problem.errors) {
    return Object.keys(problem.errors);
  }

  return problem.title && problem.title !== validationTitle
    ? [problem.title]
    : [];
};

export const isRetryable = (problem: ProblemDetails): boolean =>
  retryableStatuses.has(problem.status);

export const hasCode = (problem: ProblemDetails, code: string): boolean =>
  problemCodes(problem).includes(code);

export type MessageResolver = {
  (key: string): string;
  has: (key: string) => boolean;
};

export const translateProblem = (
  problem: ProblemDetails,
  t: MessageResolver,
): string => {
  const [code] = problemCodes(problem);
  const statusKey = `status.${problem.status}`;

  if (code && t.has(code)) {
    return t(code);
  }

  return t.has(statusKey) ? t(statusKey) : t("unknown");
};
