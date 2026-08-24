"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import {
  isValidCollectionDescription,
  isValidCollectionName,
} from "@/lib/collections/label";
import type { CollectionDraft } from "./CollectionFormFields";

type FieldKey = "name" | "description";

const fieldOf: [string, FieldKey][] = [
  ["Collection.NameRequired", "name"],
  ["Collection.NameTooLong", "name"],
  ["Collection.NameAlreadyUsed", "name"],
  ["Collection.DescriptionTooLong", "description"],
];

export const useCollectionSave = (collectionId?: string) => {
  const t = useTranslations("collections");
  const errors = useTranslations("errors");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
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

  const validate = (draft: CollectionDraft): boolean => {
    if (!isValidCollectionName(draft.name)) {
      setFieldErrors({ name: t("form.nameRequired") });
      return false;
    }

    if (!isValidCollectionDescription(draft.description)) {
      setFieldErrors({ description: errors("Collection.DescriptionTooLong") });
      return false;
    }

    return true;
  };

  const save = async (draft: CollectionDraft): Promise<boolean> => {
    setFieldErrors({});
    setFailure(undefined);

    if (!validate(draft)) {
      return false;
    }

    setSaving(true);

    try {
      await apiFetch(
        collectionId ? endpoints.collections.byId(collectionId) : endpoints.collections.root,
        {
          method: collectionId ? "PUT" : "POST",
          body: JSON.stringify({
            name: draft.name.trim(),
            description: draft.description.trim() || null,
          }),
        },
      );

      toast.success(collectionId ? t("edit.saved") : t("create.created"));
      router.refresh();

      return true;
    } catch (error) {
      report(error);

      return false;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, failure, fieldErrors };
};
