"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CameraIcon, ImagePlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { apiFetch, apiUpload } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { maxPhotos } from "@/lib/ascents/photos";
import { picker, remainingSlots } from "@/lib/native/camera";
import type { AscentPhotoResponse } from "@/types/api";

const thumbnailWidth = 320;
const thumbnailHeight = 240;

export interface PhotoManagerProps {
  ascentId: string;
  photos: readonly AscentPhotoResponse[];
  peakName: string;
}

export const PhotoManager = ({
  ascentId,
  photos,
  peakName,
}: PhotoManagerProps) => {
  const t = useTranslations("ascents.photos");
  const gallery = useTranslations("ascents.gallery");
  const toMessage = useProblemMessage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<string | undefined>();

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["ascent", ascentId] });
    router.refresh();
  };

  const upload = useMutation({
    mutationFn: async (files: readonly File[]) => {
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        await apiUpload(endpoints.ascents.photos(ascentId), body);
      }
    },
    onSuccess: refresh,
    onError: (error) => toast.error(toMessage(error)),
  });

  const pick = async (source: "takePhoto" | "chooseFromGallery") => {
    const outcome =
      source === "takePhoto"
        ? await picker.takePhoto()
        : await picker.chooseFromGallery(remainingSlots(photos.length));

    if (outcome.status === "denied") {
      toast.error(t("pickerDenied"));
      return;
    }

    if (outcome.status === "picked") {
      upload.mutate(outcome.files);
    }
  };

  const remove = useMutation({
    mutationFn: (photoId: string) =>
      apiFetch(endpoints.ascents.photo(ascentId, photoId), {
        method: "DELETE",
      }),
    onSuccess: async () => {
      toast.success(t("deleted"));
      await refresh();
    },
    onError: (error) => toast.error(toMessage(error)),
  });

  const full = photos.length >= maxPhotos;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>

      {photos.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground text-start">
          {t("empty")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="flex flex-col gap-2 rounded-md border border-border p-2"
            >
              <Image
                src={photo.secureUrl}
                alt={gallery("photoAlt", { index: index + 1, peak: peakName })}
                width={thumbnailWidth}
                height={thumbnailHeight}
                className="h-32 w-full rounded-md object-cover"
              />
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 self-end"
                aria-label={t("delete", {
                  index: index + 1,
                  total: photos.length,
                })}
                onClick={() => setPendingDelete(photo.id)}
              >
                <Trash2Icon aria-hidden className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {full ? (
        <p className="text-sm leading-relaxed text-muted-foreground text-start">
          {t("full", { max: maxPhotos })}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={upload.isPending}
            onClick={() => void pick("takePhoto")}
          >
            <CameraIcon aria-hidden className="size-4" />
            {upload.isPending ? t("uploading") : t("takePhoto")}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={upload.isPending}
            onClick={() => void pick("chooseFromGallery")}
          >
            <ImagePlusIcon aria-hidden className="size-4" />
            {t("chooseFromGallery")}
          </Button>
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {upload.isPending ? t("uploading") : ""}
      </p>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        onOpenChange={(open) => setPendingDelete(open ? pendingDelete : undefined)}
        title={t("confirmTitle")}
        description={t("confirmBody")}
        confirmLabel={t("confirmAction")}
        onConfirm={() => {
          if (pendingDelete) {
            remove.mutate(pendingDelete);
          }

          setPendingDelete(undefined);
        }}
      />
    </section>
  );
};
