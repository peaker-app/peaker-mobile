"use client";

import { useTranslations } from "next-intl";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  collectionDescriptionMaxLength,
  collectionNameMaxLength,
} from "@/lib/collections/label";

export interface CollectionDraft {
  name: string;
  description: string;
}

export interface CollectionFormFieldsProps {
  idPrefix: string;
  draft: CollectionDraft;
  nameError?: string;
  descriptionError?: string;
  onChange: (draft: CollectionDraft) => void;
}

export const CollectionFormFields = ({
  idPrefix,
  draft,
  nameError,
  descriptionError,
  onChange,
}: CollectionFormFieldsProps) => {
  const t = useTranslations("collections.form");

  return (
    <>
      <FormField
        id={`${idPrefix}-name`}
        label={t("name")}
        help={t("nameHelp", { max: collectionNameMaxLength })}
        error={nameError}
      >
        {({ describedBy, invalid }) => (
          <Input
            id={`${idPrefix}-name`}
            dir="auto"
            maxLength={collectionNameMaxLength}
            value={draft.name}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
          />
        )}
      </FormField>

      <FormField
        id={`${idPrefix}-description`}
        label={t("description")}
        help={t("descriptionCounter", {
          count: draft.description.length,
          max: collectionDescriptionMaxLength,
        })}
        error={descriptionError}
      >
        {({ describedBy, invalid }) => (
          <Textarea
            id={`${idPrefix}-description`}
            dir="auto"
            rows={3}
            maxLength={collectionDescriptionMaxLength}
            value={draft.description}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) =>
              onChange({ ...draft, description: event.target.value })
            }
          />
        )}
      </FormField>
    </>
  );
};
