"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import type { Visibility } from "@/types/api";

export type ProfileField = "displayName" | "bio" | "countryCode";

export interface ProfileDraft {
  displayName: string;
  bio: string;
  countryCode: string;
  visibility: Visibility;
}

const fieldOf: [string, ProfileField][] = [
  ["Profile.DisplayNameEmpty", "displayName"],
  ["Profile.DisplayNameTooLong", "displayName"],
  ["Profile.BioTooLong", "bio"],
  ["Profile.CountryCodeInvalid", "countryCode"],
];

export const useProfileSave = () => {
  const t = useTranslations("settings.profile.data");
  const errors = useTranslations("errors");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProfileField, string>>
  >({});
  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const report = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setFailure(errors("unknown"));
      return;
    }

    const match = fieldOf.find(([code]) => hasCode(error.problem, code));

    if (match) {
      setFieldErrors({ [match[1]]: errors(match[0]) });
    } else {
      setFailure(toMessage(error));
    }
  };

  const save = async (draft: ProfileDraft): Promise<boolean> => {
    setSaving(true);
    setFieldErrors({});
    setFailure(undefined);

    try {
      await apiFetch(endpoints.profiles.me, {
        method: "PUT",
        body: JSON.stringify({
          displayName: draft.displayName.trim(),
          bio: draft.bio.trim() || null,
          countryCode: draft.countryCode || null,
          visibility: draft.visibility,
        }),
      });

      toast.success(t("saved"));
      router.refresh();

      return true;
    } catch (error) {
      report(error);

      return false;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, failure, fieldErrors, setFieldErrors };
};
