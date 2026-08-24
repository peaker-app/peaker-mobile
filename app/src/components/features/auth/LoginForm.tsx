"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/client";
import { resolveNextPath } from "@/lib/auth/nextPath";
import { signIn } from "@/lib/auth/session";
import { FormField } from "@/components/forms/FormField";
import { useEmailConfirmation } from "@/stores/emailConfirmation";
import { PasswordField } from "./PasswordField";

const unauthorizedStatus = 401;
const rateLimitStatus = 429;
const rateLimitCooldownMs = 60_000;

const schema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof schema>;

export interface LoginFormProps {
  next?: string;
}

export const LoginForm = ({ next }: LoginFormProps) => {
  const t = useTranslations("auth.login");
  const fields = useTranslations("auth.fields");
  const errors = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [throttled, setThrottled] = useState(false);
  const clearUnconfirmed = useEmailConfirmation((state) => state.clear);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const rejectGenerically = () => {
    setFormError(t("failed"));
    form.setValue("password", "");
    form.setFocus("identifier");
  };

  const applyFailure = (error: unknown) => {
    const status = error instanceof ApiError ? error.problem.status : undefined;

    if (status === unauthorizedStatus) {
      rejectGenerically();
      return;
    }

    if (status === rateLimitStatus) {
      setFormError(t("rateLimited"));
      setThrottled(true);
      setTimeout(() => setThrottled(false), rateLimitCooldownMs);
      return;
    }

    setFormError(status ? errors(`status.${status}`) : errors("unknown"));
  };

  const submit = form.handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await signIn(values);
      clearUnconfirmed();
      router.replace(resolveNextPath(next, locale));
      router.refresh();
    } catch (error) {
      applyFailure(error);
    }
  });

  const busy = form.formState.isSubmitting || throttled;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField id="identifier" label={fields("identifier")}>
        {({ describedBy }) => (
          <Input
            id="identifier"
            autoComplete="username"
            dir="ltr"
            aria-describedby={describedBy}
            {...form.register("identifier")}
          />
        )}
      </FormField>

      <FormField id="password" label={fields("password")}>
        {({ describedBy }) => (
          <PasswordField
            id="password"
            autoComplete="current-password"
            aria-describedby={describedBy}
            {...form.register("password")}
          />
        )}
      </FormField>

      <Button type="submit" disabled={busy} aria-busy={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-sm leading-relaxed text-muted-foreground text-start">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          {t("signUp")}
        </Link>
      </p>
    </form>
  );
};
