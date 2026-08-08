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

export interface AddPeakDialogProps {
  presentPeakIds: readonly string[];
  onAdd: (peakId: string) => Promise<string | undefined>;
}

export const AddPeakDialog = ({ presentPeakIds, onAdd }: AddPeakDialogProps) => {
  const t = useTranslations("collections.addPeak");
  const detail = useTranslations("collections.detail");

  const [open, setOpen] = useState(false);
  const [failure, setFailure] = useState<string | undefined>(undefined);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setFailure(undefined);
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

        {failure ? (
          <Alert variant="destructive" role="alert" className="mt-4">
            <AlertDescription>{failure}</AlertDescription>
          </Alert>
        ) : null}

        <div className="mt-4 flex flex-col gap-2">
          <Label htmlFor="addPeakSearch">{t("label")}</Label>
          <PeakSearchCombobox
            inputId="addPeakSearch"
            disabledIds={presentPeakIds}
            disabledHint={t("alreadyInCollection")}
            onSelect={(peak) => {
              setFailure(undefined);

              void onAdd(peak.id).then((message) => {
                setFailure(message);

                if (!message) {
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
