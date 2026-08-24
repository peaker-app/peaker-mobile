"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  CollectionFormFields,
  type CollectionDraft,
} from "./CollectionFormFields";
import { useCollectionSave } from "./useCollectionSave";

export interface CollectionDialogProps {
  trigger: ReactNode;
  title: string;
  submitLabel: string;
  idPrefix: string;
  collectionId?: string;
  initial?: CollectionDraft;
}

const emptyDraft: CollectionDraft = { name: "", description: "" };

export const CollectionDialog = ({
  trigger,
  title,
  submitLabel,
  idPrefix,
  collectionId,
  initial,
}: CollectionDialogProps) => {
  const common = useTranslations("common.confirm");
  const { save, saving, failure, fieldErrors } = useCollectionSave(collectionId);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CollectionDraft>(initial ?? emptyDraft);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (await save(draft)) {
      setOpen(false);
      setDraft(initial ?? emptyDraft);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setDraft(initial ?? emptyDraft);
        }
      }}
    >
      {trigger}
      <DialogContent aria-label={title}>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg leading-relaxed font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>

          {failure ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{failure}</AlertDescription>
            </Alert>
          ) : null}

          <CollectionFormFields
            idPrefix={idPrefix}
            draft={draft}
            nameError={fieldErrors.name}
            descriptionError={fieldErrors.description}
            onChange={setDraft}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving} aria-busy={saving}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
