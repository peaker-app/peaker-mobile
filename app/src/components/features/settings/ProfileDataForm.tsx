"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { CountrySelect } from "@/components/forms/CountrySelect";
import { FormField } from "@/components/forms/FormField";
import { VisibilitySelect } from "@/components/forms/VisibilitySelect";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  bioMaxLength,
  displayNameMaxLength,
  isValidBio,
  isValidDisplayName,
} from "@/lib/profile/avatar";
import type { ProfileResponse, Visibility } from "@/types/api";
import { useProfileSave } from "./useProfileSave";

export const ProfileDataForm = ({ profile }: { profile: ProfileResponse }) => {
  const t = useTranslations("settings.profile.data");
  const errors = useTranslations("errors");
  const { save, saving, failure, fieldErrors, setFieldErrors } = useProfileSave();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [countryCode, setCountryCode] = useState(profile.countryCode ?? "");
  const [value, setValue] = useState<Visibility>(profile.visibility);
  const [confirmingPrivate, setConfirmingPrivate] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidDisplayName(displayName)) {
      setFieldErrors({ displayName: errors("Profile.DisplayNameEmpty") });
      return;
    }

    if (!isValidBio(bio)) {
      setFieldErrors({ bio: errors("Profile.BioTooLong") });
      return;
    }

    if (value === "Private" && profile.visibility === "Public") {
      setConfirmingPrivate(true);
      return;
    }

    void save({ displayName, bio, countryCode, visibility: value });
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4 rounded-md border border-border p-6"
    >
      <h2 className="text-lg leading-relaxed font-semibold text-start">
        {t("heading")}
      </h2>

      {failure ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{failure}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="displayName"
        label={t("displayName")}
        help={t("displayNameHelp")}
        error={fieldErrors.displayName}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="displayName"
            dir="auto"
            maxLength={displayNameMaxLength}
            value={displayName}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        )}
      </FormField>

      <FormField
        id="bio"
        label={t("bio")}
        help={t("bioCounter", { count: bio.length, max: bioMaxLength })}
        error={fieldErrors.bio}
      >
        {({ describedBy, invalid }) => (
          <Textarea
            id="bio"
            dir="auto"
            rows={4}
            maxLength={bioMaxLength}
            value={bio}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => setBio(event.target.value)}
          />
        )}
      </FormField>

      <FormField id="countryCode" label={t("country")} error={fieldErrors.countryCode}>
        {({ describedBy }) => (
          <CountrySelect
            id="countryCode"
            value={countryCode}
            placeholder={t("countryPlaceholder")}
            onChange={setCountryCode}
            describedBy={describedBy}
          />
        )}
      </FormField>

      <VisibilitySelect
        id="profileVisibility"
        label={t("visibility")}
        help={t("visibilityHelp")}
        value={value}
        onChange={setValue}
      />

      <Button type="submit" disabled={saving} aria-busy={saving} className="self-start">
        {t("save")}
      </Button>

      <ConfirmDialog
        open={confirmingPrivate}
        onOpenChange={setConfirmingPrivate}
        title={t("confirmPrivateTitle")}
        description={t("confirmPrivateBody")}
        confirmLabel={t("confirmPrivateAction")}
        onConfirm={() => {
          setConfirmingPrivate(false);
          void save({ displayName, bio, countryCode, visibility: "Private" });
        }}
      />
    </form>
  );
};
