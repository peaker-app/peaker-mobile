"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { collectionLabel, isDefaultCollection } from "@/lib/collections/label";
import type { CollectionSummaryResponse } from "@/types/api";
import { CollectionDialog } from "./CollectionDialog";

export const CollectionHeader = ({
  collection,
}: {
  collection: CollectionSummaryResponse;
}) => {
  const t = useTranslations("collections");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDefault = isDefaultCollection(collection.kind);

  const remove = async () => {
    setDeleting(true);

    try {
      await apiFetch(endpoints.collections.byId(collection.id), { method: "DELETE" });
      toast.success(t("remove.deleted"));
      router.replace("/dashboard/collections");
      router.refresh();
    } catch (error) {
      toast.error(toMessage(error));
      setDeleting(false);
    }
  };

  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 dir="auto" className="text-3xl leading-relaxed font-semibold text-start">
          {collectionLabel(collection, t("defaultName"))}
          {isDefault ? (
            <Badge className="ms-2 align-middle">{t("defaultBadge")}</Badge>
          ) : null}
        </h1>

        {isDefault ? null : (
          <div className="flex flex-wrap gap-2">
            <CollectionDialog
              idPrefix="editCollection"
              collectionId={collection.id}
              title={t("edit.title")}
              submitLabel={t("edit.submit")}
              initial={{
                name: collection.name,
                description: collection.description ?? "",
              }}
              trigger={
                <DialogTrigger asChild>
                  <Button variant="outline">{t("edit.action")}</Button>
                </DialogTrigger>
              }
            />
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirming(true)}
            >
              {t("remove.action")}
            </Button>
          </div>
        )}
      </div>

      {collection.description ? (
        <p dir="auto" className="max-w-prose leading-relaxed text-start">
          {collection.description}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("remove.title")}
        description={t("remove.body")}
        confirmLabel={t("remove.confirm")}
        onConfirm={() => {
          setConfirming(false);
          void remove();
        }}
      />
    </header>
  );
};
