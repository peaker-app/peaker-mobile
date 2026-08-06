"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useProblemMessage } from "@/hooks/useProblemToast";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { hasCode } from "@/lib/api/problem";
import {
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  passwordMinLength,
} from "@/lib/auth/validation";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "./PasswordField";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

const rateLimitStatus = 429;

const schema = z.object({
  email: z.string().refine(isValidEmail),
  username: z.string().refine(isValidUsername),
  password: z.string().min(passwordMinLength),
});

type RegisterValues = z.infer<typeof schema>;

export const RegisterForm = () => {
  const t = useTranslations("auth.register");
  const fields = useTranslations("auth.fields");
  const errors = useTranslations("errors");
  const toMessage = useProblemMessage();
  const router = useRouter();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [emailTaken, setEmailTaken] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "", username: "", password: "" },
  });

  const applyProblem = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setFormError(errors("unknown"));
      return;
    }

    const { problem } = error;

    if (problem.status === rateLimitStatus) {
      setFormError(t("rateLimited"));
      return;
    }

    const fieldOf: [string, keyof RegisterValues][] = [
      ["User.EmailAlreadyRegistered", "email"],
      ["User.EmailEmpty", "email"],
      ["User.EmailInvalid", "email"],
      ["User.EmailTooLong", "email"],
      ["User.UsernameAlreadyRegistered", "username"],
      ["User.UsernameEmpty", "username"],
      ["User.UsernameInvalid", "username"],
      ["User.PasswordBreached", "password"],
    ];
    const match = fieldOf.find(([code]) => hasCode(problem, code));

    setEmailTaken(hasCode(problem, "User.EmailAlreadyRegistered"));

    if (match) {
      form.setError(match[1], { message: toMessage(error) });
      form.setFocus(match[1]);
      return;
    }

    setFormError(toMessage(error));
  };

  const submit = form.handleSubmit(async (values) => {
    setFormError(undefined);
    setEmailTaken(false);

    try {
      await apiFetch(endpoints.auth.register, {
        method: "POST",
        body: JSON.stringify({
          email: normalizeEmail(values.email),
          username: values.username.trim(),
          password: values.password,
        }),
      });

      router.replace("/login?registered=1");
    } catch (error) {
      applyProblem(error);
    }
  });

  const password = useWatch({ control: form.control, name: "password" });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="email"
        label={fields("email")}
        help={fields("emailHelp")}
        error={form.formState.errors.email?.message}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            dir="ltr"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("email")}
          />
        )}
      </FormField>

      {emailTaken ? (
        <p className="text-sm leading-relaxed text-start">
          <Link href="/login" className="font-medium underline">
            {t("emailTakenAction")}
          </Link>
        </p>
      ) : null}

      <FormField
        id="username"
        label={fields("username")}
        help={`${fields("usernameHelp")} ${fields("usernameCase")}`}
        error={form.formState.errors.username?.message}
      >
        {({ describedBy, invalid }) => (
          <Input
            id="username"
            autoComplete="username"
            dir="ltr"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("username")}
          />
        )}
      </FormField>

      <FormField
        id="password"
        label={fields("password")}
        help={fields("passwordHelp", { min: passwordMinLength })}
        error={form.formState.errors.password?.message}
      >
        {({ describedBy, invalid }) => (
          <PasswordField
            id="password"
            autoComplete="new-password"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            {...form.register("password")}
          />
        )}
      </FormField>

      <PasswordStrengthMeter value={password} />

      <Button type="submit" disabled={form.formState.isSubmitting} aria-busy={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-sm leading-relaxed text-muted-foreground text-start">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          {t("signIn")}
        </Link>
      </p>
    </form>
  );
};
