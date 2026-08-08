"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { apiFetch, apiUpload } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { maxAvatarMegabytes, rejectAvatar } from "@/lib/profile/avatar";
import type { AvatarResponse } from "@/types/api";

export const useAvatarActions = () => {
  const t = useTranslations("settings.profile.avatar");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    setFailure(undefined);

    try {
      await action();
      toast.success(t(done));
      router.refresh();
    } catch (error) {
      setFailure(toMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File) => {
    const rejection = rejectAvatar(file);

    if (rejection) {
      setFailure(t(rejection, { size: maxAvatarMegabytes }));
      return;
    }

    await run(async () => {
      const body = new FormData();
      body.append("file", file);
      await apiUpload<AvatarResponse>(endpoints.profiles.myAvatar, body);
    }, "uploaded");
  };

  const remove = () =>
    run(
      () => apiFetch(endpoints.profiles.myAvatar, { method: "DELETE" }),
      "removed",
    );

  return { upload, remove, busy, failure };
};
