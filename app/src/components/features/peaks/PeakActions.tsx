"use client";

import { useTranslations } from "next-intl";
import { AddToCollectionDialog } from "@/components/features/peaks/AddToCollectionDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";
import { useSessionState } from "@/lib/auth/session";

export const PeakActions = ({
  peakId,
  locale,
}: {
  peakId: string;
  locale: string;
}) => {
  const t = useTranslations("peakDetail.actions");
  const { status } = useSessionState();
  const authenticated = status === "authenticated";

  const registerPath = `/dashboard/ascents/new?peakId=${peakId}`;
  const loginPath = `/login?next=${encodeURIComponent(`/${locale}${registerPath}`)}`;
  const collectionsLoginPath = `/login?next=${encodeURIComponent(
    `/${locale}/peaks/${peakId}`,
  )}`;

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-6">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>
      {status === "unknown" ? (
        <Skeleton className="h-11 w-48" />
      ) : (
        <>
          <Button asChild>
            <Link href={authenticated ? registerPath : loginPath}>
              {t("logAscent")}
            </Link>
          </Button>

          {authenticated ? (
            <AddToCollectionDialog peakId={peakId} />
          ) : (
            <Button asChild variant="outline">
              <Link href={collectionsLoginPath}>{t("addToCollection")}</Link>
            </Button>
          )}

          {authenticated ? null : (
            <>
              <p className="text-sm leading-relaxed text-muted-foreground text-start">
                {t("logAscentHint")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground text-start">
                {t("addToCollectionHint")}
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
};
