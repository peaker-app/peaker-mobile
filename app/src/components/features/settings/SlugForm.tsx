"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/forms/FormField";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import { isValidSlug, slugMaxLength } from "@/lib/profile/avatar";
import { siteUrl } from "@/lib/seo";

export const SlugForm = ({ slug: initial }: { slug: string }) => {
  const t = useTranslations("settings.profile.slug");
  const errors = useTranslations("errors");
  const toMessage = useProblemMessage();
  const router = useRouter();

  const [slug, setSlug] = useState(initial);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const publicUrl = `${siteUrl()}/climbers/${slug}`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldError(undefined);
    setFailure(undefined);

    if (!isValidSlug(slug)) {
      setFieldError(errors("Profile.SlugInvalid"));
      return;
    }

    setSaving(true);

    try {
      await apiFetch(endpoints.profiles.mySlug, {
        method: "PUT",
        body: JSON.stringify({ slug: slug.trim() }),
      });

      toast.success(t("saved"));
      router.refresh();
    } catch (error) {
      if (
        error instanceof ApiError &&
        (hasCode(error.problem, "Profile.SlugAlreadyTaken") ||
          hasCode(error.problem, "Profile.SlugInvalid"))
      ) {
        setFieldError(toMessage(error));
      } else {
        setFailure(
          error instanceof ApiError ? toMessage(error) : errors("unknown"),
        );
      }
    } finally {
      setSaving(false);
    }
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

      <Alert variant="warning">
        <TriangleAlertIcon aria-hidden />
        <AlertDescription>{t("warning")}</AlertDescription>
      </Alert>

      <FormField
        id="slug"
        label={t("label")}
        help={t("help", { max: slugMaxLength })}
        error={fieldError}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="slug"
            dir="ltr"
            maxLength={slugMaxLength}
            value={slug}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            onChange={(event) => setSlug(event.target.value)}
          />
        )}
      </FormField>

      <p dir="ltr" className="text-sm leading-relaxed text-muted-foreground text-start">
        {publicUrl}
      </p>

      <Button type="submit" disabled={saving} aria-busy={saving} className="self-start">
        {t("save")}
      </Button>
    </form>
  );
};
