import { ErrorState } from "@/components/feedback/ErrorState";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { hasCode, isRetryable } from "@/lib/api/problem";

const outOfRangeCode = "Pagination.PageOutOfRange";

export interface PagedErrorStateProps {
  error: unknown;
  firstPagePath: string;
  onRetry: () => void;
}

export const PagedErrorState = ({
  error,
  firstPagePath,
  onRetry,
}: PagedErrorStateProps) => {
  const toMessage = useProblemMessage();
  const router = useRouter();

  const problem = error instanceof ApiError ? error.problem : undefined;

  if (problem && hasCode(problem, outOfRangeCode)) {
    return (
      <ErrorState
        message={toMessage(error)}
        onRetry={() => router.push(firstPagePath)}
      />
    );
  }

  return (
    <ErrorState
      message={toMessage(error)}
      onRetry={!problem || isRetryable(problem) ? onRetry : undefined}
    />
  );
};
