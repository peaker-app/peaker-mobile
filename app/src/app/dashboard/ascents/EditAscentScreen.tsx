import { useParams } from "react-router";
import { useTranslations } from "use-intl";
import { NotFoundScreen } from "@/app/NotFoundScreen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EditAscentForm } from "@/components/features/ascents/EditAscentForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { ApiError } from "@/lib/api/client";
import { isRetryable } from "@/lib/api/problem";
import { useOwnAscent } from "./useOwnAscent";

export const EditAscentScreen = () => {
  const { id = "" } = useParams();
  const t = useTranslations("ascentForm");
  const nav = useTranslations("nav");
  const toMessage = useProblemMessage();
  const ascent = useOwnAscent(id);

  if (ascent.isError) {
    const problem =
      ascent.error instanceof ApiError ? ascent.error.problem : undefined;

    if (problem?.status === 404) {
      return <NotFoundScreen />;
    }

    return (
      <main className="flex-1 p-6">
        <ErrorState
          message={toMessage(ascent.error)}
          onRetry={
            !problem || isRetryable(problem)
              ? () => void ascent.refetch()
              : undefined
          }
        />
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      {ascent.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <Breadcrumb
            steps={[
              { label: nav("myAscents"), href: "/dashboard/ascents" },
              {
                label: ascent.data.peakName,
                href: `/dashboard/ascents/${ascent.data.id}`,
              },
              { label: t("editTitle") },
            ]}
          />
          <h1 className="text-xl leading-relaxed font-semibold text-start">
            {t("editTitle")}
          </h1>
          <EditAscentForm ascent={ascent.data} />
        </>
      )}
    </main>
  );
};
