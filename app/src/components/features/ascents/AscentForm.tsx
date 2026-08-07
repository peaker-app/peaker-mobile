"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Link } from "@/i18n/navigation";
import { maxPhotos, type PhotoCandidate } from "@/lib/ascents/photos";
import type { SubmitProgressState } from "@/lib/ascents/submitAscent";
import { todayAsDateOnly } from "@/lib/format";
import type { Visibility } from "@/types/api";
import { ConditionsPicker, type ConditionsValue } from "./ConditionsPicker";
import { PeakSearchCombobox, type SelectedPeak } from "./PeakSearchCombobox";
import { PhotoUploader } from "./PhotoUploader";
import { SubmitProgress } from "./SubmitProgress";
import { VisibilityRadioGroup } from "./VisibilityRadioGroup";

export const maxCompanionsLength = 500;
export const maxRouteNotesLength = 2000;
export const minimumAscentDate = "1900-01-01";

const showPickerWhenBrowserAllows = (input: HTMLInputElement) => {
  try {
    input.showPicker();
  } catch {
    return;
  }
};

export interface AscentFormValues {
  peak?: SelectedPeak;
  ascentDate: string;
  companions: string;
  routeNotes: string;
  conditions: ConditionsValue;
  visibility: Visibility;
  photos: PhotoCandidate[];
}

export interface AscentFormProps {
  mode: "create" | "edit";
  initial: AscentFormValues;
  fieldErrors?: Partial<Record<"peak" | "ascentDate" | "companions" | "routeNotes", string>>;
  formError?: { title: string; body: string; retry?: () => void; resendHref?: string };
  progress?: SubmitProgressState;
  submitting: boolean;
  onSubmit: (values: AscentFormValues) => void;
  cancelHref: string;
}

export const emptyAscentForm = (): AscentFormValues => ({
  ascentDate: todayAsDateOnly(),
  companions: "",
  routeNotes: "",
  conditions: { snow: null, wind: null, trail: null },
  visibility: "Public",
  photos: [],
});

export const AscentForm = ({
  mode,
  initial,
  fieldErrors = {},
  formError,
  progress,
  submitting,
  onSubmit,
  cancelHref,
}: AscentFormProps) => {
  const t = useTranslations("ascentForm");
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState(false);

  const update = <K extends keyof AscentFormValues>(
    key: K,
    value: AscentFormValues[K],
  ) => {
    setTouched(true);
    setValues((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (!touched || submitting) {
      return;
    }

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [touched, submitting]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6 pb-24 md:pb-0">
      {formError ? (
        <Alert variant="warning" role="alert">
          <div className="flex flex-col gap-3">
            <AlertTitle>{formError.title}</AlertTitle>
            <AlertDescription>{formError.body}</AlertDescription>
            <div className="flex flex-wrap gap-3">
              {formError.resendHref ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={formError.resendHref}>
                    {t("emailNotConfirmed.resend")}
                  </Link>
                </Button>
              ) : null}
              {formError.retry ? (
                <Button variant="outline" size="sm" onClick={formError.retry}>
                  {t("emailNotConfirmed.retry")}
                </Button>
              ) : null}
            </div>
          </div>
        </Alert>
      ) : null}

      <FormField
        id="peak"
        label={mode === "edit" ? t("peak.locked") : t("peak.label")}
        help={mode === "edit" ? t("peak.lockedHelp") : undefined}
        error={fieldErrors.peak}
      >
        {({ describedBy, invalid }) =>
          mode === "edit" ? (
            <output className="block font-medium text-start" dir="auto">
              {values.peak?.name}
            </output>
          ) : (
            <PeakSearchCombobox
              selected={values.peak}
              onSelect={(peak) => update("peak", peak)}
              onClear={() => update("peak", undefined)}
              invalid={invalid}
              describedBy={describedBy}
            />
          )
        }
      </FormField>

      <FormField
        id="ascentDate"
        label={t("date.label")}
        help={t("date.help")}
        error={fieldErrors.ascentDate}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="ascentDate"
            type="date"
            dir="ltr"
            min={minimumAscentDate}
            max={todayAsDateOnly()}
            value={values.ascentDate}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onFocus={(event) => showPickerWhenBrowserAllows(event.currentTarget)}
            onChange={(event) => update("ascentDate", event.target.value)}
          />
        )}
      </FormField>

      {mode === "create" ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm leading-relaxed font-medium text-start">
            {t("photos.label")}
          </legend>
          <PhotoUploader
            photos={values.photos}
            onChange={(photos) => update("photos", photos)}
          />
        </fieldset>
      ) : null}

      <FormField
        id="companions"
        label={t("companions.label")}
        help={t("companions.counter", {
          count: values.companions.length,
          max: maxCompanionsLength,
        })}
        error={fieldErrors.companions}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="companions"
            dir="auto"
            maxLength={maxCompanionsLength}
            placeholder={t("companions.placeholder")}
            value={values.companions}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update("companions", event.target.value)}
          />
        )}
      </FormField>

      <FormField
        id="routeNotes"
        label={t("notes.label")}
        help={t("notes.counter", {
          count: values.routeNotes.length,
          max: maxRouteNotesLength,
        })}
        error={fieldErrors.routeNotes}
      >
        {({ describedBy, invalid }) => (
          <Textarea
            id="routeNotes"
            dir="auto"
            rows={6}
            maxLength={maxRouteNotesLength}
            placeholder={t("notes.placeholder")}
            value={values.routeNotes}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => update("routeNotes", event.target.value)}
          />
        )}
      </FormField>

      <ConditionsPicker
        value={values.conditions}
        onChange={(conditions) => update("conditions", conditions)}
      />

      <VisibilityRadioGroup
        value={values.visibility}
        onChange={(visibility) => update("visibility", visibility)}
      />

      {progress ? (
        <SubmitProgress state={progress} maxPhotos={maxPhotos} />
      ) : null}

      <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-border bg-background py-4 md:static md:border-0 md:py-0">
        <Button type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? t("submitting") : t("submit")}
        </Button>
        <Button asChild variant="outline" disabled={submitting}>
          <Link href={cancelHref}>{t("cancel")}</Link>
        </Button>
      </div>
    </form>
  );
};
