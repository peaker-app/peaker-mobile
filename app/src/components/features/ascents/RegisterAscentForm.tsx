"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { hasCode } from "@/lib/api/problem";
import {
  submitAscent,
  type SubmitProgressState,
} from "@/lib/ascents/submitAscent";
import { useEmailConfirmation } from "@/stores/emailConfirmation";
import {
  AscentForm,
  emptyAscentForm,
  type AscentFormProps,
  type AscentFormValues,
} from "./AscentForm";
import type { SelectedPeak } from "./PeakSearchCombobox";

type FieldErrors = NonNullable<AscentFormProps["fieldErrors"]>;

const fieldOf: [string, keyof FieldErrors][] = [
  ["Ascent.DateInFuture", "ascentDate"],
  ["Ascent.DateTooOld", "ascentDate"],
  ["Ascent.CompanionsTooLong", "companions"],
  ["Ascent.RouteNotesTooLong", "routeNotes"],
  ["Ascent.PeakNotFound", "peak"],
];

export const RegisterAscentForm = ({
  preselectedPeak,
}: {
  preselectedPeak?: SelectedPeak;
}) => {
  const t = useTranslations("ascentForm");
  const errors = useTranslations("errors");
  const router = useRouter();
  const markUnconfirmed = useEmailConfirmation((state) => state.markUnconfirmed);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] =
    useState<AscentFormProps["formError"]>(undefined);
  const [progress, setProgress] = useState<SubmitProgressState | undefined>(
    undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  const initial: AscentFormValues = {
    ...emptyAscentForm(),
    peak: preselectedPeak,
  };

  const applyProblem = (error: unknown, retry: () => void) => {
    if (!(error instanceof ApiError)) {
      setFormError({ title: errors("unknown"), body: "", retry });
      return;
    }

    const { problem } = error;

    if (hasCode(problem, "Ascent.EmailNotConfirmed")) {
      markUnconfirmed();
      setFormError({
        title: t("emailNotConfirmed.title"),
        body: t("emailNotConfirmed.body"),
        retry,
        resendHref: "/confirm-email/pending",
      });
      return;
    }

    if (hasCode(problem, "Ascent.PeakCatalogUnavailable")) {
      setFormError({ title: t("catalogueUnavailable.title"), body: "", retry });
      return;
    }

    const match = fieldOf.find(([code]) => hasCode(problem, code));

    if (match) {
      setFieldErrors({ [match[1]]: errors(match[0]) });
      return;
    }

    setFormError({
      title: errors(`status.${problem.status}`),
      body: "",
      retry,
    });
  };

  const save = async (values: AscentFormValues) => {
    if (!values.peak) {
      setFieldErrors({ peak: errors("Ascent.PeakNotFound") });
      return;
    }

    setSubmitting(true);
    setFieldErrors({});
    setFormError(undefined);

    try {
      const { ascentId, failedPhotos } = await submitAscent({
        request: {
          peakId: values.peak.id,
          ascentDate: values.ascentDate,
          companions: values.companions.trim() || null,
          routeNotes: values.routeNotes.trim() || null,
          snow: values.conditions.snow,
          wind: values.conditions.wind,
          trail: values.conditions.trail,
          visibility: values.visibility,
        },
        photos: values.photos,
        onProgress: setProgress,
      });

      router.replace(
        failedPhotos > 0
          ? `/dashboard/ascents/${ascentId}?photosFailed=${failedPhotos}`
          : `/dashboard/ascents/${ascentId}`,
      );
    } catch (error) {
      setProgress(undefined);
      applyProblem(error, () => void save(values));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AscentForm
      mode="create"
      initial={initial}
      fieldErrors={fieldErrors}
      formError={formError}
      progress={progress}
      submitting={submitting}
      onSubmit={(values) => void save(values)}
      cancelHref="/dashboard/ascents"
    />
  );
};
