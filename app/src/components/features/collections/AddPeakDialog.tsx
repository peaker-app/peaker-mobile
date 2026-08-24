"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { PeakSearchCombobox } from "@/components/features/ascents/PeakSearchCombobox";
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
import { Label } from "@/components/ui/Label";
import type { AddPeakOutcome } from "./useCollectionPeaks";

export interface AddPeakDialogProps {
  presentPeakIds: readonly string[];
  onAdd: (peakId: string) => Promise<AddPeakOutcome | undefined>;
}

export const AddPeakDialog = ({ presentPeakIds, onAdd }: AddPeakDialogProps) => {
  const t = useTranslations("collections.addPeak");
  const detail = useTranslations("collections.detail");

  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<AddPeakOutcome | undefined>(undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setOutcome(undefined);
      }}
    >
      <DialogTrigger asChild>
        <Button>{detail("addPeak")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
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
          <Label htmlFor="addPeakSearch">{t("label")}</Label>
          <PeakSearchCombobox
            inputId="addPeakSearch"
            disabledIds={presentPeakIds}
            disabledHint={t("alreadyInCollection")}
            onSelect={(peak) => {
              setOutcome(undefined);

              void onAdd(peak.id).then((result) => {
                setOutcome(result);

                if (!result) {
                  setOpen(false);
                }
              });
            }}
          />
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
