"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import type { AscentResponse } from "@/types/api";
import {
  AscentForm,
  type AscentFormProps,
  type AscentFormValues,
} from "./AscentForm";

type FieldErrors = NonNullable<AscentFormProps["fieldErrors"]>;

const fieldOf: [string, keyof FieldErrors][] = [
  ["Ascent.DateInFuture", "ascentDate"],
  ["Ascent.DateTooOld", "ascentDate"],
  ["Ascent.CompanionsTooLong", "companions"],
  ["Ascent.RouteNotesTooLong", "routeNotes"],
];

export const EditAscentForm = ({ ascent }: { ascent: AscentResponse }) => {
  const t = useTranslations("ascents.danger");
  const errors = useTranslations("errors");
  const router = useRouter();

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] =
    useState<AscentFormProps["formError"]>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const initial: AscentFormValues = {
    peak: {
      id: ascent.peakId,
      name: ascent.peakName,
      altitudeMeters: ascent.peakAltitudeMeters,
    },
    ascentDate: ascent.ascentDate,
    companions: ascent.companions ?? "",
    routeNotes: ascent.routeNotes ?? "",
    conditions: ascent.conditions,
    visibility: ascent.visibility,
    photos: [],
  };

  const applyProblem = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setFormError({ title: errors("unknown"), body: "" });
      return;
    }

    const match = fieldOf.find(([code]) => hasCode(error.problem, code));

    if (match) {
      setFieldErrors({ [match[1]]: errors(match[0]) });
      return;
    }

    setFormError({ title: errors(`status.${error.problem.status}`), body: "" });
  };

  const save = async (values: AscentFormValues) => {
    setSubmitting(true);
    setFieldErrors({});
    setFormError(undefined);

    try {
      await apiFetch(endpoints.ascents.byId(ascent.id), {
        method: "PUT",
        body: JSON.stringify({
          ascentDate: values.ascentDate,
          companions: values.companions.trim() || null,
          routeNotes: values.routeNotes.trim() || null,
          snow: values.conditions.snow,
          wind: values.conditions.wind,
          trail: values.conditions.trail,
          visibility: values.visibility,
        }),
      });

      toast.success(t("saved"));
      router.replace(`/dashboard/ascents/${ascent.id}`);
    } catch (error) {
      applyProblem(error);
    } finally {
      setSubmitting(false);
    }
  };

  const destroy = async () => {
    try {
      await apiFetch(endpoints.ascents.byId(ascent.id), { method: "DELETE" });
      toast.success(t("deleted"));
      router.replace("/dashboard/ascents");
    } catch (error) {
      applyProblem(error);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <AscentForm
        mode="edit"
        initial={initial}
        fieldErrors={fieldErrors}
        formError={formError}
        submitting={submitting}
        onSubmit={(values) => void save(values)}
        cancelHref={`/dashboard/ascents/${ascent.id}`}
      />

      <section className="flex flex-col gap-3 border-t border-destructive/40 pt-6">
        <h2 className="flex items-center gap-2 text-lg leading-relaxed font-semibold text-start">
          <TriangleAlertIcon aria-hidden className="size-5 text-destructive" />
          {t("heading")}
        </h2>
        <p className="max-w-prose leading-relaxed text-muted-foreground text-start">
          {t("body")}
        </p>
        <Button
          variant="destructive"
          className="self-start"
          onClick={() => setConfirming(true)}
        >
          {t("delete")}
        </Button>
      </section>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("confirmTitle")}
        description={t("confirmBody", { count: ascent.photos.length })}
        confirmLabel={t("delete")}
        onConfirm={() => {
          setConfirming(false);
          void destroy();
        }}
      />
    </div>
  );
};
