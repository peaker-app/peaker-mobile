"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { ApiError, apiFetch, buildQuery } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import { collectionLabel } from "@/lib/collections/label";
import type { CollectionSummaryResponse, PagedResponse } from "@/types/api";

type Outcome = { tone: "success" | "neutral" | "error"; message: string };

export const AddToCollectionDialog = ({ peakId }: { peakId: string }) => {
  const t = useTranslations("collections.picker");
  const collections = useTranslations("collections");
  const common = useTranslations("common.states");
  const toMessage = useProblemMessage();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | undefined>(undefined);

  const mine = useQuery({
    queryKey: ["collections", "picker"],
    queryFn: () =>
      apiFetch<PagedResponse<CollectionSummaryResponse>>(
        `${endpoints.collections.root}${buildQuery({ size: 100 })}`,
      ),
    enabled: open,
    retry: false,
  });

  const add = async (collection: CollectionSummaryResponse) => {
    const name = collectionLabel(collection, collections("defaultName"));
    setBusy(true);
    setOutcome(undefined);

    try {
      await apiFetch(endpoints.collections.peaks(collection.id), {
        method: "POST",
        body: JSON.stringify({ peakId }),
      });

      setOutcome({ tone: "success", message: t("added", { collection: name }) });
    } catch (error) {
      const alreadyThere =
        error instanceof ApiError && hasCode(error.problem, "Collection.PeakAlreadyAdded");

      setOutcome(
        alreadyThere
          ? { tone: "neutral", message: t("alreadyThere", { collection: name }) }
          : { tone: "error", message: toMessage(error) },
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setOutcome(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">{t("title")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg leading-relaxed font-semibold">
            {t("title")}
          </DialogTitle>
        </DialogHeader>

        {outcome ? (
          <Alert
            variant={outcome.tone === "error" ? "destructive" : "info"}
            role={outcome.tone === "error" ? "alert" : "status"}
            className="mt-4"
          >
            <AlertDescription>{outcome.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          {mine.isPending ? <Skeleton className="h-24 w-full" /> : null}

          {mine.isError ? (
            <p role="alert" className="text-sm leading-relaxed text-destructive text-start">
              {common("errorTitle")}
            </p>
          ) : null}

          {mine.data?.items.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground text-start">
              {t("empty")}
            </p>
          ) : null}

          {mine.data?.items.map((collection) => (
            <Button
              key={collection.id}
              variant="outline"
              disabled={busy}
              className="justify-start"
              onClick={() => void add(collection)}
            >
              <span dir="auto">
                {collectionLabel(collection, collections("defaultName"))}
              </span>
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
