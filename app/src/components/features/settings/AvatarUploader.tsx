"use client";

import { CameraIcon, ImagePlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { picker } from "@/lib/native/camera";
import { maxAvatarMegabytes } from "@/lib/profile/avatar";
import { AvatarPreview } from "./AvatarPreview";
import { useAvatarActions } from "./useAvatarActions";

export interface AvatarUploaderProps {
  avatarUrl: string | null;
  displayName: string;
}

export const AvatarUploader = ({
  avatarUrl,
  displayName,
}: AvatarUploaderProps) => {
  const t = useTranslations("settings.profile.avatar");
  const { upload, remove, busy, failure } = useAvatarActions();
  const [confirming, setConfirming] = useState(false);
  const [pickerFailure, setPickerFailure] = useState<string | undefined>(
    undefined,
  );

  const pick = async (source: "takePhoto" | "chooseFromGallery") => {
    setPickerFailure(undefined);

    const outcome =
      source === "takePhoto"
        ? await picker.takePhoto()
        : await picker.chooseFromGallery(1);

    if (outcome.status === "denied") {
      setPickerFailure(t("pickerDenied"));
      return;
    }

    if (outcome.status === "picked" && outcome.files[0]) {
      await upload(outcome.files[0]);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>

      <div className="flex flex-wrap items-center gap-4">
        <AvatarPreview
          avatarUrl={avatarUrl}
          displayName={displayName}
          alt={t("alt", { name: displayName })}
        />

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={busy}
              onClick={() => void pick("takePhoto")}
            >
              <CameraIcon aria-hidden className="size-4" />
              {t("takePhoto")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={busy}
              onClick={() => void pick("chooseFromGallery")}
            >
              <ImagePlusIcon aria-hidden className="size-4" />
              {t("chooseFromGallery")}
            </Button>
            {avatarUrl ? (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                disabled={busy}
                onClick={() => setConfirming(true)}
              >
                <Trash2Icon aria-hidden className="size-4" />
                {t("remove")}
              </Button>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground text-start">
            {avatarUrl ? t("help", { size: maxAvatarMegabytes }) : t("empty")}
          </p>
        </div>
      </div>

      {pickerFailure ?? failure ? (
        <p role="alert" className="text-sm leading-relaxed text-destructive text-start">
          {pickerFailure ?? failure}
        </p>
      ) : null}

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("confirmRemoveTitle")}
        description={t("confirmRemoveBody")}
        confirmLabel={t("confirmRemoveAction")}
        onConfirm={() => {
          setConfirming(false);
          void remove();
        }}
      />
    </section>
  );
};
